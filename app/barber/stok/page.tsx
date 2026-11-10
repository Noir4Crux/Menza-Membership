"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../../components/Sidebar";
import Topbar from "../../../components/Topbar";

type Product = {
  ProdukID: string;
  NamaProduk: string;
  Satuan: string;
  Stok: number;
  statusStok: "Habis" | "Menipis" | "Tersedia";
};

const cardClass =
  "rounded-[8px] border border-[#d9d9d9] bg-white px-[20px] pb-[22px] pt-[18px]";

function stockLabelClass(status: Product["statusStok"]) {
  if (status === "Habis") return "bg-[#fde2e2] text-[#b42318]";
  if (status === "Menipis") return "bg-[#fff1c2] text-[#8a6100]";
  return "bg-[#d7f3e5] text-[#18794e]";
}

export default function BarberStokPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");

  async function loadProducts(search: string, signal?: AbortSignal) {
    const response = await fetch(
      `/api/barber/produk?q=${encodeURIComponent(search)}`,
      { signal },
    );
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "Gagal memuat daftar produk.");
    }
    setProducts(result.data as Product[]);
    setSelectedProduct(null);
  }

  useEffect(() => {
    const controller = new AbortController();
    async function initialLoad() {
      try {
        await loadProducts("", controller.signal);
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Gagal memuat daftar produk.",
          );
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void initialLoad();
    return () => controller.abort();
  }, []);

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearching(true);
    setError("");
    try {
      await loadProducts(query.trim());
    } catch (searchError) {
      setError(
        searchError instanceof Error
          ? searchError.message
          : "Gagal mencari produk.",
      );
    } finally {
      setSearching(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f2f2f0] font-sans text-[#252525]">
      <Sidebar role="barber" />
      <Topbar title="Stok Produk" role="barber" />
      <main className="min-h-screen pt-[76px] md:ml-[240px]">
        <div className="mx-auto max-w-[1200px] px-5 py-[28px] md:px-[28px]">
          <section className={cardClass}>
            <h1 className="text-[16px] font-bold">Cari nama produk</h1>
            <form
              onSubmit={handleSearch}
              className="mt-[16px] flex flex-col gap-[12px] sm:flex-row"
            >
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Cari nama produk"
                className="h-[42px] flex-1 rounded-[6px] border border-[#c9c9c9] px-[12px] text-[14px] outline-none placeholder:text-[#777]"
              />
              <button
                type="submit"
                className="h-[42px] rounded-[6px] bg-[#171717] px-[24px] text-[14px] font-bold text-white hover:bg-[#333]"
              >
                {searching ? "Mencari..." : "Cari"}
              </button>
            </form>
            {error && (
              <p role="alert" className="mt-3 text-[13px] text-red-600">
                {error}
              </p>
            )}
          </section>

          <section className={`mt-[18px] ${cardClass}`}>
            <h2 className="text-[16px] font-bold">Daftar Stok Produk</h2>
            <div className="mt-[16px] overflow-x-auto rounded-[8px] border border-[#ececec]">
              <table className="w-full min-w-[650px] border-collapse text-left">
                <thead>
                  <tr className="h-[48px] border-b border-[#ececec] text-[13px] font-bold">
                    <th className="px-4">Nama Produk</th>
                    <th className="px-4">Satuan</th>
                    <th className="px-4">Stok</th>
                    <th className="px-4">Status Stok</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center">
                        Memuat...
                      </td>
                    </tr>
                  ) : products.length ? (
                    products.map((product) => (
                      <tr
                        key={product.ProdukID}
                        onClick={() => setSelectedProduct(product)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            setSelectedProduct(product);
                          }
                        }}
                        tabIndex={0}
                        className={`h-[54px] cursor-pointer border-b border-[#ececec] text-[13px] last:border-0 hover:bg-[#fafafa] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#d5aa21] ${
                          selectedProduct?.ProdukID === product.ProdukID
                            ? "bg-[#fff8e6]"
                            : ""
                        }`}
                      >
                        <td className="px-4">{product.NamaProduk}</td>
                        <td className="px-4">{product.Satuan}</td>
                        <td className="px-4">{product.Stok}</td>
                        <td className="px-4">
                          <span
                            className={`rounded-full px-3 py-1 text-[12px] font-bold ${stockLabelClass(product.statusStok)}`}
                          >
                            {product.statusStok}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-7 text-center text-[14px] text-[#777]"
                      >
                        Produk tidak ditemukan
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className={`mt-[18px] ${cardClass}`}>
            <h2 className="text-[16px] font-bold">Pemeriksaan Stok</h2>
            {selectedProduct ? (
              <div className="mt-4 grid gap-4 text-[14px] sm:grid-cols-3">
                <div>
                  <p className="text-[#777]">Produk Terpilih</p>
                  <p className="mt-1 font-bold">{selectedProduct.NamaProduk}</p>
                </div>
                <div>
                  <p className="text-[#777]">Stok Saat Ini</p>
                  <p className="mt-1 font-bold">
                    {selectedProduct.Stok} {selectedProduct.Satuan}
                  </p>
                </div>
                <div>
                  <p className="text-[#777]">Stok menipis?</p>
                  <p className="mt-1 font-bold">
                    {selectedProduct.statusStok === "Tersedia" ? "Tidak" : "Ya"}
                  </p>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-[14px] text-[#777]">
                Pilih produk untuk memeriksa stok.
              </p>
            )}
            <div className="mt-[18px] flex flex-wrap gap-[12px]">
              <button
                type="button"
                onClick={() => {
                  if (selectedProduct) {
                    router.push(
                      `/barber/pesanan?produk=${encodeURIComponent(selectedProduct.ProdukID)}`,
                    );
                  }
                }}
                disabled={!selectedProduct}
                className={`min-h-[42px] rounded-[6px] px-[20px] text-[13px] font-bold text-white ${
                  selectedProduct
                    ? "bg-[#171717] hover:bg-[#333]"
                    : "cursor-not-allowed bg-[#999]"
                }`}
              >
                Pesan Produk
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
