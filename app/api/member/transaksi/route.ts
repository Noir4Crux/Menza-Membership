import { NextResponse } from "next/server";
import { handleApiError, isNextResponse } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export async function GET() {
  const authorization = await requireRole("member");
  if (isNextResponse(authorization)) return authorization;

  try {
    const transactions = await prisma.transaksi.findMany({
      where: { MemberID: authorization.id },
      include: {
        Detail_Transaksi: {
          include: { Layanan: { select: { NamaLayanan: true } } },
        },
      },
      orderBy: [{ TanggalTransaksi: "desc" }, { TransaksiID: "desc" }],
    });
    const data = transactions.map((transaction) => ({
      TransaksiID: transaction.TransaksiID,
      Tanggal: transaction.TanggalTransaksi,
      layanan: transaction.Detail_Transaksi.map(
        (detail) => detail.Layanan.NamaLayanan,
      ).join(", "),
      TotalTransaksi: transaction.TotalTransaksi.toNumber(),
      diskon: (transaction.PoinDigunakan ?? 0) * 100,
      status: "Berhasil",
    }));
    return NextResponse.json({ data });
  } catch (error) {
    return handleApiError(error);
  }
}
