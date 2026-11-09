"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import Sidebar from "../../../components/Sidebar";
import Topbar from "../../../components/Topbar";

type MemberRow = {
  MemberID: string;
  NamaMember: string;
  NomorHP: string | null;
  StatusMembership: string;
  MasaBerlaku: string | null;
  saldoPoin: number;
};

type MemberDetail = {
  MemberID: string;
  NamaMember: string;
  StatusMembership: string;
  Member_Info: {
    NomorHP: string | null;
    MasaBerlaku: string | null;
  } | null;
  saldoPoin: number;
  transaksi: {
    tanggal: string;
    namaLayanan: string[];
    total: number;
  }[];
};

type Panel = "detail" | "edit" | "add" | null;

async function fetchData<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  let result: unknown;
  try {
    result = await response.json();
  } catch {
    throw new Error("Respons server tidak valid.");
  }

  if (!response.ok) {
    const message =
      typeof result === "object" &&
      result !== null &&
      "error" in result &&
      typeof result.error === "string"
        ? result.error
        : "Permintaan gagal.";
    throw new Error(message);
  }
  if (
    typeof result !== "object" ||
    result === null ||
    !("data" in result)
  ) {
    throw new Error("Respons server tidak valid.");
  }
  return result.data as T;
}

function formatRupiah(value: number) {
  const rounded = Math.round(value);
  const sign = rounded < 0 ? "-" : "";
  const digits = String(Math.abs(rounded));
  const groups: string[] = [];
  for (let end = digits.length; end > 0; end -= 3) {
    groups.unshift(digits.slice(Math.max(0, end - 3), end));
  }
  return `Rp ${sign}${groups.join(".")}`;
}

function formatDate(value: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${date.getUTCFullYear()}`;
}

function dateInputValue(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

const statusOptions = ["Aktif", "Menunggu", "Ditolak", "Kadaluarsa"];
const inputClass =
  "mt-[8px] h-[42px] w-full rounded-[6px] border border-[#c9c9c9] bg-white px-[12px] text-[14px] font-normal outline-none";
const actionButtonClass =
  "h-[40px] rounded-[6px] border border-[#252525] px-[18px] text-[14px] font-bold text-[#252525] disabled:cursor-not-allowed disabled:opacity-50";

export default function AdminMemberPage() {
  const [query, setQuery] = useState("");
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [selectedId, setSelectedId] = useState("");
  const [panel, setPanel] = useState<Panel>(null);
  const [detail, setDetail] = useState<MemberDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadMembers = useCallback(async (searchTerm: string) => {
    setListLoading(true);
    setError("");
    try {
      const data = await fetchData<MemberRow[]>(
        `/api/admin/member?q=${encodeURIComponent(searchTerm)}`,
      );
      setMembers(data);
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Gagal memuat member.",
      );
      setMembers([]);
    } finally {
      setListLoading(false);
    }
  }, []);

  const loadDetail = useCallback(async (id: string) => {
    setDetailLoading(true);
    setError("");
    try {
      const data = await fetchData<MemberDetail>(
        `/api/admin/member/${encodeURIComponent(id)}`,
      );
      setDetail(data);
      return data;
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Gagal memuat detail.",
      );
      setDetail(null);
      return null;
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetchData<MemberRow[]>("/api/admin/member?q=")
      .then((data) => {
        if (active) setMembers(data);
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Gagal memuat member.",
          );
          setMembers([]);
        }
      })
      .finally(() => {
        if (active) setListLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  function chooseMember(id: string) {
    setSelectedId(id);
    setPanel(null);
    setDetail(null);
    setError("");
    setSuccess("");
  }

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPanel(null);
    setDetail(null);
    setSelectedId("");
    setSuccess("");
    await loadMembers(query);
  }

  async function showDetail() {
    if (!selectedId) return;
    setPanel("detail");
    setDetail(null);
    await loadDetail(selectedId);
  }

  async function showEditForm() {
    if (!selectedId) return;
    setPanel("edit");
    if (!detail || detail.MemberID !== selectedId) {
      await loadDetail(selectedId);
    }
  }

  async function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActionLoading(true);
    setError("");
    setSuccess("");
    const values = new FormData(event.currentTarget);
    try {
      const data = await fetchData<{ MemberID: string }>("/api/admin/member", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          NamaMember: values.get("NamaMember"),
          NomorHP: values.get("NomorHP") || null,
        }),
      });
      setPanel(null);
      setSelectedId(data.MemberID);
      await loadMembers(query);
      setSuccess(`Member ${data.MemberID} berhasil ditambahkan.`);
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "Gagal menambah member.",
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedId) return;
    setActionLoading(true);
    setError("");
    setSuccess("");
    const values = new FormData(event.currentTarget);
    try {
      await fetchData<MemberDetail>(
        `/api/admin/member/${encodeURIComponent(selectedId)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            NamaMember: values.get("NamaMember"),
            NomorHP: values.get("NomorHP") || null,
            StatusMembership: values.get("StatusMembership"),
            MasaBerlaku: values.get("MasaBerlaku") || null,
          }),
        },
      );
      await loadMembers(query);
      const updatedDetail = await loadDetail(selectedId);
      setPanel(updatedDetail ? "detail" : null);
      setSuccess("Data member berhasil diperbarui.");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Gagal memperbarui member.",
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelete() {
    if (!selectedId || !window.confirm(`Hapus member ${selectedId}?`)) return;
    setActionLoading(true);
    setError("");
    setSuccess("");
    try {
      await fetchData<{ MemberID: string }>(
        `/api/admin/member/${encodeURIComponent(selectedId)}`,
        { method: "DELETE" },
      );
      const deletedId = selectedId;
      setPanel(null);
      setDetail(null);
      setSelectedId("");
      await loadMembers(query);
      setSuccess(`Member ${deletedId} berhasil dihapus.`);
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Gagal menghapus member.",
      );
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f2f2f0] font-sans text-[#252525]">
      <Sidebar role="admin" />
      <Topbar title="Daftar Member" role="admin" />

      <main className="min-h-screen pt-[76px] md:ml-[240px]">
        <div className="mx-auto max-w-[1200px] px-5 py-[28px] md:px-[28px]">
          <section className="rounded-[8px] border border-[#d9d9d9] bg-white px-[20px] py-[20px]">
            <form
              onSubmit={handleSearch}
              className="flex flex-col gap-[12px] rounded-[8px] border border-[#e9e9e9] p-[16px] sm:flex-row"
            >
              <label className="relative flex-1">
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="absolute left-[10px] top-1/2 h-[18px] w-[18px] -translate-y-1/2 fill-none stroke-[#777777]"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m16 16 4 4" />
                </svg>
                <span className="sr-only">Cari member</span>
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Cari ID member, nama, atau nomor HP"
                  className="h-[40px] w-full rounded-[6px] border border-[#c9c9c9] px-[38px] text-[14px] outline-none placeholder:text-[#777777]"
                />
              </label>
              <button
                type="submit"
                disabled={listLoading}
                className="h-[40px] rounded-[6px] bg-[#171717] px-[24px] text-[14px] font-bold text-white disabled:opacity-50"
              >
                Cari
              </button>
              <button
                type="button"
                onClick={() => {
                  setPanel("add");
                  setError("");
                  setSuccess("");
                }}
                className="h-[40px] rounded-[6px] border border-[#252525] px-[18px] text-[14px] font-bold text-[#252525]"
              >
                Tambah Member
              </button>
            </form>
          </section>

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

          <section className="mt-[18px] rounded-[8px] border border-[#d9d9d9] bg-white px-[20px] pb-[20px] pt-[18px]">
            <h2 className="text-[16px] font-bold">Daftar Member</h2>
            <div className="mt-[16px] overflow-x-auto rounded-[8px] border border-[#e9e9e9]">
              <table className="w-full min-w-[760px] border-collapse text-left text-[12px]">
                <thead>
                  <tr className="h-[44px] border-b border-[#e9e9e9]">
                    <th className="px-[16px] font-bold">ID Member</th>
                    <th className="px-[16px] font-bold">Nama Member</th>
                    <th className="px-[16px] font-bold">Nomor HP</th>
                    <th className="px-[16px] font-bold">Status</th>
                    <th className="px-[16px] font-bold">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {listLoading ? (
                    <tr>
                      <td colSpan={5} className="h-[142px] text-center text-[12px] text-[#777777]">
                        Memuat...
                      </td>
                    </tr>
                  ) : members.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="h-[142px] text-center text-[12px] text-[#777777]">
                        Tidak ada data member.
                      </td>
                    </tr>
                  ) : (
                    members.map((member) => (
                      <tr
                        key={member.MemberID}
                        onClick={() => chooseMember(member.MemberID)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            chooseMember(member.MemberID);
                          }
                        }}
                        tabIndex={0}
                        className={`h-[54px] cursor-pointer border-b border-[#ededed] last:border-b-0 hover:bg-[#f7f7f7] ${
                          selectedId === member.MemberID ? "bg-[#f2f2f0]" : ""
                        }`}
                      >
                        <td className="px-[16px]">{member.MemberID}</td>
                        <td className="px-[16px]">{member.NamaMember}</td>
                        <td className="px-[16px]">{member.NomorHP ?? "-"}</td>
                        <td className="px-[16px]">{member.StatusMembership}</td>
                        <td className="px-[16px]">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              chooseMember(member.MemberID);
                            }}
                            className="font-bold underline"
                          >
                            Pilih
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <p className="mt-[12px] text-[13px] text-[#777777]">
              Menampilkan {listLoading ? "..." : members.length} dari{" "}
              {listLoading ? "..." : members.length} data
            </p>

            <div className="mt-[16px] flex min-h-[68px] flex-col items-start justify-center gap-[12px] rounded-[8px] border border-[#e9e9e9] px-[16px] sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[13px] text-[#777777]">
                Pilih member pada tabel untuk melihat detail atau memperbarui data.
              </p>
              <div className="flex gap-[10px]">
                <button
                  type="button"
                  onClick={() => void showDetail()}
                  disabled={!selectedId || detailLoading}
                  className={actionButtonClass}
                >
                  Lihat Detail
                </button>
                <button
                  type="button"
                  onClick={() => void showEditForm()}
                  disabled={!selectedId || detailLoading}
                  className={actionButtonClass}
                >
                  Perbarui
                </button>
              </div>
            </div>
          </section>

          {panel === "add" && (
            <section className="mt-[18px] rounded-[8px] border border-[#d9d9d9] bg-white px-[20px] pb-[24px] pt-[18px]">
              <h2 className="text-[16px] font-bold">Tambah Member</h2>
              <form onSubmit={handleAdd} className="mt-[16px] grid gap-[16px] md:grid-cols-2">
                <label className="text-[13px] font-bold text-[#333333]">
                  Nama Member
                  <input name="NamaMember" maxLength={50} required className={inputClass} />
                </label>
                <label className="text-[13px] font-bold text-[#333333]">
                  Nomor HP
                  <input name="NomorHP" maxLength={15} className={inputClass} />
                </label>
                <div className="flex gap-[10px] md:col-span-2">
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="h-[42px] rounded-[6px] bg-[#171717] px-[24px] text-[14px] font-bold text-white disabled:opacity-50"
                  >
                    {actionLoading ? "Menyimpan..." : "Simpan"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPanel(null)}
                    className={actionButtonClass}
                  >
                    Batal
                  </button>
                </div>
              </form>
            </section>
          )}

          {(panel === "detail" || panel === "edit") && (
            <section className="mt-[18px] rounded-[8px] border border-[#d9d9d9] bg-white px-[20px] pb-[24px] pt-[18px]">
              <h2 className="text-[16px] font-bold">
                {panel === "detail" ? "Detail Member" : "Perbarui Member"}
              </h2>
              {detailLoading ? (
                <p className="mt-[16px] text-[14px] text-[#777777]">Memuat...</p>
              ) : !detail ? (
                <p className="mt-[16px] text-[14px] text-[#777777]">
                  Detail member tidak tersedia.
                </p>
              ) : panel === "detail" ? (
                <>
                  <dl className="mt-[16px] grid gap-[12px] text-[14px] md:grid-cols-2">
                    <div className="flex justify-between rounded-[6px] border border-[#ececec] px-[14px] py-[12px]">
                      <dt className="text-[#777777]">Nama Member</dt>
                      <dd className="font-bold">{detail.NamaMember}</dd>
                    </div>
                    <div className="flex justify-between rounded-[6px] border border-[#ececec] px-[14px] py-[12px]">
                      <dt className="text-[#777777]">Nomor HP</dt>
                      <dd className="font-bold">{detail.Member_Info?.NomorHP ?? "-"}</dd>
                    </div>
                    <div className="flex justify-between rounded-[6px] border border-[#ececec] px-[14px] py-[12px]">
                      <dt className="text-[#777777]">Status</dt>
                      <dd className="font-bold">{detail.StatusMembership}</dd>
                    </div>
                    <div className="flex justify-between rounded-[6px] border border-[#ececec] px-[14px] py-[12px]">
                      <dt className="text-[#777777]">Masa Berlaku</dt>
                      <dd className="font-bold">{formatDate(detail.Member_Info?.MasaBerlaku ?? null)}</dd>
                    </div>
                    <div className="flex justify-between rounded-[6px] border border-[#ececec] px-[14px] py-[12px]">
                      <dt className="text-[#777777]">Saldo Poin</dt>
                      <dd className="font-bold">{detail.saldoPoin}</dd>
                    </div>
                  </dl>
                  <h3 className="mt-[20px] text-[14px] font-bold">5 Transaksi Terakhir</h3>
                  {detail.transaksi.length ? (
                    <ul className="mt-[8px] divide-y divide-[#ececec] rounded-[6px] border border-[#ececec]">
                      {detail.transaksi.map((transaction, index) => (
                        <li
                          key={`${transaction.tanggal}-${index}`}
                          className="flex flex-col gap-[5px] px-[14px] py-[12px] text-[13px] sm:flex-row sm:items-center sm:justify-between"
                        >
                          <span>{formatDate(transaction.tanggal)}</span>
                          <span>{transaction.namaLayanan.join(", ") || "-"}</span>
                          <span className="font-bold">{formatRupiah(transaction.total)}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-[8px] text-[13px] text-[#777777]">
                      Belum ada transaksi.
                    </p>
                  )}
                  <div className="mt-[18px]">
                    <button
                      type="button"
                      onClick={() => void handleDelete()}
                      disabled={actionLoading}
                      className="h-[40px] rounded-[6px] border border-red-600 px-[18px] text-[14px] font-bold text-red-600 disabled:opacity-50"
                    >
                      {actionLoading ? "Memproses..." : "Hapus"}
                    </button>
                  </div>
                </>
              ) : (
                <form onSubmit={handleUpdate} className="mt-[16px] grid gap-[16px] md:grid-cols-2">
                  <label className="text-[13px] font-bold text-[#333333]">
                    Nama Member
                    <input
                      name="NamaMember"
                      maxLength={50}
                      required
                      defaultValue={detail.NamaMember}
                      className={inputClass}
                    />
                  </label>
                  <label className="text-[13px] font-bold text-[#333333]">
                    Nomor HP
                    <input
                      name="NomorHP"
                      maxLength={15}
                      defaultValue={detail.Member_Info?.NomorHP ?? ""}
                      className={inputClass}
                    />
                  </label>
                  <label className="text-[13px] font-bold text-[#333333]">
                    Status
                    <select
                      name="StatusMembership"
                      defaultValue={detail.StatusMembership}
                      className={inputClass}
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-[13px] font-bold text-[#333333]">
                    Masa Berlaku
                    <input
                      type="date"
                      name="MasaBerlaku"
                      defaultValue={dateInputValue(detail.Member_Info?.MasaBerlaku ?? null)}
                      className={inputClass}
                    />
                  </label>
                  <div className="flex gap-[10px] md:col-span-2">
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="h-[42px] rounded-[6px] bg-[#171717] px-[24px] text-[14px] font-bold text-white disabled:opacity-50"
                    >
                      {actionLoading ? "Menyimpan..." : "Simpan Perubahan"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPanel("detail")}
                      className={actionButtonClass}
                    >
                      Batal
                    </button>
                  </div>
                </form>
              )}
            </section>
          )}

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
