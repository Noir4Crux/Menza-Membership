"use client";

import { usePathname } from "next/navigation";

export type MemberRole = "member" | "admin" | "barber" | "owner" | "supplier";

type SidebarProps = {
  role: MemberRole;
};

const memberMenuItems = [
  { label: "Dashboard", icon: "grid", href: "/member/dashboard" },
  { label: "Pilih Layanan", icon: "service", href: "/member/layanan" },
  { label: "Info Membership", icon: "crown", href: "/member/membership" },
  { label: "Riwayat Transaksi", icon: "history", href: "/member/riwayat" },
];

const adminMenuItems = [
  { label: "Dashboard", icon: "grid", href: "/admin/dashboard" },
  { label: "Daftar Member", icon: "members", href: "/admin/member" },
  { label: "Verifikasi Data", icon: "verify", href: "/admin/verifikasi" },
  { label: "Catat Transaksi", icon: "transaction", href: "/admin/transaksi" },
  { label: "Masa Berlaku", icon: "calendar", href: "/admin/masa-berlaku" },
  { label: "Notifikasi", icon: "bell", href: "/admin/notifikasi" },
  { label: "Laporan Bulanan", icon: "report", href: "/admin/laporan" },
];

const barberMenuItems = [
  { label: "Dashboard", icon: "grid", href: "/barber/dashboard" },
  { label: "Daftar Layanan", icon: "service", href: "/barber/layanan" },
  { label: "Stok Produk", icon: "stock", href: "/barber/stok" },
];

const ownerMenuItems = [
  { label: "Menu Utama", icon: "grid", href: "/owner/dashboard" },
  { label: "Notifikasi", icon: "bell", href: "/owner/notifikasi" },
  { label: "Rekap Transaksi", icon: "transaction", href: "/owner/rekap" },
  { label: "Laporan Bulanan", icon: "report", href: "/owner/laporan" },
];

const supplierMenuItems = [
  { label: "Dashboard", icon: "grid", href: "/supplier/dashboard" },
  { label: "Rincian Pesanan", icon: "orders", href: "/supplier/pesanan" },
  { label: "Riwayat Transaksi", icon: "history", href: "/supplier/riwayat" },
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

  if (name === "members") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[20px] w-[20px] fill-none stroke-current">
        <circle cx="9" cy="8" r="3" strokeWidth="1.8" />
        <path d="M3 19c0-3.3 2.7-6 6-6s6 2.7 6 6" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="17" cy="9" r="2.5" strokeWidth="1.8" />
        <path d="M15 14c3.3 0 6 2.2 6 5" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === "verify") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[20px] w-[20px] fill-none stroke-current">
        <circle cx="12" cy="12" r="9" strokeWidth="1.8" />
        <path d="m7.8 12.1 2.7 2.7 5.9-6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (name === "transaction") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[20px] w-[20px] fill-none stroke-current">
        <path d="M6 3h12v18l-2-1.2-2 1.2-2-1.2-2 1.2-2-1.2L6 21V3z" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M9 7h6M9 11h6M9 15h3" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === "calendar") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[20px] w-[20px] fill-none stroke-current">
        <rect x="3" y="5" width="18" height="16" rx="2" strokeWidth="1.8" />
        <path d="M8 3v4M16 3v4M3 10h18" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M7 14h3v3H7z" strokeWidth="1.5" />
      </svg>
    );
  }

  if (name === "bell") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[20px] w-[20px] fill-none stroke-current">
        <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9z" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M10 21h4" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === "report") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[20px] w-[20px] fill-none stroke-current">
        <path d="M4 20V9M10 20V4M16 20v-7M22 20V11" strokeWidth="2" strokeLinecap="round" />
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

  if (name === "stock") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[20px] w-[20px] fill-none stroke-current">
        <path d="m3 7 9-4 9 4-9 4-9-4zM3 12l9 4 9-4M3 17l9 4 9-4" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    );
  }

  if (name === "orders") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[20px] w-[20px] fill-none stroke-current">
        <path d="M4 8h16l-1 13H5L4 8zM8 8a4 4 0 0 1 8 0M9 12v5M15 12v5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (name === "history") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[20px] w-[20px] fill-none stroke-current">
        <path d="M3 12a9 9 0 1 0 3-6.7L3 8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3 3v5h5M12 7v5l3 2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
  const menusByRole = {
    member: memberMenuItems,
    admin: adminMenuItems,
    barber: barberMenuItems,
    owner: ownerMenuItems,
    supplier: supplierMenuItems,
  };
  const menuItems = menusByRole[role];
  const isServicePage =
    pathname === "/member/layanan" || pathname === "/member/ringkasan";
  const isHistoryPage = pathname.startsWith("/member/riwayat");
  const menuTitles = {
    member: "Menu Member",
    admin: "Menu Administrator",
    barber: "Menu Barber",
    owner: "Menu Owner",
    supplier: "Menu Supplier",
  };

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

      <nav key={role} className="mt-[18px] flex flex-col gap-[2px]" aria-label={`${role} navigation`}>
        {role !== "member" && (
          <div className="px-[30px] pb-[10px] text-[11px] font-bold text-[#bdbdbd]">
            {menuTitles[role]}
          </div>
        )}
        {menuItems.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className={`flex h-[50px] items-center gap-[18px] px-[30px] text-[13px] font-bold ${
              (pathname === item.href ||
                pathname.startsWith(`${item.href}/`) ||
                (item.href === "/member/layanan" && isServicePage) ||
                (item.href === "/member/riwayat" && isHistoryPage))
                ? "border-l-4 border-[#f5c842] bg-black pl-[26px]"
                : "text-white"
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
