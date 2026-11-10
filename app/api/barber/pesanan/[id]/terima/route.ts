import { NextResponse } from "next/server";
import {
  errorResponse,
  handleBarberApiError,
  isRecord,
} from "@/lib/barber-api";
import { isNextResponse, utcToday } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteContext) {
  const authorization = await requireRole("barber");
  if (isNextResponse(authorization)) return authorization;

  const { id } = await params;
  if (!id || id.length > 10) {
    return errorResponse("ID pesanan tidak valid", 400);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Body JSON tidak valid", 400);
  }
  const jumlahDiterima = isRecord(body) ? body.jumlahDiterima : undefined;
  const sesuai = isRecord(body) ? body.sesuai : undefined;
  if (
    !isRecord(body) ||
    typeof jumlahDiterima !== "number" ||
    !Number.isInteger(jumlahDiterima) ||
    jumlahDiterima < 0 ||
    jumlahDiterima > 2_147_483_647 ||
    typeof sesuai !== "boolean" ||
    Object.keys(body).some(
      (key) => !["jumlahDiterima", "sesuai"].includes(key),
    )
  ) {
    return errorResponse("Input penerimaan pesanan tidak valid", 400);
  }
  if (!sesuai) {
    return errorResponse("Konfirmasi bahwa jumlah barang sudah sesuai", 400);
  }

  try {
    const result = await prisma.$transaction(
      async (tx) => {
        const order = await tx.pesanan_Produk.findFirst({
          where: { PesananID: id, BarberID: authorization.id },
          select: {
            PesananID: true,
            ProdukID: true,
            Status: true,
          },
        });
        if (!order) return { kind: "not-found" as const };
        if (order.Status !== "Dalam pengiriman") {
          return { kind: "conflict" as const, status: order.Status };
        }

        const update = await tx.pesanan_Produk.updateMany({
          where: {
            PesananID: id,
            BarberID: authorization.id,
            Status: "Dalam pengiriman",
          },
          data: {
            Status: "Diterima",
            TanggalTerima: utcToday(),
            JumlahDiterima: jumlahDiterima,
          },
        });
        if (update.count !== 1) {
          return { kind: "conflict" as const, status: order.Status };
        }

        const product = await tx.produk.update({
          where: { ProdukID: order.ProdukID },
          data: { Stok: { increment: jumlahDiterima } },
          select: { ProdukID: true, NamaProduk: true, Stok: true },
        });
        const updatedOrder = await tx.pesanan_Produk.findUniqueOrThrow({
          where: { PesananID: id },
          select: {
            PesananID: true,
            Status: true,
            TanggalTerima: true,
            JumlahDiterima: true,
          },
        });
        return {
          kind: "received" as const,
          order: updatedOrder,
          product,
        };
      },
      { isolationLevel: "Serializable" },
    );

    if (result.kind === "not-found") {
      return errorResponse("Pesanan tidak ditemukan", 404);
    }
    if (result.kind === "conflict") {
      return errorResponse(
        `Pesanan tidak dapat diterima karena statusnya "${result.status}", bukan "Dalam pengiriman"`,
        409,
      );
    }
    return NextResponse.json({ data: result });
  } catch (error) {
    return handleBarberApiError(error);
  }
}
