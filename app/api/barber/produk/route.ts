import { NextResponse } from "next/server";
import { errorResponse, handleBarberApiError } from "@/lib/barber-api";
import { isNextResponse } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export async function GET(request: Request) {
  const authorization = await requireRole("barber");
  if (isNextResponse(authorization)) return authorization;

  const searchParams = new URL(request.url).searchParams;
  const q = searchParams.get("q")?.trim() ?? "";
  if (q.length > 100) {
    return errorResponse("Parameter q maksimal 100 karakter", 400);
  }

  try {
    const products = await prisma.produk.findMany({
      where: q
        ? { NamaProduk: { contains: q, mode: "insensitive" } }
        : undefined,
      select: {
        ProdukID: true,
        NamaProduk: true,
        Satuan: true,
        Stok: true,
      },
      orderBy: { NamaProduk: "asc" },
    });

    return NextResponse.json({
      data: products.map((product) => ({
        ...product,
        statusStok:
          product.Stok === 0
            ? "Habis"
            : product.Stok <= 4
              ? "Menipis"
              : "Tersedia",
      })),
    });
  } catch (error) {
    return handleBarberApiError(error);
  }
}
