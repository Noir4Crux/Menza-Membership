import { NextResponse } from "next/server";
import { isNextResponse } from "@/lib/admin-api";
import { handleSupplierApiError } from "@/lib/supplier-api";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export async function GET() {
  const authorization = await requireRole("supplier");
  if (isNextResponse(authorization)) return authorization;

  try {
    const [activeOrder, notifikasiBelumDibaca, notifications] =
      await Promise.all([
        prisma.pesanan_Produk.findFirst({
          where: { SupplierID: authorization.id, Status: { not: "Diterima" } },
          select: {
            PesananID: true,
            Status: true,
            Produk: { select: { NamaProduk: true } },
          },
          orderBy: [{ TanggalPesan: "desc" }, { PesananID: "desc" }],
        }),
        prisma.notifikasi.count({
          where: { Penerima: authorization.id, Dibaca: false },
        }),
        prisma.notifikasi.findMany({
          where: { Penerima: authorization.id },
          select: {
            NotifikasiID: true,
            Jenis: true,
            Pesan: true,
            Tanggal: true,
            Dibaca: true,
          },
          orderBy: [{ Tanggal: "desc" }, { NotifikasiID: "desc" }],
          take: 10,
        }),
      ]);

    return NextResponse.json({
      data: {
        pesananAktif: activeOrder
          ? {
              PesananID: activeOrder.PesananID,
              namaProduk: activeOrder.Produk.NamaProduk,
              Status: activeOrder.Status,
            }
          : null,
        notifikasiBelumDibaca,
        notifikasi: notifications.map((notification) => ({
          id: notification.NotifikasiID,
          Jenis: notification.Jenis,
          Pesan: notification.Pesan,
          Tanggal: notification.Tanggal,
          Dibaca: notification.Dibaca,
        })),
      },
    });
  } catch (error) {
    return handleSupplierApiError(error);
  }
}
