import { NextResponse } from "next/server";
import {
  errorResponse,
  getServiceStatus,
  handleBarberApiError,
  isRecord,
} from "@/lib/barber-api";
import { isNextResponse } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteContext) {
  const authorization = await requireRole("barber");
  if (isNextResponse(authorization)) return authorization;

  const { id } = await params;
  if (!id || id.length > 10) {
    return errorResponse("ID transaksi tidak valid", 400);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Body JSON tidak valid", 400);
  }
  const catatan = isRecord(body) ? body.catatan : undefined;
  if (
    !isRecord(body) ||
    typeof catatan !== "string" ||
    !catatan.trim() ||
    catatan.length > 300 ||
    typeof body.sesuai !== "boolean" ||
    Object.keys(body).some((key) => !["catatan", "sesuai"].includes(key))
  ) {
    return errorResponse("Input penyelesaian layanan tidak valid", 400);
  }
  if (!body.sesuai) {
    return errorResponse("Konfirmasi bahwa layanan selesai", 400);
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const transaction = await tx.transaksi.findFirst({
        where: { TransaksiID: id, BarberID: authorization.id },
        select: {
          TransaksiID: true,
          Status_Layanan: { select: { Status: true } },
        },
      });
      if (!transaction) return { kind: "not-found" as const };
      if (getServiceStatus(transaction.Status_Layanan) !== "Sedang Dikerjakan") {
        return { kind: "conflict" as const };
      }

      const status = await tx.status_Layanan.update({
        where: { TransaksiID: id },
        data: {
          Status: "Selesai",
          Catatan: catatan.trim(),
          WaktuSelesai: new Date(),
        },
        select: { Status: true, Catatan: true, WaktuSelesai: true },
      });
      return { kind: "success" as const, status };
    }, { isolationLevel: "Serializable" });

    if (result.kind === "not-found") {
      return errorResponse("Transaksi tidak ditemukan", 404);
    }
    if (result.kind === "conflict") {
      return errorResponse("Status layanan bukan Sedang Dikerjakan", 409);
    }
    return NextResponse.json({ data: result });
  } catch (error) {
    return handleBarberApiError(error);
  }
}
