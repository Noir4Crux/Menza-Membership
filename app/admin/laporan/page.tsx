import Link from "next/link";
import Sidebar from "../../../components/Sidebar";
import Topbar from "../../../components/Topbar";

const monthlyData = [
  { month: "Jan", transactions: 18 },
  { month: "Feb", transactions: 24 },
  { month: "Mar", transactions: 21 },
  { month: "Apr", transactions: 29 },
  { month: "Mei", transactions: 32 },
  { month: "Jun", transactions: 27 },
];

const transactions = [
  { date: "28 Jun 2026", service: "Haircut by Senior Kapster", member: "Faiz", amount: "Rp 80.000" },
  { date: "27 Jun 2026", service: "Haircut by Junior Kapster", member: "Budi", amount: "Rp 60.000" },
  { date: "26 Jun 2026", service: "Coloring", member: "Andi", amount: "Rp 150.000" },
];

export default function AdminLaporanPage() {
  return (
    <div className="min-h-screen bg-[#f2f2f0] font-sans text-[#252525]">
      <Sidebar role="admin" />
      <Topbar title="Laporan Bulanan" role="admin" />

      <main className="min-h-screen pt-[76px] md:ml-[240px]">
        <div className="mx-auto max-w-[1200px] px-5 py-[28px] md:px-[28px]">
          <section className="flex flex-col gap-[12px] rounded-[8px] border border-[#d9d9d9] bg-white px-[20px] py-[16px] sm:flex-row sm:items-end sm:justify-between">
            <label className="text-[13px] font-bold text-[#333333]">
              Periode Laporan
              <select className="mt-[8px] h-[42px] w-full min-w-[220px] rounded-[6px] border border-[#c9c9c9] bg-white px-[12px] text-[14px] font-normal outline-none sm:w-[220px]">
                <option>Juni 2026</option>
                <option>Mei 2026</option>
                <option>April 2026</option>
              </select>
            </label>
            <button
              type="button"
              className="h-[42px] rounded-[6px] bg-[#171717] px-[24px] text-[14px] font-bold text-white"
            >
              Unduh Laporan
            </button>
          </section>

          <section className="mt-[18px] grid grid-cols-1 gap-[16px] sm:grid-cols-3">
            <div className="min-h-[120px] rounded-[8px] border border-[#d9d9d9] bg-white px-[18px] py-[16px]">
              <p className="text-[13px] text-[#777777]">Pendapatan</p>
              <p className="mt-[18px] text-[24px] font-bold">Rp 3.850.000</p>
            </div>
            <div className="min-h-[120px] rounded-[8px] border border-[#d9d9d9] bg-white px-[18px] py-[16px]">
              <p className="text-[13px] text-[#777777]">Jumlah Transaksi</p>
              <p className="mt-[18px] text-[24px] font-bold">27</p>
            </div>
            <div className="min-h-[120px] rounded-[8px] border border-[#d9d9d9] bg-white px-[18px] py-[16px]">
              <p className="text-[13px] text-[#777777]">Member Baru</p>
              <p className="mt-[18px] text-[24px] font-bold">5</p>
            </div>
          </section>

          <section className="mt-[18px] rounded-[8px] border border-[#d9d9d9] bg-white px-[20px] pb-[20px] pt-[18px]">
            <h1 className="text-[16px] font-bold">Jumlah Transaksi Bulanan</h1>
            <div className="mt-[22px] flex h-[220px] items-end gap-[18px] border-b border-[#d9d9d9] px-[8px] sm:gap-[28px]">
              {monthlyData.map((data) => (
                <div key={data.month} className="flex h-full flex-1 flex-col justify-end text-center">
                  <div
                    className="mx-auto w-full max-w-[44px] rounded-t-[4px] bg-[#252525]"
                    style={{ height: `${data.transactions * 5}px` }}
                  />
                  <span className="h-[24px] pt-[8px] text-[11px] text-[#777777]">{data.month}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-[18px] rounded-[8px] border border-[#d9d9d9] bg-white px-[20px] pb-[20px] pt-[18px]">
            <h2 className="text-[16px] font-bold">Rincian Transaksi</h2>
            <div className="mt-[16px] overflow-x-auto rounded-[8px] border border-[#e9e9e9]">
              <table className="w-full min-w-[680px] border-collapse text-left text-[12px]">
                <thead>
                  <tr className="h-[44px] border-b border-[#e9e9e9]">
                    <th className="px-[16px] font-bold">Tanggal</th>
                    <th className="px-[16px] font-bold">Layanan</th>
                    <th className="px-[16px] font-bold">Member</th>
                    <th className="px-[16px] font-bold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={`${transaction.date}-${transaction.member}`} className="h-[54px] border-b border-[#ededed] last:border-b-0">
                      <td className="px-[16px]">{transaction.date}</td>
                      <td className="px-[16px]">{transaction.service}</td>
                      <td className="px-[16px]">{transaction.member}</td>
                      <td className="px-[16px] font-bold">{transaction.amount}</td>
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
