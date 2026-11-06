"use client";

import { usePathname } from "next/navigation";

export type MemberRole = "member" | "admin" | "barber" | "owner" | "supplier";

type SidebarProps = {
  role: MemberRole;
};

const menuItems = [
  { label: "Dashboard", icon: "grid", href: "/member/dashboard" },
  { label: "Pilih Layanan", icon: "service", href: "/member/layanan" },
  { label: "Info Membership", icon: "crown", href: "#" },
  { label: "Riwayat Transaksi", icon: "history", href: "#" },
];

function MenuIcon({ name }: { name: string }) {
  if (name === "grid") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px] fill-none stroke-current">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    );
  }

  if (name === "service") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[22px] w-[22px] fill-none stroke-current">
        <path d="M7 3v18M17 3v18M3 8l8 4-8 4M21 8l-8 4 8 4" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === "crown") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[22px] w-[22px] fill-none stroke-current">
        <path d="M3 7l4 4 5-7 5 7 4-4-2 11H5L3 7zM5 21h14" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[20px] w-[20px] fill-none stroke-current">
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 3v5h5M12 7v5l3 2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[240px] flex-col bg-[#181818] text-white md:flex">
      <div className="flex h-[102px] flex-col items-center justify-center border-b border-white/20">
        <div className="flex items-center gap-[10px]">
          <div className="flex h-[35px] w-[35px] items-center justify-center rounded-[4px] bg-white text-[22px] font-bold text-black">
            M
            <span className="-ml-[2px] mt-[-18px] text-[#f5c842]">*</span>
          </div>
          <div>
            <div className="text-[16px] font-bold leading-none tracking-[0.5px]">MENZA</div>
            <div className="mt-[7px] text-[10px] text-[#cccccc]">Membership Barbershop</div>
          </div>
        </div>
      </div>

      <nav className="mt-[18px] flex flex-col gap-[2px]" aria-label={`${role} navigation`}>
        {menuItems.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className={`flex h-[50px] items-center gap-[18px] px-[30px] text-[13px] font-bold ${
              pathname === item.href ? "border-l-4 border-[#f5c842] bg-black pl-[26px]" : "text-white"
            }`}
          >
            <MenuIcon name={item.icon} />
            <span>{item.label}</span>
          </a>
        ))}
      </nav>
    </aside>
  );
}
