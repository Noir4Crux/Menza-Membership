type StatCardProps = {
  title: string;
  value: string;
  description?: string;
  status?: boolean;
  points?: boolean;
};

export default function StatCard({ title, value, description, status, points }: StatCardProps) {
  return (
    <section className="min-h-[151px] rounded-[8px] border border-[#e3e3e0] bg-white px-[18px] py-[16px] shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <h2 className="text-[17px] font-bold text-[#1a1a1a]">{title}</h2>

      {status ? (
        <div className="mt-[14px] inline-flex h-[43px] items-center rounded-full bg-[#d7f3e5] px-[20px] text-[20px] font-bold text-[#18794e]">
          {value}
        </div>
      ) : (
        <div className="mt-[14px] flex items-center gap-[12px]">
          {points && (
            <div className="flex h-[46px] w-[46px] items-center justify-center rounded-full border-[4px] border-[#d5aa21] bg-[#f7c948] text-[20px] text-white">
              P
            </div>
          )}
          <div className="text-[20px] font-bold text-[#1a1a1a]">{value}</div>
        </div>
      )}

      {description && <p className="mt-[18px] whitespace-pre-line text-[18px] leading-[24px] text-[#6b6b66]">{description}</p>}
    </section>
  );
}
