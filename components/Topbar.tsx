export default function Topbar() {
  return (
    <header className="fixed left-0 right-0 top-0 z-20 flex h-[76px] items-center justify-between border-b border-[#dedede] bg-white px-6 md:left-[240px] md:px-[36px]">
      <h1 className="text-[22px] font-bold text-[#1a1a1a] md:text-[24px]">Dashboard Member</h1>
      <div className="flex items-center gap-[16px]">
        <div className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-[#171717]">
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[20px] w-[20px] fill-white">
            <circle cx="12" cy="8" r="3.5" />
            <path d="M5 19c0-4 3-6 7-6s7 2 7 6H5z" />
          </svg>
        </div>
        <span className="hidden text-[13px] font-bold text-[#1a1a1a] sm:inline">Member</span>
        <button
          type="button"
          className="h-[38px] rounded-[4px] border border-[#1a1a1a] px-[18px] text-[13px] font-bold text-[#252525]"
        >
          Keluar
        </button>
      </div>
    </header>
  );
}
