"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../../components/Sidebar";
import Topbar from "../../../components/Topbar";

type HistoryOrder = {
  PesananID: string;
  TanggalPesan: string;
  totalHarga: number;
  tampilStatus: "Success" | "On Progress";
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
  const cents = Math.round(value * 100);
  const sign = cents < 0 ? "-" : "";
  const absolute = Math.abs(cents);
  const whole = String(Math.floor(absolute / 100));
  const groups: string[] = [];
  for (let end = whole.length; end > 0; end -= 3) {
    groups.unshift(whole.slice(Math.max(0, end - 3), end));
  }
  return `Rp ${sign}${groups.join(".")},${String(absolute % 100).padStart(2, "0")}`;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return `${String(date.getUTCDate()).padStart(2, "0")}/${String(date.getUTCMonth() + 1).padStart(2, "0")}/${date.getUTCFullYear()}`;
}

export default function SupplierRiwayatPage() {
  const router = useRouter();
  const [history, setHistory] = useState<HistoryOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    async function loadHistory() {
      try {
        const data = await requestApi<HistoryOrder[]>("/api/supplier/riwayat", {
          signal: controller.signal,
        });
        if (!controller.signal.aborted) setHistory(data);
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Gagal memuat riwayat pesanan.",
          );
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadHistory();
    return () => controller.abort();
  }, []);

  return (
    <div className="min-h-screen bg-[#efefed] font-sans text-[#1a1a1a]">
      <Sidebar role="supplier" />
      <Topbar title="Riwayat Transaksi" role="supplier" />
      <main className="min-h-screen pt-[76px] md:ml-[240px]">
        <div className="mx-auto w-full max-w-[1200px] px-5 py-[24px] md:px-[36px]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-[20px] font-bold">Riwayat Transaksi</h1>
              <p className="mt-1 text-sm text-[#686863]">Riwayat Pesanan</p>
            </div>
            <Link
              href="/supplier/dashboard"
              className="rounded-md border border-[#252525] bg-white px-4 py-2 text-sm font-bold hover:bg-[#f5f5f2]"
            >
              Dashboard
            </Link>
          </div>
          {error && (
            <p role="alert" className="mt-4 text-sm text-red-600">
              {error}
            </p>
          )}

          <section className="mt-6 overflow-hidden rounded-lg border border-[#dededb] bg-white">
            {loading ? (
              <p className="p-6 text-sm text-[#686863]">Memuat...</p>
            ) : history.length === 0 && !error ? (
              <p className="p-6 text-sm text-[#686863]">
                Belum ada riwayat pesanan
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] text-left text-sm">
                  <thead className="bg-[#f5f5f2]">
                    <tr>
                      <th scope="col" className="px-5 py-3 font-bold">
                        Tanggal
                      </th>
                      <th scope="col" className="px-5 py-3 font-bold">
                        Harga
                      </th>
                      <th scope="col" className="px-5 py-3 font-bold">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((order) => (
                      <tr
                        key={order.PesananID}
                        onClick={() =>
                          router.push(
                            `/supplier/riwayat/${encodeURIComponent(order.PesananID)}`,
                          )
                        }
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            router.push(
                              `/supplier/riwayat/${encodeURIComponent(order.PesananID)}`,
                            );
                          }
                        }}
                        tabIndex={0}
                        role="link"
                        aria-label={`Pesanan ${order.PesananID}, ${order.tampilStatus}`}
                        className="cursor-pointer border-t border-[#e7e7e4] hover:bg-[#fafaf8] focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-black"
                      >
                        <td className="px-5 py-4">
                          <span className="block">
                            {formatDate(order.TanggalPesan)}
                          </span>
                          <span className="mt-1 block text-xs text-[#777]">
                            {order.PesananID}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 font-semibold">
                          {formatRupiah(order.totalHarga)}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                              order.tampilStatus === "Success"
                                ? "bg-[#e2f2e7] text-[#21633a]"
                                : "bg-[#f7edd1] text-[#795a12]"
                            }`}
                          >
                            {order.tampilStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
