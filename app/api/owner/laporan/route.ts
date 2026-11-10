import { NextResponse } from "next/server";
import { errorResponse, isNextResponse } from "@/lib/admin-api";
import { handleOwnerApiError, monthRange } from "@/lib/owner-api";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

const namaBulan = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export async function GET(request: Request) {
  const authorization = await requireRole("owner");
  if (isNextResponse(authorization)) return authorization;

  const searchParams = new URL(request.url).searchParams;
  const range = monthRange(
    searchParams.get("bulan"),
    searchParams.get("tahun"),
  );
  if (!range) return errorResponse("Parameter bulan dan tahun tidak valid", 400);

  const ownerPeriod = {
    OwnerID: authorization.id,
    TanggalTransaksi: { gte: range.start, lt: range.end },
  };
  const yearStart = new Date(Date.UTC(range.start.getUTCFullYear(), 0, 1));
  const yearEnd = new Date(Date.UTC(range.start.getUTCFullYear() + 1, 0, 1));
  const ownerYear = {
    OwnerID: authorization.id,
    TanggalTransaksi: { gte: yearStart, lt: yearEnd },
  };

  try {
    const [
      jumlahMemberAktif,
      jumlahTransaksi,
      visits,
      totals,
      serviceCounts,
      monthlyTransactions,
    ] = await Promise.all([
      prisma.member.count({
        where: {
          StatusMembership: "Aktif",
          Transaksi_Transaksi_MemberIDToMember: { some: ownerPeriod },
        },
      }),
      prisma.transaksi.count({ where: ownerPeriod }),
      prisma.transaksi.groupBy({
        by: ["MemberID", "TanggalTransaksi"],
        where: ownerPeriod,
      }),
      prisma.transaksi.aggregate({
        where: ownerPeriod,
        _sum: {
          TotalTransaksi: true,
          PoinDiperoleh: true,
          PoinDigunakan: true,
        },
      }),
      prisma.detail_Transaksi.groupBy({
        by: ["LayananID"],
        where: { Transaksi: { is: ownerPeriod } },
        _count: { _all: true },
      }),
      prisma.transaksi.groupBy({
        by: ["TanggalTransaksi"],
        where: ownerYear,
        _sum: { TotalTransaksi: true },
      }),
    ]);

    let layananTerlaris: { nama: string; jumlah: number } | null = null;
    if (serviceCounts.length > 0) {
      const services = await prisma.layanan.findMany({
        where: { LayananID: { in: serviceCounts.map((item) => item.LayananID) } },
        select: { LayananID: true, NamaLayanan: true },
      });
      const serviceNames = new Map(
        services.map((service) => [service.LayananID, service.NamaLayanan]),
      );
      const mostPopular = serviceCounts
        .map((item) => {
          const nama = serviceNames.get(item.LayananID);
          if (nama === undefined) {
            throw new Error(`Layanan ${item.LayananID} tidak ditemukan.`);
          }
          return { nama, jumlah: item._count._all };
        })
        .sort(
          (left, right) =>
            right.jumlah - left.jumlah || left.nama.localeCompare(right.nama),
        )[0];
      if (mostPopular) layananTerlaris = mostPopular;
    }

    const monthlyTotals = Array.from({ length: 12 }, () => 0);
    for (const transaction of monthlyTransactions) {
      const month = transaction.TanggalTransaksi.getUTCMonth();
      const amountCents = Math.round(
        (transaction._sum.TotalTransaksi?.toNumber() ?? 0) * 100,
      );
      monthlyTotals[month] = (monthlyTotals[month] ?? 0) + amountCents;
    }

    return NextResponse.json({
      data: {
        jumlahMemberAktif,
        jumlahTransaksi,
        jumlahKunjungan: visits.length,
        totalPendapatan: totals._sum.TotalTransaksi?.toNumber() ?? 0,
        layananTerlaris,
        totalPoinDiberikan: totals._sum.PoinDiperoleh ?? 0,
        totalPoinDipakai: totals._sum.PoinDigunakan ?? 0,
        grafik: namaBulan.map((bulan, index) => ({
          bulan,
          total: (monthlyTotals[index] ?? 0) / 100,
        })),
      },
    });
  } catch (error) {
    return handleOwnerApiError(error);
  }
}
