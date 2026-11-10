"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Sidebar from "../../../../components/Sidebar";
import Topbar from "../../../../components/Topbar";

type Order = {
  PesananID: string;
  ProdukID: string;
  NamaProduk: string;
  Jumlah: number;
  Status: string;
  TanggalPesan: string;
};

const cardClass =
  "rounded-[8px] border border-[#d9d9d9] bg-white px-[20px] pb-[22px] pt-[18px]";

function formatTanggal(value: Date) {
  return `${String(value.getUTCDate()).padStart(2, "0")}/${String(value.getUTCMonth() + 1).padStart(2, "0")}/${value.getUTCFullYear()}`;
}

function TerimaBarangContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id") ?? "";
  const [order, setOrder] = useState<Order | null>(null);
  const [receivedQuantity, setReceivedQuantity] = useState("");
  const [receivedDate, setReceivedDate] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setReceivedDate(formatTanggal(new Date()));
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!orderId) return;

    const controller = new AbortController();
    async function loadOrder() {
      try {
        const response = await fetch("/api/barber/pesanan", {
          signal: controller.signal,
        });
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || "Gagal memuat pesanan.");
        }
        const matchingOrder = (result.data as Order[]).find(
          (item) => item.PesananID === orderId,
        );
        if (!matchingOrder) throw new Error("Pesanan tidak ditemukan.");
        if (matchingOrder.Status !== "Dalam pengiriman") {
          throw new Error(
            `Pesanan tidak dapat diterima karena statusnya "${matchingOrder.Status}".`,
          );
        }
        setOrder(matchingOrder);
        setReceivedQuantity(String(matchingOrder.Jumlah));
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

    void loadOrder();
    return () => controller.abort();
  }, [orderId]);

  async function handleSave() {
    if (!confirmed || !order || saving) return;
    const quantity = Number(receivedQuantity);
    if (!Number.isInteger(quantity) || quantity < 0) {
      setError("Jumlah diterima harus bilangan bulat minimal 0.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetch(
        `/api/barber/pesanan/${encodeURIComponent(order.PesananID)}/terima`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jumlahDiterima: quantity,
            sesuai: confirmed,
          }),
        },
      );
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Gagal memperbarui stok.");
      }
      setOrder({ ...order, Status: "Diterima", Jumlah: quantity });
      setSuccess("Stok berhasil diperbarui");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Gagal memperbarui stok.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f2f2f0] font-sans text-[#252525]">
      <Sidebar role="barber" />
      <Topbar title="Terima Barang & Simpan Stok" role="barber" />
      <main className="min-h-screen pt-[76px] md:ml-[240px]">
        <div className="mx-auto max-w-[1200px] px-5 py-[28px] md:px-[28px]">
          {loading && orderId && (
            <p className="mb-4 text-[14px] text-[#777]">Memuat...</p>
          )}
          {(!orderId || error) && (
            <p role="alert" className="mb-4 text-[13px] text-red-600">
              {error || "ID pesanan tidak ditemukan."}
            </p>
          )}
          {success && (
            <p role="status" className="mb-4 text-[13px] text-green-700">
              {success}
            </p>
          )}

          {order && orderId && (
            <>
              <section className={cardClass}>
                <h1 className="text-[16px] font-bold">Terima Barang</h1>
                <dl className="mt-4 grid gap-4 text-[14px] sm:grid-cols-2">
                  <div>
                    <dt className="text-[#777]">Pesanan Terkait</dt>
                    <dd className="mt-1 font-bold">{order.NamaProduk}</dd>
                  </div>
                  <div>
                    <dt className="text-[#777]">Tanggal Diterima</dt>
                    <dd className="mt-1 font-bold">
                      {receivedDate || "Memuat..."}
                    </dd>
                  </div>
                </dl>
                <label className="mt-5 flex cursor-pointer items-center gap-3 text-[14px]">
                  <input
                    type="checkbox"
                    checked={confirmed}
                    onChange={(event) => setConfirmed(event.target.checked)}
                    className="h-5 w-5 accent-black"
                  />
                  <span>Barang sesuai pesanan</span>
                </label>
              </section>

              <section className={`mt-[18px] ${cardClass}`}>
                <h2 className="text-[16px] font-bold">Barang Diterima</h2>
                <div className="mt-[16px] overflow-x-auto rounded-[8px] border border-[#ececec]">
                  <table className="w-full min-w-[600px] border-collapse text-left">
                    <thead>
                      <tr className="h-[48px] border-b border-[#ececec] text-[13px] font-bold">
                        <th className="px-4">Nama Produk</th>
                        <th className="px-4">Jumlah Dipesan</th>
                        <th className="px-4">Jumlah Diterima</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="h-[60px] text-[13px]">
                        <td className="px-4">{order.NamaProduk}</td>
                        <td className="px-4">{order.Jumlah}</td>
                        <td className="px-4">
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={receivedQuantity}
                            onChange={(event) =>
                              setReceivedQuantity(event.target.value)
                            }
                            className="h-[38px] w-[140px] rounded-[6px] border border-[#c9c9c9] px-3 text-[14px] outline-none"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <button
                  type="button"
                  onClick={() => void handleSave()}
                  disabled={!confirmed || saving}
                  className={`mt-[18px] min-h-[42px] rounded-[6px] px-[20px] text-[13px] font-bold text-white ${
                    !confirmed || saving
                      ? "cursor-not-allowed bg-[#999]"
                      : "bg-[#171717] hover:bg-[#333]"
                  }`}
                >
                  {saving ? "Menyimpan..." : "Simpan Stok"}
                </button>
              </section>
            </>
          )}

          <div className="mt-[18px] flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => router.push("/barber/pesanan")}
              className="min-h-[42px] rounded-[6px] border border-[#c9c9c9] bg-white px-[20px] text-[13px] font-bold hover:bg-[#f5f5f5]"
            >
              Kembali ke Status Pesanan
            </button>
            <button
              type="button"
              onClick={() => router.push("/barber/dashboard")}
              className="min-h-[42px] rounded-[6px] bg-[#171717] px-[20px] text-[13px] font-bold text-white hover:bg-[#333]"
            >
              Kembali ke Dashboard
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function TerimaBarangPage() {
  return (
    <Suspense fallback={<p className="p-6 text-[#777]">Memuat...</p>}>
      <TerimaBarangContent />
    </Suspense>
  );
}
