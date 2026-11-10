import { NextResponse } from "next/server";
import {
  errorResponse,
  handleApiError,
  isNextResponse,
  isRecord,
} from "@/lib/admin-api";
import { calculateMemberOrder } from "@/lib/member-api";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export async function POST(request: Request) {
  const authorization = await requireRole("member");
  if (isNextResponse(authorization)) return authorization;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Body JSON tidak valid", 400);
  }
  if (
    !isRecord(body) ||
    typeof body.layananId !== "string" ||
    !body.layananId.trim() ||
    body.layananId.trim().length > 5 ||
    typeof body.gunakanPoin !== "boolean" ||
    Object.keys(body).some((key) => !["layananId", "gunakanPoin"].includes(key))
  ) {
    return errorResponse("Input perhitungan tidak valid", 400);
  }

  try {
    const [member, layanan, points] = await Promise.all([
      prisma.member.findUnique({
        where: { MemberID: authorization.id },
        select: { StatusMembership: true },
      }),
      prisma.layanan.findUnique({
        where: { LayananID: body.layananId.trim() },
        select: { NamaLayanan: true, HargaLayanan: true },
      }),
      prisma.transaksi.aggregate({
        where: { MemberID: authorization.id },
        _sum: { PoinDiperoleh: true, PoinDigunakan: true },
      }),
    ]);

    if (!member) return errorResponse("Member tidak ditemukan", 404);
    if (!layanan) return errorResponse("Layanan tidak ditemukan", 404);

    const saldoPoin =
      (points._sum.PoinDiperoleh ?? 0) - (points._sum.PoinDigunakan ?? 0);
    const calculation = calculateMemberOrder(
      Math.round(layanan.HargaLayanan.toNumber() * 100),
      saldoPoin,
      member.StatusMembership,
      body.gunakanPoin,
    );

    return NextResponse.json({
      data: { namaLayanan: layanan.NamaLayanan, ...calculation },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
