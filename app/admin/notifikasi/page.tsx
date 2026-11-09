import Link from "next/link";
import Sidebar from "../../../components/Sidebar";
import Topbar from "../../../components/Topbar";

const notifications = [
  {
    title: "Masa berlaku hampir habis",
    message: "Membership Anda akan berakhir pada 01 Jan 2027.",
    recipient: "Faiz - ID00001",
    date: "17 Des 2026",
    status: "Terkirim",
  },
];

export default function AdminNotifikasiPage() {
  return (
    <div className="min-h-screen bg-[#f2f2f0] font-sans text-[#252525]">
      <Sidebar role="admin" />
      <Topbar title="Notifikasi" role="admin" />

      <main className="min-h-screen pt-[76px] md:ml-[240px]">
        <div className="mx-auto max-w-[1200px] px-5 py-[28px] md:px-[28px]">
          <section className="rounded-[8px] border border-[#d9d9d9] bg-white px-[20px] pb-[24px] pt-[18px]">
            <h1 className="text-[16px] font-bold">Kirim Notifikasi</h1>

            <div className="mt-[16px] grid gap-[16px] md:grid-cols-2">
              <label className="text-[13px] font-bold text-[#333333]">
                Penerima
                <select className="mt-[8px] h-[42px] w-full rounded-[6px] border border-[#c9c9c9] bg-white px-[12px] text-[14px] font-normal outline-none">
                  <option>Semua Member</option>
                  <option>Member aktif</option>
                  <option>Masa berlaku hampir habis</option>
                  <option>ID00001 - Faiz</option>
                </select>
              </label>

              <label className="text-[13px] font-bold text-[#333333]">
                Judul Notifikasi
                <input
                  type="text"
                  defaultValue="Masa berlaku hampir habis"
                  className="mt-[8px] h-[42px] w-full rounded-[6px] border border-[#c9c9c9] px-[12px] text-[14px] font-normal outline-none"
                />
              </label>

              <label className="text-[13px] font-bold text-[#333333] md:col-span-2">
                Pesan
                <textarea
                  defaultValue="Masa berlaku membership Anda hampir habis. Segera perpanjang membership Anda!"
                  rows={4}
                  className="mt-[8px] w-full resize-none rounded-[6px] border border-[#c9c9c9] px-[12px] py-[10px] text-[14px] font-normal outline-none"
                />
              </label>
            </div>

            <button
              type="button"
              className="mt-[20px] h-[42px] rounded-[6px] bg-[#171717] px-[24px] text-[14px] font-bold text-white"
            >
              Kirim Notifikasi
            </button>
          </section>

          <section className="mt-[18px] rounded-[8px] border border-[#d9d9d9] bg-white px-[20px] pb-[20px] pt-[18px]">
            <h2 className="text-[16px] font-bold">Riwayat Notifikasi</h2>

            <div className="mt-[16px] overflow-x-auto rounded-[8px] border border-[#e9e9e9]">
              <table className="w-full min-w-[760px] border-collapse text-left text-[12px]">
                <thead>
                  <tr className="h-[44px] border-b border-[#e9e9e9]">
                    <th className="px-[16px] font-bold">Judul</th>
                    <th className="px-[16px] font-bold">Pesan</th>
                    <th className="px-[16px] font-bold">Penerima</th>
                    <th className="px-[16px] font-bold">Tanggal</th>
                    <th className="px-[16px] font-bold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {notifications.map((notification) => (
                    <tr
                      key={`${notification.recipient}-${notification.date}`}
                      className="h-[64px] border-b border-[#ededed] last:border-b-0"
                    >
                      <td className="px-[16px] font-bold">{notification.title}</td>
                      <td className="max-w-[300px] px-[16px]">{notification.message}</td>
                      <td className="px-[16px]">{notification.recipient}</td>
                      <td className="px-[16px]">{notification.date}</td>
                      <td className="px-[16px]">
                        <span className="rounded-full bg-[#e7f4e7] px-[12px] py-[6px] text-[#36743a]">
                          {notification.status}
                        </span>
                      </td>
                    </tr>
                  ))}
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
