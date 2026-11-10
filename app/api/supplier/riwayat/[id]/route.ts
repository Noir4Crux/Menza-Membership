import { NextResponse } from "next/server";
import { isNextResponse } from "@/lib/admin-api";
import {
  errorResponse,
  getSupplierOrderDetails,
  handleSupplierApiError,
} from "@/lib/supplier-api";
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
