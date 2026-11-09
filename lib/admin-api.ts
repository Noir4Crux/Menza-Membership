import { NextResponse } from "next/server";

export function isNextResponse(value: unknown): value is NextResponse {
  return value instanceof NextResponse;
}

export function errorResponse(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

export function handleApiError(error: unknown) {
  console.error("Admin API request failed:", error);
  return errorResponse("Terjadi kesalahan server", 500);
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseDateOnly(value: unknown): Date | null {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    return null;
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10) === value ? date : null;
}

export function utcToday() {
  const today = new Date();
  return new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
  );
}

export function addUtcMonths(date: Date, months: number) {
  const result = new Date(date);
  result.setUTCMonth(result.getUTCMonth() + months);
  return result;
}
