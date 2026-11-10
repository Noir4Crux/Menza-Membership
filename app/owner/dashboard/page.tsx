"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Sidebar from "../../../components/Sidebar";
import Topbar from "../../../components/Topbar";

type DashboardData = {
  notifikasiBelumDibaca: number;
  bulanIni: {
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

export default function OwnerDashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    async function loadDashboard() {
      try {
        const data = await requestApi<DashboardData>("/api/owner/dashboard", {
          signal: controller.signal,
        });
        if (!controller.signal.aborted) setDashboard(data);
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Gagal memuat dashboard.",
          );
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadDashboard();
    return () => controller.abort();
  }, []);

  const cards = [
    {
      title: "Notifikasi",
      href: "/owner/notifikasi",
      badge: dashboard?.notifikasiBelumDibaca ?? 0,
      icon: "bell",
    },
    {
      title: "Rekap Transaksi",
      href: "/owner/rekap",
      icon: "receipt",
    },
    {
      title: "Laporan Bulanan",
      href: "/owner/laporan",
      icon: "chart",
    },
  ];

  return (
    <div className="min-h-screen bg-[#efefed] font-sans text-[#1a1a1a]">
      <Sidebar role="owner" />
      <Topbar title="Menu Utama" role="owner" />
      <main className="min-h-screen pt-[76px] md:ml-[240px]">
        <div className="mx-auto w-full max-w-[1200px] px-5 py-[24px] md:px-[36px]">
          <h1 className="text-[20px] font-bold">Menu Utama</h1>
          {error && (
            <p role="alert" className="mt-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <section aria-label="Menu owner" className="mt-6 grid gap-4 md:grid-cols-3">
            {cards.map((card) => (
              <Link
                key={card.title}
                href={card.href}
                className="relative flex min-h-[150px] items-center gap-5 rounded-lg border border-[#dededb] bg-white p-6 transition hover:border-[#999] hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#f0f0ed]">
                  {card.icon === "bell" ? (
                    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6 fill-none stroke-current">
                      <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9z" strokeWidth="1.8" strokeLinejoin="round" />
                      <path d="M10 21h4" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  ) : card.icon === "receipt" ? (
                    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6 fill-none stroke-current">
                      <path d="M6 3h12v18l-2-1.2-2 1.2-2-1.2-2 1.2-2-1.2L6 21V3z" strokeWidth="1.8" strokeLinejoin="round" />
                      <path d="M9 7h6M9 11h6M9 15h3" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6 fill-none stroke-current">
                      <path d="M4 20V9M10 20V4M16 20v-7M22 20V11" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  )}
                </span>
                <span className="text-[17px] font-bold">{card.title}</span>
                {card.title === "Notifikasi" && (
                  <span className="absolute right-4 top-4 flex min-h-6 min-w-6 items-center justify-center rounded-full bg-[#a32626] px-2 text-xs font-bold text-white">
                    {loading ? "…" : card.badge}
                  </span>
                )}
              </Link>
            ))}
          </section>

          <section className="mt-7 rounded-lg border border-[#dededb] bg-white p-5 md:p-6">
            <h2 className="text-lg font-bold">Ringkasan bulan ini</h2>
            {loading ? (
              <p className="mt-5 text-sm text-[#686863]">Memuat...</p>
            ) : (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-md bg-[#f5f5f2] p-4">
                  <p className="text-sm text-[#666]">Jumlah Transaksi</p>
                  <p className="mt-2 text-2xl font-bold">
                    {dashboard?.bulanIni.jumlahTransaksi ?? "—"}
                  </p>
                </div>
                <div className="rounded-md bg-[#f5f5f2] p-4">
                  <p className="text-sm text-[#666]">Total Pendapatan</p>
                  <p className="mt-2 text-2xl font-bold">
                    {dashboard
                      ? formatRupiah(dashboard.bulanIni.totalPendapatan)
                      : "—"}
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
