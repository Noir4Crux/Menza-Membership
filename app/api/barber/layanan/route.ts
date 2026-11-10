import { NextResponse } from "next/server";
import { getServiceStatus, handleBarberApiError } from "@/lib/barber-api";
import { errorResponse, isNextResponse } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

const statusOrder: Record<string, number> = {
  Menunggu: 0,
  "Sedang Dikerjakan": 1,
  Selesai: 2,
};

export async function GET(request: Request) {
  const authorization = await requireRole("barber");
  if (isNextResponse(authorization)) return authorization;

  const searchParams = new URL(request.url).searchParams;
  const q = searchParams.get("q")?.trim() ?? "";
  if (q.length > 100) {
    return errorResponse("Parameter q maksimal 100 karakter", 400);
  }

  try {
    const transactions = await prisma.transaksi.findMany({
      where: {
        BarberID: authorization.id,
        ...(q
          ? {
              Member_Transaksi_MemberIDToMember: {
                OR: [
                  { MemberID: { contains: q, mode: "insensitive" as const } },
                  { NamaMember: { contains: q, mode: "insensitive" as const } },
                ],
              },
            }
          : {}),
      },
      select: {
        TransaksiID: true,
        MemberID: true,
        TanggalTransaksi: true,
        Member_Transaksi_MemberIDToMember: {
          select: { NamaMember: true },
        },
        Detail_Transaksi: {
          select: { Layanan: { select: { NamaLayanan: true } } },
        },
        Status_Layanan: { select: { Status: true } },
      },
    });

    const data = transactions
      .map((transaction) => ({
        TransaksiID: transaction.TransaksiID,
        MemberID: transaction.MemberID,
        NamaMember: transaction.Member_Transaksi_MemberIDToMember.NamaMember,
        layanan: transaction.Detail_Transaksi.map(
          (detail) => detail.Layanan.NamaLayanan,
        ).join(", "),
        TanggalTransaksi: transaction.TanggalTransaksi,
        status: getServiceStatus(transaction.Status_Layanan),
      }))
      .sort((a, b) => {
        const statusDifference =
          (statusOrder[a.status] ?? 3) - (statusOrder[b.status] ?? 3);
        if (statusDifference !== 0) return statusDifference;
        return (
          b.TanggalTransaksi.getTime() - a.TanggalTransaksi.getTime() ||
          b.TransaksiID.localeCompare(a.TransaksiID)
        );
      });

    return NextResponse.json({ data });
  } catch (error) {
    return handleBarberApiError(error);
  }
}
