import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export function errorResponse(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

export function handleSupplierApiError(error: unknown) {
  console.error("Supplier API request failed:", error);
  return errorResponse("Terjadi kesalahan server", 500);
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function getSupplierOrderDetails(
  supplierId: string,
  orderId: string,
) {
  const order = await prisma.pesanan_Produk.findFirst({
    where: { PesananID: orderId, SupplierID: supplierId },
    select: {
      PesananID: true,
      Status: true,
      TanggalPesan: true,
      Jumlah: true,
      HargaSatuan: true,
      Produk: { select: { NamaProduk: true } },
    },
  });
  if (!order) return null;

  const harga = order.HargaSatuan.toNumber();
  const totalCents = Math.round(harga * 100) * order.Jumlah;
  return {
    PesananID: order.PesananID,
    Status: order.Status,
    TanggalPesan: order.TanggalPesan,
    pemesan: "Menza Barbershop",
    item: [
      {
        produk: order.Produk.NamaProduk,
        qty: order.Jumlah,
        harga,
      },
    ],
    totalHarga: totalCents / 100,
  };
}
