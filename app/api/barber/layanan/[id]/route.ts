import { NextResponse } from "next/server";
import { errorResponse, getServiceStatus, handleBarberApiError } from "@/lib/barber-api";
import { isNextResponse } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const authorization = await requireRole("barber");
  if (isNextResponse(authorization)) return authorization;

  const { id } = await params;
  if (!id || id.length > 10) {
    return errorResponse("ID transaksi tidak valid", 400);
  }

  try {
    const transaction = await prisma.transaksi.findFirst({
      where: { TransaksiID: id, BarberID: authorization.id },
      select: {
        TransaksiID: true,
        MemberID: true,
        TanggalTransaksi: true,
        Member_Transaksi_MemberIDToMember: {
          select: {
            MemberID: true,
            NamaMember: true,
            StatusMembership: true,
          },
        },
        Detail_Transaksi: {
          select: { Layanan: { select: { NamaLayanan: true } } },
        },
        Status_Layanan: {
          select: {
            Status: true,
            Catatan: true,
          },
        },
      },
    });
    if (!transaction) return errorResponse("Transaksi tidak ditemukan", 404);

    const visits = await prisma.transaksi.findMany({
      where: { MemberID: transaction.MemberID },
      select: {
        TransaksiID: true,
        TanggalTransaksi: true,
        Detail_Transaksi: {
          select: { Layanan: { select: { NamaLayanan: true } } },
        },
      },
      orderBy: [{ TanggalTransaksi: "desc" }, { TransaksiID: "desc" }],
      take: 5,
    });

    return NextResponse.json({
      data: {
        member: transaction.Member_Transaksi_MemberIDToMember,
        layanan: transaction.Detail_Transaksi.map((detail) => ({
          namaLayanan: detail.Layanan.NamaLayanan,
          tanggalKunjungan: transaction.TanggalTransaksi,
          status: getServiceStatus(transaction.Status_Layanan),
          catatan: transaction.Status_Layanan?.Catatan ?? null,
        })),
        riwayatKunjungan: visits.map((visit) => ({
          tanggal: visit.TanggalTransaksi,
          TransaksiID: visit.TransaksiID,
          layanan: visit.Detail_Transaksi.map(
            (detail) => detail.Layanan.NamaLayanan,
          ).join(", "),
        })),
      },
    });
  } catch (error) {
    return handleBarberApiError(error);
  }
}
