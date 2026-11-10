"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import Sidebar from "../../../components/Sidebar";
import Topbar from "../../../components/Topbar";

type Barber = {
  BarberID: string;
  NamaBarber: string;
};

type Layanan = {
  LayananID: string;
  NamaLayanan: string;
  HargaLayanan: number;
};

type Member = {
  MemberID: string;
  NamaMember: string;
  StatusMembership: string;
  saldoPoin: number;
};

type TransactionRow = {
  TransaksiID: string;
  namaMember: string;
  namaBarber: string;
  namaLayanan: string[];
  total: number;
  statusLayanan: string;
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

function todayInputValue() {
  const today = new Date();
  return `${today.getUTCFullYear()}-${String(today.getUTCMonth() + 1).padStart(2, "0")}-${String(today.getUTCDate()).padStart(2, "0")}`;
}

const fieldClass =
  "mt-[8px] h-[42px] w-full rounded-[6px] border border-[#c9c9c9] px-[12px] text-[14px] font-normal outline-none placeholder:text-[#777777]";
const cardClass =
  "rounded-[8px] border border-[#d9d9d9] bg-white px-[20px] pb-[24px] pt-[18px]";

export default function AdminTransaksiPage() {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [services, setServices] = useState<Layanan[]>([]);
  const [todayTransactions, setTodayTransactions] = useState<TransactionRow[]>([]);
  const [resourcesLoading, setResourcesLoading] = useState(true);
  const [memberId, setMemberId] = useState("");
  const [member, setMember] = useState<Member | null>(null);
  const [barberId, setBarberId] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [tanggal, setTanggal] = useState("");
  const [gunakanPoin, setGunakanPoin] = useState(false);
  const [memberLoading, setMemberLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmPayment, setConfirmPayment] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadTodayTransactions = useCallback(async (signal?: AbortSignal) => {
    const data = await requestApi<TransactionRow[]>(
      "/api/admin/transaksi/hari-ini",
      signal ? { signal } : undefined,
    );
    setTodayTransactions(data);
  }, []);

  useEffect(() => {
    let active = true;

    async function loadResources() {
      try {
        const [barberData, serviceData, transactionData] = await Promise.all([
          requestApi<Barber[]>("/api/barber"),
          requestApi<Layanan[]>("/api/layanan"),
          requestApi<TransactionRow[]>("/api/admin/transaksi/hari-ini"),
        ]);
        if (active) {
          setBarbers(barberData);
          setServices(serviceData);
          setTodayTransactions(transactionData);
        }
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Gagal memuat data transaksi.",
          );
        }
      } finally {
        if (active) setResourcesLoading(false);
      }
    }

    void loadResources();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const interval = window.setInterval(() => {
      void loadTodayTransactions(controller.signal).catch((loadError) => {
        if (!controller.signal.aborted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Gagal memuat status layanan.",
          );
        }
      });
    }, 30_000);

    return () => {
      window.clearInterval(interval);
      controller.abort();
    };
  }, [loadTodayTransactions]);

  useEffect(() => {
    const timer = window.setTimeout(() => setTanggal(todayInputValue()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const selectedServiceRows = useMemo(
    () => services.filter((service) => selectedServices.includes(service.LayananID)),
    [services, selectedServices],
  );
  const subtotal = selectedServiceRows.reduce(
    (sum, service) => sum + service.HargaLayanan,
    0,
  );
  const pointsEarned = member?.StatusMembership === "Aktif" ? 5 : 0;
  const pointsUsed =
    member?.StatusMembership === "Aktif" && gunakanPoin
      ? Math.max(0, Math.min(member.saldoPoin, Math.floor(subtotal / 100)))
      : 0;
  const discount = pointsUsed * 100;
  const finalTotal = subtotal - discount;
  const canSave =
    Boolean(member) && Boolean(barberId) && selectedServices.length > 0;

  async function handleMemberSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMember(null);
    setError("");
    setSuccess("");
    if (!memberId.trim()) {
      setError("Masukkan ID Member.");
      return;
    }

    setMemberLoading(true);
    try {
      const data = await requestApi<Member>(
        `/api/admin/member/${encodeURIComponent(memberId.trim())}`,
      );
      setMember(data);
      setGunakanPoin(false);
    } catch (searchError) {
      setError(
        searchError instanceof Error &&
          searchError.message.toLowerCase().includes("tidak ditemukan")
          ? "Member tidak ditemukan"
          : searchError instanceof Error
            ? searchError.message
            : "Gagal mencari member.",
      );
    } finally {
      setMemberLoading(false);
    }
  }

  function toggleService(id: string) {
    setSelectedServices((current) =>
      current.includes(id)
        ? current.filter((serviceId) => serviceId !== id)
        : [...current, id],
    );
  }

  async function handleSaveTransaction() {
    if (!canSave || !member) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const result = await requestApi<{
        transaksi: { TransaksiID: string; TotalTransaksi: number };
        saldoBaru: number;
      }>("/api/admin/transaksi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          MemberID: member.MemberID,
          BarberID: barberId,
          layananIds: selectedServices,
          gunakanPoin,
          ...(tanggal ? { tanggal } : {}),
        }),
      });

      setSuccess(
        `Transaksi ${result.transaksi.TransaksiID} berhasil disimpan. Total: ${formatRupiah(result.transaksi.TotalTransaksi)}. Saldo poin baru: ${result.saldoBaru}.`,
      );
      setMemberId("");
      setMember(null);
      setBarberId("");
      setSelectedServices([]);
      setGunakanPoin(false);
      setTanggal(todayInputValue());
      setConfirmPayment(false);

      try {
        await loadTodayTransactions();
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? `Transaksi tersimpan, tetapi daftar layanan gagal dimuat: ${loadError.message}`
            : "Transaksi tersimpan, tetapi daftar layanan gagal dimuat.",
        );
      }
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Gagal menyimpan transaksi.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f2f2f0] font-sans text-[#252525]">
      <Sidebar role="admin" />
      <Topbar title="Catat Transaksi" role="admin" />

      <main className="min-h-screen pt-[76px] md:ml-[240px]">
        <div className="mx-auto max-w-[1200px] px-5 py-[28px] md:px-[28px]">
          <section className={cardClass}>
            <h1 className="text-[16px] font-bold">Catat Transaksi Baru</h1>

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

            <div className="mt-[16px] grid gap-[16px] md:grid-cols-2">
              <div>
                <form onSubmit={handleMemberSearch}>
                  <label className="block text-[13px] font-bold text-[#333333]">
                    ID Member
                    <span className="mt-[8px] flex gap-[8px]">
                      <input
                        type="text"
                        value={memberId}
                        onChange={(event) => setMemberId(event.target.value)}
                        placeholder="Masukkan ID Member"
                        className="h-[42px] min-w-0 flex-1 rounded-[6px] border border-[#c9c9c9] px-[12px] text-[14px] font-normal outline-none placeholder:text-[#777777]"
                      />
                      <button
                        type="submit"
                        disabled={memberLoading}
                        className="h-[42px] rounded-[6px] bg-[#171717] px-[18px] text-[13px] font-bold text-white disabled:opacity-50"
                      >
                        {memberLoading ? "Memuat..." : "Cari"}
                      </button>
                    </span>
                  </label>
                </form>
                <p className="mt-[5px] min-h-[18px] text-[11px] font-normal text-[#777777]">
                  {memberLoading ? "Memuat..." : "Cari member berdasarkan ID."}
                </p>
              </div>

              <label className="block text-[13px] font-bold text-[#333333]">
                Tanggal
                <input
                  type="date"
                  value={tanggal}
                  onChange={(event) => setTanggal(event.target.value)}
                  className={fieldClass}
                />
              </label>

              <label className="relative z-10 block text-[13px] font-bold text-[#333333]">
                Barber
                <select
                  value={barberId}
                  onChange={(event) => setBarberId(event.target.value)}
                  className={`${fieldClass} pointer-events-auto cursor-pointer bg-white`}
                >
                  <option value="">Pilih Barber</option>
                  {barbers.map((barber) => (
                    <option key={barber.BarberID} value={barber.BarberID}>
                      {barber.NamaBarber}
                    </option>
                  ))}
                </select>
                <span className="sr-only">
                  {resourcesLoading ? "Memuat..." : ""}
                </span>
              </label>

              <fieldset className="relative z-0 md:row-span-2">
                <legend className="text-[13px] font-bold text-[#333333]">
                  Layanan
                </legend>
                <div className="mt-[8px] max-h-[188px] space-y-[2px] overflow-y-auto rounded-[6px] border border-[#c9c9c9] bg-white p-[10px]">
                  {resourcesLoading ? (
                    <p className="py-[8px] text-[13px] text-[#777777]">
                      Memuat...
                    </p>
                  ) : services.length === 0 ? (
                    <p className="py-[8px] text-[13px] text-[#777777]">
                      Tidak ada layanan.
                    </p>
                  ) : (
                    services.map((service) => (
                      <label
                        key={service.LayananID}
                        className="flex cursor-pointer items-center justify-between gap-[12px] rounded-[4px] px-[6px] py-[8px] text-[13px] hover:bg-[#f7f7f7]"
                      >
                        <span className="flex items-center gap-[9px]">
                          <input
                            type="checkbox"
                            checked={selectedServices.includes(service.LayananID)}
                            onChange={() => toggleService(service.LayananID)}
                          />
                          {service.NamaLayanan}
                        </span>
                        <span className="whitespace-nowrap font-normal text-[#555555]">
                          {formatRupiah(service.HargaLayanan)}
                        </span>
                      </label>
                    ))
                  )}
                </div>
              </fieldset>

              <label className="text-[13px] font-bold text-[#333333]">
                Total Transaksi (Rp)
                <input
                  type="text"
                  readOnly
                  value={formatRupiah(subtotal)}
                  className={`${fieldClass} bg-[#f7f7f7]`}
                />
              </label>

              <fieldset className="md:col-span-2">
                <legend className="text-[13px] font-bold text-[#333333]">
                  Transaksi menggunakan poin?
                </legend>
                <div className="mt-[9px] flex gap-[20px] text-[14px]">
                  <label className="flex items-center gap-[7px]">
                    <input
                      type="radio"
                      name="gunakan-poin"
                      checked={gunakanPoin}
                      onChange={() => setGunakanPoin(true)}
                      disabled={member?.StatusMembership !== "Aktif"}
                    />
                    Ya
                  </label>
                  <label className="flex items-center gap-[7px]">
                    <input
                      type="radio"
                      name="gunakan-poin"
                      checked={!gunakanPoin}
                      onChange={() => setGunakanPoin(false)}
                    />
                    Tidak
                  </label>
                  {member && member.StatusMembership !== "Aktif" && (
                    <span className="text-[12px] text-[#777777]">
                      Poin hanya dapat digunakan oleh member aktif.
                    </span>
                  )}
                </div>
              </fieldset>
            </div>

            <section className="mt-[20px] rounded-[8px] border border-[#e9e9e9] p-[16px]">
              <h2 className="text-[14px] font-bold">
                Hasil Pemeriksaan Status Membership
              </h2>
              {memberLoading ? (
                <p className="mt-[12px] text-[13px] text-[#777777]">Memuat...</p>
              ) : member ? (
                <div className="mt-[12px] grid gap-[10px] text-[13px] sm:grid-cols-3">
                  <p>
                    Nama: <span className="font-bold">{member.NamaMember}</span>
                  </p>
                  <p>
                    Status:{" "}
                    <span className="font-bold">{member.StatusMembership}</span>
                  </p>
                  <p>
                    Saldo poin:{" "}
                    <span className="font-bold">{member.saldoPoin}</span>
                  </p>
                </div>
              ) : memberId && error === "Member tidak ditemukan" ? (
                <p className="mt-[12px] text-[13px] text-red-600">
                  Member tidak ditemukan
                </p>
              ) : (
                <p className="mt-[12px] text-[13px] text-[#777777]">
                  Cari ID member untuk memeriksa status membership.
                </p>
              )}
            </section>

            <section className="mt-[16px] rounded-[8px] border border-[#e9e9e9] p-[16px]">
              <h2 className="text-[14px] font-bold">
                Informasi Poin dan Diskon
              </h2>
              <dl className="mt-[12px] grid gap-[10px] text-[13px] sm:grid-cols-2">
                <div className="flex justify-between gap-[12px]">
                  <dt>Saldo poin</dt>
                  <dd className="font-bold">{member?.saldoPoin ?? 0}</dd>
                </div>
                <div className="flex justify-between gap-[12px]">
                  <dt>Poin dipakai</dt>
                  <dd className="font-bold">{pointsUsed}</dd>
                </div>
                <div className="flex justify-between gap-[12px]">
                  <dt>Diskon</dt>
                  <dd className="font-bold">{formatRupiah(discount)}</dd>
                </div>
                <div className="flex justify-between gap-[12px]">
                  <dt>Total akhir</dt>
                  <dd className="font-bold">{formatRupiah(finalTotal)}</dd>
                </div>
                <div className="flex justify-between gap-[12px]">
                  <dt>Poin yang akan diperoleh</dt>
                  <dd className="font-bold">{pointsEarned}</dd>
                </div>
              </dl>
            </section>

            <button
              type="button"
              onClick={() => {
                setError("");
                setConfirmPayment(true);
              }}
              disabled={!canSave || saving}
              className="mt-[24px] h-[42px] rounded-[6px] bg-[#171717] px-[24px] text-[14px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Simpan Transaksi
            </button>
          </section>

          <section className={`mt-[18px] ${cardClass}`}>
            <h2 className="text-[16px] font-bold">
              Pantau Layanan (Dikerjakan Barber)
            </h2>
            {resourcesLoading ? (
              <p className="mt-[16px] text-[13px] text-[#777777]">Memuat...</p>
            ) : todayTransactions.length === 0 ? (
              <p className="mt-[16px] text-[13px] text-[#777777]">
                Belum ada layanan yang dikerjakan
              </p>
            ) : (
              <div className="mt-[16px] overflow-x-auto rounded-[8px] border border-[#e9e9e9]">
                <table className="w-full min-w-[850px] border-collapse text-left text-[12px]">
                  <thead>
                    <tr className="h-[44px] border-b border-[#e9e9e9]">
                      <th className="px-[16px] font-bold">ID Transaksi</th>
                      <th className="px-[16px] font-bold">Member</th>
                      <th className="px-[16px] font-bold">Barber</th>
                      <th className="px-[16px] font-bold">Layanan</th>
                      <th className="px-[16px] font-bold">Status Layanan</th>
                      <th className="px-[16px] font-bold">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todayTransactions.map((transaction) => (
                      <tr
                        key={transaction.TransaksiID}
                        className="h-[52px] border-b border-[#ededed] last:border-b-0"
                      >
                        <td className="px-[16px]">{transaction.TransaksiID}</td>
                        <td className="px-[16px]">{transaction.namaMember}</td>
                        <td className="px-[16px]">{transaction.namaBarber}</td>
                        <td className="px-[16px]">
                          {transaction.namaLayanan.join(", ")}
                        </td>
                        <td className="px-[16px]">
                          {transaction.statusLayanan}
                        </td>
                        <td className="px-[16px]">
                          {formatRupiah(transaction.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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

      {confirmPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="payment-confirmation-title"
            className="w-full max-w-[420px] rounded-[10px] bg-white p-[24px] shadow-xl"
          >
            <h2
              id="payment-confirmation-title"
              className="text-[16px] font-bold"
            >
              Verifikasi Pembayaran
            </h2>
            <p className="mt-[12px] text-[14px]">
              Apakah pembayaran sudah diterima dan sesuai?
            </p>
            <div className="mt-[24px] flex justify-end gap-[10px]">
              <button
                type="button"
                onClick={() => setConfirmPayment(false)}
                disabled={saving}
                className="h-[40px] rounded-[6px] border border-[#252525] px-[18px] text-[14px] font-bold disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => void handleSaveTransaction()}
                disabled={saving}
                className="h-[40px] rounded-[6px] bg-[#171717] px-[18px] text-[14px] font-bold text-white disabled:opacity-50"
              >
                {saving ? "Menyimpan..." : "Ya"}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
