"use client";

import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Sidebar from "../../../../components/Sidebar";
import Topbar from "../../../../components/Topbar";

type TransactionDetail = {
  TransaksiID: string;
  Tanggal: string;
  layanan: string;
  TotalTransaksi: number;
  diskon: number;
  status: string;
  poinDiperoleh: number;
  saldoPoin: number;
};

const monthNames = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${day} ${monthNames[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

function formatRupiah(amount: number) {
  return `Rp ${Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
}

function DetailTransaksiContent() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [transaction, setTransaction] = useState<TransactionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    async function loadTransaction() {
      try {
        const response = await fetch(
          `/api/member/transaksi/${encodeURIComponent(id)}`,
          { signal: controller.signal },
        );
        const result = await response.json();
        if (response.status === 404) {
          setTransaction(null);
          return;
        }
        if (!response.ok) {
          throw new Error(result.error || "Gagal memuat detail transaksi.");
        }
        setTransaction(result.data as TransactionDetail);
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Gagal memuat detail transaksi.",
          );
        }

      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadTransaction();
    return () => controller.abort();
  }, [id]);

  const details = transaction
    ? [
        ["No Transaksi", transaction.TransaksiID],
        ["Tanggal", formatDate(transaction.Tanggal)],
        ["Layanan", transaction.layanan],
        ["Total Pembayaran", formatRupiah(transaction.TotalTransaksi)],
        ["Diskon (Poin)", formatRupiah(transaction.diskon)],
        ["Status", transaction.status],
      ]
    : [];

  return (
    <div className="min-h-screen bg-[#efefed] font-sans text-[#1a1a1a]">
      <Sidebar role="member" />
      <Topbar title="Riwayat Transaksi" />

      <main className="min-h-screen pt-[76px] md:ml-[240px]">
        <div className="mx-auto w-full max-w-[1200px] px-5 py-[24px] md:px-[36px]">
          <p className="text-[18px] text-[#6b6b66]">
            Lihat riwayat transaksi dan kunjungan Anda
          </p>
          {loading && <p className="mt-4 text-[#6b6b66]">Memuat...</p>}
          {error && (
            <p role="alert" className="mt-3 text-sm text-red-600">
              {error}
            </p>
          )}
          {!loading && !error && !transaction && (
            <p className="mt-[24px] rounded-[8px] bg-white px-5 py-7 text-center text-[#6b6b66]">
              Belum ada transaksi
            </p>
          )}

          {transaction && (
            <div className="mt-[24px] grid gap-[16px] lg:grid-cols-[510px_340px]">
              <section className="overflow-hidden rounded-[8px] border border-[#ededeb] bg-white">
                <h1 className="px-[20px] pt-[18px] text-[16px] font-bold">
                  Detail Transaksi
                </h1>
                <div className="mt-[12px]">
                  {details.map(([label, value]) => (
                    <div
                      key={label}
                      className="flex min-h-[52px] items-center justify-between border-t border-[#ededeb] px-[20px] text-[14px]"
                    >
                      <span className="text-[#6b6b66]">{label}</span>
                      {label === "Status" ? (
                        <span className="rounded-full bg-[#d7f3e5] px-[14px] py-[5px] font-bold text-[#18794e]">
                          {value}
                        </span>
                      ) : (
                        <span
                          className={
                            label === "Layanan" ? "text-right font-bold" : ""
                          }
                        >
                          {value}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              <section className="h-fit rounded-[8px] border border-[#ededeb] bg-white px-[20px] pt-[18px]">
                <h2 className="text-[16px] font-bold">Poin</h2>
                <div className="mt-[12px]">
                  <div className="flex min-h-[52px] items-center justify-between border-t border-[#ededeb] text-[14px]">
                    <span className="text-[#6b6b66]">Poin diperoleh</span>
                    <span className="font-bold">
                      + {transaction.poinDiperoleh} Poin
                    </span>
                  </div>
                  <div className="flex min-h-[52px] items-center justify-between border-t border-[#ededeb] text-[14px]">
                    <span className="text-[#6b6b66]">Total poin sekarang</span>
                    <span className="font-bold">{transaction.saldoPoin} Poin</span>
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function DetailTransaksiPage() {
  return (
    <Suspense fallback={<p className="p-6 text-[#6b6b66]">Memuat...</p>}>
      <DetailTransaksiContent />
    </Suspense>
  );
}
