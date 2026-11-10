"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../../components/Sidebar";
import Topbar from "../../../components/Topbar";

type ServiceRow = {
  TransaksiID: string;
  MemberID: string;
  NamaMember: string;
  layanan: string;
  TanggalTransaksi: string;
  status: string;
};

function formatTanggal(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return `${String(date.getUTCDate()).padStart(2, "0")}/${String(date.getUTCMonth() + 1).padStart(2, "0")}/${date.getUTCFullYear()}`;
}

const cardClass =
  "rounded-[8px] border border-[#d9d9d9] bg-white px-[20px] pb-[22px] pt-[18px]";

export default function BarberLayananPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<ServiceRow[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");

  async function loadServices(search: string, signal?: AbortSignal) {
    const response = await fetch(
      `/api/barber/layanan?q=${encodeURIComponent(search)}`,
      { signal },
    );
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "Gagal memuat daftar layanan.");
    }
    setRows(result.data as ServiceRow[]);
    setSelectedId("");
  }

  useEffect(() => {
    const controller = new AbortController();
    async function initialLoad() {
      try {
        await loadServices("", controller.signal);
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Gagal memuat daftar layanan.",
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
      await loadServices(query.trim());
    } catch (searchError) {
      setError(
        searchError instanceof Error
          ? searchError.message
          : "Gagal mencari layanan.",
      );
    } finally {
      setSearching(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f2f2f0] font-sans text-[#252525]">
      <Sidebar role="barber" />
      <Topbar title="Daftar Layanan" role="barber" />
      <main className="min-h-screen pt-[76px] md:ml-[240px]">
        <div className="mx-auto max-w-[1200px] px-5 py-[28px] md:px-[28px]">
          <section className={cardClass}>
            <h1 className="text-[16px] font-bold">
              Layanan Dikonfirmasi Admin
            </h1>
            <form
              onSubmit={handleSearch}
              className="mt-[16px] flex flex-col gap-[12px] sm:flex-row"
            >
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Cari ID member atau nama member"
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
            <h2 className="text-[16px] font-bold">
              Layanan Dikonfirmasi Admin
            </h2>
            <div className="mt-[16px] overflow-x-auto rounded-[8px] border border-[#ececec]">
              <table className="w-full min-w-[900px] border-collapse text-left">
                <thead>
                  <tr className="h-[48px] border-b border-[#ececec] text-[13px] font-bold">
                    <th className="px-4">ID Member</th>
                    <th className="px-4">Nama Member</th>
                    <th className="px-4">Layanan</th>
                    <th className="px-4">Tanggal Kunjungan</th>
                    <th className="px-4">Status Layanan</th>
                    <th className="px-4">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center">
                        Memuat...
                      </td>
                    </tr>
                  ) : rows.length ? (
                    rows.map((row) => (
                      <tr
                        key={row.TransaksiID}
                        onClick={() => setSelectedId(row.TransaksiID)}
                        className={`h-[56px] cursor-pointer border-b border-[#ececec] text-[13px] last:border-0 hover:bg-[#fafafa] ${
                          selectedId === row.TransaksiID ? "bg-[#fff8e6]" : ""
                        }`}
                      >
                        <td className="px-4">{row.MemberID}</td>
                        <td className="px-4">{row.NamaMember}</td>
                        <td className="px-4">{row.layanan}</td>
                        <td className="px-4">
                          {formatTanggal(row.TanggalTransaksi)}
                        </td>
                        <td className="px-4">{row.status}</td>
                        <td className="px-4">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              setSelectedId(row.TransaksiID);
                              router.push(
                                `/barber/layanan/${encodeURIComponent(row.TransaksiID)}`,
                              );
                            }}
                            className="rounded-[6px] bg-[#171717] px-[18px] py-[8px] text-[13px] font-bold text-white hover:bg-[#333]"
                          >
                            Pilih
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-8 text-center text-[14px] text-[#777]"
                      >
                        Belum ada layanan yang dikonfirmasi
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="mt-[18px] flex flex-wrap gap-[12px]">
              <button
                type="button"
                onClick={() => {
                  if (selectedId) {
                    router.push(
                      `/barber/layanan/${encodeURIComponent(selectedId)}`,
                    );
                  }
                }}
                disabled={!selectedId}
                aria-disabled={!selectedId}
                className={`min-h-[42px] rounded-[6px] px-[20px] text-[13px] font-bold text-white ${
                  selectedId
                    ? "bg-[#171717] hover:bg-[#333]"
                    : "cursor-not-allowed bg-[#999]"
                }`}
              >
                Lihat Detail Member
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
