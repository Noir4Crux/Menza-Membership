"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../../components/Sidebar";
import Topbar from "../../../components/Topbar";

type Transaction = {
  TransaksiID: string;
  Tanggal: string;
  layanan: string;
  TotalTransaksi: number;
  diskon: number;
  status: string;
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

export default function RiwayatTransaksiPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    async function loadTransactions() {
      try {
        const response = await fetch("/api/member/transaksi", {
          signal: controller.signal,
        });
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || "Gagal memuat riwayat transaksi.");
        }
        setTransactions(result.data as Transaction[]);
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Gagal memuat riwayat transaksi.",
          );
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadTransactions();
    return () => controller.abort();
  }, []);

  function openTransaction(id: string) {
    router.push(`/member/riwayat/${encodeURIComponent(id)}`);
  }

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

          <div className="mt-[24px] overflow-x-auto rounded-[8px] border border-[#ededeb] bg-white">
            <table className="w-full min-w-[720px] border-collapse text-left">
              <thead>
                <tr className="h-[52px] border-b border-[#ededeb] text-[13px] font-bold">
                  <th className="px-[16px]">Tanggal</th>
                  <th className="px-[16px]">Layanan</th>
                  <th className="px-[16px]">Total</th>
                  <th className="px-[16px]">Diskon</th>
                  <th className="px-[16px]">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr
                    key={transaction.TransaksiID}
                    role="link"
                    tabIndex={0}
                    onClick={() => openTransaction(transaction.TransaksiID)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        openTransaction(transaction.TransaksiID);
                      }
                    }}
                    className="h-[56px] cursor-pointer border-b border-[#ededeb] text-[13px] last:border-b-0 hover:bg-[#fafafa] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#d5aa21]"
                  >
                    <td className="px-[16px] py-[18px] text-[#6b6b66]">
                      {formatDate(transaction.Tanggal)}
                    </td>
                    <td className="px-[16px] py-[18px]">
                      {transaction.layanan}
                    </td>
                    <td className="px-[16px] py-[18px]">
                      {formatRupiah(transaction.TotalTransaksi)}
                    </td>
                    <td className="px-[16px] py-[18px] text-[#6b6b66]">
                      {formatRupiah(transaction.diskon)}
                    </td>
                    <td className="px-[16px] py-[18px]">
                      <span className="rounded-full bg-[#d7f3e5] px-[14px] py-[5px] font-bold text-[#18794e]">
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {!loading && transactions.length === 0 && !error && (
                  <tr>
                    <td
                      colSpan={5}
                      className="h-[80px] text-center text-[15px] text-[#6b6b66]"
                    >
                      Belum ada transaksi
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
