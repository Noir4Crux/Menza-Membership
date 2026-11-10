"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import Sidebar from "../../../components/Sidebar";
import Topbar from "../../../components/Topbar";

type TransactionRow = {
  Tanggal: string;
  TransaksiID: string;
  MemberID: string;
  NamaMember: string;
  Layanan: string;
  Barber: string;
  TotalTransaksi: number;
};

type Rekap = {
  baris: TransactionRow[];
  ringkasan: {
    jumlahTransaksi: number;
    totalPendapatan: number;
  };
};

type ApiResult<T> = { data: T } | { error: string };

async function requestApi<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  let result: ApiResult<T>;
  try {
    result = (await response.json()) as ApiResult<T>;
  } catch {
    throw new Error("Respons server tidak valid.");
  }
  if (!response.ok) {
    throw new Error("error" in result ? result.error : "Permintaan gagal.");
  }
  if (!("data" in result)) throw new Error("Respons server tidak valid.");
  return result.data;
}

function formatRupiah(value: number) {
  const rounded = Math.round(value);
  const sign = rounded < 0 ? "-" : "";
  const digits = String(Math.abs(rounded));
  const groups: string[] = [];
  for (let end = digits.length; end > 0; end -= 3) {
    groups.unshift(digits.slice(Math.max(0, end - 3), end));
  }
  return `Rp ${sign}${groups.join(".")}`;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return `${String(date.getUTCDate()).padStart(2, "0")}/${String(date.getUTCMonth() + 1).padStart(2, "0")}/${date.getUTCFullYear()}`;
}

const months = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];
const years = [2024, 2025, 2026];
const inputClass =
  "mt-2 h-[42px] w-full rounded-md border border-[#c9c9c9] bg-white px-3 text-sm outline-none focus:border-[#333] sm:w-[220px]";

export default function OwnerRekapPage() {
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [period, setPeriod] = useState<{
    month: number;
    year: number;
    request: number;
  } | null>(null);
  const [rekap, setRekap] = useState<Rekap | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const current = new Date();
      setMonth(String(current.getMonth() + 1));
      setYear(String(current.getFullYear()));
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const selectedPeriod = period;
    if (!selectedPeriod) return;
    const selectedMonth = selectedPeriod.month;
    const selectedYear = selectedPeriod.year;
    const controller = new AbortController();
    async function loadRekap() {
      setLoading(true);
      setRekap(null);
      setError("");
      try {
        const params = new URLSearchParams({
          bulan: String(selectedMonth),
          tahun: String(selectedYear),
        });
        const data = await requestApi<Rekap>(
          `/api/owner/rekap?${params.toString()}`,
          { signal: controller.signal },
        );
        if (!controller.signal.aborted) setRekap(data);
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Gagal memuat rekap transaksi.",
          );
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadRekap();
    return () => controller.abort();
  }, [period]);

  function showRekap(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const monthNumber = Number(month);
    const yearNumber = Number(year);
    if (
      !Number.isInteger(monthNumber) ||
      monthNumber < 1 ||
      monthNumber > 12 ||
      !Number.isInteger(yearNumber) ||
      yearNumber < 1000 ||
      yearNumber > 9999
    ) {
      setError("Pilih bulan dan tahun yang valid.");
      return;
    }
    setRekap(null);
    setError("");
    setPeriod((current) => ({
      month: monthNumber,
      year: yearNumber,
      request: (current?.request ?? 0) + 1,
    }));
  }

  return (
    <div className="min-h-screen bg-[#efefed] font-sans text-[#1a1a1a]">
      <Sidebar role="owner" />
      <Topbar title="Rekap Transaksi" role="owner" />
      <main className="min-h-screen pt-[76px] md:ml-[240px]">
        <div className="mx-auto w-full max-w-[1200px] px-5 py-[24px] md:px-[36px]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-[20px] font-bold">Rekap Transaksi</h1>
            <Link
              href="/owner/dashboard"
              className="rounded-md border border-[#252525] bg-white px-4 py-2 text-sm font-bold hover:bg-[#f5f5f2]"
            >
              Kembali
            </Link>
          </div>

          <form
            onSubmit={showRekap}
            className="mt-6 flex flex-wrap items-end gap-4 rounded-lg border border-[#dededb] bg-white p-5 md:p-6"
          >
            <label className="text-sm font-semibold">
              Bulan
              <select
                className={inputClass}
                value={month}
                onChange={(event) => setMonth(event.target.value)}
              >
                <option value="">Pilih bulan</option>
                {months.map((label, index) => (
                  <option key={label} value={String(index + 1)}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold">
              Tahun
              <select
                className={inputClass}
                value={year}
                onChange={(event) => setYear(event.target.value)}
              >
                <option value="">Pilih tahun</option>
                {years.map((option) => (
                  <option key={option} value={String(option)}>
                    {option}
                  </option>
                ))}
                {year && !years.includes(Number(year)) && (
                  <option value={year}>{year}</option>
                )}
              </select>
            </label>
            <button
              type="submit"
              className="h-[42px] rounded-md bg-[#a32626] px-5 text-sm font-bold text-white hover:bg-[#842020] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
            >
              Tampilkan
            </button>
          </form>

          {error && (
            <p role="alert" className="mt-4 text-sm text-red-600">
              {error}
            </p>
          )}

          {loading && (
            <p className="mt-6 text-sm text-[#686863]">Memuat...</p>
          )}

          {rekap && !loading && !error && (
            <>
              <section className="mt-6 overflow-hidden rounded-lg border border-[#dededb] bg-white">
                {rekap.baris.length === 0 ? (
                  <p className="p-6 text-sm text-[#686863]">
                    Belum ada rekap untuk periode ini
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px] border-collapse text-left text-sm">
                      <thead className="bg-[#f5f5f2]">
                        <tr>
                          {[
                            "Tanggal",
                            "ID Transaksi",
                            "Member",
                            "Layanan",
                            "Barber",
                            "Total",
                          ].map((heading) => (
                            <th
                              key={heading}
                              scope="col"
                              className="px-4 py-3 font-bold"
                            >
                              {heading}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {rekap.baris.map((row) => (
                          <tr
                            key={row.TransaksiID}
                            className="border-t border-[#e7e7e4]"
                          >
                            <td className="whitespace-nowrap px-4 py-3">
                              {formatDate(row.Tanggal)}
                            </td>
                            <td className="whitespace-nowrap px-4 py-3">
                              {row.TransaksiID}
                            </td>
                            <td className="px-4 py-3">
                              <span className="block font-semibold">
                                {row.NamaMember}
                              </span>
                              <span className="text-xs text-[#686863]">
                                {row.MemberID}
                              </span>
                            </td>
                            <td className="px-4 py-3">{row.Layanan || "—"}</td>
                            <td className="px-4 py-3">{row.Barber}</td>
                            <td className="whitespace-nowrap px-4 py-3 font-semibold">
                              {formatRupiah(row.TotalTransaksi)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
              <section className="mt-5 grid gap-4 sm:grid-cols-2">
                <article className="rounded-lg border border-[#dededb] bg-white p-5">
                  <p className="text-sm text-[#686863]">Jumlah Transaksi</p>
                  <p className="mt-2 text-2xl font-bold">
                    {rekap.ringkasan.jumlahTransaksi}
                  </p>
                </article>
                <article className="rounded-lg border border-[#dededb] bg-white p-5">
                  <p className="text-sm text-[#686863]">Total Pendapatan</p>
                  <p className="mt-2 text-2xl font-bold">
                    {formatRupiah(rekap.ringkasan.totalPendapatan)}
                  </p>
                </article>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
