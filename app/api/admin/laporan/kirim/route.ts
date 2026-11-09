import { NextResponse } from "next/server";
import { errorResponse, handleApiError, isNextResponse, isRecord } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

function validMonthYear(month: unknown, year: unknown) {
  return (
    Number.isInteger(month) &&
    typeof month === "number" &&
    month >= 1 &&
    month <= 12 &&
    Number.isInteger(year) &&
    typeof year === "number" &&
    year >= 1000 &&
    year <= 9999
  );
}

export async function POST(request: Request) {
  const authorization = await requireRole("administrator");
  if (isNextResponse(authorization)) return authorization;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Body JSON tidak valid", 400);
  }
  if (
    !isRecord(body) ||
    !validMonthYear(body.bulan, body.tahun) ||
    Object.keys(body).some((key) => !["bulan", "tahun"].includes(key))
  ) {
    return errorResponse("Bulan dan tahun tidak valid", 400);
  }

  const bulan = body.bulan as number;
  const tahun = body.tahun as number;
  const start = new Date(Date.UTC(tahun, bulan - 1, 1));
  const end = new Date(Date.UTC(tahun, bulan, 1));
  const where = { TanggalTransaksi: { gte: start, lt: end } };

  try {
    const result = await prisma.$transaction(async (tx) => {
      const owner = await tx.owner.findUnique({
        where: { OwnerID: "OWN001" },
        select: { OwnerID: true },
      });
      if (!owner) return null;

      const [jumlahTransaksi, revenue] = await Promise.all([
        tx.transaksi.count({ where }),
        tx.transaksi.aggregate({
          where,
          _sum: { TotalTransaksi: true },
        }),
      ]);
      const totalPendapatan = revenue._sum.TotalTransaksi?.toNumber() ?? 0;
      const bulanText = String(bulan).padStart(2, "0");

      await tx.transaksi.updateMany({
        where: { ...where, OwnerID: null },
        data: { OwnerID: owner.OwnerID },
      });
      await tx.notifikasi.create({
        data: {
          Penerima: owner.OwnerID,
          Jenis: "Laporan Bulanan",
          Pesan: `Laporan bulan ${bulanText} tahun ${tahun}: ${jumlahTransaksi} transaksi, total pendapatan Rp${totalPendapatan}.`,
        },
      });
      return { jumlahTransaksi };
    });

    if (!result) return errorResponse("Owner OWN001 tidak ditemukan", 404);
    return NextResponse.json({ data: result });
  } catch (error) {
    return handleApiError(error);
  }
}
