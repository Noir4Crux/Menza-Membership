import { errorResponse } from "@/lib/admin-api";

export function monthRange(monthValue: string | null, yearValue: string | null) {
  if (
    !monthValue ||
    !yearValue ||
    !/^\d{1,2}$/.test(monthValue) ||
    !/^\d{4}$/.test(yearValue)
  ) {
    return null;
  }

  const month = Number(monthValue);
  const year = Number(yearValue);
  if (month < 1 || month > 12 || year < 1000 || year > 9999) return null;

  return {
    start: new Date(Date.UTC(year, month - 1, 1)),
    end: new Date(Date.UTC(year, month, 1)),
  };
}

export function handleOwnerApiError(error: unknown) {
  console.error("Owner API request failed:", error);
  return errorResponse("Terjadi kesalahan server", 500);
}
