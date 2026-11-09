import { NextResponse } from "next/server";
import {
  errorResponse,
  handleApiError,
  isNextResponse,
  isRecord,
} from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

function isOptionalText(
  value: unknown,
  maxLength: number,
  nullable = false,
): value is string | null {
  return (
    (nullable && value === null) ||
    (typeof value === "string" &&
      value.trim().length > 0 &&
      value.length <= maxLength)
  );
}

export async function GET(request: Request) {
  const authorization = await requireRole("administrator");
  if (isNextResponse(authorization)) return authorization;

  const q = new URL(request.url).searchParams.get("q") ?? "";
  if (q.length > 100) {
    return errorResponse("Parameter q maksimal 100 karakter", 400);
  }

  try {
    const members = await prisma.member.findMany({
      where: q
        ? {
            OR: [
              { MemberID: { contains: q, mode: "insensitive" } },
              { NamaMember: { contains: q, mode: "insensitive" } },
              {
                Member_Info: {
                  is: {
                    NomorHP: { contains: q, mode: "insensitive" },
                  },
                },
              },
            ],
          }
        : undefined,
      include: { Member_Info: true },
      orderBy: { MemberID: "asc" },
    });

    const pointTotals =
      members.length === 0
        ? []
        : await prisma.transaksi.groupBy({
            by: ["MemberID"],
            where: { MemberID: { in: members.map((member) => member.MemberID) } },
            _sum: { PoinDiperoleh: true, PoinDigunakan: true },
          });
    const pointsByMember = new Map(
      pointTotals.map((points) => [
        points.MemberID,
        (points._sum.PoinDiperoleh ?? 0) - (points._sum.PoinDigunakan ?? 0),
      ]),
    );
    const data = members.map((member) => ({
      MemberID: member.MemberID,
      NamaMember: member.NamaMember,
      NomorHP: member.Member_Info?.NomorHP ?? null,
      StatusMembership: member.StatusMembership,
      MasaBerlaku: member.Member_Info?.MasaBerlaku ?? null,
      saldoPoin: pointsByMember.get(member.MemberID) ?? 0,
    }));

    return NextResponse.json({ data });
  } catch (error) {
    return handleApiError(error);
  }
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
    typeof body.NamaMember !== "string" ||
    body.NamaMember.trim().length === 0 ||
    body.NamaMember.length > 50 ||
    !("NomorHP" in body) ||
    !isOptionalText(body.NomorHP, 15, true) ||
    (body.StatusMembership !== undefined &&
      !isOptionalText(body.StatusMembership, 15))
  ) {
    return errorResponse("Input member tidak valid", 400);
  }

  const NamaMember = body.NamaMember.trim();
  const NomorHP = typeof body.NomorHP === "string" ? body.NomorHP.trim() : null;
  const StatusMembership =
    typeof body.StatusMembership === "string"
      ? body.StatusMembership.trim()
      : "Menunggu";

  try {
    const data = await prisma.$transaction(
      async (tx) => {
        const membership = await tx.membership.findUnique({
          where: { StatusMembership },
          select: { StatusMembership: true },
        });
        if (!membership) {
          return null;
        }

        const existingIds = await tx.member.findMany({
          where: { MemberID: { startsWith: "MBR" } },
          select: { MemberID: true },
        });
        const lastNumber = existingIds.reduce((max, member) => {
          const match = /^MBR(\d{3})$/.exec(member.MemberID);
          return match ? Math.max(max, Number(match[1])) : max;
        }, 0);
        const nextNumber = lastNumber + 1;
        if (nextNumber > 999) {
          throw new RangeError("No member IDs remain in the MBR001-MBR999 range.");
        }
        const MemberID = `MBR${String(nextNumber).padStart(3, "0")}`;

        await tx.member.create({
          data: {
            MemberID,
            NamaMember,
            StatusMembership,
            Member_Info: { create: { NomorHP } },
          },
        });
        return { MemberID, NamaMember, NomorHP, StatusMembership };
      },
      { isolationLevel: "Serializable" },
    );

    if (!data) {
      return errorResponse("Status membership tidak ditemukan", 400);
    }
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    if (error instanceof RangeError) {
      return errorResponse("Nomor ID member sudah habis", 409);
    }
    return handleApiError(error);
  }
}
