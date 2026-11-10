"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Sidebar from "../../../components/Sidebar";
import Topbar from "../../../components/Topbar";

type Calculation = {
  namaLayanan: string;
  subtotal: number;
  saldoPoin: number;
  poinDitukar: number;
  diskon: number;
  total: number;
  poinDiperoleh: number;
  aktif: boolean;
};

type CatalogService = {
  LayananID: string;
  NamaLayanan: string;
  label: string | null;
};

function formatRupiah(amount: number) {
  return `Rp ${Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
}

function getDisplayName(service: CatalogService) {
  const kapster = service.label?.replace(/^By\s+/i, "");
  if (
    !kapster ||
    service.NamaLayanan.toLowerCase().includes(kapster.toLowerCase())
  ) {
    return service.NamaLayanan;
  }
  return `${service.NamaLayanan} by ${kapster}`;
}

function ScissorsIcon() {
  return (
    <svg
      viewBox="0 0 100 100"
      aria-hidden="true"
      className="h-[60px] w-[60px] fill-none stroke-black"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 15l32 34M89 15L57 49" strokeWidth="7" />
      <circle cx="31" cy="72" r="15" strokeWidth="7" />
      <circle cx="69" cy="72" r="15" strokeWidth="7" />
      <path d="M43 61l7-12 7 12M50 49v14" strokeWidth="7" />
    </svg>
  );
}

function RingkasanPembayaranContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const layananId = searchParams.get("layanan") ?? "";
  const poinChoice = searchParams.get("poin") ?? "";
  const [calculation, setCalculation] = useState<Calculation | null>(null);
  const [catalogService, setCatalogService] = useState<CatalogService | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!layananId) {
      return;
    }

    const controller = new AbortController();
    async function loadSummary() {
      setLoading(true);
      setError("");
      setCalculation(null);
      try {
        const [calculationResponse, catalogResponse] = await Promise.all([
          fetch("/api/member/hitung", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              layananId,
              gunakanPoin: poinChoice === "ya",
            }),
            signal: controller.signal,
          }),
          fetch("/api/member/layanan", { signal: controller.signal }),
        ]);
        const calculationResult = await calculationResponse.json();
        const catalogResult = await catalogResponse.json();
        if (!calculationResponse.ok) {
          throw new Error(
            calculationResult.error || "Gagal memuat ringkasan layanan.",
          );
        }
        if (!catalogResponse.ok) {
          throw new Error(catalogResult.error || "Gagal memuat layanan.");
        }
        setCalculation(calculationResult.data as Calculation);
        const service = (catalogResult.data as CatalogService[]).find(
          (item) => item.LayananID === layananId,
        );
        if (!service) throw new Error("Layanan tidak ditemukan.");
        setCatalogService(service);
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Gagal memuat ringkasan layanan.",
          );
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadSummary();
    return () => controller.abort();
  }, [layananId, poinChoice]);

  function choosePoints(choice: "ya" | "tidak") {
    router.push(
      `/member/ringkasan?layanan=${encodeURIComponent(layananId)}&poin=${choice}`,
    );
  }

  const namaLayanan = catalogService
    ? getDisplayName(catalogService)
    : calculation?.namaLayanan;

  return (
    <div className="min-h-screen bg-[#efefed] font-sans text-[#1a1a1a]">
      <Sidebar role="member" />
      <Topbar title="Pilih Layanan" />

      <main className="min-h-screen pt-[76px] md:ml-[240px]">
        <div className="mx-auto w-full max-w-[1200px] px-5 py-[24px] md:px-[36px]">
          <h1 className="text-[20px] font-bold">Ringkasan Pembayaran</h1>
          <p className="mt-[2px] text-[18px] text-[#6b6b66]">
            Periksa kembali detail pesanan Anda
          </p>

          {!layananId ? (
            <section className="mt-[24px] w-full max-w-[525px] rounded-[8px] bg-white p-5">
              <p className="text-red-600">
                Pilih layanan terlebih dahulu untuk melihat ringkasan.
              </p>
              <a
                href="/member/layanan"
                className="mt-4 inline-flex min-h-[42px] items-center justify-center rounded-[8px] bg-black px-4 font-bold text-white hover:bg-[#333]"
              >
                Pilih Layanan
              </a>
            </section>
          ) : (
            <>
              {loading && <p className="mt-4 text-[#6b6b66]">Memuat...</p>}
              {error && (
                <div className="mt-4">
                  <p role="alert" className="text-sm text-red-600">
                    {error}
                  </p>
                  <a
                    href="/member/layanan"
                    className="mt-3 inline-flex min-h-[42px] items-center justify-center rounded-[8px] bg-black px-4 font-bold text-white hover:bg-[#333]"
                  >
                    Pilih Layanan
                  </a>
                </div>
              )}
              {calculation && (
                <section className="mt-[24px] w-full max-w-[525px] rounded-[8px] border border-[#ededeb] bg-white px-[20px] pb-[20px] pt-[22px] shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                  <div className="flex items-center justify-between">
                    <h2 className="text-[16px] font-bold">Detail Layanan</h2>
                    <a
                      href="/member/layanan"
                      className="text-[15px] font-bold hover:underline"
                    >
                      Ubah
                    </a>
                  </div>

                  <div className="mt-[18px] flex items-center gap-[16px]">
                    <div className="flex h-[72px] w-[72px] items-center justify-center rounded-[6px] bg-[#e8e8e8]">
                      <ScissorsIcon />
                    </div>
                    <div>
                      <p className="text-[16px] font-bold">{namaLayanan}</p>
                      <p className="mt-[1px] text-[16px] text-[#6b6b66]">
                        {formatRupiah(calculation.subtotal)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-[18px] border-t border-[#dedede] pt-[20px] text-[16px]">
                    <div className="flex justify-between text-[#6b6b66]">
                      <span>Subtotal</span>
                      <span>{formatRupiah(calculation.subtotal)}</span>
                    </div>
                    <div className="mt-[18px] flex justify-between text-[#6b6b66]">
                      <span>Diskon (Poin)</span>
                      <span>-{formatRupiah(calculation.diskon)}</span>
                    </div>
                  </div>

                  <div className="mt-[20px] flex justify-between border-t border-[#dedede] pt-[18px] text-[20px] font-bold">
                    <span>Total</span>
                    <span>{formatRupiah(calculation.total)}</span>
                  </div>

                  <div className="mt-[18px] flex h-[65px] items-center gap-[12px] rounded-[8px] bg-[#efefef] px-[16px]">
                    <div className="flex h-[38px] w-[38px] items-center justify-center rounded-full border-[3px] border-[#d5aa21] bg-[#f7c948] text-[18px] text-white">
                      P
                    </div>
                    <div>
                      <p className="text-[15px] font-bold">Saldo Poin Anda</p>
                      <p className="text-[14px] text-[#6b6b66]">
                        {calculation.saldoPoin} Poin
                      </p>
                    </div>
                  </div>

                  <div className="mt-[18px]">
                    <h3 className="text-[16px] font-bold">Gunakan Poin?</h3>
                    <p className="mt-[2px] text-[15px] text-[#6b6b66]">
                      Tukarkan poin untuk mendapatkan diskon
                    </p>
                    <div className="mt-[12px] grid grid-cols-2 gap-[16px]">
                      {(["ya", "tidak"] as const).map((choice) => (
                        <button
                          key={choice}
                          type="button"
                          aria-pressed={poinChoice === choice}
                          onClick={() => choosePoints(choice)}
                          className={`flex h-[42px] items-center justify-center rounded-[8px] border border-[#d9d9d7] text-[16px] font-bold hover:bg-[#f5f5f3] ${
                            poinChoice === choice
                              ? "bg-[#1a1a1a] text-white"
                              : "bg-white"
                          }`}
                        >
                          {choice === "ya" ? "Ya" : "Tidak"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {poinChoice === "ya" || poinChoice === "tidak" ? (
                    <div className="mt-[20px] rounded-[8px] border border-[#dedede] p-4">
                      <h3 className="text-[16px] font-bold">
                        Rincian Diskon
                      </h3>
                      <div className="mt-3 space-y-2 text-[15px] text-[#6b6b66]">
                        <div className="flex justify-between">
                          <span>Poin yang ditukar</span>
                          <span>{calculation.poinDitukar} Poin</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Nilai diskon</span>
                          <span>{formatRupiah(calculation.diskon)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-[#1a1a1a]">
                          <span>Total setelah diskon</span>
                          <span>{formatRupiah(calculation.total)}</span>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {poinChoice === "ya" || poinChoice === "tidak" ? (
                    <a
                      href={`/member/pembayaran?layanan=${encodeURIComponent(layananId)}&poin=${poinChoice}`}
                      className="mt-5 flex min-h-[46px] items-center justify-center rounded-[8px] bg-black px-4 text-[15px] font-bold text-white hover:bg-[#333]"
                    >
                      Lanjutkan Pembayaran
                    </a>
                  ) : null}
                </section>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default function RingkasanPembayaranPage() {
  return (
    <Suspense fallback={<p className="p-6 text-[#6b6b66]">Memuat...</p>}>
      <RingkasanPembayaranContent />
    </Suspense>
  );
}
