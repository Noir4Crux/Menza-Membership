import { NextResponse } from "next/server";
import {
  addUtcMonths,
  errorResponse,
  handleApiError,
  isNextResponse,
  isRecord,
  parseDateOnly,
  utcToday,
} from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const authorization = await requireRole("administrator");
  if (isNextResponse(authorization)) return authorization;

  const { id } = await params;
  if (!id || id.length > 10) return errorResponse("ID member tidak valid", 400);

  try {
    const member = await prisma.member.findUnique({
      where: { MemberID: id },
      include: { Member_Info: true },
    });
    if (!member) return errorResponse("Pengajuan tidak ditemukan", 404);

    return NextResponse.json({
      data: {
        ID: member.MemberID,
        nama: member.NamaMember,
        nomorHP: member.Member_Info?.NomorHP ?? null,
        status: member.StatusMembership,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

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
    typeof body.valid !== "boolean" ||
    Object.keys(body).some(
      (key) => !["valid", "masaBerlaku", "catatan"].includes(key),
    ) ||
    (body.masaBerlaku !== undefined &&
      !parseDateOnly(body.masaBerlaku)) ||
    (body.catatan !== undefined &&
      body.catatan !== null &&
      (typeof body.catatan !== "string" ||
        body.catatan.trim().length === 0 ||
        body.catatan.length > 200))
  ) {
    return errorResponse("Input verifikasi tidak valid", 400);
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const member = await tx.member.findUnique({
        where: { MemberID: id },
        select: { MemberID: true, StatusMembership: true },
      });
      if (!member) return "not-found" as const;
      if (member.StatusMembership !== "Menunggu") {
        return "already-reviewed" as const;
      }

      const status = body.valid ? "Aktif" : "Ditolak";
      const membership = await tx.membership.findUnique({
        where: { StatusMembership: status },
        select: { StatusMembership: true },
      });
      if (!membership) return "invalid-status" as const;

      const masaBerlaku = body.valid
        ? body.masaBerlaku
          ? parseDateOnly(body.masaBerlaku)!
          : addUtcMonths(utcToday(), 12)
        : undefined;
      const infoData: {
        MasaBerlaku?: Date;
        Catatan?: string | null;
      } = {};
      if (body.valid) infoData.MasaBerlaku = masaBerlaku;
      if ("catatan" in body) {
        infoData.Catatan =
          typeof body.catatan === "string" ? body.catatan.trim() : null;
      }

      await tx.member.update({
        where: { MemberID: id },
        data: { StatusMembership: status },
      });
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

    if (result === "not-found") {
      return errorResponse("Pengajuan tidak ditemukan", 404);
    }
    if (result === "already-reviewed") {
      return errorResponse("Pengajuan sudah diproses", 409);
    }
    if (result === "invalid-status") {
      return errorResponse("Status membership tidak ditemukan", 400);
    }
    return NextResponse.json({ data: result });
  } catch (error) {
    return handleApiError(error);
  }
}
