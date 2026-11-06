import Sidebar from "../../../components/Sidebar";
import Topbar from "../../../components/Topbar";

const services = [
  {
    name: "By Senior Kapster",
    description:
      "Haircut, Hair wash, Hot towel, Vitamin, Head Message, Styling with Product",
    price: "Rp 80.000",
  },
  {
    name: "By Junior Kapster",
    description:
      "Haircut, Hair wash, Hot towel, Vitamin, Head Message, Styling with Product",
    price: "Rp 60.000",
  },
];

function ScissorsIcon({ className = "h-20 w-20" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      aria-hidden="true"
      className={`${className} fill-none stroke-black`}
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

export default function PilihLayananPage() {
  return (
    <div className="min-h-screen bg-[#efefed] font-sans text-[#1a1a1a]">
      <Sidebar role="member" />
      <Topbar title="Pilih Layanan" />

      <main className="min-h-screen pt-[76px] md:ml-[240px]">
        <div className="mx-auto w-full max-w-[1200px] px-5 py-[24px] md:px-[36px]">
          <p className="text-[20px] text-[#6b6b66]">
            Pilih Layanan yang ingin Anda gunakan
          </p>

          <label className="mt-[24px] flex h-[50px] items-center gap-[12px] rounded-[8px] bg-white px-[14px] shadow-[0_0_0_1px_rgba(0,0,0,0.02)]">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[24px] w-[24px] fill-none stroke-[#6b6b66]">
              <circle cx="11" cy="11" r="7" strokeWidth="2" />
              <path d="M16 16l5 5" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              placeholder="Cari layanan..."
              className="min-w-0 flex-1 bg-transparent text-[18px] outline-none placeholder:text-[#6b6b66]"
            />
          </label>

          <section className="mt-[18px] grid min-h-[445px] overflow-hidden rounded-[24px] border border-[#d9d9d9] bg-[#d9d9d9] md:grid-cols-[350px_1fr]">
            <div className="flex min-h-[445px] flex-col items-center justify-center gap-[20px] bg-white px-[18px]">
              <div className="flex h-[150px] w-[270px] items-center justify-center rounded-[8px] border border-[#d9d9d9]">
                <ScissorsIcon />
              </div>
              <h2 className="text-[40px] font-bold leading-none">Haircut</h2>
            </div>

            <div className="flex flex-col justify-center gap-[14px] bg-white px-4 py-6 md:px-[22px]">
              {services.map((service) => (
                <article
                  key={service.name}
                  className="rounded-[8px] border border-[#dfe0df] bg-white px-[14px] py-[13px]"
                >
                  <h3 className="text-[18px] font-bold">{service.name}</h3>
                  <p className="mt-[1px] max-w-[610px] text-[16px] leading-[20px] text-[#6b6b66]">
                    {service.description}
                  </p>
                  <div className="mt-[10px] flex items-center gap-[16px]">
                    <strong className="flex-1 text-[16px]">{service.price}</strong>
                    <button
                      type="button"
                      className="h-[44px] w-[280px] max-w-[45%] rounded-[8px] border border-[#ddddda] bg-white text-[16px] font-bold hover:bg-[#f5f5f3]"
                    >
                      Pilih
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-[30px]">
            <h2 className="text-[24px] font-bold">Layanan yang Dipilih</h2>
            <div className="mt-[16px] flex h-[68px] items-center justify-center rounded-[8px] bg-white text-[18px] text-[#6b6b66]">
              Belum ada layanan yang dipilih
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
