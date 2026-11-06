import Sidebar from "../../../components/Sidebar";
import Topbar from "../../../components/Topbar";

function ScissorsIcon() {
  return (
    <svg
      viewBox="0 0 100 100"
      aria-hidden="true"
      className="h-[60px] w-[60px] fill-none stroke-black"
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

export default function RingkasanPembayaranPage() {
  return (
    <div className="min-h-screen bg-[#efefed] font-sans text-[#1a1a1a]">
      <Sidebar role="member" />
      <Topbar title="Pilih Layanan" />

      <main className="min-h-screen pt-[76px] md:ml-[240px]">
        <div className="mx-auto w-full max-w-[1200px] px-5 py-[24px] md:px-[36px]">
          <h1 className="text-[20px] font-bold">Ringkasan Pembayaran</h1>
          <p className="mt-[2px] text-[18px] text-[#6b6b66]">
            Periksa kembali detail pesanan Anda
          </p>

          <section className="mt-[24px] w-full max-w-[525px] rounded-[8px] border border-[#ededeb] bg-white px-[20px] pb-[20px] pt-[22px] shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between">
              <h2 className="text-[16px] font-bold">Detail Layanan</h2>
              <button type="button" className="text-[15px] font-bold">
                Ubah
              </button>
            </div>

            <div className="mt-[18px] flex items-center gap-[16px]">
              <div className="flex h-[72px] w-[72px] items-center justify-center rounded-[6px] bg-[#e8e8e8]">
                <ScissorsIcon />
              </div>
              <div>
                <p className="text-[16px] font-bold">Haircut by Senior Kapster</p>
                <p className="mt-[1px] text-[16px] text-[#6b6b66]">Rp 80.000</p>
              </div>
            </div>

            <div className="mt-[18px] border-t border-[#dedede] pt-[20px] text-[16px]">
              <div className="flex justify-between text-[#6b6b66]">
                <span>Subtotal</span>
                <span>Rp 80.000</span>
              </div>
              <div className="mt-[18px] flex justify-between text-[#6b6b66]">
                <span>Diskon (Poin)</span>
                <span>-Rp 0</span>
              </div>
            </div>

            <div className="mt-[20px] flex justify-between border-t border-[#dedede] pt-[18px] text-[20px] font-bold">
              <span>Total</span>
              <span>Rp 80.000</span>
            </div>

            <div className="mt-[18px] flex h-[65px] items-center gap-[12px] rounded-[8px] bg-[#efefef] px-[16px]">
              <div className="flex h-[38px] w-[38px] items-center justify-center rounded-full border-[3px] border-[#d5aa21] bg-[#f7c948] text-[18px] text-white">
                P
              </div>
              <div>
                <p className="text-[15px] font-bold">Saldo Poin Anda</p>
                <p className="text-[14px] text-[#6b6b66]">250 Poin</p>
              </div>
            </div>

            <div className="mt-[18px]">
              <h3 className="text-[16px] font-bold">Gunakan Poin?</h3>
              <p className="mt-[2px] text-[15px] text-[#6b6b66]">
                Tukarkan poin untuk mendapatkan diskon
              </p>
              <div className="mt-[12px] grid grid-cols-2 gap-[16px]">
                <button
                  type="button"
                  className="h-[42px] rounded-[8px] border border-[#d9d9d7] bg-white text-[16px] font-bold"
                >
                  Ya
                </button>
                <button
                  type="button"
                  className="h-[42px] rounded-[8px] border border-[#d9d9d7] bg-white text-[16px] font-bold"
                >
                  Tidak
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
