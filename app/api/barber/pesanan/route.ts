import { NextResponse } from "next/server";
import {
  errorResponse,
  handleBarberApiError,
  isRecord,
} from "@/lib/barber-api";
import { isNextResponse } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

const ORDER_PREFIX = "ORD-";
const ORDER_NUMBER_LIMIT = 1000;

export async function GET() {
  const authorization = await requireRole("barber");
  if (isNextResponse(authorization)) return authorization;

  try {
    const orders = await prisma.pesanan_Produk.findMany({
      where: { BarberID: authorization.id },
      select: {
        PesananID: true,
        ProdukID: true,
        Produk: { select: { NamaProduk: true } },
        Jumlah: true,
        Status: true,
        TanggalPesan: true,
      },
      orderBy: [{ TanggalPesan: "desc" }, { PesananID: "desc" }],
    });

    return NextResponse.json({
      data: orders.map((order) => ({
        PesananID: order.PesananID,
        ProdukID: order.ProdukID,
        NamaProduk: order.Produk.NamaProduk,
        Jumlah: order.Jumlah,
        Status: order.Status,
        TanggalPesan: order.TanggalPesan,
      })),
    });
  } catch (error) {
    return handleBarberApiError(error);
  }
}

export async function POST(request: Request) {
  const authorization = await requireRole("barber");
  if (isNextResponse(authorization)) return authorization;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Body JSON tidak valid", 400);
  }

  const produkId = isRecord(body) ? body.ProdukID : undefined;
  const jumlah = isRecord(body) ? body.jumlah : undefined;
  const catatan = isRecord(body) ? body.catatan : undefined;
  if (
    !isRecord(body) ||
    typeof produkId !== "string" ||
    !produkId.trim() ||
    produkId.trim().length > 10 ||
    typeof jumlah !== "number" ||
    !Number.isInteger(jumlah) ||
    jumlah <= 0 ||
    jumlah > 2_147_483_647 ||
    (catatan !== undefined &&
      (typeof catatan !== "string" || catatan.length > 200)) ||
    Object.keys(body).some(
      (key) => !["ProdukID", "jumlah", "catatan"].includes(key),
    )
  ) {
    return errorResponse("Input pesanan produk tidak valid", 400);
  }

  try {
    const result = await prisma.$transaction(
      async (tx) => {
        const product = await tx.produk.findUnique({
          where: { ProdukID: produkId.trim() },
          select: {
            ProdukID: true,
            NamaProduk: true,
            HargaSatuan: true,
          },
        });
        if (!product) {
          return {
            kind: "not-found" as const,
          };
        }

        const existingOrders = await tx.pesanan_Produk.findMany({
          where: { PesananID: { startsWith: ORDER_PREFIX } },
          select: { PesananID: true },
        });
        const maxSequence = existingOrders.reduce((max, order) => {
          const suffix = order.PesananID.slice(ORDER_PREFIX.length);
          if (!/^\d{3}$/.test(suffix)) return max;
          return Math.max(max, Number(suffix));
        }, 0);
        const nextSequence = maxSequence + 1;
        if (nextSequence >= ORDER_NUMBER_LIMIT) {
          return { kind: "sequence-exhausted" as const };
        }
        const PesananID = `${ORDER_PREFIX}${String(nextSequence).padStart(3, "0")}`;

        const order = await tx.pesanan_Produk.create({
          data: {
            PesananID,
            ProdukID: product.ProdukID,
            BarberID: authorization.id,
            SupplierID: "SUP001",
            Jumlah: jumlah,
            HargaSatuan: product.HargaSatuan,
            Catatan:
              typeof catatan === "string" && catatan.trim()
                ? catatan.trim()
                : null,
            Status: "Belum dikirim",
          },
          select: {
            PesananID: true,
            ProdukID: true,
            BarberID: true,
            SupplierID: true,
            Jumlah: true,
            HargaSatuan: true,
            Catatan: true,
            Status: true,
            TanggalPesan: true,
          },
        });

        await tx.notifikasi.create({
          data: {
            Penerima: "SUP001",
            Jenis: "Pesanan Produk",
            Pesan: `Pesanan baru ${PesananID} dari Menza Barbershop: ${product.NamaProduk} x${jumlah}.`,
          },
        });

        return {
          kind: "created" as const,
          order: { ...order, HargaSatuan: order.HargaSatuan.toNumber() },
        };
      },
      { isolationLevel: "Serializable" },
    );

    if (result.kind === "not-found") {
      return errorResponse("Produk tidak ditemukan", 404);
    }
    if (result.kind === "sequence-exhausted") {
      return errorResponse("Nomor pesanan sudah habis", 409);
    }
    return NextResponse.json({ data: result.order }, { status: 201 });
  } catch (error) {
    return handleBarberApiError(error);
  }
}
