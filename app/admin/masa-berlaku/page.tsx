"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import Sidebar from "../../../components/Sidebar";
import Topbar from "../../../components/Topbar";

type Member = {
  MemberID: string;
  NamaMember: string;
  StatusMembership: string;
  MasaBerlaku: string | null;
  terakhirBayar: string | null;
  segeraBerakhir: boolean;
};

type ApiResult<T> = { data: T } | { error: string };

async function requestApi<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  let result: ApiResult<T>;
  try {
    result = (await response.json()) as ApiResult<T>;
  } catch {
    throw new Error("Respons server tidak valid.");
  }
  if (!response.ok) {
    throw new Error("error" in result ? result.error : "Permintaan gagal.");
  }
  if (!("data" in result)) throw new Error("Respons server tidak valid.");
  return result.data;
}

function formatDate(value: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return `${String(date.getUTCDate()).padStart(2, "0")}/${String(date.getUTCMonth() + 1).padStart(2, "0")}/${date.getUTCFullYear()}`;
}

function dateInputValue(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

const statuses = ["Aktif", "Menunggu", "Ditolak", "Kadaluarsa"];
const inputClass =
  "h-[42px] rounded-[6px] border border-[#c9c9c9] bg-white px-[12px] text-[14px] outline-none";

export default function AdminMasaBerlakuPage() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [selected, setSelected] = useState<Member | null>(null);
  const [newDate, setNewDate] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadMembers = useCallback(async (search: string, status: string) => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (status) params.set("status", status);

    try {
      const data = await requestApi<Member[]>(
        `/api/admin/masa-berlaku?${params.toString()}`,
      );
      setMembers(data);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Gagal memuat data masa berlaku.",
      );
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (statusFilter) params.set("status", statusFilter);

    requestApi<Member[]>(`/api/admin/masa-berlaku?${params.toString()}`)
      .then((data) => {
        if (active) {
          setMembers(data);
          setError("");
        }
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Gagal memuat data masa berlaku.",
          );
          setMembers([]);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [query, statusFilter]);

  function selectMember(member: Member) {
    setSelected(member);
    setNewDate(dateInputValue(member.MasaBerlaku));
    setNewStatus(member.StatusMembership);
    setError("");
    setSuccess("");
  }

  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    if (!newDate || !newStatus) {
      setError("Masa berlaku dan status wajib diisi.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await requestApi<Member>(
        `/api/admin/masa-berlaku/${encodeURIComponent(selected.MemberID)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            masaBerlaku: newDate,
            status: newStatus,
          }),
        },
      );
      await loadMembers(query, statusFilter);
      setSelected({
        ...selected,
        MasaBerlaku: newDate,
        StatusMembership: newStatus,
      });
      setSuccess("Masa berlaku dan status berhasil diperbarui.");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Gagal memperbarui masa berlaku.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f2f2f0] font-sans text-[#252525]">
      <Sidebar role="admin" />
      <Topbar title="Masa Berlaku" role="admin" />

      <main className="min-h-screen pt-[76px] md:ml-[240px]">
        <div className="mx-auto max-w-[1200px] px-5 py-[28px] md:px-[28px]">
          <section className="rounded-[8px] border border-[#d9d9d9] bg-white px-[20px] pb-[20px] pt-[18px]">
            <div className="flex flex-col gap-[12px] sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-[16px] font-bold">Masa Berlaku Member</h1>
              <button
                type="button"
                className="h-[38px] rounded-[6px] bg-[#171717] px-[18px] text-[13px] font-bold text-white"
              >
                Kirim Notifikasi
              </button>
            </div>

            <div className="mt-[16px] flex flex-col gap-[12px] sm:flex-row">
              <label className="flex-1">
                <span className="sr-only">Cari member</span>
                <input
                  type="search"
                  value={query}
                  onChange={(event) => {
                    setLoading(true);
                    setError("");
                    setQuery(event.target.value);
                  }}
                  placeholder="Cari ID member, nama, atau nomor HP"
                  className={`${inputClass} w-full`}
                />
              </label>
              <label>
                <span className="sr-only">Filter status</span>
                <select
                  value={statusFilter}
                  onChange={(event) => {
                    setLoading(true);
                    setError("");
                    setStatusFilter(event.target.value);
                  }}
                  className={inputClass}
                >
                  <option value="">Semua Status</option>
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
            </div>
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

            <div className="mt-[16px] overflow-x-auto rounded-[8px] border border-[#e9e9e9]">
              <table className="w-full min-w-[780px] border-collapse text-left text-[12px]">
                <thead>
                  <tr className="h-[44px] border-b border-[#e9e9e9]">
                    <th className="px-[16px] font-bold">ID Member</th>
                    <th className="px-[16px] font-bold">Nama Member</th>
                    <th className="px-[16px] font-bold">Status</th>
                    <th className="px-[16px] font-bold">Pembayaran</th>
                    <th className="px-[16px] font-bold">Masa Berlaku</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="h-[100px] text-center text-[#777777]">
                        Memuat...
                      </td>
                    </tr>
                  ) : members.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="h-[100px] text-center text-[#777777]">
                        Tidak ada data member.
                      </td>
                    </tr>
                  ) : (
                    members.map((member) => (
                      <tr
                        key={member.MemberID}
                        onClick={() => selectMember(member)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            selectMember(member);
                          }
                        }}
                        tabIndex={0}
                        className={`h-[54px] cursor-pointer border-b border-[#ededed] last:border-b-0 hover:bg-[#f7f7f7] ${
                          selected?.MemberID === member.MemberID
                            ? "bg-[#f2f2f0]"
                            : ""
                        }`}
                      >
                        <td className="px-[16px]">{member.MemberID}</td>
                        <td className="px-[16px]">{member.NamaMember}</td>
                        <td className="px-[16px]">{member.StatusMembership}</td>
                        <td className="px-[16px]">{formatDate(member.terakhirBayar)}</td>
                        <td className="px-[16px]">
                          {member.segeraBerakhir ? (
                            <span className="rounded-full bg-[#fff0b8] px-[12px] py-[6px] text-[#7a5b00]">
                              Segera Berakhir
                            </span>
                          ) : (
                            formatDate(member.MasaBerlaku)
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-[18px] rounded-[8px] border border-[#d9d9d9] bg-white px-[20px] pb-[20px] pt-[18px]">
            <h2 className="text-[16px] font-bold">Verifikasi &amp; Pembaruan</h2>
            {selected ? (
              <>
                <div className="mt-[16px] rounded-[6px] border border-[#ececec] px-[14px] py-[12px] text-[14px]">
                  <span className="text-[#777777]">Member Terpilih</span>
                  <p className="mt-[4px] font-bold">
                    {selected.MemberID} — {selected.NamaMember}
                  </p>
                </div>
                <form
                  onSubmit={handleUpdate}
                  className="mt-[16px] grid gap-[16px] md:grid-cols-2"
                >
                  <label className="text-[13px] font-bold text-[#333333]">
                    Masa Berlaku Sampai
                    <input
                      type="date"
                      value={newDate}
                      onChange={(event) => setNewDate(event.target.value)}
                      className={`${inputClass} mt-[8px] w-full`}
                      required
                    />
                  </label>
                  <label className="text-[13px] font-bold text-[#333333]">
                    Status Membership
                    <select
                      value={newStatus}
                      onChange={(event) => setNewStatus(event.target.value)}
                      className={`${inputClass} mt-[8px] w-full`}
                      required
                    >
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    type="submit"
                    disabled={saving}
                    className="h-[42px] w-fit rounded-[6px] bg-[#171717] px-[24px] text-[14px] font-bold text-white disabled:opacity-50 md:col-span-2"
                  >
                    {saving
                      ? "Memproses..."
                      : "Perbarui Masa Berlaku & Status"}
                  </button>
                </form>
              </>
            ) : (
              <p className="mt-[16px] text-[14px] text-[#777777]">
                Pilih member pada tabel untuk memperbarui data.
              </p>
            )}
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
