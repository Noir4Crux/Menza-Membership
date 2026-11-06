import Image from "next/image";
import Link from "next/link";

const roles = [
  ["Member", "member"],
  ["Administrator", "administrator"],
  ["Barber", "barber"],
  ["Owner", "owner"],
  ["Supplier", "supplier"],
] as const;

export default function MasukPage() {
  return (
    <main className="grid min-h-screen grid-cols-1 bg-[#474747] font-sans md:grid-cols-[51.25%_48.75%]">
      <section className="relative min-h-screen bg-[#474747]">
        <Link href="/" className="absolute left-[16px] top-[24px] flex items-center gap-[12px] text-white">
          <div className="relative flex h-[50px] w-[50px] items-center justify-center rounded-[8px] bg-white text-[#1a1a1a]">
            <span className="text-[28px] font-bold">M</span>
            <span className="absolute right-[8px] top-[1px] text-[13px] font-bold">*</span>
          </div>
          <span className="text-[16px] font-bold tracking-wide">MENZA</span>
        </Link>

        <div className="flex min-h-screen items-center justify-center px-4 pb-[20px] pt-[120px]">
          <div className="w-[287px] rounded-[18px] bg-white px-[16px] pb-[24px] pt-[48px]">
            <h1 className="text-center text-[20px] font-bold text-[#1a1a1a]">
              Masuk Sebagai
            </h1>
            <div className="mt-[48px] space-y-[18px]">
              {roles.map(([label, slug]) => (
                <Link
                  key={slug}
                  href={`/masuk/${slug}`}
                  className="flex h-[36px] items-center justify-center rounded-[6px] border border-[#9e9e9e] text-[12px] font-bold text-[#1a1a1a] transition-colors duration-200 hover:border-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white active:scale-[0.98]"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="relative min-h-[40vh] overflow-hidden md:min-h-screen">
        <Image
          src="/figma/landing-interior.png"
          alt="Interior Menza Barbershop"
          fill
          sizes="50vw"
          className="object-cover"
          priority
          quality={90}
        />
      </div>
    </main>
  );
}
