"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "../../../components/Sidebar";
import StatCard from "../../../components/StatCard";
import Topbar from "../../../components/Topbar";

type MemberData = {
  MemberID: string;
  NamaMember: string;
  StatusMembership: string;
  saldoPoin: number;
  MasaBerlaku: string | null;
  TanggalDaftar: string | null;
};

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
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${day} ${monthNames[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

function Coin() {
  return (
    <div className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-full border-[4px] border-[#d5aa21] bg-[#f7c948] text-[18px] text-white">
      P
    </div>
  );
}

export default function MemberDashboardPage() {
  const [member, setMember] = useState<MemberData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    async function loadMember() {
      try {
        const response = await fetch("/api/member/me", {
          signal: controller.signal,
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Gagal memuat data member.");
        setMember(result.data as MemberData);
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Gagal memuat data member.",
          );
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadMember();
    return () => controller.abort();
  }, []);

  const masaBerlaku = member
    ? `${formatDate(member.TanggalDaftar)} - ${formatDate(member.MasaBerlaku)}`
    : "Memuat...";

  return (
    <div className="min-h-screen bg-[#e8e8e5] font-sans text-[#1a1a1a]">
      <Sidebar role="member" />
      <Topbar />

      <main className="min-h-screen pt-[76px] md:ml-[240px]">
        <div className="mx-auto max-w-[1200px] px-5 py-[24px] md:px-[36px] md:py-[26px]">
          <p className="text-[18px] text-[#6b6b66]">
            {loading
              ? "Memuat..."
              : `Selamat datang kembali, ${member?.NamaMember ?? ""}!`}
          </p>
          {error && (
            <p role="alert" className="mt-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="mt-[28px] grid gap-[20px] md:grid-cols-2">
            <StatCard
              title="Status Membership"
              value={loading ? "Memuat..." : member?.StatusMembership ?? "—"}
              status
              description={`Masa berlaku\n${masaBerlaku}`}
            />
            <StatCard
              title="Jumlah Poin"
              value={loading ? "Memuat..." : `${member?.saldoPoin ?? 0} Poin`}
              points
            />
          </div>

          <section className="mt-[58px]">
            <h2 className="text-[20px] font-bold">Notifikasi</h2>
            <div className="mt-[16px] flex min-h-[83px] items-center gap-[16px] rounded-[8px] border border-[#e3e3e0] bg-white px-[24px] py-[16px]">
              <Coin />
              <div>
                <p className="text-[18px] font-bold">
                  Poin Anda akan kadaluwarsa dalam 30 hari
                </p>
                <p className="mt-[3px] text-[16px] text-[#6b6b66]">
                  Gunakan poin untuk mendapatkan potongan harga
                </p>
              </div>
            </div>
          </section>

          <section className="mt-[28px]">
            <h2 className="text-[20px] font-bold">Mulai Layanan</h2>
            <div className="mt-[16px] grid gap-[20px] md:grid-cols-2">
              <Link
                href="/member/layanan"
                className="flex min-h-[170px] items-center gap-[22px] rounded-[8px] border border-[#e3e3e0] bg-white px-[24px]"
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="h-[58px] w-[58px] fill-none stroke-black"
                >
                  <path
                    d="M5 5l14 14M19 5L5 19"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <circle cx="6" cy="6" r="4" />
                  <circle cx="18" cy="18" r="4" />
                </svg>
                <div>
                  <h3 className="text-[18px] font-bold">Pilih Layanan</h3>
                  <p className="mt-[2px] text-[16px] text-[#6b6b66]">
                    Lihat dan pilih layanan
                  </p>
                </div>
              </Link>

              <Link
                href="/member/riwayat"
                className="flex min-h-[170px] items-center gap-[22px] rounded-[8px] border border-[#e3e3e0] bg-white px-[24px]"
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="h-[58px] w-[58px] fill-none stroke-black"
                >
                  <path
                    d="M4 12a8 8 0 1 0 3-6.2L4 8"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M4 3v5h5M12 7v5l3 2"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div>
                  <h3 className="text-[18px] font-bold">Riwayat Transaksi</h3>
                  <p className="mt-[2px] text-[16px] text-[#6b6b66]">
                    Lihat riwayat kunjungan dan pembayaran
                  </p>
                </div>
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
