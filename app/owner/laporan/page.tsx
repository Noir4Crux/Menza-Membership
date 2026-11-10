"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Sidebar from "../../../components/Sidebar";
import Topbar from "../../../components/Topbar";

type Report = {
  jumlahMemberAktif: number;
  jumlahTransaksi: number;
  jumlahKunjungan: number;
  totalPendapatan: number;
  layananTerlaris: { nama: string; jumlah: number } | null;
  totalPoinDiberikan: number;
  totalPoinDipakai: number;
  grafik: { bulan: string; total: number }[];
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

export default function OwnerLaporanPage() {
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!month || !year) return;

    const controller = new AbortController();
    async function loadReport() {
      setLoading(true);
      setReport(null);
      setError("");
      try {
        const params = new URLSearchParams({ bulan: month, tahun: year });
        const data = await requestApi<Report>(
          `/api/owner/laporan?${params.toString()}`,
          { signal: controller.signal },
        );
        if (!controller.signal.aborted) setReport(data);
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Gagal memuat laporan.",
          );
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadReport();
    return () => controller.abort();
  }, [month, year]);

  const cards = report
    ? [
        { label: "Jumlah Member Aktif", value: String(report.jumlahMemberAktif) },
        { label: "Jumlah Transaksi", value: String(report.jumlahTransaksi) },
        { label: "Jumlah Kunjungan", value: String(report.jumlahKunjungan) },
        { label: "Total Pendapatan", value: formatRupiah(report.totalPendapatan) },
      ]
    : [];
  const hasReport = Boolean(report && report.jumlahTransaksi > 0);

  return (
    <div className="min-h-screen bg-[#efefed] font-sans text-[#1a1a1a]">
      <Sidebar role="owner" />
      <Topbar title="Laporan Bulanan" role="owner" />
      <main className="min-h-screen pt-[76px] md:ml-[240px]">
        <div className="mx-auto w-full max-w-[1200px] px-5 py-[24px] md:px-[36px]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-[20px] font-bold">Laporan Bulanan</h1>
            <Link
              href="/owner/dashboard"
              className="rounded-md border border-[#252525] bg-white px-4 py-2 text-sm font-bold hover:bg-[#f5f5f2]"
            >
              Kembali
            </Link>
          </div>

          <section className="mt-6 rounded-lg border border-[#dededb] bg-white p-5 md:p-6">
            <h2 className="text-base font-bold">Pilih periode</h2>
            <div className="mt-4 flex flex-wrap gap-4">
              <label className="text-sm font-semibold">
                Bulan
                <select
                  className={inputClass}
                  value={month}
                  onChange={(event) => {
                    setMonth(event.target.value);
                    setReport(null);
                    setError("");
                    setLoading(false);
                  }}
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
                  onChange={(event) => {
                    setYear(event.target.value);
                    setReport(null);
                    setError("");
                    setLoading(false);
                  }}
                >
                  <option value="">Pilih tahun</option>
                  {years.map((option) => (
                    <option key={option} value={String(option)}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>

          {error && (
            <p role="alert" className="mt-4 text-sm text-red-600">
              {error}
            </p>
          )}

          {loading && (
            <p className="mt-6 text-sm text-[#686863]">Memuat...</p>
          )}

          {report && !loading && !error && !hasReport && (
            <p className="mt-6 rounded-lg border border-[#dededb] bg-white p-5 text-sm text-[#686863]">
              Belum ada laporan untuk periode ini
            </p>
          )}

          {report && !loading && !error && hasReport && (
            <>
              <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {cards.map((card) => (
                  <article
                    key={card.label}
                    className="rounded-lg border border-[#dededb] bg-white p-5"
                  >
                    <p className="text-sm text-[#686863]">{card.label}</p>
                    <p className="mt-3 text-2xl font-bold">{card.value}</p>
                  </article>
                ))}
              </section>
              <section className="mt-5 grid gap-4 md:grid-cols-3">
                <article className="rounded-lg border border-[#dededb] bg-white p-5 md:col-span-1">
                  <h2 className="text-sm font-semibold text-[#686863]">
                    Layanan Terlaris
                  </h2>
                  <p className="mt-3 text-lg font-bold">
                    {report.layananTerlaris?.nama ?? "—"}
                  </p>
                  {report.layananTerlaris && (
                    <p className="mt-1 text-sm text-[#686863]">
                      {report.layananTerlaris.jumlah} kali digunakan
                    </p>
                  )}
                </article>
                <article className="rounded-lg border border-[#dededb] bg-white p-5 md:col-span-2">
                  <h2 className="text-sm font-semibold text-[#686863]">
                    Poin
                  </h2>
                  <div className="mt-3 grid gap-4 sm:grid-cols-2">
                    <p>
                      <span className="block text-sm text-[#686863]">
                        Total Poin Diberikan
                      </span>
                      <span className="mt-1 block text-xl font-bold">
                        {report.totalPoinDiberikan}
                      </span>
                    </p>
                    <p>
                      <span className="block text-sm text-[#686863]">
                        Total Poin Dipakai
                      </span>
                      <span className="mt-1 block text-xl font-bold">
                        {report.totalPoinDipakai}
                      </span>
                    </p>
                  </div>
                </article>
              </section>
            </>
          )}

          {report && !loading && !error && (
            <section className="mt-5 rounded-lg border border-[#dededb] bg-white p-5 md:p-6">
              <h2 className="text-base font-bold">
                Pendapatan per bulan {year}
              </h2>
              <div className="mt-4 overflow-x-auto">
                <RevenueChart data={report.grafik} />
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

function RevenueChart({ data }: { data: Report["grafik"] }) {
  const width = 1000;
  const height = 350;
  const left = 130;
  const right = 18;
  const top = 18;
  const bottom = 52;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const maxValue = Math.max(0, ...data.map((item) => item.total));
  const axisMax = maxValue > 0 ? maxValue : 1;
  const slot = plotWidth / 12;
  const barWidth = slot * 0.58;

  return (
    <svg
      role="img"
      aria-label="Grafik batang pendapatan bulanan"
      viewBox={`0 0 ${width} ${height}`}
      className="h-[300px] min-w-[720px] w-full"
    >
      <title>Pendapatan per bulan</title>
      <desc>
        Grafik batang yang membandingkan pendapatan owner untuk setiap bulan.
      </desc>
      {[0, 1, 2, 3, 4].map((step) => {
        const value = (axisMax * (4 - step)) / 4;
        const y = top + (plotHeight * step) / 4;
        return (
          <g key={step}>
            <line
              x1={left}
              y1={y}
              x2={width - right}
              y2={y}
              stroke="#e5e5e2"
              strokeWidth="1"
            />
            <text
              x={left - 10}
              y={y + 4}
              textAnchor="end"
              fontSize="11"
              fill="#686863"
            >
              {formatRupiah(value)}
            </text>
          </g>
        );
      })}
      {months.map((monthName, index) => {
        const value = data[index]?.total ?? 0;
        const barHeight = (Math.max(0, value) / axisMax) * plotHeight;
        const x = left + index * slot + (slot - barWidth) / 2;
        const y = top + plotHeight - barHeight;
        return (
          <g key={monthName}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              rx="3"
              fill="#a32626"
            />
            <text
              x={left + index * slot + slot / 2}
              y={height - 20}
              textAnchor="middle"
              fontSize="12"
              fill="#555"
            >
              {monthName.slice(0, 3)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
