import Sidebar from "../../../components/Sidebar";
import Topbar from "../../../components/Topbar";

const summaryCards = [
  "Total Member",
  "Menunggu Verifikasi",
  "Transaksi Hari Ini",
  "Masa Berlaku Segera Berakhir",
];

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-[#f2f2f0] font-sans text-[#252525]">
      <Sidebar role="admin" />
      <Topbar title="Dashboard Admin" role="admin" />

      <main className="min-h-screen pt-[76px] md:ml-[240px]">
        <div className="mx-auto max-w-[1200px] px-5 py-[28px] md:px-[28px]">
          <section className="rounded-[8px] border border-[#d9d9d9] bg-white px-[20px] pb-[26px] pt-[18px]">
            <h2 className="text-[16px] font-bold">Ringkasan</h2>
            <div className="mt-[16px] grid grid-cols-1 gap-[16px] sm:grid-cols-2 xl:grid-cols-4">
              {summaryCards.map((label) => (
                <div
                  key={label}
                  className="flex min-h-[184px] flex-col rounded-[16px] border border-[#ececec] px-[16px] py-[14px]"
                >
                  <p className="min-h-[34px] text-[13px] text-[#333333]">{label}</p>
                  <p className="mt-[10px] text-[28px] font-bold text-[#252525]">—</p>
                  <p className="mt-[14px] text-[12px] text-[#777777]">Belum ada data</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-[18px] rounded-[8px] border border-[#d9d9d9] bg-white px-[20px] pb-[24px] pt-[18px]">
            <h2 className="text-[16px] font-bold">Aktivitas Terbaru</h2>
            <div className="mt-[16px] flex min-h-[118px] items-center justify-center rounded-[8px] border border-[#ececec] text-center text-[14px] text-[#777777]">
              Belum ada aktivitas
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
