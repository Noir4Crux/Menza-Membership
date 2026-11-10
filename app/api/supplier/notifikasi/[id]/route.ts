import { NextResponse } from "next/server";
import { isNextResponse } from "@/lib/admin-api";
import {
  errorResponse,
  handleSupplierApiError,
} from "@/lib/supplier-api";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(_request: Request, { params }: RouteContext) {
  const authorization = await requireRole("supplier");
  if (isNextResponse(authorization)) return authorization;

  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!/^\d+$/.test(idParam) || !Number.isSafeInteger(id) || id < 1) {
    return errorResponse("ID notifikasi tidak valid", 400);
  }

  try {
    const result = await prisma.notifikasi.updateMany({
      where: { NotifikasiID: id, Penerima: authorization.id },
      data: { Dibaca: true },
    });
    if (result.count === 0) {
      return errorResponse("Notifikasi tidak ditemukan", 404);
    }

    return NextResponse.json({ data: { id, Dibaca: true } });
  } catch (error) {
    return handleSupplierApiError(error);
  }
}
