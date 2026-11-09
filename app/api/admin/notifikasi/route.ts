import { NextResponse } from "next/server";
import {
  errorResponse,
  handleApiError,
  isNextResponse,
  isRecord,
  utcToday,
} from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export async function GET() {
  const authorization = await requireRole("administrator");
  if (isNextResponse(authorization)) return authorization;

  try {
    const today = utcToday();
    const nextThirtyDays = new Date(today);
    nextThirtyDays.setUTCDate(nextThirtyDays.getUTCDate() + 30);
    const [expiringMembers, riwayat] = await Promise.all([
      prisma.member.findMany({
        where: {
          StatusMembership: "Aktif",
          Member_Info: {
            is: { MasaBerlaku: { gte: today, lte: nextThirtyDays } },
          },
        },
        include: { Member_Info: true },
        orderBy: { MemberID: "asc" },
      }),
      prisma.notifikasi.findMany({
        orderBy: [{ Tanggal: "desc" }, { NotifikasiID: "desc" }],
        take: 50,
      }),
    ]);

    const pengingat = expiringMembers.map((member) => ({
      MemberID: member.MemberID,
      NamaMember: member.NamaMember,
      NomorHP: member.Member_Info?.NomorHP ?? null,
      MasaBerlaku: member.Member_Info?.MasaBerlaku ?? null,
    }));
    return NextResponse.json({ data: { pengingat, riwayat } });
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
    typeof body.penerima !== "string" ||
    !body.penerima.trim() ||
    body.penerima.length > 10 ||
    typeof body.jenis !== "string" ||
    !body.jenis.trim() ||
    body.jenis.length > 30 ||
    typeof body.pesan !== "string" ||
    !body.pesan.trim() ||
    body.pesan.length > 300 ||
    Object.keys(body).some(
      (key) => !["penerima", "jenis", "pesan"].includes(key),
    )
  ) {
    return errorResponse("Input notifikasi tidak valid", 400);
  }

  const penerima = body.penerima.trim();
  const jenis = body.jenis.trim();
  const pesan = body.pesan.trim();

  try {
    if (penerima === "SEMUA") {
      const activeMembers = await prisma.member.findMany({
        where: { StatusMembership: "Aktif" },
        select: { MemberID: true },
      });
      if (activeMembers.length === 0) {
        return NextResponse.json({ data: { count: 0 } }, { status: 201 });
      }
      const result = await prisma.notifikasi.createMany({
        data: activeMembers.map((member) => ({
          Penerima: member.MemberID,
          Jenis: jenis,
          Pesan: pesan,
        })),
      });
      return NextResponse.json({ data: { count: result.count } }, { status: 201 });
    }

    const member = await prisma.member.findUnique({
      where: { MemberID: penerima },
      select: { MemberID: true },
    });
    if (!member) return errorResponse("Member tidak ditemukan", 404);

    const data = await prisma.notifikasi.create({
      data: { Penerima: member.MemberID, Jenis: jenis, Pesan: pesan },
    });
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
