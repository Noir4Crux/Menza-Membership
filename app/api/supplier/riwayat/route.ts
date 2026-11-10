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
      where: { SupplierID: authorization.id },
      select: {
        PesananID: true,
        Status: true,
        TanggalPesan: true,
        Jumlah: true,
        HargaSatuan: true,
      },
      orderBy: [{ TanggalPesan: "desc" }, { PesananID: "desc" }],
    });

    return NextResponse.json({
      data: orders.map((order) => ({
        PesananID: order.PesananID,
        TanggalPesan: order.TanggalPesan,
        totalHarga:
          (Math.round(order.HargaSatuan.toNumber() * 100) * order.Jumlah) / 100,
        tampilStatus: order.Status === "Diterima" ? "Success" : "On Progress",
      })),
    });
  } catch (error) {
    return handleSupplierApiError(error);
  }
}
