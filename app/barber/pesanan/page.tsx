"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Sidebar from "../../../components/Sidebar";
import Topbar from "../../../components/Topbar";

type Product = {
  ProdukID: string;
  NamaProduk: string;
  Satuan: string;
  Stok: number;
  statusStok: string;
};

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

function PesananContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryProductId = searchParams.get("produk") ?? "";
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [productId, setProductId] = useState(queryProductId);
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadOrders(signal?: AbortSignal) {
    const response = await fetch("/api/barber/pesanan", { signal });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "Gagal memuat status pesanan.");
    }
    setOrders(result.data as Order[]);
  }

  useEffect(() => {
    const controller = new AbortController();
    async function loadData() {
      try {
        const [productResponse, orderResponse] = await Promise.all([
          fetch("/api/barber/produk", { signal: controller.signal }),
          fetch("/api/barber/pesanan", { signal: controller.signal }),
        ]);
        const [productResult, orderResult] = await Promise.all([
          productResponse.json(),
          orderResponse.json(),
        ]);
        if (!productResponse.ok) {
          throw new Error(productResult.error || "Gagal memuat produk.");
        }
        if (!orderResponse.ok) {
          throw new Error(orderResult.error || "Gagal memuat status pesanan.");
        }
        if (controller.signal.aborted) return;
        const loadedProducts = productResult.data as Product[];
        setProducts(loadedProducts);
        setOrders(orderResult.data as Order[]);
        if (
          queryProductId &&
          loadedProducts.some((product) => product.ProdukID === queryProductId)
        ) {
          setProductId(queryProductId);
        } else if (loadedProducts.length > 0) {
          setProductId((current) => current || loadedProducts[0]!.ProdukID);
        }
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Gagal memuat data pesanan.",
          );
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadData();
    return () => controller.abort();
  }, [queryProductId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    const parsedQuantity = Number(quantity);
    if (!productId || !Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
      setError("Pilih produk dan masukkan jumlah bilangan bulat lebih dari 0.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/barber/pesanan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ProdukID: productId,
          jumlah: parsedQuantity,
          ...(note.trim() ? { catatan: note.trim() } : {}),
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Gagal mengirim pesanan.");
      }
      await loadOrders();
      setQuantity("");
      setNote("");
      setSuccess("Pesanan terkirim");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Gagal mengirim pesanan.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const selectedOrder = orders.find(
    (order) => order.PesananID === selectedOrderId,
  );

  return (
    <div className="min-h-screen bg-[#f2f2f0] font-sans text-[#252525]">
      <Sidebar role="barber" />
      <Topbar title="Pesan Produk & Status Pesanan" role="barber" />
      <main className="min-h-screen pt-[76px] md:ml-[240px]">
        <div className="mx-auto max-w-[1200px] px-5 py-[28px] md:px-[28px]">
          <section className={cardClass}>
            <h1 className="text-[16px] font-bold">Form Pesan Produk</h1>
            {loading ? (
              <p className="mt-4 text-[14px] text-[#777]">Memuat...</p>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="mt-[16px] grid gap-[14px] md:grid-cols-2"
              >
                <label className="text-[13px] font-bold">
                  Nama Produk
                  <select
                    value={productId}
                    onChange={(event) => setProductId(event.target.value)}
                    className="mt-2 h-[42px] w-full rounded-[6px] border border-[#c9c9c9] bg-white px-3 text-[14px] font-normal outline-none"
                  >
                    {products.length === 0 && (
                      <option value="">Tidak ada produk</option>
                    )}
                    {products.map((product) => (
                      <option key={product.ProdukID} value={product.ProdukID}>
                        {product.NamaProduk}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-[13px] font-bold">
                  Jumlah Pesan
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={quantity}
                    onChange={(event) => setQuantity(event.target.value)}
                    className="mt-2 h-[42px] w-full rounded-[6px] border border-[#c9c9c9] px-3 text-[14px] font-normal outline-none"
                  />
                </label>
                <label className="text-[13px] font-bold md:col-span-2">
                  Catatan Pesanan
                  <textarea
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    maxLength={200}
                    rows={3}
                    className="mt-2 w-full rounded-[6px] border border-[#c9c9c9] px-3 py-2 text-[14px] font-normal outline-none"
                  />
                </label>
                <div className="md:col-span-2">
                  <button
                    type="submit"
                    className="min-h-[42px] rounded-[6px] bg-[#171717] px-[20px] text-[13px] font-bold text-white hover:bg-[#333]"
                  >
                    {submitting ? "Mengirim..." : "Kirim Pesanan"}
                  </button>
                </div>
              </form>
            )}
            {error && (
              <p role="alert" className="mt-3 text-[13px] text-red-600">
                {error}
              </p>
            )}
            {success && (
              <p role="status" className="mt-3 text-[13px] text-green-700">
                {success}
              </p>
            )}
          </section>

          <section className={`mt-[18px] ${cardClass}`}>
            <h2 className="text-[16px] font-bold">Status Pesanan</h2>
            <div className="mt-[16px] overflow-x-auto rounded-[8px] border border-[#ececec]">
              <table className="w-full min-w-[700px] border-collapse text-left">
                <thead>
                  <tr className="h-[48px] border-b border-[#ececec] text-[13px] font-bold">
                    <th className="px-4">ID Pesanan</th>
                    <th className="px-4">Produk</th>
                    <th className="px-4">Jumlah</th>
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
                  ) : orders.length ? (
                    orders.map((order) => (
                      <tr
                        key={order.PesananID}
                        onClick={() => setSelectedOrderId(order.PesananID)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            setSelectedOrderId(order.PesananID);
                          }
                        }}
                        tabIndex={0}
                        className={`h-[52px] cursor-pointer border-b border-[#ececec] text-[13px] last:border-0 hover:bg-[#fafafa] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#d5aa21] ${
                          selectedOrderId === order.PesananID
                            ? "bg-[#fff8e6]"
                            : ""
                        }`}
                      >
                        <td className="px-4">{order.PesananID}</td>
                        <td className="px-4">{order.NamaProduk}</td>
                        <td className="px-4">{order.Jumlah}</td>
                        <td className="px-4">{order.Status}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-7 text-center text-[14px] text-[#777]"
                      >
                        Belum ada pesanan
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="mt-[18px] flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  if (selectedOrder) {
                    router.push(
                      `/barber/pesanan/terima?id=${encodeURIComponent(selectedOrder.PesananID)}`,
                    );
                  }
                }}
                disabled={selectedOrder?.Status !== "Dalam pengiriman"}
                className={`min-h-[42px] rounded-[6px] px-[20px] text-[13px] font-bold text-white ${
                  selectedOrder?.Status === "Dalam pengiriman"
                    ? "bg-[#171717] hover:bg-[#333]"
                    : "cursor-not-allowed bg-[#999]"
                }`}
              >
                Terima Barang
              </button>
              <button
                type="button"
                onClick={() => router.push("/barber/dashboard")}
                className="min-h-[42px] rounded-[6px] border border-[#c9c9c9] bg-white px-[20px] text-[13px] font-bold hover:bg-[#f5f5f5]"
              >
                Kembali ke Dashboard
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default function BarberPesananPage() {
  return (
    <Suspense fallback={<p className="p-6 text-[#777]">Memuat...</p>}>
      <PesananContent />
    </Suspense>
  );
}
