import { NextResponse } from "next/server";
import { handleOwnerApiError } from "@/lib/owner-api";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { isNextResponse } from "@/lib/admin-api";

export async function GET() {
  const authorization = await requireRole("owner");
  if (isNextResponse(authorization)) return authorization;

  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  const where = {
    OwnerID: authorization.id,
    TanggalTransaksi: { gte: start, lt: end },
  };

  try {
    const [notifikasiBelumDibaca, jumlahTransaksi, pendapatan] =
      await Promise.all([
        prisma.notifikasi.count({
          where: { Penerima: authorization.id, Dibaca: false },
        }),
        prisma.transaksi.count({ where }),
        prisma.transaksi.aggregate({
          where,
          _sum: { TotalTransaksi: true },
        }),
      ]);

    return NextResponse.json({
      data: {
        notifikasiBelumDibaca,
        bulanIni: {
          jumlahTransaksi,
          totalPendapatan: pendapatan._sum.TotalTransaksi?.toNumber() ?? 0,
        },
      },
    });
  } catch (error) {
    return handleOwnerApiError(error);
  }
}
