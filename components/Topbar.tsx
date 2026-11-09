"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type TopbarProps = {
  title?: string;
  role?: "member" | "admin" | "barber" | "owner" | "supplier";
};

export default function Topbar({
  title = "Dashboard Member",
  role = "member",
}: TopbarProps) {
  const router = useRouter();
  const [logoutError, setLogoutError] = useState("");

  const roleLabels = {
    member: "Member",
    admin: "Administrator",
    barber: "Barber",
    owner: "Owner",
    supplier: "Supplier",
  };

  async function handleLogout() {
    setLogoutError("");
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) {
        throw new Error("Logout request failed.");
      }
      router.push("/");
    } catch {
      setLogoutError("Gagal keluar. Silakan coba lagi.");
    }
  }

  return (
    <header className="fixed left-0 right-0 top-0 z-20 flex h-[76px] items-center justify-between border-b border-[#dedede] bg-white px-6 md:left-[240px] md:px-[36px]">
      <h1 className="text-[22px] font-bold text-[#1a1a1a] md:text-[24px]">{title}</h1>
      <div className="flex items-center gap-[16px]">
        <div className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-[#171717]">
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[20px] w-[20px] fill-white">
            <circle cx="12" cy="8" r="3.5" />
            <path d="M5 19c0-4 3-6 7-6s7 2 7 6H5z" />
          </svg>
        </div>
        <span className="hidden text-[13px] font-bold text-[#1a1a1a] sm:inline">
          {roleLabels[role]}
        </span>
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex h-[38px] items-center justify-center rounded-[4px] border border-[#1a1a1a] px-[18px] text-[13px] font-bold text-[#252525]"
        >
          Keluar
        </button>
        {logoutError && (
          <span role="alert" className="text-[12px] text-red-600">
            {logoutError}
          </span>
        )}
      </div>
    </header>
  );
}
