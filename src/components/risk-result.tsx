import type { RiskItem, RiskLevel } from "@/lib/types";

const riskMeta: Record<
  RiskLevel,
  { label: string; sublabel: string; dot: string; text: string; bg: string }
> = {
  red: {
    label: "红",
    sublabel: "违法/必须处理",
    dot: "bg-[#EF4444]",
    text: "text-[#EF4444]",
    bg: "bg-red-50",
  },
  yellow: {
    label: "黄",
    sublabel: "存在争议/建议修改",
    dot: "bg-[#F59E0B]",
    text: "text-[#D97706]",
    bg: "bg-amber-50",
  },
  green: {
    label: "绿",
    sublabel: "合规/可保留",
    dot: "bg-[#22C55E]",
    text: "text-[#16A34A]",
    bg: "bg-emerald-50",
  },
};

export function RiskResult({ items }: { items: RiskItem[] }) {
  const highest = items.some((item) => item.level === "red") ? "red" : "yellow";

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-5 text-base font-semibold text-slate-800">风险等级</h2>
        <div className="grid grid-cols-3 gap-2 text-center">
          {(Object.keys(riskMeta) as RiskLevel[]).map((level) => {
            const meta = riskMeta[level];
            return (
              <div key={level} className="flex flex-col items-center gap-1">
                <span
                  className={`grid h-11 w-11 place-items-center rounded-full text-base font-semibold text-white ${meta.dot}`}
                >
                  {meta.label}
                </span>
                <span className="text-[10px] leading-4 text-slate-500">
                  {meta.sublabel}
                </span>
              </div>
            );
          })}
        </div>
        <p
          className={`mt-4 rounded-lg px-3 py-2 text-center text-xs font-medium ${riskMeta[highest].bg} ${riskMeta[highest].text}`}
        >
          当前合同存在红色风险：需优先修改
        </p>
      </section>

      {items.map((item) => (
        <article key={item.id} className="space-y-4">
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-base font-semibold text-slate-800">
              风险说明
            </h2>
            <p className="text-sm leading-6 text-slate-600">{item.description}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
              <span className="rounded-full bg-slate-50 px-3 py-1.5">
                影响对象：{item.affectedParty}
              </span>
              <span className="rounded-full bg-slate-50 px-3 py-1.5">
                风险类型：{item.riskType}
              </span>
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-base font-semibold text-slate-800">
              修改建议
            </h2>
            <p className="text-sm leading-6 text-slate-600">{item.suggestion}</p>
            <button
              type="button"
              className="mt-4 h-9 w-full rounded-lg bg-blue-50 text-left text-sm font-medium text-[#2563EB]"
            >
              可操作：生成修改后条款
            </button>
          </section>
        </article>
      ))}
    </div>
  );
}
