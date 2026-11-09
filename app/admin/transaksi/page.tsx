import Link from "next/link";
import Sidebar from "../../../components/Sidebar";
import Topbar from "../../../components/Topbar";

export default function AdminTransaksiPage() {
  return (
    <div className="min-h-screen bg-[#f2f2f0] font-sans text-[#252525]">
      <Sidebar role="admin" />
      <Topbar title="Catat Transaksi" role="admin" />

      <main className="min-h-screen pt-[76px] md:ml-[240px]">
        <div className="mx-auto max-w-[1200px] px-5 py-[28px] md:px-[28px]">
          <section className="rounded-[8px] border border-[#d9d9d9] bg-white px-[20px] pb-[24px] pt-[18px]">
            <h1 className="text-[16px] font-bold">Catat Transaksi Baru</h1>

            <div className="mt-[16px] grid gap-[16px] md:grid-cols-2">
              <label className="text-[13px] font-bold text-[#333333]">
                ID Member
                <input
                  type="text"
                  placeholder="Masukkan ID Member"
                  className="mt-[8px] h-[42px] w-full rounded-[6px] border border-[#c9c9c9] px-[12px] text-[14px] font-normal outline-none placeholder:text-[#777777]"
                />
              </label>

              <label className="text-[13px] font-bold text-[#333333]">
                Tanggal
                <input
                  type="date"
                  defaultValue="2026-01-01"
                  className="mt-[8px] h-[42px] w-full rounded-[6px] border border-[#c9c9c9] px-[12px] text-[14px] font-normal outline-none"
                />
              </label>

              <label className="text-[13px] font-bold text-[#333333]">
                Layanan
                <select className="mt-[8px] h-[42px] w-full rounded-[6px] border border-[#c9c9c9] bg-white px-[12px] text-[14px] font-normal outline-none">
                  <option>Haircut by Senior Kapster</option>
                  <option>Haircut by Junior Kapster</option>
                  <option>Coloring</option>
                  <option>Full Service</option>
                </select>
              </label>

              <label className="text-[13px] font-bold text-[#333333]">
                Total Pembayaran
                <input
                  type="text"
                  defaultValue="Rp 80.000"
                  className="mt-[8px] h-[42px] w-full rounded-[6px] border border-[#c9c9c9] px-[12px] text-[14px] font-normal outline-none"
                />
              </label>

              <label className="text-[13px] font-bold text-[#333333]">
                Diskon Poin
                <input
                  type="text"
                  defaultValue="Rp 0"
                  className="mt-[8px] h-[42px] w-full rounded-[6px] border border-[#c9c9c9] px-[12px] text-[14px] font-normal outline-none"
                />
              </label>

              <label className="text-[13px] font-bold text-[#333333]">
                Metode Pembayaran
                <select className="mt-[8px] h-[42px] w-full rounded-[6px] border border-[#c9c9c9] bg-white px-[12px] text-[14px] font-normal outline-none">
                  <option>Transfer Bank</option>
                  <option>Cash</option>
                  <option>QRIS</option>
                </select>
              </label>
            </div>

            <button
              type="button"
              className="mt-[24px] h-[42px] rounded-[6px] bg-[#171717] px-[24px] text-[14px] font-bold text-white"
            >
              Simpan Transaksi
            </button>
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
