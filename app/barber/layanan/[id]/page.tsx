"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "../../../../components/Sidebar";
import Topbar from "../../../../components/Topbar";

type ConfirmedService = {
  namaLayanan: string;
  tanggalKunjungan: string;
  status: string;
  catatan: string | null;
};

type DetailData = {
  member: {
    MemberID: string;
    NamaMember: string;
    StatusMembership: string;
  };
  layanan: ConfirmedService[];
  riwayatKunjungan: {
    tanggal: string;
    TransaksiID: string;
    layanan: string;
  }[];
};

function formatTanggal(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return `${String(date.getUTCDate()).padStart(2, "0")}/${String(date.getUTCMonth() + 1).padStart(2, "0")}/${date.getUTCFullYear()}`;
}

function DetailMemberContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;
  const [detail, setDetail] = useState<DetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    async function loadDetail() {
      try {
        const response = await fetch(
          `/api/barber/layanan/${encodeURIComponent(id)}`,
          { signal: controller.signal },
        );
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || "Gagal memuat detail member.");
        }
        setDetail(result.data as DetailData);
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Gagal memuat detail member.",
          );
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadDetail();
    return () => controller.abort();
  }, [id]);

  async function handleStart() {
    if (!detail || starting) return;
    const status = detail.layanan[0]?.status;
    if (status === "Selesai") return;
    setError("");

    if (status === "Menunggu") {
      setStarting(true);
      try {
        const response = await fetch(
          `/api/barber/layanan/${encodeURIComponent(id)}/mulai`,
          { method: "PATCH" },
        );
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || "Gagal memulai layanan.");
        }
      } catch (startError) {
        setError(
          startError instanceof Error
            ? startError.message
            : "Gagal memulai layanan.",
        );
        setStarting(false);
        return;
      }
      setStarting(false);
    }

    router.push(`/barber/layanan/${encodeURIComponent(id)}/kerjakan`);
  }

  const status = detail?.layanan[0]?.status;

  return (
    <div className="min-h-screen bg-[#f2f2f0] font-sans text-[#252525]">
      <Sidebar role="barber" />
      <Topbar title="Detail Member" role="barber" />
      <main className="min-h-screen pt-[76px] md:ml-[240px]">
        <div className="mx-auto max-w-[1200px] px-5 py-[28px] md:px-[28px]">
          {loading && <p className="text-[14px] text-[#777]">Memuat...</p>}
          {error && (
            <p role="alert" className="mb-4 text-[13px] text-red-600">
              {error}
            </p>
          )}

          {detail && (
            <>
              <section className="rounded-[8px] border border-[#d9d9d9] bg-white px-[20px] pb-[20px] pt-[18px]">
                <h1 className="text-[16px] font-bold">Data Member</h1>
                <dl className="mt-4 grid gap-3 text-[14px] sm:grid-cols-3">
                  <div>
                    <dt className="text-[#777]">ID Member</dt>
                    <dd className="mt-1 font-bold">{detail.member.MemberID}</dd>
                  </div>
                  <div>
                    <dt className="text-[#777]">Nama Member</dt>
                    <dd className="mt-1 font-bold">{detail.member.NamaMember}</dd>
                  </div>
                  <div>
                    <dt className="text-[#777]">Status Membership</dt>
                    <dd className="mt-1 font-bold">
                      {detail.member.StatusMembership}
                    </dd>
                  </div>
                </dl>
              </section>

              <section className="mt-[18px] rounded-[8px] border border-[#d9d9d9] bg-white px-[20px] pb-[20px] pt-[18px]">
                <h2 className="text-[16px] font-bold">
                  Layanan yang Dikonfirmasi
                </h2>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[600px] border-collapse text-left text-[13px]">
                    <thead>
                      <tr className="h-[44px] border-b border-[#ececec] font-bold">
                        <th className="px-3">Layanan Dipilih</th>
                        <th className="px-3">Tanggal Kunjungan</th>
                        <th className="px-3">Status Layanan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.layanan.map((service, index) => (
                        <tr
                          key={`${service.namaLayanan}-${index}`}
                          className="h-[48px] border-b border-[#ececec] last:border-0"
                        >
                          <td className="px-3">{service.namaLayanan}</td>
                          <td className="px-3">
                            {formatTanggal(service.tanggalKunjungan)}
                          </td>
                          <td className="px-3">{service.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="mt-[18px] rounded-[8px] border border-[#d9d9d9] bg-white px-[20px] pb-[20px] pt-[18px]">
                <h2 className="text-[16px] font-bold">
                  Riwayat Kunjungan dan Layanan
                </h2>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[550px] border-collapse text-left text-[13px]">
                    <thead>
                      <tr className="h-[44px] border-b border-[#ececec] font-bold">
                        <th className="px-3">Tanggal</th>
                        <th className="px-3">ID Transaksi</th>
                        <th className="px-3">Layanan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.riwayatKunjungan.map((visit) => (
                        <tr
                          key={visit.TransaksiID}
                          className="h-[48px] border-b border-[#ececec] last:border-0"
                        >
                          <td className="px-3">{formatTanggal(visit.tanggal)}</td>
                          <td className="px-3">{visit.TransaksiID}</td>
                          <td className="px-3">{visit.layanan}</td>
                        </tr>
                      ))}
                      {detail.riwayatKunjungan.length === 0 && (
                        <tr>
                          <td
                            colSpan={3}
                            className="px-3 py-5 text-center text-[#777]"
                          >
                            Belum ada riwayat kunjungan
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              <div className="mt-[18px] flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => void handleStart()}
                  disabled={status === "Selesai" || starting}
                  className={`min-h-[42px] rounded-[6px] px-[20px] text-[13px] font-bold text-white ${
                    status === "Selesai" || starting
                      ? "cursor-not-allowed bg-[#999]"
                      : "bg-[#171717] hover:bg-[#333]"
                  }`}
                >
                  {starting ? "Memulai..." : "Kerjakan Layanan"}
                </button>
                {status === "Selesai" && (
                  <span className="text-[13px] text-[#777]">
                    Layanan sudah selesai
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => router.push("/barber/layanan")}
                  className="min-h-[42px] rounded-[6px] border border-[#c9c9c9] bg-white px-[20px] text-[13px] font-bold hover:bg-[#f5f5f5]"
                >
                  Kembali ke Daftar Layanan
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default function DetailMemberPage() {
  return (
    <Suspense fallback={<p className="p-6 text-[#777]">Memuat...</p>}>
      <DetailMemberContent />
    </Suspense>
  );
}
