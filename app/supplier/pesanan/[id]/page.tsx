"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Sidebar from "../../../../components/Sidebar";
import Topbar from "../../../../components/Topbar";

type OrderDetail = {
  PesananID: string;
  Status: string;
  TanggalPesan: string;
  pemesan: string;
  item: { produk: string; qty: number; harga: number }[];
  totalHarga: number;
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

const steps = ["Belum dikirim", "Pengemasan", "Dalam pengiriman"];

export default function SupplierPesananDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    async function loadOrder() {
      try {
        const data = await requestApi<OrderDetail>(
          `/api/supplier/pesanan/${encodeURIComponent(id)}`,
          { signal: controller.signal },
        );
        if (!controller.signal.aborted) setOrder(data);
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Gagal memuat rincian pesanan.",
          );
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadOrder();
    return () => controller.abort();
  }, [id]);

  const currentStep = order ? steps.indexOf(order.Status) : -1;
  const nextStatus =
    currentStep >= 0 && currentStep < steps.length - 1
      ? steps[currentStep + 1]
      : null;

  async function saveStatus() {
    if (!order || !nextStatus) return;
    setSaving(true);
    setError("");
    try {
      const data = await requestApi<{ PesananID: string; Status: string }>(
        `/api/supplier/pesanan/${encodeURIComponent(id)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: nextStatus }),
        },
      );
      setOrder((current) =>
        current ? { ...current, Status: data.Status } : current,
      );
      setEditing(false);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Gagal memperbarui status pesanan.",
      );
    } finally {
      setSaving(false);
    }
  }

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
          {loading && (
            <p className="mt-6 text-sm text-[#686863]">Memuat...</p>
          )}

          {order && !loading && (
            <>
              <section className="mt-6 rounded-lg border border-[#dededb] bg-white p-5 md:p-6">
                <h2 className="text-lg font-bold">Status Pesanan</h2>
                <ol className="mt-5 grid gap-3 sm:grid-cols-3">
                  {steps.map((step, index) => {
                    const complete = currentStep >= index;
                    return (
                      <li
                        key={step}
                        className={`flex items-center gap-3 rounded-md border p-3 ${
                          complete
                            ? "border-[#a32626] bg-[#fff8f7]"
                            : "border-[#e2e2df] bg-[#fafaf8]"
                        }`}
                      >
                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                            complete
                              ? "bg-[#a32626] text-white"
                              : "bg-[#e4e4e0] text-[#686863]"
                          }`}
                        >
                          {index + 1}
                        </span>
                        <span
                          className={`text-sm ${
                            complete ? "font-bold" : "text-[#686863]"
                          }`}
                        >
                          {step}
                        </span>
                      </li>
                    );
                  })}
                </ol>
              </section>

              <section className="mt-5 rounded-lg border border-[#dededb] bg-white p-5 md:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-lg font-bold">Detail Pesanan</h2>
                  <span className="rounded-full bg-[#f7edd1] px-3 py-1 text-sm font-semibold text-[#795a12]">
                    {order.PesananID}
                  </span>
                </div>
                <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm text-[#686863]">Tanggal</dt>
                    <dd className="mt-1 font-semibold">
                      {formatDate(order.TanggalPesan)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-[#686863]">Pemesan</dt>
                    <dd className="mt-1 font-semibold">{order.pemesan}</dd>
                  </div>
                </dl>
                <div className="mt-5 overflow-x-auto rounded-md border border-[#e5e5e2]">
                  <table className="w-full min-w-[520px] text-left text-sm">
                    <thead className="bg-[#f5f5f2]">
                      <tr>
                        <th scope="col" className="px-4 py-3 font-bold">
                          Produk
                        </th>
                        <th scope="col" className="px-4 py-3 font-bold">
                          Qty
                        </th>
                        <th scope="col" className="px-4 py-3 text-right font-bold">
                          Harga
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.item.map((item, index) => (
                        <tr
                          key={`${item.produk}-${index}`}
                          className="border-t border-[#e7e7e4]"
                        >
                          <td className="px-4 py-3">{item.produk}</td>
                          <td className="px-4 py-3">{item.qty}</td>
                          <td className="whitespace-nowrap px-4 py-3 text-right">
                            {formatRupiah(item.harga)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#e7e7e4] pt-4">
                  <span className="font-bold">Total Harga Pesanan</span>
                  <span className="text-lg font-bold">
                    {formatRupiah(order.totalHarga)}
                  </span>
                </div>
              </section>

              <section className="mt-5 rounded-lg border border-[#dededb] bg-white p-5 md:p-6">
                {order.Status === "Dalam pengiriman" ? (
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <p className="text-sm text-[#686863]">
                      Menunggu konfirmasi penerimaan dari toko
                    </p>
                    <button
                      type="button"
                      disabled
                      className="cursor-not-allowed rounded-md bg-[#d2d2cf] px-5 py-2 text-sm font-bold text-[#73736f]"
                    >
                      Edit
                    </button>
                  </div>
                ) : editing ? (
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="text-sm font-semibold">
                      Status berikutnya
                      <select
                        value={nextStatus ?? ""}
                        disabled
                        className="mt-2 block h-[42px] min-w-[220px] rounded-md border border-[#c9c9c9] bg-[#f5f5f2] px-3 text-sm"
                      >
                        {nextStatus && (
                          <option value={nextStatus}>{nextStatus}</option>
                        )}
                      </select>
                    </label>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => void saveStatus()}
                      className="mt-6 rounded-md bg-[#a32626] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#842020] disabled:cursor-wait disabled:opacity-60"
                    >
                      {saving ? "Menyimpan..." : "Simpan"}
                    </button>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => setEditing(false)}
                      className="mt-6 rounded-md border border-[#252525] px-5 py-2.5 text-sm font-bold hover:bg-[#f5f5f2] disabled:opacity-60"
                    >
                      Batal
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="rounded-md bg-[#a32626] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#842020] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                  >
                    Edit
                  </button>
                )}
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
