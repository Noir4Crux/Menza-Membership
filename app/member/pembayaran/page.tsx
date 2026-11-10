"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
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

const paymentMethods = ["Transfer Bank", "Cash", "QRIS"] as const;
type PaymentMethod = (typeof paymentMethods)[number];

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
      className="h-[58px] w-[58px] fill-none stroke-black"
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

function PembayaranContent() {
  const searchParams = useSearchParams();
  const layananId = searchParams.get("layanan") ?? "";
  const poinChoice = searchParams.get("poin") ?? "";
  const [calculation, setCalculation] = useState<Calculation | null>(null);
  const [catalogService, setCatalogService] = useState<CatalogService | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | "">("");
  const [submitting, setSubmitting] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("");

  useEffect(() => {
    if (!layananId || (poinChoice !== "ya" && poinChoice !== "tidak")) {
      return;
    }

    const controller = new AbortController();
    async function loadOrder() {
      setLoading(true);
      setError("");
      setCalculation(null);
      setCatalogService(null);
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
            calculationResult.error || "Gagal memuat ringkasan pesanan.",
          );
        }

        if (!catalogResponse.ok) {
          throw new Error(catalogResult.error || "Gagal memuat layanan.");
        }
        const service = (catalogResult.data as CatalogService[]).find(
          (item) => item.LayananID === layananId,
        );
        if (!service) throw new Error("Layanan tidak ditemukan.");
        setCalculation(calculationResult.data as Calculation);
        setCatalogService(service);
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Gagal memuat ringkasan pesanan.",
          );
        }

      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadOrder();
    return () => controller.abort();
  }, [layananId, poinChoice]);

  async function confirmPayment() {
    if (!selectedMethod || !layananId || paymentStatus) return;
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/member/pembayaran", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          layananId,
          gunakanPoin: poinChoice === "ya",
          metode: selectedMethod,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Gagal mengonfirmasi pembayaran.");
      }
      setPaymentStatus(result.data.status);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Gagal mengonfirmasi pembayaran.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const namaLayanan = catalogService
    ? getDisplayName(catalogService)
    : calculation?.namaLayanan;

  const missingSelection =
    !layananId || (poinChoice !== "ya" && poinChoice !== "tidak");

  return (
    <div className="min-h-screen bg-[#efefed] font-sans text-[#1a1a1a]">
      <Sidebar role="member" />
      <Topbar title="Pilih Layanan" />

      <main className="min-h-screen pt-[76px] md:ml-[240px]">
        <div className="mx-auto w-full max-w-[1200px] px-5 py-[24px] md:px-[36px]">
          <h1 className="text-[20px] font-bold">Pembayaran</h1>
          <p className="mt-[2px] text-[18px] text-[#6b6b66]">
            Lakukan pembayaran sesuai dengan metode yang tersedia
          </p>

          {loading && <p className="mt-4 text-[#6b6b66]">Memuat...</p>}
          {missingSelection && !loading && (
            <div className="mt-4">
              <p className="text-red-600">
                Pilihan layanan atau poin tidak valid. Pilih layanan terlebih
                dahulu.
              </p>
              <a
                href="/member/layanan"
                className="mt-3 inline-flex min-h-[42px] items-center justify-center rounded-[8px] bg-black px-4 font-bold text-white hover:bg-[#333]"
              >
                Pilih Layanan
              </a>
            </div>
          )}
          {error && (
            <p role="alert" className="mt-3 text-sm text-red-600">
              {error}
            </p>
          )}

          {calculation && !loading && (
            <div className="mt-[24px] grid items-start gap-[24px] lg:grid-cols-[470px_470px]">
              <div>
                <section className="rounded-[8px] border border-[#ededeb] bg-white px-[20px] pt-[22px]">
                  <h2 className="text-[16px] font-bold">Ringkasan Pesanan</h2>
                  <div className="mt-[18px] flex items-center gap-[14px]">
                    <div className="flex h-[72px] w-[72px] items-center justify-center rounded-[6px] bg-[#e8e8e8]">
                      <ScissorsIcon />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[16px] font-bold">{namaLayanan}</p>
                    </div>
                    <p className="text-[16px] font-bold">
                      {formatRupiah(calculation.subtotal)}
                    </p>
                  </div>

                  <div className="mt-[18px] border-t border-[#dedede] pt-[22px] text-[16px]">
                    <div className="flex justify-between text-[#6b6b66]">
                      <span>Subtotal</span>
                      <span>{formatRupiah(calculation.subtotal)}</span>
                    </div>
                    <div className="mt-[18px] flex justify-between text-[#6b6b66]">
                      <span>Diskon (Poin)</span>
                      <span>-{formatRupiah(calculation.diskon)}</span>
                    </div>
                  </div>

                  <div className="mt-[22px] flex justify-between border-t border-[#dedede] py-[18px] text-[20px] font-bold">
                    <span>Total</span>
                    <span>{formatRupiah(calculation.total)}</span>
                  </div>
                </section>

                <section className="mt-[16px] rounded-[8px] border border-[#ededeb] bg-white px-[20px] py-[18px]">
                  <h2 className="text-[16px] font-bold">Metode Pembayaran</h2>
                  <div className="mt-[12px]">
                    {paymentMethods.map((method, index) => (
                      <label
                        key={method}
                        className={`flex min-h-[58px] cursor-pointer items-center gap-[14px] ${
                          index > 0 ? "border-t border-[#dedede]" : ""
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment-method"
                          value={method}
                          checked={selectedMethod === method}
                          onChange={() => setSelectedMethod(method)}
                          className="h-[22px] w-[22px] accent-black"
                        />
                        <span className="text-[14px] font-bold">{method}</span>
                      </label>
                    ))}
                  </div>
                </section>
              </div>

              <aside className="rounded-[8px] border border-[#ededeb] bg-white px-[20px] pb-[24px] pt-[20px] lg:min-h-[470px]">
                <h2 className="text-[16px] font-bold">
                  Instruksi Pembayaran
                </h2>
                {selectedMethod === "Transfer Bank" && (
                  <p className="mt-[16px] text-[16px] text-[#6b6b66]">
                    BCA, BNI, BRI, Mandiri, dll
                  </p>
                )}
                <p className="mt-[16px] text-[16px] leading-6 text-[#6b6b66]">
                  Pilih metode pembayaran yang diinginkan. Lakukan pembayaran
                  sesuai nominal. Klik tombol konfirmasi setelah pembayaran
                  selesai.
                </p>
                <button
                  type="button"
                  onClick={() => void confirmPayment()}
                  disabled={!selectedMethod || submitting || Boolean(paymentStatus)}
                  className={`mt-[20px] h-[48px] w-full rounded-[6px] text-[15px] font-bold text-black ${
                    !selectedMethod || submitting || paymentStatus
                      ? "cursor-not-allowed bg-[#b4b4b4]"
                      : "bg-[#f7c948] hover:bg-[#edbc37]"
                  }`}
                >
                  {submitting ? "Memproses..." : "Konfirmasi Pembayaran"}
                </button>
                {paymentStatus && (
                  <div className="mt-5 rounded-[8px] bg-[#f0f7ec] p-4">
                    <p className="font-bold">
                      Status Pembayaran: {paymentStatus}
                    </p>
                    <p className="mt-1 text-[14px] text-[#6b6b66]">
                      Pembayaran Anda sedang dalam proses verifikasi oleh tim
                      kami
                    </p>
                  </div>
                )}
              </aside>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function PembayaranPage() {
  return (
    <Suspense fallback={<p className="p-6 text-[#6b6b66]">Memuat...</p>}>
      <PembayaranContent />
    </Suspense>
  );
}
