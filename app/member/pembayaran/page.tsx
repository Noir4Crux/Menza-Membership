import { Suspense } from "react";
import Sidebar from "../../../components/Sidebar";
import Topbar from "../../../components/Topbar";

type PaymentPageProps = {
  searchParams: Promise<{ poin?: string | string[] }>;
};

const paymentMethods = [
  {
    name: "Transfer Bank",
    detail: "BCA, BNI, BRI, Mandiri, dll",
  },
  {
    name: "QRIS",
    detail: "",
  },
  {
    name: "Cash",
    detail: "",
  },
];

function ScissorsIcon() {
  return (
    <svg
      viewBox="0 0 100 100"
      aria-hidden="true"
      className="h-[58px] w-[58px] fill-none stroke-black"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 15l32 34M89 15L57 49" strokeWidth="7" />
      <circle cx="31" cy="72" r="15" strokeWidth="7" />
      <circle cx="69" cy="72" r="15" strokeWidth="7" />
      <path d="M43 61l7-12 7 12M50 49v14" strokeWidth="7" />
    </svg>
  );
}

async function PembayaranContent({ searchParams }: PaymentPageProps) {
  const params = await searchParams;
  const poinParam = Array.isArray(params.poin) ? params.poin[0] : params.poin;
  const usePoints = poinParam === "ya";
  const discount = usePoints ? "-Rp 25.000" : "-Rp 0";
  const total = usePoints ? "Rp 55.000" : "Rp 80.000";

  return (
    <div className="min-h-screen bg-[#efefed] font-sans text-[#1a1a1a]">
      <Sidebar role="member" />
      <Topbar title="Pilih Layanan" />

      <main className="min-h-screen pt-[76px] md:ml-[240px]">
        <div className="mx-auto w-full max-w-[1200px] px-5 py-[24px] md:px-[36px]">
          <h1 className="text-[20px] font-bold">Pembayaran</h1>
          <p className="mt-[2px] text-[18px] text-[#6b6b66]">
            Lakukan pembayaran sesuai dengan metode yang tersedia
          </p>

          <div className="mt-[24px] grid items-start gap-[24px] lg:grid-cols-[470px_470px]">
            <div>
              <section className="rounded-[8px] border border-[#ededeb] bg-white px-[20px] pt-[22px]">
                <h2 className="text-[16px] font-bold">Ringkasan Pesanan</h2>
                <div className="mt-[18px] flex items-center gap-[14px]">
                  <div className="flex h-[72px] w-[72px] items-center justify-center rounded-[6px] bg-[#e8e8e8]">
                    <ScissorsIcon />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[16px] font-bold">Haircut by Senior Kapster</p>
                  </div>
                  <p className="text-[16px] font-bold">Rp 80.000</p>
                </div>

                <div className="mt-[18px] border-t border-[#dedede] pt-[22px] text-[16px]">
                  <div className="flex justify-between text-[#6b6b66]">
                    <span>Subtotal</span>
                    <span>Rp 80.000</span>
                  </div>
                  <div className="mt-[18px] flex justify-between text-[#6b6b66]">
                    <span>Diskon (Poin)</span>
                    <span>{discount}</span>
                  </div>
                </div>

                <div className="mt-[22px] flex justify-between border-t border-[#dedede] py-[18px] text-[20px] font-bold">
                  <span>Total</span>
                  <span>{total}</span>
                </div>
              </section>

              <section className="mt-[16px] rounded-[8px] border border-[#ededeb] bg-white px-[20px] py-[18px]">
                <h2 className="text-[16px] font-bold">Metode Pembayaran</h2>
                <div className="mt-[12px]">
                  {paymentMethods.map((method, index) => (
                    <label
                      key={method.name}
                      className={`flex min-h-[58px] items-center gap-[14px] ${
                        index > 0 ? "border-t border-[#dedede]" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment-method"
                        defaultChecked={method.name === "QRIS"}
                        className="h-[22px] w-[22px] accent-black"
                      />
                      <span>
                        <span className="block text-[14px] font-bold">{method.name}</span>
                        {method.detail && (
                          <span className="block text-[13px] text-[#6b6b66]">
                            {method.detail}
                          </span>
                        )}
                      </span>
                    </label>
                  ))}
                </div>
              </section>
            </div>

            <aside className="rounded-[8px] border border-[#ededeb] bg-white px-[20px] pb-[24px] pt-[20px] lg:min-h-[470px]">
              <h2 className="text-[16px] font-bold">Instruksi Pembayaran</h2>
              <ol className="mt-[16px] space-y-[14px] text-[16px] text-[#6b6b66]">
                <li>1. Pilih metode pembayaran yang diinginkan</li>
                <li>2. Lakukan pembayaran sesuai nominal</li>
                <li>3. Klik tombol konfirmasi setelah pembayaran selesai</li>
              </ol>
              <button
                type="button"
                className="mt-[20px] h-[48px] w-full rounded-[6px] bg-[#b4b4b4] text-[15px] font-bold text-black"
              >
                Konfirmasi Pembayaran
              </button>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function PembayaranPage({ searchParams }: PaymentPageProps) {
  return (
    <Suspense fallback={null}>
      <PembayaranContent searchParams={searchParams} />
    </Suspense>
  );
}
