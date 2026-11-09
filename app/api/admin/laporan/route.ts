import { NextResponse } from "next/server";
import { errorResponse, handleApiError, isNextResponse } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

function monthRange(monthValue: string | null, yearValue: string | null) {
  if (
    !monthValue ||
    !yearValue ||
    !/^\d{1,2}$/.test(monthValue) ||
    !/^\d{4}$/.test(yearValue)
  ) {
    return null;
  }
  const month = Number(monthValue);
  const year = Number(yearValue);
  if (month < 1 || month > 12 || year < 1000 || year > 9999) return null;
  return {
    start: new Date(Date.UTC(year, month - 1, 1)),
    end: new Date(Date.UTC(year, month, 1)),
  };
}

export async function GET(request: Request) {
  const authorization = await requireRole("administrator");
  if (isNextResponse(authorization)) return authorization;

  const searchParams = new URL(request.url).searchParams;
  const range = monthRange(
    searchParams.get("bulan"),
    searchParams.get("tahun"),
  );
  if (!range) return errorResponse("Parameter bulan dan tahun tidak valid", 400);

  try {
    const where = {
      TanggalTransaksi: { gte: range.start, lt: range.end },
    };
    const [jumlahMember, jumlahTransaksi, total, transactions, visits] =
      await Promise.all([
        prisma.member.count(),
        prisma.transaksi.count({ where }),
        prisma.transaksi.aggregate({
          where,
          _sum: { TotalTransaksi: true },
        }),
        prisma.transaksi.findMany({
          where,
          include: {
            Detail_Transaksi: {
              include: { Layanan: { select: { NamaLayanan: true } } },
            },
          },
          orderBy: [{ TanggalTransaksi: "asc" }, { TransaksiID: "asc" }],
        }),
        prisma.transaksi.groupBy({
          by: ["MemberID", "TanggalTransaksi"],
          where,
        }),
      ]);

    const baris = transactions.map((transaction) => ({
      Tanggal: transaction.TanggalTransaksi,
      TransaksiID: transaction.TransaksiID,
      MemberID: transaction.MemberID,
      Layanan: transaction.Detail_Transaksi.map(
        (detail) => detail.Layanan.NamaLayanan,
      ).join(", "),
      TotalTransaksi: transaction.TotalTransaksi.toNumber(),
    }));

    return NextResponse.json({
      data: {
        jumlahMember,
        jumlahTransaksi,
        jumlahKunjungan: visits.length,
        totalPendapatan: total._sum.TotalTransaksi?.toNumber() ?? 0,
        baris,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
