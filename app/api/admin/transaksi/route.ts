import { NextResponse } from "next/server";
import {
  errorResponse,
  handleApiError,
  isNextResponse,
  isRecord,
  parseDateOnly,
  utcToday,
} from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

function nextIdentifier(current: string | null, prefix: "TK" | "DT", width: number) {
  const currentNumber =
    current && current.startsWith(prefix)
      ? Number(current.slice(prefix.length))
      : 0;
  const nextNumber = currentNumber + 1;
  if (!Number.isSafeInteger(nextNumber) || nextNumber >= 10 ** width) {
    throw new RangeError(`Nomor ${prefix} sudah habis.`);
  }
  return `${prefix}${String(nextNumber).padStart(width, "0")}`;
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
    typeof body.MemberID !== "string" ||
    !body.MemberID.trim() ||
    body.MemberID.length > 10 ||
    typeof body.BarberID !== "string" ||
    !body.BarberID.trim() ||
    body.BarberID.length > 10 ||
    !Array.isArray(body.layananIds) ||
    body.layananIds.length === 0 ||
    body.layananIds.length > 100 ||
    body.layananIds.some(
      (id) => typeof id !== "string" || !id.trim() || id.length > 5,
    ) ||
    new Set(body.layananIds).size !== body.layananIds.length ||
    typeof body.gunakanPoin !== "boolean" ||
    (body.tanggal !== undefined && !parseDateOnly(body.tanggal)) ||
    Object.keys(body).some(
      (key) =>
        ![
          "MemberID",
          "BarberID",
          "layananIds",
          "gunakanPoin",
          "tanggal",
        ].includes(key),
    )
  ) {
    return errorResponse("Input transaksi tidak valid", 400);
  }

  const MemberID = body.MemberID.trim();
  const BarberID = body.BarberID.trim();
  const layananIds = body.layananIds as string[];
  const tanggalTransaksi =
    body.tanggal === undefined
      ? utcToday()
      : parseDateOnly(body.tanggal)!;

  try {
    const data = await prisma.$transaction(
      async (tx) => {
        const [member, barber, layanan] = await Promise.all([
          tx.member.findUnique({
            where: { MemberID },
            select: { MemberID: true, StatusMembership: true },
          }),
          tx.barber.findUnique({
            where: { BarberID },
            select: { BarberID: true },
          }),
          tx.layanan.findMany({
            where: { LayananID: { in: layananIds } },
            select: { LayananID: true, NamaLayanan: true, HargaLayanan: true },
          }),
        ]);
        if (!member) return { error: "Member tidak ditemukan", status: 404 };
        if (!barber) return { error: "Barber tidak ditemukan", status: 404 };
        if (layanan.length !== layananIds.length) {
          return { error: "Satu atau lebih layanan tidak ditemukan", status: 404 };
        }

        const pointTotals = await tx.transaksi.aggregate({
          where: { MemberID },
          _sum: { PoinDiperoleh: true, PoinDigunakan: true },
        });
        const saldo =
          (pointTotals._sum.PoinDiperoleh ?? 0) -
          (pointTotals._sum.PoinDigunakan ?? 0);
        const totalCents = layanan.reduce(
          (sum, item) => sum + Math.round(item.HargaLayanan.toNumber() * 100),
          0,
        );
        const aktif = member.StatusMembership === "Aktif";
        const poinDiperoleh = aktif ? 5 : 0;
        const poinDipakai =
          aktif && body.gunakanPoin
            ? Math.max(0, Math.min(saldo, Math.floor(totalCents / 10_000)))
            : 0;
        const diskonCents = poinDipakai * 10_000;
        const totalTransaksi = (totalCents - diskonCents) / 100;

        const lastTransaction = await tx.transaksi.findFirst({
          where: { TransaksiID: { startsWith: "TK" } },
          orderBy: { TransaksiID: "desc" },
          select: { TransaksiID: true },
        });
        const TransaksiID = nextIdentifier(
          lastTransaction?.TransaksiID ?? null,
          "TK",
          7,
        );

        const lastDetail = await tx.detail_Transaksi.findFirst({
          where: { TransaksiID: { startsWith: "DT" } },
          orderBy: { TransaksiID: "desc" },
          select: { TransaksiID: true },
        });
        const detailIds: string[] = [];
        let previousDetailId = lastDetail?.TransaksiID ?? null;
        for (let index = 0; index < layanan.length; index += 1) {
          previousDetailId = nextIdentifier(previousDetailId, "DT", 8);
          detailIds.push(previousDetailId);
        }

        const transaksi = await tx.transaksi.create({
          data: {
            TransaksiID,
            TanggalTransaksi: tanggalTransaksi,
            MemberID,
            StatusMembership: member.StatusMembership,
            TotalTransaksi: totalTransaksi,
            PoinDiperoleh: poinDiperoleh,
            PoinDigunakan: poinDipakai,
            Benefit: poinDipakai > 0 ? "Diskon Poin" : null,
            AdminID: authorization.id,
            BarberID,
            OwnerID: null,
          },
        });
        const detail = await Promise.all(
          layanan.map((item, index) =>
            tx.detail_Transaksi.create({
              data: {
                TransaksiID: detailIds[index]!,
                LayananID: item.LayananID,
                HargaSaatTransaksi: item.HargaLayanan,
                TransaksiTransaksiID: TransaksiID,
              },
            }),
          ),
        );

        return {
          transaksi: {
            ...transaksi,
            TotalTransaksi: transaksi.TotalTransaksi.toNumber(),
          },
          detail: detail.map((item) => ({
            ...item,
            HargaSaatTransaksi: item.HargaSaatTransaksi.toNumber(),
          })),
          saldoBaru: saldo - poinDipakai + poinDiperoleh,
        };
      },
      { isolationLevel: "Serializable" },
    );

    if (
      "error" in data &&
      typeof data.error === "string" &&
      typeof data.status === "number"
    ) {
      return errorResponse(data.error, data.status);
    }
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    if (error instanceof RangeError) return errorResponse(error.message, 409);
    return handleApiError(error);
  }
}
