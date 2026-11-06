import { Suspense } from "react";
import Sidebar from "../../../../components/Sidebar";
import Topbar from "../../../../components/Topbar";

type DetailTransactionPageProps = {
  params: Promise<{ id: string }>;
};

async function DetailTransaksi({
  params,
}: DetailTransactionPageProps) {
  await params;

  const details = [
    ["No Transaksi", "TK0000005"],
    ["Tanggal", "26 Oktober 2026"],
    ["Layanan", "Haircut by Senior Kapster"],
    ["Total Pembayaran", "Rp 55.000"],
    ["Diskon (Poin)", "Rp 25.000"],
    ["Status", "Berhasil"],
  ] as const;

  return (
    <div className="min-h-screen bg-[#efefed] font-sans text-[#1a1a1a]">
      <Sidebar role="member" />
      <Topbar title="Riwayat Transaksi" />

      <main className="min-h-screen pt-[76px] md:ml-[240px]">
        <div className="mx-auto w-full max-w-[1200px] px-5 py-[24px] md:px-[36px]">
          <p className="text-[18px] text-[#6b6b66]">
            Lihat riwayat transaksi dan kunjungan Anda
          </p>

          <div className="mt-[24px] grid gap-[16px] lg:grid-cols-[510px_340px]">
            <section className="overflow-hidden rounded-[8px] border border-[#ededeb] bg-white">
              <h1 className="px-[20px] pt-[18px] text-[16px] font-bold">
                Detail Transaksi
              </h1>
              <div className="mt-[12px]">
                {details.map(([label, value]) => (
                  <div
                    key={label}
                    className="flex min-h-[52px] items-center justify-between border-t border-[#ededeb] px-[20px] text-[14px]"
                  >
                    <span className="text-[#6b6b66]">{label}</span>
                    {label === "Status" ? (
                      <span className="rounded-full bg-[#d7f3e5] px-[14px] py-[5px] font-bold text-[#18794e]">
                        {value}
                      </span>
                    ) : (
                      <span className={label === "Layanan" ? "font-bold" : ""}>
                        {value}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <section className="h-fit rounded-[8px] border border-[#ededeb] bg-white px-[20px] pt-[18px]">
              <h2 className="text-[16px] font-bold">Poin</h2>
              <div className="mt-[12px]">
                <div className="flex min-h-[52px] items-center justify-between border-t border-[#ededeb] text-[14px]">
                  <span className="text-[#6b6b66]">Poin diperoleh</span>
                  <span className="font-bold">+ 5 Poin</span>
                </div>
                <div className="flex min-h-[52px] items-center justify-between border-t border-[#ededeb] text-[14px]">
                  <span className="text-[#6b6b66]">Total poin sekarang</span>
                  <span className="font-bold">250 Poin</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function DetailTransaksiPage(props: DetailTransactionPageProps) {
  return (
    <Suspense fallback={null}>
      <DetailTransaksi {...props} />
    </Suspense>
  );
}
