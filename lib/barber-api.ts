import { NextResponse } from "next/server";

export function errorResponse(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

export function handleBarberApiError(error: unknown) {
  console.error("Barber API request failed:", error);
  return errorResponse("Terjadi kesalahan server", 500);
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function getServiceStatus(
  status: { Status: string } | null | undefined,
) {
  return status?.Status ?? "Menunggu";
}
