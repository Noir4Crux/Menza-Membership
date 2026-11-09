import Link from "next/link";
import Sidebar from "../../../components/Sidebar";
import Topbar from "../../../components/Topbar";

const members = [
  {
    id: "ID00001",
    name: "Faiz",
    endDate: "01 Jan 2027",
    remaining: "15 hari",
    status: "Segera Berakhir",
  },
];

export default function AdminMasaBerlakuPage() {
  return (
    <div className="min-h-screen bg-[#f2f2f0] font-sans text-[#252525]">
      <Sidebar role="admin" />
      <Topbar title="Masa Berlaku" role="admin" />

      <main className="min-h-screen pt-[76px] md:ml-[240px]">
        <div className="mx-auto max-w-[1200px] px-5 py-[28px] md:px-[28px]">
          <section className="rounded-[8px] border border-[#d9d9d9] bg-white px-[20px] pb-[20px] pt-[18px]">
            <div className="flex flex-col gap-[12px] sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-[16px] font-bold">Masa Berlaku Member</h1>
              <button
                type="button"
                className="h-[38px] rounded-[6px] bg-[#171717] px-[18px] text-[13px] font-bold text-white"
              >
                Kirim Notifikasi
              </button>
            </div>

            <div className="mt-[16px] overflow-x-auto rounded-[8px] border border-[#e9e9e9]">
              <table className="w-full min-w-[780px] border-collapse text-left text-[12px]">
                <thead>
                  <tr className="h-[44px] border-b border-[#e9e9e9]">
                    <th className="px-[16px] font-bold">ID Member</th>
                    <th className="px-[16px] font-bold">Nama Member</th>
                    <th className="px-[16px] font-bold">Tanggal Berakhir</th>
                    <th className="px-[16px] font-bold">Sisa Masa Berlaku</th>
                    <th className="px-[16px] font-bold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <tr key={member.id} className="h-[54px] border-b border-[#ededed] last:border-b-0">
                      <td className="px-[16px]">{member.id}</td>
                      <td className="px-[16px]">{member.name}</td>
                      <td className="px-[16px]">{member.endDate}</td>
                      <td className="px-[16px]">{member.remaining}</td>
                      <td className="px-[16px]">
                        <span className="rounded-full bg-[#fff0b8] px-[12px] py-[6px] text-[#7a5b00]">
                          {member.status}
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
