import Link from "next/link";
import Sidebar from "../../../components/Sidebar";
import Topbar from "../../../components/Topbar";

export default function AdminMemberPage() {
  return (
    <div className="min-h-screen bg-[#f2f2f0] font-sans text-[#252525]">
      <Sidebar role="admin" />
      <Topbar title="Daftar Member" role="admin" />

      <main className="min-h-screen pt-[76px] md:ml-[240px]">
        <div className="mx-auto max-w-[1200px] px-5 py-[28px] md:px-[28px]">
          <section className="rounded-[8px] border border-[#d9d9d9] bg-white px-[20px] py-[20px]">
            <div className="flex flex-col gap-[12px] rounded-[8px] border border-[#e9e9e9] p-[16px] sm:flex-row">
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
                  placeholder="Cari ID member, nama, atau nomor HP"
                  className="h-[40px] w-full rounded-[6px] border border-[#c9c9c9] px-[38px] text-[14px] outline-none placeholder:text-[#777777]"
                />
              </label>
              <button
                type="button"
                className="h-[40px] rounded-[6px] bg-[#171717] px-[24px] text-[14px] font-bold text-white"
              >
                Cari
              </button>
            </div>
          </section>

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
                    <th className="px-[16px] font-bold">Masa Berlaku</th>
                    <th className="px-[16px] font-bold">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={6} className="h-[142px] text-center text-[12px] text-[#777777]">
                      Menampilkan 0 dari 0 data
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-[16px] flex min-h-[68px] flex-col items-start justify-center gap-[12px] rounded-[8px] border border-[#e9e9e9] px-[16px] sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[13px] text-[#777777]">
                Pilih member pada tabel untuk melihat detail atau memperbarui data.
              </p>
              <div className="flex gap-[10px]">
                <button
                  type="button"
                  disabled
                  className="h-[40px] rounded-[6px] border border-[#d4d4d4] px-[18px] text-[14px] font-bold text-[#777777]"
                >
                  Lihat Detail
                </button>
                <button
                  type="button"
                  disabled
                  className="h-[40px] rounded-[6px] border border-[#d4d4d4] px-[18px] text-[14px] font-bold text-[#777777]"
                >
                  Perbarui
                </button>
              </div>
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
