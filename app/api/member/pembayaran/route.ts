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

const metodePembayaran = ["Transfer Bank", "Cash", "QRIS"] as const;

export async function POST(request: Request) {
  const authorization = await requireRole("member");
  if (isNextResponse(authorization)) return authorization;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Body JSON tidak valid", 400);
  }
  if (!isRecord(body)) {
    return errorResponse("Input pembayaran tidak valid", 400);
  }
  const layananId = body.layananId;
  const gunakanPoin = body.gunakanPoin;
  const metode = body.metode;
  if (
    typeof layananId !== "string" ||
    !layananId.trim() ||
    layananId.trim().length > 5 ||
    typeof gunakanPoin !== "boolean" ||
    typeof metode !== "string" ||
    !metodePembayaran.some((option) => option === metode) ||
    Object.keys(body).some(
      (key) => !["layananId", "gunakanPoin", "metode"].includes(key),
    )
  ) {
    return errorResponse("Input pembayaran tidak valid", 400);
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const member = await tx.member.findUnique({
        where: { MemberID: authorization.id },
        select: { MemberID: true, NamaMember: true, StatusMembership: true },
      });
      if (!member) {
        return {
          kind: "error" as const,
          error: "Member tidak ditemukan",
          status: 404,
        };
      }
      if (member.StatusMembership !== "Aktif") {
        return {
          kind: "error" as const,
          error: "Membership belum aktif",
          status: 403,
        };
      }

      const layanan = await tx.layanan.findUnique({
        where: { LayananID: layananId.trim() },
        select: { NamaLayanan: true, HargaLayanan: true },
      });
      if (!layanan) {
        return {
          kind: "error" as const,
          error: "Layanan tidak ditemukan",
          status: 404,
        };
      }

      const points = await tx.transaksi.aggregate({
        where: { MemberID: authorization.id },
        _sum: { PoinDiperoleh: true, PoinDigunakan: true },
      });
      const saldoPoin =
        (points._sum.PoinDiperoleh ?? 0) - (points._sum.PoinDigunakan ?? 0);
      const calculation = calculateMemberOrder(
        Math.round(layanan.HargaLayanan.toNumber() * 100),
        saldoPoin,
        member.StatusMembership,
        gunakanPoin,
      );
      const pesan = `${member.MemberID} ${member.NamaMember} memilih ${layanan.NamaLayanan}, total Rp ${calculation.total}, poin ditukar ${calculation.poinDitukar}, metode ${metode}. Menunggu verifikasi.`;

      await tx.notifikasi.create({
        data: {
          Penerima: "ADM001",
          Jenis: "Pembayaran",
          Pesan: pesan,
        },
      });
      return { kind: "success" as const, status: "Menunggu Verifikasi" };
    });

    if (result.kind === "error") {
      return errorResponse(result.error, result.status);
    }
    return NextResponse.json({ data: { status: result.status } }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
