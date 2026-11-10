import { NextResponse } from "next/server";
import {
  errorResponse,
  handleApiError,
  isNextResponse,
} from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const authorization = await requireRole("member");
  if (isNextResponse(authorization)) return authorization;

  const { id } = await params;
  if (!id || id.length > 10) {
    return errorResponse("ID transaksi tidak valid", 400);
  }

  try {
    const [transaction, points] = await Promise.all([
      prisma.transaksi.findFirst({
        where: { TransaksiID: id, MemberID: authorization.id },
        include: {
          Detail_Transaksi: {
            include: { Layanan: { select: { NamaLayanan: true } } },
          },
        },
      }),
      prisma.transaksi.aggregate({
        where: { MemberID: authorization.id },
        _sum: { PoinDiperoleh: true, PoinDigunakan: true },
      }),
    ]);

    if (!transaction) return errorResponse("Transaksi tidak ditemukan", 404);

    return NextResponse.json({
      data: {
        TransaksiID: transaction.TransaksiID,
        Tanggal: transaction.TanggalTransaksi,
        layanan: transaction.Detail_Transaksi.map(
          (detail) => detail.Layanan.NamaLayanan,
        ).join(", "),
        TotalTransaksi: transaction.TotalTransaksi.toNumber(),
        diskon: (transaction.PoinDigunakan ?? 0) * 100,
        status: "Berhasil",
        poinDiperoleh: transaction.PoinDiperoleh ?? 0,
        saldoPoin:
          (points._sum.PoinDiperoleh ?? 0) - (points._sum.PoinDigunakan ?? 0),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
