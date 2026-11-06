import Link from "next/link";
import Sidebar from "../../../components/Sidebar";
import Topbar from "../../../components/Topbar";

const transactions = [
  {
    id: "tk0000001",
    date: "10 April 2026",
    service: "Haircut by Senior Kapster",
    total: "Rp 80.000",
    discount: "Rp 0",
  },
  {
    id: "tk0000002",
    date: "12 Mei 2026",
    service: "Haircut by Junior Kapster",
    total: "Rp 60.000",
    discount: "Rp 0",
  },
  {
    id: "tk0000003",
    date: "08 Agustus 2026",
    service: "Coloring",
    total: "Rp 300.000",
    discount: "Rp 0",
  },
  {
    id: "tk0000004",
    date: "11 September 2026",
    service: "Full Service",
    total: "Rp 150.000",
    discount: "Rp 0",
  },
  {
    id: "tk0000005",
    date: "26 Oktober 2026",
    service: "Haircut by Senior Kapster",
    total: "Rp 55.000",
    discount: "Rp 25.000",
  },
];

export default function RiwayatTransaksiPage() {
  return (
    <div className="min-h-screen bg-[#efefed] font-sans text-[#1a1a1a]">
      <Sidebar role="member" />
      <Topbar title="Riwayat Transaksi" />

      <main className="min-h-screen pt-[76px] md:ml-[240px]">
        <div className="mx-auto w-full max-w-[1200px] px-5 py-[24px] md:px-[36px]">
          <p className="text-[18px] text-[#6b6b66]">
            Lihat riwayat transaksi dan kunjungan Anda
          </p>

          <div className="mt-[24px] overflow-x-auto rounded-[8px] border border-[#ededeb] bg-white">
            <table className="w-full min-w-[720px] border-collapse text-left">
              <thead>
                <tr className="h-[52px] border-b border-[#ededeb] text-[13px] font-bold">
                  <th className="px-[16px]">Tanggal</th>
                  <th className="px-[16px]">Layanan</th>
                  <th className="px-[16px]">Total</th>
                  <th className="px-[16px]">Diskon</th>
                  <th className="px-[16px]">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="h-[56px] border-b border-[#ededeb] text-[13px] last:border-b-0 hover:bg-[#fafafa]">
                    <td className="px-[16px]">
                      <Link
                        href={`/member/riwayat/${transaction.id}`}
                        className="block py-[18px] text-[#6b6b66]"
                      >
                        {transaction.date}
                      </Link>
                    </td>
                    <td className="px-[16px]">
                      <Link href={`/member/riwayat/${transaction.id}`} className="block py-[18px]">
                        {transaction.service}
                      </Link>
                    </td>
                    <td className="px-[16px]">
                      <Link href={`/member/riwayat/${transaction.id}`} className="block py-[18px]">
                        {transaction.total}
                      </Link>
                    </td>
                    <td className="px-[16px]">
                      <Link href={`/member/riwayat/${transaction.id}`} className="block py-[18px] text-[#6b6b66]">
                        {transaction.discount}
                      </Link>
                    </td>
                    <td className="px-[16px]">
                      <Link href={`/member/riwayat/${transaction.id}`} className="block py-[18px]">
                        <span className="rounded-full bg-[#d7f3e5] px-[14px] py-[5px] font-bold text-[#18794e]">
                          Berhasil
                        </span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
