import { NextResponse } from "next/server";
import { handleApiError, isNextResponse, utcToday } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export async function GET() {
  const authorization = await requireRole("administrator");
  if (isNextResponse(authorization)) return authorization;

  try {
    const today = utcToday();
    const tomorrow = new Date(today);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    const transactions = await prisma.transaksi.findMany({
      where: { TanggalTransaksi: { gte: today, lt: tomorrow } },
      include: {
        Member_Transaksi_MemberIDToMember: {
          select: { NamaMember: true },
        },
        Barber: { select: { NamaBarber: true } },
        Detail_Transaksi: {
          include: { Layanan: { select: { NamaLayanan: true } } },
        },
      },
      orderBy: [{ TanggalTransaksi: "desc" }, { TransaksiID: "desc" }],
    });

    const data = transactions.map((transaction) => ({
      TransaksiID: transaction.TransaksiID,
      namaMember: transaction.Member_Transaksi_MemberIDToMember.NamaMember,
      namaBarber: transaction.Barber.NamaBarber,
      namaLayanan: transaction.Detail_Transaksi.map(
        (detail) => detail.Layanan.NamaLayanan,
      ),
      total: transaction.TotalTransaksi.toNumber(),
    }));
    return NextResponse.json({ data });
  } catch (error) {
    return handleApiError(error);
  }
}
