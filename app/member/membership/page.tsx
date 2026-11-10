"use client";

import { useEffect, useState } from "react";
import Sidebar from "../../../components/Sidebar";
import Topbar from "../../../components/Topbar";

type MemberData = {
  MemberID: string;
  NamaMember: string;
  StatusMembership: string;
  Benefit: string | null;
  MasaBerlaku: string | null;
  TanggalDaftar: string | null;
};

const packages = [
  { months: 3, price: 50000, label: "Membership 3 Bulan" },
  { months: 12, price: 180000, label: "Membership 12 Bulan" },
] as const;
const paymentMethods = ["Transfer Bank", "QRIS", "Cash"] as const;
type PaymentMethod = (typeof paymentMethods)[number];

const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return `${String(date.getUTCDate()).padStart(2, "0")} ${monthNames[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

function formatRupiah(amount: number) {
  return `Rp ${Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
}

export default function MembershipPage() {
  const [member, setMember] = useState<MemberData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPackage, setSelectedPackage] = useState<3 | 12 | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | "">("");
  const [submitting, setSubmitting] = useState(false);
  const [requestStatus, setRequestStatus] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    async function loadMember() {
      try {
        const response = await fetch("/api/member/me", {
          signal: controller.signal,
        });
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || "Gagal memuat data membership.");
        }
        setMember(result.data as MemberData);
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Gagal memuat data membership.",
          );
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadMember();
    return () => controller.abort();
  }, []);

  const selectedPlan = packages.find(
    (item) => item.months === selectedPackage,
  );

  async function submitExtension() {
    if (!selectedPackage || !selectedMethod || submitting || requestStatus) {
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/member/perpanjang", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paket: selectedPackage,
          metode: selectedMethod,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Gagal mengajukan perpanjangan.");
      }
      setRequestStatus(result.data.status);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Gagal mengajukan perpanjangan.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#efefed] font-sans text-[#1a1a1a]">
      <Sidebar role="member" />
      <Topbar title="Info Membership" />

      <main className="min-h-screen pt-[76px] md:ml-[240px]">
        <div className="mx-auto w-full max-w-[1200px] px-5 py-[24px] md:px-[36px]">
          <p className="text-[18px] text-[#6b6b66]">
            Kelola masa aktif membership Anda
          </p>
          {loading && <p className="mt-3 text-[#6b6b66]">Memuat...</p>}
          {error && (
            <p role="alert" className="mt-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <section className="mt-[24px] grid overflow-hidden rounded-[8px] border border-[#ededeb] bg-white md:grid-cols-[345px_1fr]">
            <div className="relative mx-[20px] my-[20px] overflow-hidden rounded-[38px] bg-[#171717] text-white">
              <div className="absolute inset-y-[-20%] right-[-12%] w-[180px] rotate-[32deg] border-l border-[#efbd24]/70 bg-[#171717]" />
              <div className="relative flex h-[170px] flex-col justify-center px-[26px]">
                <div className="flex items-center gap-[9px]">
                  <div className="flex h-[28px] w-[28px] items-center justify-center rounded-[3px] bg-white text-[18px] font-bold text-black">
                    M
                  </div>
                  <span className="text-[14px] font-bold">MENZA</span>
                </div>
                <p className="mt-[18px] text-[13px] font-bold">
                  {member?.NamaMember ?? (loading ? "Memuat..." : "—")}
                </p>
                <p className="mt-[5px] text-[12px] font-bold">
                  {member?.MemberID ?? "—"}
                </p>
              </div>
            </div>

            <div className="flex flex-col justify-center px-[20px] py-[24px]">
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-[16px] font-bold">Membership Saat Ini</h2>
                <span className="rounded-full bg-[#d7f3e5] px-[18px] py-[7px] text-[16px] font-bold text-[#18794e]">
                  {member?.StatusMembership ?? (loading ? "Memuat..." : "—")}
                </span>
              </div>
              <dl className="mt-[20px] space-y-[16px] text-[16px]">
                <div className="flex gap-[16px]">
                  <dt className="w-[160px] shrink-0 text-[#6b6b66]">
                    Berlaku sampai
                  </dt>
                  <dd className="font-bold">
                    {formatDate(member?.MasaBerlaku ?? null)}
                  </dd>
                </div>
                <div className="flex gap-[16px]">
                  <dt className="w-[160px] shrink-0 text-[#6b6b66]">Mulai</dt>
                  <dd className="font-bold">
                    {formatDate(member?.TanggalDaftar ?? null)}
                  </dd>
                </div>
                <div className="flex gap-[16px]">
                  <dt className="w-[160px] shrink-0 text-[#6b6b66]">
                    Berakhir
                  </dt>
                  <dd className="font-bold">
                    {formatDate(member?.MasaBerlaku ?? null)}
                  </dd>
                </div>
              </dl>
            </div>
          </section>

          <section className="mt-[24px] rounded-[8px] border border-[#ededeb] bg-white px-[20px] py-[20px]">
            <h2 className="text-[20px] font-bold">Perpanjang Membership</h2>
            <h3 className="mt-4 text-[16px] font-bold">
              Pilih Paket Perpanjangan
            </h3>
            <div className="mt-[12px] grid gap-[12px] md:grid-cols-2">
              {packages.map((item) => (
                <button
                  key={item.months}
                  type="button"
                  aria-pressed={selectedPackage === item.months}
                  onClick={() => setSelectedPackage(item.months)}
                  className={`rounded-[8px] border p-[16px] text-left hover:bg-[#fafafa] ${
                    selectedPackage === item.months
                      ? "border-[#d5aa21] bg-[#fffaf0] ring-1 ring-[#d5aa21]"
                      : "border-[#ededeb] bg-white"
                  }`}
                >
                  <span className="block text-[16px] font-bold">
                    {item.label}
                  </span>
                  <span className="mt-1 block text-[18px] font-bold">
                    {formatRupiah(item.price)}
                  </span>
                  <span className="mt-1 block text-[14px] text-[#6b6b66]">
                    Masa aktif bertambah {item.months} bulan
                  </span>
                </button>
              ))}
            </div>

            <h3 className="mt-[20px] text-[16px] font-bold">
              Metode Pembayaran
            </h3>
            <div className="mt-[10px] flex flex-wrap gap-[10px]">
              {paymentMethods.map((method) => (
                <button
                  key={method}
                  type="button"
                  aria-pressed={selectedMethod === method}
                  onClick={() => setSelectedMethod(method)}
                  className={`min-h-[42px] rounded-[8px] border px-[18px] text-[15px] font-bold hover:bg-[#fafafa] ${
                    selectedMethod === method
                      ? "border-[#d5aa21] bg-[#fffaf0]"
                      : "border-[#d9d9d7] bg-white"
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>

            <div className="mt-[20px] flex items-center justify-between border-t border-[#ededeb] pt-[18px] text-[18px] font-bold">
              <span>Total Pembayaran</span>
              <span>{formatRupiah(selectedPlan?.price ?? 0)}</span>
            </div>
            <button
              type="button"
              onClick={() => void submitExtension()}
              disabled={
                !selectedPackage ||
                !selectedMethod ||
                submitting ||
                Boolean(requestStatus)
              }
              className={`mt-[16px] min-h-[46px] w-full rounded-[6px] text-[15px] font-bold ${
                !selectedPackage ||
                !selectedMethod ||
                submitting ||
                Boolean(requestStatus)
                  ? "cursor-not-allowed bg-[#b4b4b4] text-black"
                  : "bg-[#f7c948] text-black hover:bg-[#edbc37]"
              }`}
            >
              {submitting ? "Memproses..." : "Perpanjang Membership"}
            </button>
            {requestStatus && (
              <p role="status" className="mt-4 text-[15px] text-[#18794e]">
                Status Perpanjangan: {requestStatus}
              </p>
            )}
          </section>

          <section className="mt-[24px]">
            <h2 className="text-[20px] font-bold">Benefit Membership</h2>
            <div className="mt-[16px] grid rounded-[8px] border border-[#ededeb] bg-white md:grid-cols-2">
              <div className="px-[28px] py-[28px] text-[16px] text-[#6b6b66]">
                {member?.Benefit ?? "Benefit membership belum tersedia."}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
