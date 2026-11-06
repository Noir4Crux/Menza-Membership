import Sidebar from "../../../components/Sidebar";
import Topbar from "../../../components/Topbar";

function WarningIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-[34px] w-[34px] fill-none stroke-[#1a1a1a]"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2L1 21h22L12 2z" strokeWidth="1.8" />
      <path d="M12 8v6M12 18v.5" strokeWidth="2" />
    </svg>
  );
}

export default function MembershipPage() {
  return (
    <div className="min-h-screen bg-[#efefed] font-sans text-[#1a1a1a]">
      <Sidebar role="member" />
      <Topbar title="Info Membership" />

      <main className="min-h-screen pt-[76px] md:ml-[240px]">
        <div className="mx-auto w-full max-w-[1200px] px-5 py-[24px] md:px-[36px]">
          <p className="text-[18px] text-[#6b6b66]">
            Lihat detail status dan masa berlaku membership
          </p>

          <section className="mt-[24px] grid overflow-hidden rounded-[8px] border border-[#ededeb] bg-white md:grid-cols-[345px_1fr]">
            <div className="relative mx-[20px] my-[20px] overflow-hidden rounded-[38px] bg-[#171717] text-white">
              <div className="absolute inset-y-[-20%] right-[-12%] w-[180px] rotate-[32deg] border-l border-[#efbd24]/70 bg-[#171717]" />
              <div className="relative flex h-[170px] flex-col justify-center px-[26px]">
                <div className="flex items-center gap-[9px]">
                  <div className="flex h-[28px] w-[28px] items-center justify-center rounded-[3px] bg-white text-[18px] font-bold text-black">
                    M
                  </div>
                  <span className="text-[14px] font-bold">MENZA</span>
                </div>
                <p className="mt-[18px] text-[13px] font-bold">Faiz</p>
                <p className="mt-[5px] text-[12px] font-bold">ID00001</p>
              </div>
            </div>

            <div className="flex flex-col justify-center px-[20px] py-[24px]">
              <div className="flex items-start justify-between">
                <h2 className="text-[16px] font-bold">Status Membership</h2>
                <span className="rounded-full bg-[#d7f3e5] px-[18px] py-[7px] text-[16px] font-bold text-[#18794e]">
                  Aktif
                </span>
              </div>
              <dl className="mt-[20px] space-y-[16px] text-[16px]">
                <div className="flex gap-[16px]">
                  <dt className="w-[160px] text-[#6b6b66]">Nama Member</dt>
                  <dd className="font-bold">Faiz</dd>
                </div>
                <div className="flex gap-[16px]">
                  <dt className="w-[160px] text-[#6b6b66]">ID Membership</dt>
                  <dd className="font-bold">ID00001</dd>
                </div>
                <div className="flex gap-[16px]">
                  <dt className="w-[160px] text-[#6b6b66]">Masa Berlaku</dt>
                  <dd className="font-bold">01 Jan 2026 - 01 Jan 2027</dd>
                </div>
              </dl>
            </div>
          </section>

          <div className="mt-[20px] grid gap-[20px] md:grid-cols-2">
            <section className="flex min-h-[115px] items-center gap-[16px] rounded-[8px] border border-[#ededeb] bg-white px-[18px]">
              <div className="flex h-[46px] w-[46px] items-center justify-center rounded-full border-[4px] border-[#d5aa21] bg-[#f7c948] text-[20px] text-white">
                P
              </div>
              <div>
                <p className="text-[16px] text-[#6b6b66]">Jumlah Poin</p>
                <p className="text-[16px] font-bold">250 Poin</p>
              </div>
            </section>

            <section className="min-h-[115px] rounded-[8px] border border-[#ededeb] bg-white px-[18px] py-[16px]">
              <div className="flex gap-[14px]">
                <WarningIcon />
                <div>
                  <h2 className="text-[16px] font-bold">Masa berlaku hampir habis</h2>
                  <p className="mt-[8px] text-[14px] text-[#6b6b66]">
                    Tersisa 15 hari lagi. Segera perpanjang membership Anda!
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="mt-[12px] h-[38px] w-full rounded-[6px] border border-[#d9d9d7] bg-[#f5f5f4] text-[15px] font-bold"
              >
                Perpanjang Membership
              </button>
            </section>
          </div>

          <section className="mt-[24px]">
            <h2 className="text-[20px] font-bold">Benefit Membership</h2>
            <div className="mt-[16px] grid rounded-[8px] border border-[#ededeb] bg-white md:grid-cols-2">
              <div className="grid grid-flow-col grid-cols-2 grid-rows-2 gap-y-[32px] px-[28px] py-[28px] text-[18px] text-[#6b6b66]">
                <span>Diskon</span>
                <span>Poin setiap transaksi</span>
                <span>Prioritas antrean</span>
                <span>Promo khusus member</span>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
