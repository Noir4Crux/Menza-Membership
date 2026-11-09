import { NextResponse } from "next/server";
import { handleApiError, isNextResponse } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export async function GET() {
  const authorization = await requireRole("administrator");
  if (isNextResponse(authorization)) return authorization;

  try {
    const layanan = await prisma.layanan.findMany({
      select: { LayananID: true, NamaLayanan: true, HargaLayanan: true },
      orderBy: { LayananID: "asc" },
    });
    const data = layanan.map((item) => ({
      ...item,
      HargaLayanan: item.HargaLayanan.toNumber(),
    }));
    return NextResponse.json({ data });
  } catch (error) {
    return handleApiError(error);
  }
}
