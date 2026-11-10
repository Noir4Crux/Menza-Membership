"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Sidebar from "../../../components/Sidebar";
import Topbar from "../../../components/Topbar";

type Order = {
  PesananID: string;
  namaProduk: string;
  Jumlah: number;
  Status: string;
  TanggalPesan: string;
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

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return `${String(date.getUTCDate()).padStart(2, "0")}/${String(date.getUTCMonth() + 1).padStart(2, "0")}/${date.getUTCFullYear()}`;
}

export default function SupplierPesananPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    async function loadOrders() {
      try {
        const data = await requestApi<Order[]>("/api/supplier/pesanan", {
          signal: controller.signal,
        });
        if (!controller.signal.aborted) setOrders(data);
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Gagal memuat pesanan.",
          );
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadOrders();
    return () => controller.abort();
  }, []);

  return (
    <div className="min-h-screen bg-[#efefed] font-sans text-[#1a1a1a]">
      <Sidebar role="supplier" />
      <Topbar title="Rincian Pesanan" role="supplier" />
      <main className="min-h-screen pt-[76px] md:ml-[240px]">
        <div className="mx-auto w-full max-w-[1200px] px-5 py-[24px] md:px-[36px]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-[20px] font-bold">Rincian Pesanan</h1>
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
            ) : orders.length === 0 && !error ? (
              <p className="p-6 text-sm text-[#686863]">Belum ada pesanan</p>
            ) : (
              <ul>
                {orders.map((order) => (
                  <li
                    key={order.PesananID}
                    className="border-b border-[#e7e7e4] last:border-0"
                  >
                    <Link
                      href={`/supplier/pesanan/${encodeURIComponent(order.PesananID)}`}
                      className="flex flex-wrap items-center justify-between gap-4 px-5 py-5 hover:bg-[#fafaf8] focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-black"
                    >
                      <span>
                        <span className="block font-bold">{order.PesananID}</span>
                        <span className="mt-1 block text-sm text-[#686863]">
                          {order.namaProduk} · Qty {order.Jumlah}
                        </span>
                        <span className="mt-1 block text-xs text-[#777]">
                          {formatDate(order.TanggalPesan)}
                        </span>
                      </span>
                      <span className="rounded-full bg-[#f7edd1] px-3 py-1 text-sm font-semibold text-[#795a12]">
                        {order.Status}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
