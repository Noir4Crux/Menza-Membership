"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import Sidebar from "../../../components/Sidebar";
import Topbar from "../../../components/Topbar";

type Member = {
  MemberID: string;
  NamaMember: string;
};

type Reminder = {
  MemberID: string;
  NamaMember: string;
  NomorHP: string | null;
  MasaBerlaku: string | null;
};

type Notification = {
  NotifikasiID: number;
  Penerima: string;
  Jenis: string;
  Pesan: string;
  Tanggal: string;
};

type NotificationData = {
  pengingat: Reminder[];
  riwayat: Notification[];
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

const kinds = ["Masa Berlaku", "Poin", "Promo", "Informasi"];
const inputClass =
  "mt-[8px] h-[42px] w-full rounded-[6px] border border-[#c9c9c9] bg-white px-[12px] text-[14px] font-normal outline-none";

export default function AdminNotifikasiPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [recipient, setRecipient] = useState("");
  const [kind, setKind] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadNotifications = useCallback(async () => {
    const data = await requestApi<NotificationData>("/api/admin/notifikasi");
    setReminders(data.pengingat);
    setNotifications(data.riwayat);
  }, []);

  useEffect(() => {
    let active = true;

    async function loadPage() {
      try {
        const [notificationData, memberData] = await Promise.all([
          requestApi<NotificationData>("/api/admin/notifikasi"),
          requestApi<Member[]>("/api/admin/member"),
        ]);
        if (active) {
          setReminders(notificationData.pengingat);
          setNotifications(notificationData.riwayat);
          setMembers(memberData);
        }
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Gagal memuat notifikasi.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadPage();
    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setError("");
    setSuccess("");

    try {
      await requestApi<unknown>("/api/admin/notifikasi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          penerima: recipient,
          jenis: kind,
          pesan: message,
        }),
      });
      setRecipient("");
      setKind("");
      setMessage("");
      setSuccess("Notifikasi berhasil dikirim.");
      await loadNotifications();
    } catch (sendError) {
      setError(
        sendError instanceof Error
          ? sendError.message
          : "Gagal mengirim notifikasi.",
      );
    } finally {
      setSending(false);
    }
  }

  function clearForm() {
    setRecipient("");
    setKind("");
    setMessage("");
    setError("");
    setSuccess("");
  }

  return (
    <div className="min-h-screen bg-[#f2f2f0] font-sans text-[#252525]">
      <Sidebar role="admin" />
      <Topbar title="Notifikasi" role="admin" />

      <main className="min-h-screen pt-[76px] md:ml-[240px]">
        <div className="mx-auto max-w-[1200px] px-5 py-[28px] md:px-[28px]">
          <section className="rounded-[8px] border border-[#d9d9d9] bg-white px-[20px] pb-[24px] pt-[18px]">
            <h1 className="text-[16px] font-bold">Siapkan Notifikasi</h1>

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

            <form onSubmit={handleSubmit}>
              <div className="mt-[16px] grid gap-[16px] md:grid-cols-2">
                <label className="text-[13px] font-bold text-[#333333]">
                  Penerima
                  <select
                    value={recipient}
                    onChange={(event) => setRecipient(event.target.value)}
                    required
                    className={inputClass}
                  >
                    <option value="">Pilih penerima</option>
                    <option value="SEMUA">Semua Member Aktif</option>
                    {members.map((member) => (
                      <option key={member.MemberID} value={member.MemberID}>
                        {member.MemberID} - {member.NamaMember}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="text-[13px] font-bold text-[#333333]">
                  Jenis
                  <select
                    value={kind}
                    onChange={(event) => setKind(event.target.value)}
                    required
                    className={inputClass}
                  >
                    <option value="">Pilih jenis</option>
                    {kinds.map((notificationKind) => (
                      <option key={notificationKind} value={notificationKind}>
                        {notificationKind}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="text-[13px] font-bold text-[#333333] md:col-span-2">
                  Pesan
                  <textarea
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    maxLength={300}
                    required
                    rows={4}
                    className="mt-[8px] w-full resize-none rounded-[6px] border border-[#c9c9c9] px-[12px] py-[10px] text-[14px] font-normal outline-none"
                  />
                </label>
              </div>

              <div className="mt-[20px] flex gap-[10px]">
                <button
                  type="submit"
                  disabled={sending || loading}
                  className="h-[42px] rounded-[6px] bg-[#171717] px-[24px] text-[14px] font-bold text-white disabled:opacity-50"
                >
                  {sending ? "Mengirim..." : "Kirim Notifikasi"}
                </button>
                <button
                  type="button"
                  onClick={clearForm}
                  disabled={sending}
                  className="h-[42px] rounded-[6px] border border-[#252525] px-[24px] text-[14px] font-bold text-[#252525] disabled:opacity-50"
                >
                  Batal
                </button>
              </div>
            </form>
          </section>

          <section className="mt-[18px] rounded-[8px] border border-[#d9d9d9] bg-white px-[20px] pb-[20px] pt-[18px]">
            <h2 className="text-[16px] font-bold">Pengingat Masa Berlaku</h2>
            {loading ? (
              <p className="mt-[16px] text-[13px] text-[#777777]">Memuat...</p>
            ) : reminders.length === 0 ? (
              <p className="mt-[16px] text-[13px] text-[#777777]">
                Tidak ada pengingat masa berlaku.
              </p>
            ) : (
              <div className="mt-[16px] overflow-x-auto rounded-[8px] border border-[#e9e9e9]">
                <table className="w-full min-w-[700px] border-collapse text-left text-[12px]">
                  <thead>
                    <tr className="h-[44px] border-b border-[#e9e9e9]">
                      <th className="px-[16px] font-bold">Tanggal</th>
                      <th className="px-[16px] font-bold">Jenis</th>
                      <th className="px-[16px] font-bold">Pesan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reminders.map((reminder) => (
                      <tr
                        key={reminder.MemberID}
                        className="h-[58px] border-b border-[#ededed] last:border-b-0"
                      >
                        <td className="px-[16px]">
                          {formatDate(reminder.MasaBerlaku)}
                        </td>
                        <td className="px-[16px]">Masa Berlaku</td>
                        <td className="px-[16px]">
                          {reminder.NamaMember} ({reminder.MemberID}) akan berakhir pada{" "}
                          {formatDate(reminder.MasaBerlaku)}.
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="mt-[18px] rounded-[8px] border border-[#d9d9d9] bg-white px-[20px] pb-[20px] pt-[18px]">
            <h2 className="text-[16px] font-bold">Riwayat Notifikasi</h2>

            <div className="mt-[16px] overflow-x-auto rounded-[8px] border border-[#e9e9e9]">
              <table className="w-full min-w-[760px] border-collapse text-left text-[12px]">
                <thead>
                  <tr className="h-[44px] border-b border-[#e9e9e9]">
                    <th className="px-[16px] font-bold">Tanggal</th>
                    <th className="px-[16px] font-bold">Jenis</th>
                    <th className="px-[16px] font-bold">Pesan</th>
                    <th className="px-[16px] font-bold">Penerima</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="h-[100px] text-center text-[#777777]">
                        Memuat...
                      </td>
                    </tr>
                  ) : notifications.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="h-[100px] text-center text-[#777777]">
                        Belum ada riwayat notifikasi.
                      </td>
                    </tr>
                  ) : (
                    notifications.map((notification) => (
                      <tr
                        key={notification.NotifikasiID}
                        className="h-[58px] border-b border-[#ededed] last:border-b-0"
                      >
                        <td className="px-[16px]">
                          {formatDate(notification.Tanggal)}
                        </td>
                        <td className="px-[16px]">{notification.Jenis}</td>
                        <td className="max-w-[360px] px-[16px]">
                          {notification.Pesan}
                        </td>
                        <td className="px-[16px]">{notification.Penerima}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
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
