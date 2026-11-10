"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "../../../components/Sidebar";
import Topbar from "../../../components/Topbar";

type DashboardData = {
  menunggu: number;
  sedangDikerjakan: number;
  selesai: number;
  antrean: {
    TransaksiID: string;
    TanggalTransaksi: string;
    namaMember: string;
    namaLayanan: string;
    status: string;
  }[];
  peringatanStok: { nama: string; stok: number; statusStok: string }[];
  aktivitasTerbaru: { teks: string; waktu: string }[];
};

function formatTanggal(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return `${String(date.getUTCDate()).padStart(2, "0")}/${String(date.getUTCMonth() + 1).padStart(2, "0")}/${date.getUTCFullYear()}`;
}

const cardClass =
  "rounded-[8px] border border-[#d9d9d9] bg-white px-[20px] pb-[22px] pt-[18px]";

export default function BarberDashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    async function loadDashboard() {
      try {
        const response = await fetch("/api/barber/dashboard", {
          signal: controller.signal,
        });
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || "Gagal memuat dashboard.");
        }
        setDashboard(result.data as DashboardData);
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

  const summary = [
    { label: "Menunggu Konfirmasi", value: dashboard?.menunggu },
    {
      label: "Layanan Sedang Dikerjakan",
      value: dashboard?.sedangDikerjakan,
    },
    { label: "Selesai", value: dashboard?.selesai },
  ];

  return (
    <div className="min-h-screen bg-[#f2f2f0] font-sans text-[#252525]">
      <Sidebar role="barber" />
      <Topbar title="Dashboard Barber" role="barber" />
      <main className="min-h-screen pt-[76px] md:ml-[240px]">
        <div className="mx-auto max-w-[1200px] px-5 py-[28px] md:px-[28px]">
          <section className={cardClass}>
            <h2 className="text-[16px] font-bold">Ringkasan</h2>
            {error && (
              <p role="alert" className="mt-3 text-[13px] text-red-600">
                {error}
              </p>
            )}
            <div className="mt-[16px] grid gap-[16px] sm:grid-cols-2 xl:grid-cols-3">
              {summary.map((item) => (
                <div
                  key={item.label}
                  className="min-h-[135px] rounded-[16px] border border-[#ececec] px-[16px] py-[14px]"
                >
                  <p className="min-h-[38px] text-[13px] text-[#333]">
                    {item.label}
                  </p>
                  <p className="mt-[10px] text-[28px] font-bold">
                    {loading ? "Memuat..." : item.value ?? "—"}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className={`mt-[18px] ${cardClass}`}>
            <h2 className="text-[16px] font-bold">Antrean Layanan</h2>
            <div className="mt-[16px] overflow-x-auto rounded-[8px] border border-[#ececec]">
              <table className="w-full min-w-[600px] border-collapse text-left">
                <thead>
                  <tr className="h-[46px] border-b border-[#ececec] text-[13px] font-bold">
                    <th className="px-4">No.</th>
                    <th className="px-4">ID Transaksi</th>
                    <th className="px-4">Waktu</th>
                    <th className="px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center">
                        Memuat...
                      </td>
                    </tr>
                  ) : dashboard?.antrean.length ? (
                    dashboard.antrean.map((item, index) => (
                      <tr
                        key={item.TransaksiID}
                        className="h-[50px] border-b border-[#ececec] text-[13px] last:border-0"
                      >
                        <td className="px-4">{index + 1}</td>
                        <td className="px-4">
                          <Link
                            href={`/barber/layanan/${encodeURIComponent(item.TransaksiID)}`}
                            className="font-bold text-[#252525] hover:underline"
                          >
                            {item.TransaksiID}
                          </Link>
                        </td>
                        <td className="px-4">
                          {formatTanggal(item.TanggalTransaksi)}
                        </td>
                        <td className="px-4">{item.status}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-6 text-center text-[#777]"
                      >
                        Belum ada antrean layanan
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <div className="mt-[18px] grid gap-[18px] lg:grid-cols-2">
            <section className={cardClass}>
              <h2 className="text-[16px] font-bold">Peringatan Stok Produk</h2>
              <div className="mt-[16px] min-h-[100px] rounded-[8px] border border-[#ececec]">
                {loading ? (
                  <p className="flex min-h-[100px] items-center justify-center text-[14px] text-[#777]">
                    Memuat...
                  </p>
                ) : dashboard?.peringatanStok.length ? (
                  <ul>
                    {dashboard.peringatanStok.map((item) => (
                      <li
                        key={item.nama}
                        className="flex items-center justify-between gap-3 border-b border-[#ececec] px-4 py-3 last:border-0"
                      >
                        <span className="text-[14px]">{item.nama}</span>
                        <span className="text-right text-[13px] text-[#777]">
                          {item.stok} stok · {item.statusStok}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="flex min-h-[100px] items-center justify-center text-center text-[14px] text-[#777]">
                    Belum ada peringatan stok
                  </p>
                )}
              </div>
            </section>

            <section className={cardClass}>
              <h2 className="text-[16px] font-bold">Aktivitas Terbaru</h2>
              <div className="mt-[16px] min-h-[100px] rounded-[8px] border border-[#ececec]">
                {loading ? (
                  <p className="flex min-h-[100px] items-center justify-center text-[14px] text-[#777]">
                    Memuat...
                  </p>
                ) : dashboard?.aktivitasTerbaru.length ? (
                  <ul>
                    {dashboard.aktivitasTerbaru.map((item, index) => (
                      <li
                        key={`${item.teks}-${item.waktu}-${index}`}
                        className="flex flex-col gap-1 border-b border-[#ececec] px-4 py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <span className="text-[14px]">{item.teks}</span>
                        <time
                          dateTime={item.waktu}
                          className="shrink-0 text-[12px] text-[#777]"
                        >
                          {formatTanggal(item.waktu)}
                        </time>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="flex min-h-[100px] items-center justify-center text-center text-[14px] text-[#777]">
                    Belum ada aktivitas
                  </p>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
