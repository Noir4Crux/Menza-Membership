import { NextResponse } from "next/server";
import {
  errorResponse,
  isNextResponse,
} from "@/lib/admin-api";
import { handleOwnerApiError, monthRange } from "@/lib/owner-api";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export async function GET(request: Request) {
  const authorization = await requireRole("owner");
  if (isNextResponse(authorization)) return authorization;

  const searchParams = new URL(request.url).searchParams;
  const range = monthRange(
    searchParams.get("bulan"),
    searchParams.get("tahun"),
  );
  if (!range) return errorResponse("Parameter bulan dan tahun tidak valid", 400);

  try {
    const where = {
      OwnerID: authorization.id,
      TanggalTransaksi: { gte: range.start, lt: range.end },
    };
    const [transactions, count, revenue] = await Promise.all([
      prisma.transaksi.findMany({
        where,
        select: {
          TanggalTransaksi: true,
          TransaksiID: true,
          MemberID: true,
          TotalTransaksi: true,
          Member_Transaksi_MemberIDToMember: {
            select: { NamaMember: true },
          },
          Barber: { select: { NamaBarber: true } },
          Detail_Transaksi: {
            select: { Layanan: { select: { NamaLayanan: true } } },
          },
        },
        orderBy: [{ TanggalTransaksi: "asc" }, { TransaksiID: "asc" }],
      }),
      prisma.transaksi.count({ where }),
      prisma.transaksi.aggregate({
        where,
        _sum: { TotalTransaksi: true },
      }),
    ]);

    const baris = transactions.map((transaction) => ({
      Tanggal: transaction.TanggalTransaksi,
      TransaksiID: transaction.TransaksiID,
      MemberID: transaction.MemberID,
      NamaMember: transaction.Member_Transaksi_MemberIDToMember.NamaMember,
      Layanan: transaction.Detail_Transaksi.map(
        (detail) => detail.Layanan.NamaLayanan,
      ).join(", "),
      Barber: transaction.Barber.NamaBarber,
      TotalTransaksi: transaction.TotalTransaksi.toNumber(),
    }));

    return NextResponse.json({
      data: {
        baris,
        ringkasan: {
          jumlahTransaksi: count,
          totalPendapatan: revenue._sum.TotalTransaksi?.toNumber() ?? 0,
        },
      },
    });
  } catch (error) {
    return handleOwnerApiError(error);
  }
}
