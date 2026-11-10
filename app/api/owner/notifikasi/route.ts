import { NextResponse } from "next/server";
import { handleOwnerApiError } from "@/lib/owner-api";
import { prisma } from "@/lib/prisma";
import { isNextResponse } from "@/lib/admin-api";
import { requireRole } from "@/lib/session";

export async function GET() {
  const authorization = await requireRole("owner");
  if (isNextResponse(authorization)) return authorization;

  try {
    const notifications = await prisma.notifikasi.findMany({
      where: { Penerima: authorization.id },
      select: {
        NotifikasiID: true,
        Tanggal: true,
        Pesan: true,
        Dibaca: true,
      },
      orderBy: [{ Tanggal: "desc" }, { NotifikasiID: "desc" }],
    });

    return NextResponse.json({
      data: notifications.map((notification) => ({
        id: notification.NotifikasiID,
        Tanggal: notification.Tanggal,
        Pesan: notification.Pesan,
        Dibaca: notification.Dibaca,
      })),
    });
  } catch (error) {
    return handleOwnerApiError(error);
  }
}
