import Sidebar from "../../../components/Sidebar";
import StatCard from "../../../components/StatCard";
import Topbar from "../../../components/Topbar";

function Coin() {
  return (
    <div className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-full border-[4px] border-[#d5aa21] bg-[#f7c948] text-[18px] text-white">
      P
    </div>
  );
}

export default function MemberDashboardPage() {
  return (
    <div className="min-h-screen bg-[#e8e8e5] font-sans text-[#1a1a1a]">
      <Sidebar role="member" />
      <Topbar />

      <main className="min-h-screen pt-[76px] md:ml-[240px]">
        <div className="mx-auto max-w-[1200px] px-5 py-[24px] md:px-[36px] md:py-[26px]">
          <p className="text-[18px] text-[#6b6b66]">Selamat datang kembali, nama member!</p>

          <div className="mt-[28px] grid gap-[20px] md:grid-cols-2">
            <StatCard
              title="Status Membership"
              value="Aktif"
              status
              description={"Masa berlaku\n01 Jan 2026 - 01 Jan 2027"}
            />
            <StatCard title="Jumlah Poin" value="250 Poin" points />
          </div>

          <section className="mt-[58px]">
            <h2 className="text-[20px] font-bold">Notifikasi</h2>
            <div className="mt-[16px] flex min-h-[83px] items-center gap-[16px] rounded-[8px] border border-[#e3e3e0] bg-white px-[24px] py-[16px]">
              <Coin />
              <div>
                <p className="text-[18px] font-bold">Poin Anda akan kadaluwarsa dalam 30 hari</p>
                <p className="mt-[3px] text-[16px] text-[#6b6b66]">
                  Gunakan poin untuk mendapatkan potongan harga
                </p>
              </div>
            </div>
          </section>

          <section className="mt-[28px]">
            <h2 className="text-[20px] font-bold">Mulai Layanan</h2>
            <div className="mt-[16px] grid gap-[20px] md:grid-cols-2">
              <a href="#" className="flex min-h-[170px] items-center gap-[22px] rounded-[8px] border border-[#e3e3e0] bg-white px-[24px]">
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[58px] w-[58px] fill-none stroke-black">
                  <path d="M5 5l14 14M19 5L5 19" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="6" cy="6" r="4" />
                  <circle cx="18" cy="18" r="4" />
                </svg>
                <div>
                  <h3 className="text-[18px] font-bold">Pilih Layanan</h3>
                  <p className="mt-[2px] text-[16px] text-[#6b6b66]">Lihat dan pilih layanan</p>
                </div>
              </a>

              <a href="#" className="flex min-h-[170px] items-center gap-[22px] rounded-[8px] border border-[#e3e3e0] bg-white px-[24px]">
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[58px] w-[58px] fill-none stroke-black">
                  <path d="M4 12a8 8 0 1 0 3-6.2L4 8" strokeWidth="2" strokeLinecap="round" />
                  <path d="M4 3v5h5M12 7v5l3 2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div>
                  <h3 className="text-[18px] font-bold">Riwayat Transaksi</h3>
                  <p className="mt-[2px] text-[16px] text-[#6b6b66]">Lihat riwayat kunjungan dan pembayaran</p>
                </div>
              </a>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
