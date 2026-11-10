"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Sidebar from "../../../components/Sidebar";
import Topbar from "../../../components/Topbar";

type Notification = {
  id: number;
  Tanggal: string;
  Pesan: string;
  Dibaca: boolean;
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
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  }).format(date);
}

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--.--";
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  })
    .format(date)
    .replace(":", ".");
}

export default function OwnerNotifikasiPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    async function loadNotifications() {
      try {
        const data = await requestApi<Notification[]>("/api/owner/notifikasi", {
          signal: controller.signal,
        });
        if (!controller.signal.aborted) setNotifications(data);
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Gagal memuat notifikasi.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
          setLoaded(true);
        }
      }
    }

    void loadNotifications();
    return () => controller.abort();
  }, []);

  async function markAsRead(notification: Notification) {
    if (notification.Dibaca) return;
    setError("");
    try {
      await requestApi<{ id: number; Dibaca: boolean }>(
        `/api/owner/notifikasi/${notification.id}`,
        { method: "PATCH" },
      );
      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id ? { ...item, Dibaca: true } : item,
        ),
      );
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Gagal memperbarui notifikasi.",
      );
    }
  }

  return (
    <div className="min-h-screen bg-[#efefed] font-sans text-[#1a1a1a]">
      <Sidebar role="owner" />
      <Topbar title="Notifikasi" role="owner" />
      <main className="min-h-screen pt-[76px] md:ml-[240px]">
        <div className="mx-auto w-full max-w-[1200px] px-5 py-[24px] md:px-[36px]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-[20px] font-bold">Notifikasi</h1>
            <Link
              href="/owner/dashboard"
              className="rounded-md border border-[#252525] bg-white px-4 py-2 text-sm font-bold hover:bg-[#f5f5f2]"
            >
              Kembali
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
            ) : loaded && notifications.length === 0 && !error ? (
              <p className="p-6 text-sm text-[#686863]">
                Belum ada notifikasi
              </p>
            ) : (
              <ul>
                {notifications.map((notification) => (
                  <li key={notification.id} className="border-b border-[#e7e7e4] last:border-b-0">
                    <button
                      type="button"
                      onClick={() => void markAsRead(notification)}
                      aria-label={`Tandai notifikasi sebagai dibaca: ${notification.Pesan}`}
                      className="flex w-full items-start gap-4 px-5 py-5 text-left hover:bg-[#fafaf8] focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-black"
                    >
                      <span
                        aria-hidden="true"
                        className={`mt-2 h-2.5 w-2.5 shrink-0 rounded-full ${
                          notification.Dibaca ? "bg-[#d0d0cc]" : "bg-[#a32626]"
                        }`}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                          <span className="text-[15px] font-semibold">
                            {notification.Pesan}
                          </span>
                          <span className="shrink-0 text-xs text-[#70706b]">
                            {formatDate(notification.Tanggal)} ·{" "}
                            {formatTime(notification.Tanggal)}
                          </span>
                        </span>
                      </span>
                    </button>
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
