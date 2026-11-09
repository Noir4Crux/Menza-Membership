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

export async function PATCH(request: Request, { params }: RouteContext) {
  const authorization = await requireRole("administrator");
  if (isNextResponse(authorization)) return authorization;

  const { id } = await params;
  if (!id || id.length > 10) return errorResponse("ID member tidak valid", 400);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Body JSON tidak valid", 400);
  }
  if (
    !isRecord(body) ||
    typeof body.status !== "string" ||
    !body.status.trim() ||
    body.status.length > 15 ||
    !parseDateOnly(body.masaBerlaku) ||
    Object.keys(body).some((key) => !["masaBerlaku", "status"].includes(key))
  ) {
    return errorResponse("Input masa berlaku tidak valid", 400);
  }

  try {
    const membership = await prisma.membership.findUnique({
      where: { StatusMembership: body.status.trim() },
      select: { StatusMembership: true },
    });
    if (!membership) return errorResponse("Status membership tidak ditemukan", 400);

    const member = await prisma.member.findUnique({
      where: { MemberID: id },
      select: { MemberID: true },
    });
    if (!member) return errorResponse("Member tidak ditemukan", 404);

    const data = await prisma.$transaction(async (tx) => {
      await tx.member.update({
        where: { MemberID: id },
        data: { StatusMembership: membership.StatusMembership },
      });
      await tx.member_Info.upsert({
        where: { MemberID: id },
        create: { MemberID: id, MasaBerlaku: parseDateOnly(body.masaBerlaku)! },
        update: { MasaBerlaku: parseDateOnly(body.masaBerlaku)! },
      });
      return tx.member.findUnique({
        where: { MemberID: id },
        include: { Member_Info: true },
      });
    });
    return NextResponse.json({ data });
  } catch (error) {
    return handleApiError(error);
  }
}
