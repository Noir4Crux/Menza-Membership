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
    const nextThirtyDays = new Date(today);
    nextThirtyDays.setUTCDate(nextThirtyDays.getUTCDate() + 30);

    const [
      totalMember,
      menungguVerifikasi,
      transaksiHariIni,
      segeraBerakhir,
      transactions,
      notifications,
    ] = await Promise.all([
      prisma.member.count(),
      prisma.member.count({ where: { StatusMembership: "Menunggu" } }),
      prisma.transaksi.count({
        where: { TanggalTransaksi: { gte: today, lt: tomorrow } },
      }),
      prisma.member.count({
        where: {
          StatusMembership: "Aktif",
          Member_Info: {
            is: { MasaBerlaku: { gte: today, lte: nextThirtyDays } },
          },
        },
      }),
      prisma.transaksi.findMany({
        orderBy: [{ TanggalTransaksi: "desc" }, { TransaksiID: "desc" }],
        take: 5,
        include: {
          Member_Transaksi_MemberIDToMember: {
            select: { NamaMember: true },
          },
        },
      }),
      prisma.notifikasi.findMany({
        orderBy: [{ Tanggal: "desc" }, { NotifikasiID: "desc" }],
        take: 5,
      }),
    ]);

    const aktivitas = [
      ...transactions.map((transaction) => ({
        teks: `Transaksi ${transaction.TransaksiID} oleh ${transaction.Member_Transaksi_MemberIDToMember.NamaMember}`,
        tanggal: transaction.TanggalTransaksi,
      })),
      ...notifications.map((notification) => ({
        teks: `${notification.Jenis}: ${notification.Pesan}`,
        tanggal: notification.Tanggal,
      })),
    ]
      .sort((left, right) => right.tanggal.getTime() - left.tanggal.getTime())
      .slice(0, 5);

    return NextResponse.json({
      data: {
        totalMember,
        menungguVerifikasi,
        transaksiHariIni,
        segeraBerakhir,
        aktivitasTerbaru: aktivitas,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
