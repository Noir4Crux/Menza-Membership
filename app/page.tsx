import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="grid min-h-screen grid-cols-1 bg-[#474747] font-sans md:grid-cols-[51.25%_48.75%]">
      <section className="relative flex min-h-[60vh] items-center bg-[#474747] md:min-h-screen">
        <div className="w-full px-6 md:px-[24px]">
          <div className="flex items-center gap-[10px]">
            <div className="relative flex h-[74px] w-[74px] shrink-0 items-center justify-center">
              <Image
                src="/figma/menza-logo.svg"
                alt=""
                fill
                sizes="74px"
                priority
              />
              <span className="relative -mt-[1px] text-[40px] font-bold leading-none text-[#1a1a1a]">
                M
                <span className="absolute -right-[1px] top-[-12px] text-[18px] text-[#1a1a1a]">
                  *
                </span>
              </span>
            </div>
            <h1 className="whitespace-nowrap text-[clamp(32px,4.7vw,64px)] font-bold leading-none text-white">
              Menza Barbershop
            </h1>
          </div>

          <p className="mt-[24px] ml-[84px] text-[16px] text-[#dedede]">
            Selamat Datang di Menza Barbershop!
          </p>

          <div className="mt-[30px] ml-[84px]">
            <Link
              href="/masuk"
              className="relative flex h-[52px] w-[220px] items-center justify-center overflow-hidden text-[14px] font-bold text-[#1a1a1a]"
            >
              <Image
                src="/figma/login-button.svg"
                alt=""
                fill
                sizes="220px"
                priority
              />
              <span className="relative z-10">Masuk</span>
            </Link>
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
