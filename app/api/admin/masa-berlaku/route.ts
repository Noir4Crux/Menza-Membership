import { NextResponse } from "next/server";
import {
  errorResponse,
  handleApiError,
  isNextResponse,
  utcToday,
} from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export async function GET(request: Request) {
  const authorization = await requireRole("administrator");
  if (isNextResponse(authorization)) return authorization;

  const searchParams = new URL(request.url).searchParams;
  const q = searchParams.get("q") ?? "";
  const status = searchParams.get("status");
  if (q.length > 100) return errorResponse("Parameter q maksimal 100 karakter", 400);
  if (status !== null && (!status.trim() || status.length > 15)) {
    return errorResponse("Parameter status tidak valid", 400);
  }

  try {
    if (status !== null) {
      const membership = await prisma.membership.findUnique({
        where: { StatusMembership: status },
        select: { StatusMembership: true },
      });
      if (!membership) return errorResponse("Status membership tidak ditemukan", 400);
    }

    const today = utcToday();
    const nextThirtyDays = new Date(today);
    nextThirtyDays.setUTCDate(nextThirtyDays.getUTCDate() + 30);
    await prisma.member.updateMany({
      where: {
        StatusMembership: "Aktif",
        Member_Info: { is: { MasaBerlaku: { lt: today } } },
      },
      data: { StatusMembership: "Kadaluarsa" },
    });

    const members = await prisma.member.findMany({
      where: {
        ...(status ? { StatusMembership: status } : {}),
        ...(q
          ? {
              OR: [
                { MemberID: { contains: q, mode: "insensitive" as const } },
                { NamaMember: { contains: q, mode: "insensitive" as const } },
                {
                  Member_Info: {
                    is: {
                      NomorHP: { contains: q, mode: "insensitive" as const },
                    },
                  },
                },
              ],
            }
          : {}),
      },
      include: {
        Member_Info: true,
        Transaksi_Transaksi_MemberIDToMember: {
          orderBy: [{ TanggalTransaksi: "desc" }, { TransaksiID: "desc" }],
          take: 1,
          select: { TanggalTransaksi: true },
        },
      },
      orderBy: { MemberID: "asc" },
    });

    const data = members.map((member) => {
      const masaBerlaku = member.Member_Info?.MasaBerlaku ?? null;
      return {
        MemberID: member.MemberID,
        NamaMember: member.NamaMember,
        StatusMembership: member.StatusMembership,
        MasaBerlaku: masaBerlaku,
        terakhirBayar:
          member.Transaksi_Transaksi_MemberIDToMember[0]?.TanggalTransaksi ?? null,
        segeraBerakhir:
          masaBerlaku !== null &&
          masaBerlaku >= today &&
          masaBerlaku <= nextThirtyDays,
      };
    });
    return NextResponse.json({ data });
  } catch (error) {
    return handleApiError(error);
  }
}
