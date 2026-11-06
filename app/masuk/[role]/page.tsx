import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

type RolePageProps = {
  params: Promise<{ role: string }>;
};

const roles = {
  member: "/member/dashboard",
  administrator: "/admin/dashboard",
  barber: "/barber/dashboard",
  owner: "/owner/dashboard",
  supplier: "/supplier/dashboard",
} as const;

async function LoginRole({ params }: RolePageProps) {
  const { role } = await params;

  if (!(role in roles)) {
    notFound();
  }

  const destination = roles[role as keyof typeof roles];

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
          <div className="relative w-[287px] rounded-[18px] bg-white px-[25px] pb-[32px] pt-[16px]">
            <Link
              href="/masuk"
              aria-label="Kembali memilih role"
              className="absolute right-[12px] top-[8px] flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[#454545] text-[20px] leading-none text-white"
            >
              ×
            </Link>
            <h1 className="mt-[14px] text-center text-[24px] font-bold text-[#1a1a1a]">
              Login
            </h1>

            <div className="mt-[46px] space-y-[20px]">
              <label className="block">
                <span className="sr-only">Email</span>
                <input
                  type="email"
                  placeholder="Email"
                  className="h-[38px] w-full border-b border-[#777777] bg-transparent px-0 text-[12px] text-[#1a1a1a] outline-none placeholder:text-[#777777]"
                />
              </label>
              <label className="block">
                <span className="sr-only">Password</span>
                <input
                  type="password"
                  placeholder="Password"
                  className="h-[38px] w-full border-b border-[#777777] bg-transparent px-0 text-[12px] text-[#1a1a1a] outline-none placeholder:text-[#777777]"
                />
              </label>
            </div>

            <Link
              href={destination}
              className="mt-[24px] flex h-[36px] items-center justify-center rounded-[6px] bg-[#0d0d0d] text-[12px] text-white"
            >
              Login
            </Link>

            {role === "member" && (
              <p className="mt-[24px] text-center text-[10px] text-[#1a1a1a]">
                Belum punya akun?{" "}
                <Link href="/daftar" className="font-bold">
                  Daftar
                </Link>
              </p>
            )}
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

export default function RoleLoginPage(props: RolePageProps) {
  return (
    <Suspense fallback={null}>
      <LoginRole {...props} />
    </Suspense>
  );
}
