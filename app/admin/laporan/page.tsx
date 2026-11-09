"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import Sidebar from "../../../components/Sidebar";
import Topbar from "../../../components/Topbar";

type ReportRow = {
  Tanggal: string;
  TransaksiID: string;
  MemberID: string;
  Layanan: string;
  TotalTransaksi: number;
};

type Report = {
  jumlahMember: number;
  jumlahTransaksi: number;
  jumlahKunjungan: number;
  totalPendapatan: number;
  baris: ReportRow[];
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
const years = Array.from({ length: 41 }, (_, index) => 2000 + index);
const inputClass =
  "mt-[8px] h-[42px] w-full min-w-[220px] rounded-[6px] border border-[#c9c9c9] bg-white px-[12px] text-[14px] font-normal outline-none sm:w-[220px]";

export default function AdminLaporanPage() {
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [requestPeriod, setRequestPeriod] = useState<{
    month: number;
    year: number;
    key: number;
  } | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const current = new Date();
      setMonth(String(current.getMonth() + 1));
      setYear(String(current.getFullYear()));
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!requestPeriod) return;
    const period = requestPeriod;
    let active = true;

    async function loadReport() {
      setLoading(true);
      setError("");
      setSuccess("");
      try {
        const params = new URLSearchParams({
          bulan: String(period.month),
          tahun: String(period.year),
        });
        const data = await requestApi<Report>(
          `/api/admin/laporan?${params.toString()}`,
        );
        if (active) {
          setReport(data);
          setShowSummary(false);
        }
      } catch (loadError) {
        if (active) {
          setReport(null);
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Gagal memuat laporan.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadReport();
    return () => {
      active = false;
    };
  }, [requestPeriod]);

  function showReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const monthNumber = Number(month);
    const yearNumber = Number(year);
    if (
      !Number.isInteger(monthNumber) ||
      monthNumber < 1 ||
      monthNumber > 12 ||
      !Number.isInteger(yearNumber) ||
      yearNumber < 2000 ||
      yearNumber > 2040
    ) {
      setError("Pilih bulan dan tahun laporan yang valid.");
      return;
    }
    setReport(null);
    setShowSummary(false);
    setError("");
    setRequestPeriod((current) => ({
      month: monthNumber,
      year: yearNumber,
      key: (current?.key ?? 0) + 1,
    }));
  }

  async function sendReport() {
    if (!report || !requestPeriod) return;
    setSending(true);
    setError("");
    setSuccess("");
    try {
      const result = await requestApi<{ jumlahTransaksi: number }>(
        "/api/admin/laporan/kirim",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bulan: requestPeriod.month,
            tahun: requestPeriod.year,
          }),
        },
      );
      setSuccess(
        `Laporan terkirim ke Owner (${result.jumlahTransaksi} transaksi)`,
      );
    } catch (sendError) {
      setError(
        sendError instanceof Error
          ? sendError.message
          : "Gagal mengirim laporan ke Owner.",
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f2f2f0] font-sans text-[#252525]">
      <Sidebar role="admin" />
      <Topbar title="Laporan Bulanan" role="admin" />

      <main className="min-h-screen pt-[76px] md:ml-[240px]">
        <div className="mx-auto max-w-[1200px] px-5 py-[28px] md:px-[28px]">
          <form
            onSubmit={showReport}
            className="flex flex-col gap-[12px] rounded-[8px] border border-[#d9d9d9] bg-white px-[20px] py-[16px] sm:flex-row sm:items-end sm:justify-between"
          >
            <label className="text-[13px] font-bold text-[#333333]">
              Bulan
              <select
                value={month}
                onChange={(event) => setMonth(event.target.value)}
                required
                className={inputClass}
              >
                <option value="">Pilih Bulan</option>
                {months.map((monthName, index) => (
                  <option key={monthName} value={index + 1}>
                    {monthName}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-[13px] font-bold text-[#333333]">
              Tahun
              <select
                value={year}
                onChange={(event) => setYear(event.target.value)}
                required
                className={inputClass}
              >
                <option value="">Pilih Tahun</option>
                {years.map((optionYear) => (
                  <option key={optionYear} value={optionYear}>
                    {optionYear}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              disabled={loading || !month || !year}
              className="h-[42px] rounded-[6px] bg-[#171717] px-[24px] text-[14px] font-bold text-white disabled:opacity-50"
            >
              {loading ? "Memuat..." : "Tampilkan Data"}
            </button>
          </form>

          {error && (
            <p role="alert" className="mt-[12px] text-[13px] text-red-600">
              {error}
            </p>
          )}
          {success && (
            <p role="status" className="mt-[12px] text-[13px] text-green-700">
              {success}
            </p>
          )}

          <section className="mt-[18px] grid grid-cols-1 gap-[16px] sm:grid-cols-3">
            {[
              { label: "Jumlah Member", value: report?.jumlahMember },
              { label: "Jumlah Transaksi", value: report?.jumlahTransaksi },
              { label: "Jumlah Kunjungan", value: report?.jumlahKunjungan },
            ].map((card) => (
              <div
                key={card.label}
                className="min-h-[120px] rounded-[8px] border border-[#d9d9d9] bg-white px-[18px] py-[16px]"
              >
                <p className="text-[13px] text-[#777777]">{card.label}</p>
                <p className="mt-[18px] text-[24px] font-bold">
                  {loading
                    ? "Memuat..."
                    : report
                      ? card.value
                      : "—"}
                </p>
              </div>
            ))}
          </section>

          <section className="mt-[18px] rounded-[8px] border border-[#d9d9d9] bg-white px-[20px] pb-[20px] pt-[18px]">
            <div className="flex flex-col gap-[12px] sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-[16px] font-bold">Rekap Bulanan</h1>
              <div className="flex flex-wrap gap-[10px]">
                <button
                  type="button"
                  onClick={() => setShowSummary(true)}
                  disabled={!report || loading}
                  className="h-[40px] rounded-[6px] border border-[#252525] px-[18px] text-[14px] font-bold text-[#252525] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Buat Rekap
                </button>
                <button
                  type="button"
                  onClick={() => void sendReport()}
                  disabled={!report || loading || sending}
                  className="h-[40px] rounded-[6px] bg-[#171717] px-[18px] text-[14px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {sending ? "Mengirim..." : "Kirim ke Owner"}
                </button>
              </div>
            </div>

            {showSummary && report && (
              <div className="mt-[16px] rounded-[8px] border border-[#e9e9e9] bg-[#fafafa] px-[16px] py-[14px]">
                <p className="text-[13px] text-[#777777]">Ringkasan Hasil</p>
                <p className="mt-[5px] text-[18px] font-bold">
                  Total Pendapatan: {formatRupiah(report.totalPendapatan)}
                </p>
                <p className="mt-[4px] text-[13px] text-[#555555]">
                  {report.jumlahTransaksi} transaksi · {report.jumlahKunjungan}{" "}
                  kunjungan · {report.jumlahMember} member
                </p>
              </div>
            )}

            <div className="mt-[16px] overflow-x-auto rounded-[8px] border border-[#e9e9e9]">
              <table className="w-full min-w-[760px] border-collapse text-left text-[12px]">
                <thead>
                  <tr className="h-[44px] border-b border-[#e9e9e9]">
                    <th className="px-[16px] font-bold">Tanggal</th>
                    <th className="px-[16px] font-bold">ID Transaksi</th>
                    <th className="px-[16px] font-bold">Member</th>
                    <th className="px-[16px] font-bold">Layanan</th>
                    <th className="px-[16px] font-bold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="h-[120px] text-center text-[#777777]">
                        Memuat...
                      </td>
                    </tr>
                  ) : !report ? (
                    <tr>
                      <td colSpan={5} className="h-[120px] text-center text-[#777777]">
                        Pilih periode dan tampilkan data.
                      </td>
                    </tr>
                  ) : report.baris.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="h-[120px] text-center text-[#777777]">
                        Tidak ada transaksi pada periode ini.
                      </td>
                    </tr>
                  ) : (
                    report.baris.map((row) => (
                      <tr
                        key={row.TransaksiID}
                        className="h-[54px] border-b border-[#ededed] last:border-b-0"
                      >
                        <td className="px-[16px]">{formatDate(row.Tanggal)}</td>
                        <td className="px-[16px]">{row.TransaksiID}</td>
                        <td className="px-[16px]">{row.MemberID}</td>
                        <td className="px-[16px]">{row.Layanan}</td>
                        <td className="px-[16px] font-bold">
                          {formatRupiah(row.TotalTransaksi)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <Link
            href="/admin/dashboard"
            className="mt-[18px] inline-flex h-[34px] items-center justify-center rounded-[6px] border border-[#252525] px-[18px] text-[14px] font-bold text-[#252525]"
          >
            Kembali ke Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
