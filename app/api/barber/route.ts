import { NextResponse } from "next/server";
import { isNextResponse, handleApiError } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export async function GET() {
  const authorization = await requireRole("administrator");
  if (isNextResponse(authorization)) return authorization;

  try {
    const data = await prisma.barber.findMany({
      select: { BarberID: true, NamaBarber: true },
      orderBy: { BarberID: "asc" },
    });
    return NextResponse.json({ data });
  } catch (error) {
    return handleApiError(error);
  }
}
