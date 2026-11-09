import { NextResponse } from "next/server";
import {
  errorResponse,
  handleApiError,
  isNextResponse,
  isRecord,
  parseDateOnly,
} from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

type RouteContext = { params: Promise<{ id: string }> };

function validId(id: string) {
  return id.length > 0 && id.length <= 10;
}

function validOptionalText(
  value: unknown,
  maxLength: number,
  nullable = false,
) {
  return (
    (nullable && value === null) ||
    (typeof value === "string" &&
      value.trim().length > 0 &&
      value.length <= maxLength)
  );
}

export async function GET(_request: Request, { params }: RouteContext) {
  const authorization = await requireRole("administrator");
  if (isNextResponse(authorization)) return authorization;

  const { id } = await params;
  if (!validId(id)) return errorResponse("ID member tidak valid", 400);

  try {
    const member = await prisma.member.findUnique({
      where: { MemberID: id },
      include: {
        Member_Info: true,
        Transaksi_Transaksi_MemberIDToMember: {
          orderBy: [{ TanggalTransaksi: "desc" }, { TransaksiID: "desc" }],
          take: 5,
          select: {
            TanggalTransaksi: true,
            TotalTransaksi: true,
            Detail_Transaksi: {
              select: { Layanan: { select: { NamaLayanan: true } } },
            },
          },
        },
      },
    });
    if (!member) return errorResponse("Member tidak ditemukan", 404);

    const points = await prisma.transaksi.aggregate({
      where: { MemberID: id },
      _sum: { PoinDiperoleh: true, PoinDigunakan: true },
    });
    const data = {
      MemberID: member.MemberID,
      NamaMember: member.NamaMember,
      StatusMembership: member.StatusMembership,
      Member_Info: member.Member_Info,
      saldoPoin:
        (points._sum.PoinDiperoleh ?? 0) - (points._sum.PoinDigunakan ?? 0),
      transaksi: member.Transaksi_Transaksi_MemberIDToMember.map((transaction) => ({
        tanggal: transaction.TanggalTransaksi,
        namaLayanan: transaction.Detail_Transaksi.map(
          (detail) => detail.Layanan.NamaLayanan,
        ),
        total: transaction.TotalTransaksi.toNumber(),
      })),
    };
    return NextResponse.json({ data });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const authorization = await requireRole("administrator");
  if (isNextResponse(authorization)) return authorization;

  const { id } = await params;
  if (!validId(id)) return errorResponse("ID member tidak valid", 400);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Body JSON tidak valid", 400);
  }
  if (!isRecord(body)) return errorResponse("Body tidak valid", 400);

  const allowedFields = [
    "NamaMember",
    "NomorHP",
    "StatusMembership",
    "MasaBerlaku",
  ];
  if (
    Object.keys(body).length === 0 ||
    Object.keys(body).some((key) => !allowedFields.includes(key))
  ) {
    return errorResponse("Input member tidak valid", 400);
  }

  if (
    ("NamaMember" in body && !validOptionalText(body.NamaMember, 50)) ||
    ("NomorHP" in body && !validOptionalText(body.NomorHP, 15, true)) ||
    ("StatusMembership" in body &&
      !validOptionalText(body.StatusMembership, 15)) ||
    ("MasaBerlaku" in body &&
      body.MasaBerlaku !== null &&
      !parseDateOnly(body.MasaBerlaku))
  ) {
    return errorResponse("Input member tidak valid", 400);
  }

  try {
    const data = await prisma.$transaction(async (tx) => {
      const current = await tx.member.findUnique({
        where: { MemberID: id },
        select: { MemberID: true },
      });
      if (!current) return null;

      const memberData: {
        NamaMember?: string;
        StatusMembership?: string;
      } = {};
      if (typeof body.NamaMember === "string") {
        memberData.NamaMember = body.NamaMember.trim();
      }
      if (typeof body.StatusMembership === "string") {
        const status = body.StatusMembership.trim();
        const membership = await tx.membership.findUnique({
          where: { StatusMembership: status },
          select: { StatusMembership: true },
        });
        if (!membership) return "invalid-status" as const;
        memberData.StatusMembership = status;
      }

      const infoData: { NomorHP?: string | null; MasaBerlaku?: Date | null } =
        {};
      if ("NomorHP" in body) {
        infoData.NomorHP =
          typeof body.NomorHP === "string" ? body.NomorHP.trim() : null;
      }
      if ("MasaBerlaku" in body) {
        infoData.MasaBerlaku =
          typeof body.MasaBerlaku === "string"
            ? parseDateOnly(body.MasaBerlaku)!
            : null;
      }

      if (Object.keys(memberData).length > 0) {
        await tx.member.update({ where: { MemberID: id }, data: memberData });
      }
      if (Object.keys(infoData).length > 0) {
        await tx.member_Info.upsert({
          where: { MemberID: id },
          create: { MemberID: id, ...infoData },
          update: infoData,
        });
      }
      return tx.member.findUnique({
        where: { MemberID: id },
        include: { Member_Info: true },
      });
    });

    if (!data) return errorResponse("Member tidak ditemukan", 404);
    if (data === "invalid-status") {
      return errorResponse("Status membership tidak ditemukan", 400);
    }
    return NextResponse.json({ data });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const authorization = await requireRole("administrator");
  if (isNextResponse(authorization)) return authorization;

  const { id } = await params;
  if (!validId(id)) return errorResponse("ID member tidak valid", 400);

  try {
    const result = await prisma.$transaction(async (tx) => {
      const member = await tx.member.findUnique({
        where: { MemberID: id },
        select: { MemberID: true },
      });
      if (!member) return "not-found" as const;

      const transactionCount = await tx.transaksi.count({
        where: { MemberID: id },
      });
      if (transactionCount > 0) return "has-transactions" as const;

      await tx.member.delete({ where: { MemberID: id } });
      return "deleted" as const;
    });
    if (result === "not-found") return errorResponse("Member tidak ditemukan", 404);
    if (result === "has-transactions") {
      return errorResponse("Member memiliki transaksi, tidak dapat dihapus", 409);
    }
    return NextResponse.json({ data: { MemberID: id } });
  } catch (error) {
    return handleApiError(error);
  }
}
