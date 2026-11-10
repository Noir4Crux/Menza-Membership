import { NextResponse } from "next/server";
import {
  getServiceStatus,
  handleBarberApiError,
} from "@/lib/barber-api";
import { isNextResponse } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

function serviceNames(
  details: { Layanan: { NamaLayanan: string } }[],
) {
  return details.map((detail) => detail.Layanan.NamaLayanan).join(", ");
}

export async function GET() {
  const authorization = await requireRole("barber");
  if (isNextResponse(authorization)) return authorization;

  try {
    const [transactions, products, statusRows] = await Promise.all([
      prisma.transaksi.findMany({
        where: { BarberID: authorization.id },
        select: {
          TransaksiID: true,
          TanggalTransaksi: true,
          Member_Transaksi_MemberIDToMember: {
            select: { NamaMember: true },
          },
          Detail_Transaksi: {
            select: { Layanan: { select: { NamaLayanan: true } } },
          },
          Status_Layanan: {
            select: { Status: true },
          },
        },
        orderBy: [{ TanggalTransaksi: "desc" }, { TransaksiID: "desc" }],
      }),
      prisma.produk.findMany({
        where: { Stok: { lte: 4 } },
        select: { NamaProduk: true, Stok: true },
        orderBy: [{ Stok: "asc" }, { NamaProduk: "asc" }],
      }),
      prisma.status_Layanan.findMany({
        where: { Transaksi: { BarberID: authorization.id } },
        select: {
          Status: true,
          WaktuMulai: true,
          WaktuSelesai: true,
          Transaksi: {
            select: {
              Member_Transaksi_MemberIDToMember: {
                select: { NamaMember: true },
              },
              Detail_Transaksi: {
                select: { Layanan: { select: { NamaLayanan: true } } },
              },
            },
          },
        },
      }),
    ]);

    const counts = { menunggu: 0, sedangDikerjakan: 0, selesai: 0 };
    const antrean = transactions.flatMap((transaction) => {
      const status = getServiceStatus(transaction.Status_Layanan);
      if (status === "Menunggu") counts.menunggu += 1;
      if (status === "Sedang Dikerjakan") counts.sedangDikerjakan += 1;
      if (status === "Selesai") counts.selesai += 1;
      if (status === "Selesai") return [];
      return [
        {
          TransaksiID: transaction.TransaksiID,
          TanggalTransaksi: transaction.TanggalTransaksi,
          namaMember:
            transaction.Member_Transaksi_MemberIDToMember.NamaMember,
          namaLayanan: serviceNames(transaction.Detail_Transaksi),
          status,
        },
      ];
    });

    const aktivitasTerbaru = statusRows
      .map((row) => {
        const status = getServiceStatus(row);
        const waktu =
          status === "Selesai"
            ? row.WaktuSelesai ?? row.WaktuMulai
            : row.WaktuMulai ?? row.WaktuSelesai;
        if (!waktu) return null;
        const namaMember =
          row.Transaksi.Member_Transaksi_MemberIDToMember.NamaMember;
        const layanan = serviceNames(row.Transaksi.Detail_Transaksi);
        const teks =
          status === "Selesai"
            ? `${layanan} untuk ${namaMember} selesai`
            : status === "Sedang Dikerjakan"
              ? `Mulai mengerjakan ${layanan} untuk ${namaMember}`
              : `Status layanan ${layanan} untuk ${namaMember}: ${status}`;
        return { teks, waktu };
      })
      .filter((activity): activity is { teks: string; waktu: Date } => activity !== null)
      .sort((a, b) => b.waktu.getTime() - a.waktu.getTime())
      .slice(0, 5);

    return NextResponse.json({
      data: {
        ...counts,
        antrean,
        peringatanStok: products.map((product) => ({
          nama: product.NamaProduk,
          stok: product.Stok,
          statusStok: product.Stok === 0 ? "Habis" : "Stok Menipis",
        })),
        aktivitasTerbaru,
      },
    });
  } catch (error) {
    return handleBarberApiError(error);
  }
}
