"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Sidebar from "../../../components/Sidebar";
import Topbar from "../../../components/Topbar";

type Notification = {
  id: number;
  Jenis: string;
  Pesan: string;
  Tanggal: string;
  Dibaca: boolean;
};

type DashboardData = {
  pesananAktif: {
    PesananID: string;
    namaProduk: string;
    Status: string;
  } | null;
  notifikasiBelumDibaca: number;
  notifikasi: Notification[];
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

export default function SupplierDashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    async function loadDashboard() {
      try {
        const data = await requestApi<DashboardData>(
          "/api/supplier/dashboard",
          { signal: controller.signal },
        );
        if (!controller.signal.aborted) setDashboard(data);
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Gagal memuat dashboard supplier.",
          );
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadDashboard();
    return () => controller.abort();
  }, []);

  async function markAsRead(notification: Notification) {
    if (notification.Dibaca) return;
    setError("");
    try {
      await requestApi<{ id: number; Dibaca: boolean }>(
        `/api/supplier/notifikasi/${notification.id}`,
        { method: "PATCH" },
      );
      setDashboard((current) =>
        current
          ? {
              ...current,
              notifikasiBelumDibaca: Math.max(
                0,
                current.notifikasiBelumDibaca - 1,
              ),
              notifikasi: current.notifikasi.map((item) =>
                item.id === notification.id ? { ...item, Dibaca: true } : item,
              ),
            }
          : current,
      );
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Gagal memperbarui notifikasi.",
      );
    }
  }

  const order = dashboard?.pesananAktif;

  return (
    <div className="min-h-screen bg-[#efefed] font-sans text-[#1a1a1a]">
      <Sidebar role="supplier" />
      <Topbar title="Dashboard Supplier" role="supplier" />
      <main className="min-h-screen pt-[76px] md:ml-[240px]">
        <div className="mx-auto w-full max-w-[1200px] px-5 py-[24px] md:px-[36px]">
          <h1 className="text-[20px] font-bold">Dashboard Supplier</h1>
          {error && (
            <p role="alert" className="mt-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <section className="mt-6 grid gap-5 md:grid-cols-2">
            <Link
              href={order ? `/supplier/pesanan/${encodeURIComponent(order.PesananID)}` : "/supplier/pesanan"}
              className="rounded-lg border border-[#dededb] bg-white p-6 transition hover:border-[#999] hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
            >
              <p className="text-sm font-semibold text-[#686863]">
                Status Pesanan
              </p>
              {loading ? (
                <p className="mt-4 text-sm text-[#686863]">Memuat...</p>
              ) : order ? (
                <>
                  <p className="mt-4 text-xl font-bold">{order.PesananID}</p>
                  <p className="mt-1 text-sm text-[#686863]">
                    {order.namaProduk}
                  </p>
                  <span className="mt-4 inline-flex rounded-full bg-[#f7edd1] px-3 py-1 text-sm font-semibold text-[#795a12]">
                    {order.Status}
                  </span>
                </>
              ) : (
                <>
                  <span className="mt-4 inline-flex rounded-full bg-[#f0f0ed] px-3 py-1 text-sm font-semibold text-[#686863]">
                    Belum tersedia
                  </span>
                  <p className="mt-3 text-sm text-[#686863]">
                    Status dan lokasi pesanan akan tampil setelah diverifikasi.
                  </p>
                </>
              )}
            </Link>

            <button
              type="button"
              onClick={() => setShowNotifications((shown) => !shown)}
              aria-expanded={showNotifications}
              className="relative min-h-[150px] rounded-lg border border-[#dededb] bg-white p-6 text-left transition hover:border-[#999] hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
            >
              <span className="text-lg font-bold">Notifikasi</span>
              <span className="mt-2 block text-sm text-[#686863]">
                {showNotifications ? "Sembunyikan notifikasi" : "Lihat notifikasi"}
              </span>
              <span className="absolute right-5 top-5 flex min-h-7 min-w-7 items-center justify-center rounded-full bg-[#a32626] px-2 text-sm font-bold text-white">
                {loading ? "…" : dashboard?.notifikasiBelumDibaca ?? 0}
              </span>
            </button>
          </section>

          {showNotifications && (
            <section
              aria-label="Notifikasi supplier"
              className="mt-4 overflow-hidden rounded-lg border border-[#dededb] bg-white"
            >
              {loading ? (
                <p className="p-5 text-sm text-[#686863]">Memuat...</p>
              ) : !dashboard || dashboard.notifikasi.length === 0 ? (
                <p className="p-5 text-sm text-[#686863]">
                  Belum ada notifikasi
                </p>
              ) : (
                <ul>
                  {dashboard.notifikasi.map((notification) => (
                    <li
                      key={notification.id}
                      className="border-b border-[#e7e7e4] last:border-0"
                    >
                      <button
                        type="button"
                        onClick={() => void markAsRead(notification)}
                        className="flex w-full items-start gap-4 px-5 py-4 text-left hover:bg-[#fafaf8] focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-black"
                      >
                        <span
                          aria-hidden="true"
                          className={`mt-2 h-2.5 w-2.5 shrink-0 rounded-full ${
                            notification.Dibaca
                              ? "bg-[#d0d0cc]"
                              : "bg-[#a32626]"
                          }`}
                        />
                        <span>
                          <span className="block font-bold">
                            Menza Barbershop
                          </span>
                          <span className="mt-1 block text-xs font-semibold uppercase tracking-wide text-[#777]">
                            Pemesanan produk
                          </span>
                          <span className="mt-1 block text-sm text-[#555]">
                            {notification.Pesan}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          <section className="mt-8">
            <h2 className="text-lg font-bold">
              Mulai layanan: Pilih salah satu fungsi berikut.
            </h2>
            <div className="mt-4 grid gap-5 md:grid-cols-2">
              <Link
                href="/supplier/pesanan"
                className="flex min-h-[170px] flex-col justify-between rounded-lg border border-[#dededb] bg-white p-6 transition hover:border-[#999] hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
              >
                <span>
                  <span className="block text-lg font-bold">Pesanan</span>
                  <span className="mt-2 block text-sm text-[#686863]">
                    Lihat pesanan toko
                  </span>
                </span>
                <span className="mt-5 inline-flex w-fit rounded-md bg-[#a32626] px-4 py-2 text-sm font-bold text-white">
                  Rincian Pesanan
                </span>
              </Link>
              <Link
                href="/supplier/riwayat"
                className="flex min-h-[170px] flex-col justify-between rounded-lg border border-[#dededb] bg-white p-6 transition hover:border-[#999] hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
              >
                <span>
                  <span className="block text-lg font-bold">
                    Riwayat transaksi
                  </span>
                  <span className="mt-2 block text-sm text-[#686863]">
                    Riwayat pesanan toko
                  </span>
                </span>
                <span className="mt-5 inline-flex w-fit rounded-md bg-[#a32626] px-4 py-2 text-sm font-bold text-white">
                  Lihat riwayat
                </span>
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
