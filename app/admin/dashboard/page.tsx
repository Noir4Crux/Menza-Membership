"use client";

import { useEffect, useState } from "react";
import Sidebar from "../../../components/Sidebar";
import Topbar from "../../../components/Topbar";

type DashboardData = {
  totalMember: number;
  menungguVerifikasi: number;
  transaksiHariIni: number;
  segeraBerakhir: number;
  aktivitasTerbaru: { teks: string; tanggal: string }[];
};

type DashboardMetric =
  | "totalMember"
  | "menungguVerifikasi"
  | "transaksiHariIni"
  | "segeraBerakhir";

const summaryCards: { label: string; key: DashboardMetric }[] = [
  { label: "Total Member", key: "totalMember" },
  { label: "Menunggu Verifikasi", key: "menungguVerifikasi" },
  { label: "Transaksi Hari Ini", key: "transaksiHariIni" },
  { label: "Masa Berlaku Segera Berakhir", key: "segeraBerakhir" },
];

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${date.getUTCFullYear()}`;
}

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch("/api/admin/dashboard");
        const result: unknown = await response.json();
        if (!response.ok) {
          const message =
            typeof result === "object" &&
            result !== null &&
            "error" in result &&
            typeof result.error === "string"
              ? result.error
              : "Gagal memuat dashboard.";
          throw new Error(message);
        }
        if (
          typeof result !== "object" ||
          result === null ||
          !("data" in result) ||
          typeof result.data !== "object" ||
          result.data === null
        ) {
          throw new Error("Respons dashboard tidak valid.");
        }
        if (active) setDashboard(result.data as DashboardData);
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Gagal memuat dashboard.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadDashboard();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#f2f2f0] font-sans text-[#252525]">
      <Sidebar role="admin" />
      <Topbar title="Dashboard Admin" role="admin" />

      <main className="min-h-screen pt-[76px] md:ml-[240px]">
        <div className="mx-auto max-w-[1200px] px-5 py-[28px] md:px-[28px]">
          <section className="rounded-[8px] border border-[#d9d9d9] bg-white px-[20px] pb-[26px] pt-[18px]">
            <h2 className="text-[16px] font-bold">Ringkasan</h2>
            {error && (
              <p role="alert" className="mt-[12px] text-[13px] text-red-600">
                {error}
              </p>
            )}
            <div className="mt-[16px] grid grid-cols-1 gap-[16px] sm:grid-cols-2 xl:grid-cols-4">
              {summaryCards.map(({ label, key }) => (
                <div
                  key={label}
                  className="flex min-h-[184px] flex-col rounded-[16px] border border-[#ececec] px-[16px] py-[14px]"
                >
                  <p className="min-h-[34px] text-[13px] text-[#333333]">{label}</p>
                  <p className="mt-[10px] text-[28px] font-bold text-[#252525]">
                    {loading ? "Memuat..." : dashboard?.[key] ?? "—"}
                  </p>
                  <p className="mt-[14px] text-[12px] text-[#777777]">
                    &nbsp;
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-[18px] rounded-[8px] border border-[#d9d9d9] bg-white px-[20px] pb-[24px] pt-[18px]">
            <h2 className="text-[16px] font-bold">Aktivitas Terbaru</h2>
            <div className="mt-[16px] min-h-[118px] rounded-[8px] border border-[#ececec]">
              {loading ? (
                <p className="flex min-h-[118px] items-center justify-center text-center text-[14px] text-[#777777]">
                  Memuat...
                </p>
              ) : error ? null : dashboard?.aktivitasTerbaru.length ? (
                <ul>
                  {dashboard.aktivitasTerbaru.map((activity, index) => (
                    <li
                      key={`${activity.teks}-${activity.tanggal}-${index}`}
                      className="flex flex-col gap-[6px] border-b border-[#ececec] px-[16px] py-[14px] last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <span className="text-[14px]">{activity.teks}</span>
                      <time
                        dateTime={activity.tanggal}
                        className="text-[12px] text-[#777777]"
                      >
                        {formatDate(activity.tanggal)}
                      </time>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="flex min-h-[118px] items-center justify-center text-center text-[14px] text-[#777777]">
                  Belum ada aktivitas
                </p>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
