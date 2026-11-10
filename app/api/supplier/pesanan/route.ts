import { NextResponse } from "next/server";
import { isNextResponse } from "@/lib/admin-api";
import { handleSupplierApiError } from "@/lib/supplier-api";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export async function GET() {
  const authorization = await requireRole("supplier");
  if (isNextResponse(authorization)) return authorization;

  try {
    const orders = await prisma.pesanan_Produk.findMany({
      where: { SupplierID: authorization.id, Status: { not: "Diterima" } },
      select: {
        PesananID: true,
        Status: true,
        TanggalPesan: true,
        Jumlah: true,
        Produk: { select: { NamaProduk: true } },
      },
      orderBy: [{ TanggalPesan: "desc" }, { PesananID: "desc" }],
    });

    return NextResponse.json({
      data: orders.map((order) => ({
        PesananID: order.PesananID,
        namaProduk: order.Produk.NamaProduk,
        Jumlah: order.Jumlah,
        Status: order.Status,
        TanggalPesan: order.TanggalPesan,
      })),
    });
  } catch (error) {
    return handleSupplierApiError(error);
  }
}
