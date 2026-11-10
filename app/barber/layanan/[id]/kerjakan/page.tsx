"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "../../../../../components/Sidebar";
import Topbar from "../../../../../components/Topbar";

type DetailData = {
  member: {
    MemberID: string;
    NamaMember: string;
    StatusMembership: string;
  };
  layanan: {
    namaLayanan: string;
    tanggalKunjungan: string;
    status: string;
    catatan: string | null;
  }[];
};

function KerjakanLayananContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;
  const [detail, setDetail] = useState<DetailData | null>(null);
  const [checked, setChecked] = useState(false);
  const [catatan, setCatatan] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    async function loadDetail() {
      try {
        const response = await fetch(
          `/api/barber/layanan/${encodeURIComponent(id)}`,
          { signal: controller.signal },
        );
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || "Gagal memuat layanan.");
        }
        setDetail(result.data as DetailData);
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

    void loadDetail();
    return () => controller.abort();
  }, [id]);

  async function handleFinish() {
    if (!checked || !catatan.trim() || saving || !detail) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetch(
        `/api/barber/layanan/${encodeURIComponent(id)}/selesai`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ catatan: catatan.trim(), sesuai: checked }),
        },
      );
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Gagal mencatat layanan selesai.");
      }
      setDetail({
        ...detail,
        layanan: detail.layanan.map((service) => ({
          ...service,
          status: "Selesai",
          catatan: catatan.trim(),
        })),
      });
      setSuccess("Layanan berhasil dicatat");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Gagal mencatat layanan selesai.",
      );
    } finally {
      setSaving(false);
    }
  }

  const status = detail?.layanan[0]?.status ?? "";
  const complete = status === "Selesai";

  return (
    <div className="min-h-screen bg-[#f2f2f0] font-sans text-[#252525]">
      <Sidebar role="barber" />
      <Topbar title="Kerjakan & Catat Layanan" role="barber" />
      <main className="min-h-screen pt-[76px] md:ml-[240px]">
        <div className="mx-auto max-w-[1200px] px-5 py-[28px] md:px-[28px]">
          {loading && <p className="text-[14px] text-[#777]">Memuat...</p>}
          {error && (
            <p role="alert" className="mb-4 text-[13px] text-red-600">
              {error}
            </p>
          )}
          {success && (
            <p role="status" className="mb-4 text-[13px] text-green-700">
              {success}
            </p>
          )}

          {detail && (
            <>
              <section className="rounded-[8px] border border-[#d9d9d9] bg-white px-[20px] pb-[20px] pt-[18px]">
                <h1 className="text-[16px] font-bold">
                  Layanan yang Dikerjakan
                </h1>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[700px] border-collapse text-left text-[13px]">
                    <thead>
                      <tr className="h-[44px] border-b border-[#ececec] font-bold">
                        <th className="px-3">ID Member</th>
                        <th className="px-3">Nama Member</th>
                        <th className="px-3">Layanan</th>
                        <th className="px-3">Status Layanan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.layanan.map((service, index) => (
                        <tr
                          key={`${service.namaLayanan}-${index}`}
                          className="h-[50px] border-b border-[#ececec] last:border-0"
                        >
                          <td className="px-3">{detail.member.MemberID}</td>
                          <td className="px-3">{detail.member.NamaMember}</td>
                          <td className="px-3">{service.namaLayanan}</td>
                          <td className="px-3">{service.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="mt-[18px] rounded-[8px] border border-[#d9d9d9] bg-white px-[20px] pb-[22px] pt-[18px]">
                <h2 className="text-[16px] font-bold">Catat Layanan</h2>
                {complete ? (
                  <p className="mt-4 text-[14px] text-[#18794e]">
                    Layanan sudah selesai
                    {detail.layanan[0]?.catatan
                      ? ` — ${detail.layanan[0].catatan}`
                      : ""}
                  </p>
                ) : (
                  <>
                    <label className="mt-4 flex cursor-pointer items-center gap-3 text-[14px]">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(event) => setChecked(event.target.checked)}
                        className="h-5 w-5 accent-black"
                      />
                      <span>Layanan selesai</span>
                    </label>
                    <label
                      htmlFor="catatan-layanan"
                      className="mt-4 block text-[14px] font-bold"
                    >
                      Catatan Layanan
                    </label>
                    <textarea
                      id="catatan-layanan"
                      value={catatan}
                      onChange={(event) => setCatatan(event.target.value)}
                      maxLength={300}
                      rows={4}
                      placeholder="Masukkan catatan layanan (maks. 300 karakter)"
                      className="mt-2 w-full rounded-[6px] border border-[#c9c9c9] px-3 py-2 text-[14px] outline-none focus:border-[#777]"
                    />
                    <button
                      type="button"
                      onClick={() => void handleFinish()}
                      disabled={!checked || !catatan.trim() || saving}
                      className={`mt-4 min-h-[42px] rounded-[6px] px-[20px] text-[13px] font-bold text-white ${
                        !checked || !catatan.trim() || saving
                          ? "cursor-not-allowed bg-[#999]"
                          : "bg-[#171717] hover:bg-[#333]"
                      }`}
                    >
                      {saving ? "Menyimpan..." : "Catat Layanan Selesai"}
                    </button>
                  </>
                )}
              </section>

              <div className="mt-[18px] flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() =>
                    router.push(`/barber/layanan/${encodeURIComponent(id)}`)
                  }
                  className="min-h-[42px] rounded-[6px] border border-[#c9c9c9] bg-white px-[20px] text-[13px] font-bold hover:bg-[#f5f5f5]"
                >
                  Kembali ke Detail Member
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/barber/dashboard")}
                  className="min-h-[42px] rounded-[6px] bg-[#171717] px-[20px] text-[13px] font-bold text-white hover:bg-[#333]"
                >
                  Kembali ke Dashboard
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default function KerjakanLayananPage() {
  return (
    <Suspense fallback={<p className="p-6 text-[#777]">Memuat...</p>}>
      <KerjakanLayananContent />
    </Suspense>
  );
}
