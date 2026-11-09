import Link from "next/link";
import Sidebar from "../../../components/Sidebar";
import Topbar from "../../../components/Topbar";

export default function AdminVerifikasiPage() {
  return (
    <div className="min-h-screen bg-[#f2f2f0] font-sans text-[#252525]">
      <Sidebar role="admin" />
      <Topbar title="Verifikasi Data" role="admin" />

      <main className="min-h-screen pt-[76px] md:ml-[240px]">
        <div className="mx-auto max-w-[1200px] px-5 py-[28px] md:px-[28px]">
          <section className="rounded-[8px] border border-[#d9d9d9] bg-white px-[20px] pb-[20px] pt-[18px]">
            <h1 className="text-[16px] font-bold">Cek ID Pengajuan</h1>
            <div className="mt-[16px] flex flex-col gap-[12px] sm:flex-row">
              <input
                type="text"
                placeholder="ID atau nomor pendaftaran"
                className="h-[42px] flex-1 rounded-[6px] border border-[#c9c9c9] px-[12px] text-[14px] outline-none placeholder:text-[#777777]"
              />
              <button
                type="button"
                className="h-[42px] rounded-[6px] bg-[#171717] px-[24px] text-[14px] font-bold text-white"
              >
                Cari
              </button>
            </div>
          </section>

          <section className="mt-[18px] rounded-[8px] border border-[#d9d9d9] bg-white px-[20px] py-[18px]">
            <h2 className="text-[16px] font-bold">Data Pengajuan</h2>
            <div className="mt-[16px] grid gap-[12px] text-[14px] md:grid-cols-2">
              <div className="flex items-center justify-between rounded-[6px] border border-[#ececec] px-[14px] py-[12px]">
                <span className="text-[#777777]">ID / Nomor Pendaftaran</span>
                <span className="font-bold">MB-001</span>
              </div>
              <div className="flex items-center justify-between rounded-[6px] border border-[#ececec] px-[14px] py-[12px]">
                <span className="text-[#777777]">Nama Member</span>
                <span className="font-bold">Andi Pratama</span>
              </div>
              <div className="flex items-center justify-between rounded-[6px] border border-[#ececec] px-[14px] py-[12px]">
                <span className="text-[#777777]">Nomor HP</span>
                <span className="font-bold">081234567801</span>
              </div>
              <div className="flex items-center justify-between rounded-[6px] border border-[#ececec] px-[14px] py-[12px]">
                <span className="text-[#777777]">Status Pengajuan</span>
                <span className="rounded-full bg-[#fff0b8] px-[12px] py-[6px] text-[12px] font-bold text-[#7a5b00]">
                  Menunggu Verifikasi
                </span>
              </div>
            </div>
          </section>

          <section className="mt-[18px] rounded-[8px] border border-[#d9d9d9] bg-white px-[20px] pb-[20px] pt-[18px]">
            <h2 className="text-[16px] font-bold">Keputusan Verifikasi</h2>
            <fieldset className="mt-[16px] text-[14px]">
              <legend className="font-bold text-[#333333]">Data valid?</legend>
              <div className="mt-[10px] flex flex-col gap-[10px] sm:flex-row">
                <label className="flex items-center gap-[8px]">
                  <input type="radio" name="data-valid" defaultChecked />
                  <span>Ya, data valid</span>
                </label>
                <label className="flex items-center gap-[8px]">
                  <input type="radio" name="data-valid" />
                  <span>Tidak, data tidak valid</span>
                </label>
              </div>
            </fieldset>

            <div className="mt-[18px] grid gap-[16px] md:grid-cols-2">
              <label className="text-[13px] font-bold text-[#333333]">
                Status Membership
                <select className="mt-[8px] h-[42px] w-full rounded-[6px] border border-[#c9c9c9] bg-white px-[12px] text-[14px] font-normal outline-none">
                  <option value="">Pilih status</option>
                  <option>Aktif</option>
                  <option>Nonaktif</option>
                  <option>Hampir Berakhir</option>
                </select>
              </label>
              <label className="text-[13px] font-bold text-[#333333]">
                Masa Berlaku Sampai
                <input
                  type="text"
                  placeholder="dd/mm/yyyy"
                  className="mt-[8px] h-[42px] w-full rounded-[6px] border border-[#c9c9c9] px-[12px] text-[14px] font-normal outline-none placeholder:text-[#777777]"
                />
              </label>
            </div>

            <label className="mt-[16px] block text-[13px] font-bold text-[#333333]">
              Catatan Pemeriksaan
              <textarea
                rows={4}
                placeholder="Tulis catatan pemeriksaan (opsional)"
                className="mt-[8px] w-full resize-none rounded-[6px] border border-[#c9c9c9] px-[12px] py-[10px] text-[14px] font-normal outline-none placeholder:text-[#777777]"
              />
            </label>

            <div className="mt-[20px] flex flex-col gap-[12px] sm:flex-row">
              <button
                type="button"
                className="h-[42px] rounded-[6px] bg-[#171717] px-[24px] text-[14px] font-bold text-white"
              >
                Aktifkan Membership
              </button>
              <button
                type="button"
                className="h-[42px] rounded-[6px] border border-[#252525] px-[24px] text-[14px] font-bold text-[#252525]"
              >
                Tolak / Minta Perbaikan
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
