import { NextResponse } from "next/server";
import {
  errorResponse,
  handleApiError,
  isNextResponse,
} from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export async function GET() {
  const authorization = await requireRole("member");
  if (isNextResponse(authorization)) return authorization;

  try {
    const member = await prisma.member.findUnique({
      where: { MemberID: authorization.id },
      select: {
        MemberID: true,
        NamaMember: true,
        StatusMembership: true,
        Membership: { select: { Benefit: true } },
        Member_Info: {
          select: { MasaBerlaku: true, TanggalDaftar: true },
        },
      },
    });
    if (!member) return errorResponse("Member tidak ditemukan", 404);

    const points = await prisma.transaksi.aggregate({
      where: { MemberID: authorization.id },
      _sum: { PoinDiperoleh: true, PoinDigunakan: true },
    });

    return NextResponse.json({
      data: {
        MemberID: member.MemberID,
        NamaMember: member.NamaMember,
        StatusMembership: member.StatusMembership,
        Benefit: member.Membership.Benefit,
        saldoPoin:
          (points._sum.PoinDiperoleh ?? 0) - (points._sum.PoinDigunakan ?? 0),
        MasaBerlaku: member.Member_Info?.MasaBerlaku ?? null,
        TanggalDaftar: member.Member_Info?.TanggalDaftar ?? null,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
