"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "../../../components/Sidebar";
import Topbar from "../../../components/Topbar";

type Service = {
  LayananID: string;
  NamaLayanan: string;
  HargaLayanan: number;
  kategori: string | null;
  label: string | null;
  deskripsi: string | null;
};

const categories = ["Haircut", "Full Service", "Other Service", "Coloring"];

function formatRupiah(amount: number) {
  return `Rp ${Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
}

function CategoryIcon({ category }: { category: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      aria-hidden="true"
      className="h-20 w-20 fill-none stroke-black"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {category === "Haircut" ? (
        <>
          <path d="M11 15l32 34M89 15L57 49" strokeWidth="7" />
          <circle cx="31" cy="72" r="15" strokeWidth="7" />
          <circle cx="69" cy="72" r="15" strokeWidth="7" />
          <path d="M43 61l7-12 7 12M50 49v14" strokeWidth="7" />
        </>
      ) : (
        <>
          <circle cx="50" cy="50" r="31" strokeWidth="7" />
          <path d="M50 19v62M19 50h62" strokeWidth="6" />
          <circle cx="50" cy="50" r="10" strokeWidth="6" />
        </>
      )}
    </svg>
  );
}

export default function PilihLayananPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    async function loadServices() {
      try {
        const response = await fetch("/api/member/layanan", {
          signal: controller.signal,
        });
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || "Gagal memuat layanan.");
        }
        setServices(result.data as Service[]);
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Gagal memuat layanan.",
          );
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadServices();
    return () => controller.abort();
  }, []);

  const visibleServices = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    if (!query) return services;
    return services.filter((service) =>
      [
        service.NamaLayanan,
        service.label ?? "",
        service.deskripsi ?? "",
      ]
        .join(" ")
        .toLocaleLowerCase()
        .includes(query),
    );
  }, [search, services]);

  const selectedService = services.find(
    (service) => service.LayananID === selectedId,
  );

  function displayName(service: Service) {
    return service.label
      ? `${service.NamaLayanan} ${service.label.toLowerCase()}`
      : service.NamaLayanan;
  }

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
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-[24px] w-[24px] fill-none stroke-[#6b6b66]"
            >
              <circle cx="11" cy="11" r="7" strokeWidth="2" />
              <path d="M16 16l5 5" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              placeholder="Cari layanan..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="min-w-0 flex-1 bg-transparent text-[18px] outline-none placeholder:text-[#6b6b66]"
            />
          </label>

          {error && (
            <p role="alert" className="mt-3 text-sm text-red-600">
              {error}
            </p>
          )}
          {loading && <p className="mt-4 text-[#6b6b66]">Memuat...</p>}

          <div className="mt-[18px] space-y-[18px]">
            {categories.map((category) => {
              const categoryServices = visibleServices.filter(
                (service) => service.kategori === category,
              );
              return (
                <section
                  key={category}
                  className="grid min-h-[260px] overflow-hidden rounded-[24px] border border-[#d9d9d9] bg-[#d9d9d9] md:grid-cols-[350px_1fr]"
                >
                  <div className="flex min-h-[220px] flex-col items-center justify-center gap-[20px] bg-white px-[18px]">
                    <div className="flex h-[150px] w-[270px] items-center justify-center rounded-[8px] border border-[#d9d9d9]">
                      <CategoryIcon category={category} />
                    </div>
                    <h2 className="text-[32px] font-bold leading-none">
                      {category}
                    </h2>
                  </div>
                  <div className="flex flex-col justify-center gap-[14px] bg-white px-4 py-6 md:px-[22px]">
                    {categoryServices.map((service) => (
                      <article
                        key={service.LayananID}
                        className="rounded-[8px] border border-[#dfe0df] bg-white px-[14px] py-[13px]"
                      >
                        <h3 className="text-[18px] font-bold">
                          {service.label ?? service.NamaLayanan}
                        </h3>
                        {service.deskripsi && (
                          <p className="mt-[1px] max-w-[610px] text-[16px] leading-[20px] text-[#6b6b66]">
                            {service.deskripsi}
                          </p>
                        )}
                        <div className="mt-[10px] flex items-center gap-[16px]">
                          <strong className="flex-1 text-[16px]">
                            {formatRupiah(service.HargaLayanan)}
                          </strong>
                          <button
                            type="button"
                            aria-pressed={selectedId === service.LayananID}
                            onClick={() => setSelectedId(service.LayananID)}
                            className={`h-[44px] w-[280px] max-w-[45%] rounded-[8px] border border-[#ddddda] text-[16px] font-bold hover:bg-[#f5f5f3] ${
                              selectedId === service.LayananID
                                ? "bg-[#1a1a1a] text-white"
                                : "bg-white"
                            }`}
                          >
                            {selectedId === service.LayananID
                              ? "Dipilih"
                              : "Pilih"}
                          </button>
                        </div>
                      </article>
                    ))}
                    {!loading && categoryServices.length === 0 && (
                      <p className="text-center text-[16px] text-[#6b6b66]">
                        Tidak ada layanan yang cocok.
                      </p>
                    )}
                  </div>
                </section>
              );
            })}
          </div>

          <section className="mt-[30px]">
            <h2 className="text-[24px] font-bold">Layanan yang Dipilih</h2>
            {selectedService ? (
              <div className="mt-[16px] flex flex-wrap items-center gap-4 rounded-[8px] bg-white p-4">
                <div className="min-w-0 flex-1">
                  <p className="text-[18px] font-bold">
                    {displayName(selectedService)}
                  </p>
                  <p className="mt-1 text-[16px] text-[#6b6b66]">
                    {formatRupiah(selectedService.HargaLayanan)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedId("")}
                  className="rounded-[6px] border border-[#d9d9d7] px-3 py-2 text-sm font-bold hover:bg-[#f5f5f3]"
                >
                  Hapus
                </button>
                <a
                  href={`/member/ringkasan?layanan=${encodeURIComponent(selectedService.LayananID)}`}
                  className="flex min-h-[44px] w-full items-center justify-center rounded-[8px] bg-black px-4 text-[15px] font-bold text-white hover:bg-[#333] sm:w-auto"
                >
                  Konfirmasi Layanan
                </a>
              </div>
            ) : (
              <div className="mt-[16px] flex h-[68px] items-center justify-center rounded-[8px] bg-white text-[18px] text-[#6b6b66]">
                Belum ada layanan yang dipilih
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
