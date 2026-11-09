"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import Sidebar from "../../../components/Sidebar";
import Topbar from "../../../components/Topbar";

type Application = {
  ID: string;
  nama: string;
  nomorHP: string | null;
  status: string;
};

type ApiResult<T> = { data: T } | { error: string };

async function requestApi<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const result = (await response.json()) as ApiResult<T>;
  if (!response.ok) {
    throw Object.assign(new Error("error" in result ? result.error : "Permintaan gagal."), {
      status: response.status,
    });
  }
  if (!("data" in result)) throw new Error("Respons server tidak valid.");
  return result.data;
}

function dateInputValue(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export default function AdminVerifikasiPage() {
  const [searchId, setSearchId] = useState("");
  const [application, setApplication] = useState<Application | null>(null);
  const [membershipStatus, setMembershipStatus] = useState("Aktif");
  const [masaBerlaku, setMasaBerlaku] = useState("");
  const [catatan, setCatatan] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const date = new Date();
      date.setMonth(date.getMonth() + 12);
      setMasaBerlaku(dateInputValue(date));
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setApplication(null);
    setError("");
    setSuccess("");
    if (!searchId.trim()) {
      setError("Masukkan ID pengajuan.");
      return;
    }

    setLoading(true);
    try {
      const data = await requestApi<Application>(
        `/api/admin/verifikasi/${encodeURIComponent(searchId.trim())}`,
      );
      setApplication(data);
    } catch (requestError) {
      const status =
        typeof requestError === "object" &&
        requestError !== null &&
        "status" in requestError
          ? requestError.status
          : undefined;
      setError(status === 404 ? "ID tidak ditemukan" : "Gagal memuat pengajuan.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDecision(valid: boolean) {
    if (!application) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const data = await requestApi<{
        MemberID: string;
        StatusMembership: string;
      }>(`/api/admin/verifikasi/${encodeURIComponent(application.ID)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          valid,
          ...(valid && masaBerlaku ? { masaBerlaku } : {}),
          ...(catatan ? { catatan } : {}),
        }),
      });
      setApplication({ ...application, status: data.StatusMembership });
      setSuccess(
        valid ? "Membership berhasil diaktifkan." : "Pengajuan berhasil ditolak.",
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Gagal memproses pengajuan.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f2f2f0] font-sans text-[#252525]">
      <Sidebar role="admin" />
      <Topbar title="Verifikasi Data" role="admin" />

      <main className="min-h-screen pt-[76px] md:ml-[240px]">
        <div className="mx-auto max-w-[1200px] px-5 py-[28px] md:px-[28px]">
          <section className="rounded-[8px] border border-[#d9d9d9] bg-white px-[20px] pb-[20px] pt-[18px]">
            <h1 className="text-[16px] font-bold">Cek ID Pengajuan</h1>
            <form
              onSubmit={handleSearch}
              className="mt-[16px] flex flex-col gap-[12px] sm:flex-row"
            >
              <input
                type="text"
                value={searchId}
                onChange={(event) => setSearchId(event.target.value)}
                placeholder="ID atau nomor pendaftaran"
                className="h-[42px] flex-1 rounded-[6px] border border-[#c9c9c9] px-[12px] text-[14px] outline-none placeholder:text-[#777777]"
              />
              <button
                type="submit"
                disabled={loading}
                className="h-[42px] rounded-[6px] bg-[#171717] px-[24px] text-[14px] font-bold text-white disabled:opacity-50"
              >
                {loading ? "Memuat..." : "Cari"}
              </button>
            </form>
            {error && (
              <p role="alert" className="mt-[12px] text-[13px] text-red-600">
                {error}
              </p>
            )}
            {success && (
              <p role="status" className="mt-[12px] text-[13px] text-green-700">
                {success}
              </p>
            )}
          </section>

          <section className="mt-[18px] rounded-[8px] border border-[#d9d9d9] bg-white px-[20px] py-[18px]">
            <h2 className="text-[16px] font-bold">Data Pengajuan</h2>
            {loading ? (
              <p className="mt-[16px] text-[14px] text-[#777777]">Memuat...</p>
            ) : application ? (
              <div className="mt-[16px] grid gap-[12px] text-[14px] md:grid-cols-2">
                <div className="flex items-center justify-between rounded-[6px] border border-[#ececec] px-[14px] py-[12px]">
                  <span className="text-[#777777]">ID / Nomor Pendaftaran</span>
                  <span className="font-bold">{application.ID}</span>
                </div>
                <div className="flex items-center justify-between rounded-[6px] border border-[#ececec] px-[14px] py-[12px]">
                  <span className="text-[#777777]">Nama Member</span>
                  <span className="font-bold">{application.nama}</span>
                </div>
                <div className="flex items-center justify-between rounded-[6px] border border-[#ececec] px-[14px] py-[12px]">
                  <span className="text-[#777777]">Nomor HP</span>
                  <span className="font-bold">{application.nomorHP ?? "-"}</span>
                </div>
                <div className="flex items-center justify-between rounded-[6px] border border-[#ececec] px-[14px] py-[12px]">
                  <span className="text-[#777777]">Status Pengajuan</span>
                  <span className="rounded-full bg-[#fff0b8] px-[12px] py-[6px] text-[12px] font-bold text-[#7a5b00]">
                    {application.status}
                  </span>
                </div>
              </div>
            ) : (
              <p className="mt-[16px] text-[14px] text-[#777777]">
                Masukkan ID untuk melihat data pengajuan.
              </p>
            )}
          </section>

          <section className="mt-[18px] rounded-[8px] border border-[#d9d9d9] bg-white px-[20px] pb-[20px] pt-[18px]">
            <h2 className="text-[16px] font-bold">Keputusan Verifikasi</h2>
            <fieldset className="mt-[16px] text-[14px]" disabled={!application || saving}>
              <legend className="font-bold text-[#333333]">Data valid?</legend>
              <div className="mt-[10px] flex flex-col gap-[10px] sm:flex-row">
                <label className="flex items-center gap-[8px]">
                  <input
                    type="radio"
                    name="data-valid"
                    checked={membershipStatus === "Aktif"}
                    onChange={() => setMembershipStatus("Aktif")}
                  />
                  <span>Ya, data valid</span>
                </label>
                <label className="flex items-center gap-[8px]">
                  <input
                    type="radio"
                    name="data-valid"
                    checked={membershipStatus === "Ditolak"}
                    onChange={() => setMembershipStatus("Ditolak")}
                  />
                  <span>Tidak, data tidak valid</span>
                </label>
              </div>
            </fieldset>

            <div className="mt-[18px] grid gap-[16px] md:grid-cols-2">
              <label className="text-[13px] font-bold text-[#333333]">
                Status Membership
                <select
                  value={membershipStatus}
                  onChange={(event) => setMembershipStatus(event.target.value)}
                  disabled={!application || saving}
                  className="mt-[8px] h-[42px] w-full rounded-[6px] border border-[#c9c9c9] bg-white px-[12px] text-[14px] font-normal outline-none disabled:opacity-50"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Ditolak">Ditolak</option>
                </select>
              </label>
              <label className="text-[13px] font-bold text-[#333333]">
                Masa Berlaku Sampai
                <input
                  type="date"
                  value={masaBerlaku}
                  onChange={(event) => setMasaBerlaku(event.target.value)}
                  disabled={!application || saving || membershipStatus !== "Aktif"}
                  className="mt-[8px] h-[42px] w-full rounded-[6px] border border-[#c9c9c9] px-[12px] text-[14px] font-normal outline-none disabled:opacity-50"
                />
              </label>
            </div>

            <label className="mt-[16px] block text-[13px] font-bold text-[#333333]">
              Catatan Pemeriksaan
              <textarea
                rows={4}
                value={catatan}
                onChange={(event) => setCatatan(event.target.value)}
                maxLength={200}
                disabled={!application || saving}
                placeholder="Tulis catatan pemeriksaan (opsional)"
                className="mt-[8px] w-full resize-none rounded-[6px] border border-[#c9c9c9] px-[12px] py-[10px] text-[14px] font-normal outline-none placeholder:text-[#777777] disabled:opacity-50"
              />
            </label>

            <div className="mt-[20px] flex flex-col gap-[12px] sm:flex-row">
              <button
                type="button"
                onClick={() => void handleDecision(true)}
                disabled={!application || saving || application.status !== "Menunggu"}
                className="h-[42px] rounded-[6px] bg-[#171717] px-[24px] text-[14px] font-bold text-white disabled:opacity-50"
              >
                {saving && membershipStatus === "Aktif"
                  ? "Memproses..."
                  : "Aktifkan Membership"}
              </button>
              <button
                type="button"
                onClick={() => void handleDecision(false)}
                disabled={!application || saving || application.status !== "Menunggu"}
                className="h-[42px] rounded-[6px] border border-[#252525] px-[24px] text-[14px] font-bold text-[#252525] disabled:opacity-50"
              >
                {saving && membershipStatus === "Ditolak"
                  ? "Memproses..."
                  : "Tolak / Minta Perbaikan"}
              </button>
            </div>
          </section>

          <Link
            href="/admin/dashboard"
            className="mt-[18px] inline-flex h-[34px] items-center justify-center rounded-[6px] border border-[#252525] px-[18px] text-[14px] font-bold text-[#252525]"
          >
            Kembali ke Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
