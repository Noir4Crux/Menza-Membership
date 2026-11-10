import { NextResponse } from "next/server";
import {
  errorResponse,
  getServiceStatus,
  handleBarberApiError,
} from "@/lib/barber-api";
import { isNextResponse } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(_request: Request, { params }: RouteContext) {
  const authorization = await requireRole("barber");
  if (isNextResponse(authorization)) return authorization;

  const { id } = await params;
  if (!id || id.length > 10) {
    return errorResponse("ID transaksi tidak valid", 400);
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
      if (getServiceStatus(transaction.Status_Layanan) !== "Menunggu") {
        return { kind: "conflict" as const };
      }

      const status = await tx.status_Layanan.upsert({
        where: { TransaksiID: id },
        create: {
          TransaksiID: id,
          Status: "Sedang Dikerjakan",
          WaktuMulai: new Date(),
        },
        update: {
          Status: "Sedang Dikerjakan",
          WaktuMulai: new Date(),
        },
        select: { Status: true, WaktuMulai: true },
      });
      return { kind: "success" as const, status };
    }, { isolationLevel: "Serializable" });

    if (result.kind === "not-found") {
      return errorResponse("Transaksi tidak ditemukan", 404);
    }
    if (result.kind === "conflict") {
      return errorResponse("Status layanan bukan Menunggu", 409);
    }
    return NextResponse.json({ data: result });
  } catch (error) {
    return handleBarberApiError(error);
  }
}
