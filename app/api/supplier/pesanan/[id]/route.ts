import { NextResponse } from "next/server";
import { isNextResponse } from "@/lib/admin-api";
import {
  errorResponse,
  getSupplierOrderDetails,
  handleSupplierApiError,
  isRecord,
} from "@/lib/supplier-api";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const authorization = await requireRole("supplier");
  if (isNextResponse(authorization)) return authorization;

  const { id } = await params;
  if (!id || id.length > 10) {
    return errorResponse("ID pesanan tidak valid", 400);
  }

  try {
    const data = await getSupplierOrderDetails(authorization.id, id);
    if (!data) return errorResponse("Pesanan tidak ditemukan", 404);
    return NextResponse.json({ data });
  } catch (error) {
    return handleSupplierApiError(error);
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const authorization = await requireRole("supplier");
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
  if (
    !isRecord(body) ||
    typeof body.status !== "string" ||
    Object.keys(body).some((key) => key !== "status")
  ) {
    return errorResponse("Input status pesanan tidak valid", 400);
  }

  try {
    const order = await prisma.pesanan_Produk.findFirst({
      where: { PesananID: id, SupplierID: authorization.id },
      select: { PesananID: true, Status: true },
    });
    if (!order) return errorResponse("Pesanan tidak ditemukan", 404);

    const nextStatus: Record<string, string> = {
      "Belum dikirim": "Pengemasan",
      Pengemasan: "Dalam pengiriman",
    };
    if (nextStatus[order.Status] !== body.status) {
      return errorResponse(
        `Status pesanan hanya dapat maju satu tahap dari "${order.Status}"`,
        409,
      );
    }

    const result = await prisma.pesanan_Produk.updateMany({
      where: {
        PesananID: id,
        SupplierID: authorization.id,
        Status: order.Status,
      },
      data: { Status: body.status },
    });
    if (result.count !== 1) {
      return errorResponse("Status pesanan berubah; muat ulang lalu coba lagi", 409);
    }

    return NextResponse.json({
      data: { PesananID: order.PesananID, Status: body.status },
    });
  } catch (error) {
    return handleSupplierApiError(error);
  }
}
