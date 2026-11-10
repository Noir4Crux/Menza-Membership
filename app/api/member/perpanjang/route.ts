import { NextResponse } from "next/server";
import {
  errorResponse,
  handleApiError,
  isNextResponse,
  isRecord,
} from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

const paymentMethods = ["Transfer Bank", "QRIS", "Cash"] as const;

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
    return errorResponse("Input perpanjangan tidak valid", 400);
  }

  const paket = body.paket;
  const metode = body.metode;
  if (
    (paket !== 3 && paket !== 12) ||
    typeof metode !== "string" ||
    !paymentMethods.some((option) => option === metode) ||
    Object.keys(body).some((key) => !["paket", "metode"].includes(key))
  ) {
    return errorResponse("Input perpanjangan tidak valid", 400);
  }

  const harga = paket === 3 ? 50_000 : 180_000;

  try {
    const member = await prisma.member.findUnique({
      where: { MemberID: authorization.id },
      select: { MemberID: true, NamaMember: true },
    });
    if (!member) return errorResponse("Member tidak ditemukan", 404);

    const pesan = `${member.MemberID} ${member.NamaMember} mengajukan perpanjangan ${paket} bulan Rp ${harga}, metode ${metode}. Menunggu verifikasi.`;
    await prisma.notifikasi.create({
      data: {
        Penerima: "ADM001",
        Jenis: "Perpanjangan",
        Pesan: pesan,
      },
    });

    return NextResponse.json(
      { data: { status: "Menunggu Verifikasi" } },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
