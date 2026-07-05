"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Download,
  FileCheck,
  Share2,
} from "lucide-react";
import type { ReviewResult, ReviewRisk, DiffSegment, WorkflowRiskColor } from "@/lib/types";
import { StatusBar } from "@/components/mobile-shell";
import { downloadContractAsPdf } from "@/lib/download-contract";
import { cn } from "@/lib/utils";

/* ========== 主组件 ========== */

type Tab = "risk" | "parties" | "original";

export function ReviewResultPage({ data, onBack }: { data: ReviewResult; onBack: () => void }) {
  const [tab, setTab] = useState<Tab>("risk");

  /** 一键导出：原文 + 修改建议 → 合规合同 */
  const compliantContract = useMemo(() => buildCompliantContract(data), [data]);

  function handleExportCompliant() {
    downloadContractAsPdf(
      compliantContract,
      data.contract_meta.title || "房屋租赁合同（合规修订版）",
    );
  }

  return (
    <>
      <StatusBar />
      <header className="relative flex h-12 shrink-0 items-center px-4">
        <div className="flex w-10 justify-start">
          <button
            type="button"
            onClick={onBack}
            aria-label="返回上一步"
            className="grid h-9 w-9 place-items-center rounded-full text-slate-950"
          >
            <ArrowLeft size={24} strokeWidth={2.4} />
          </button>
        </div>
        <div className="absolute left-16 right-16 text-center">
          <h1 className="text-lg font-semibold text-slate-950">
            {tab === "risk" ? "风险" : tab === "parties" ? "基本信息" : "原文"}
          </h1>
        </div>
        <div className="ml-auto flex w-10 justify-end">
          <button
            type="button"
            aria-label="分享"
            className="grid h-9 w-9 place-items-center rounded-full text-slate-950"
          >
            <Share2 size={22} strokeWidth={2} />
          </button>
        </div>
      </header>

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* 顶部结论横幅（§5.3） */}
        {data.risk_level && (
          <ConclusionBanner
            riskLevel={data.risk_level}
            conclusion={data.overall_conclusion}
          />
        )}

        <div className="flex shrink-0 items-center border-b border-slate-200 px-5">
          {(
            [
              { key: "risk", label: "风险" },
              { key: "parties", label: "基本信息" },
              { key: "original", label: "原文" },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={cn(
                "relative px-3 py-3 text-sm font-medium transition-colors",
                tab === t.key ? "text-[#2563EB]" : "text-slate-400",
              )}
            >
              {t.label}
              {tab === t.key && (
                <span className="absolute bottom-0 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-[#2563EB]" />
              )}
            </button>
          ))}

          {/* 一键导出合规合同 */}
          <button
            type="button"
            onClick={handleExportCompliant}
            className="ml-2 flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-600 transition-colors hover:bg-emerald-100"
          >
            <FileCheck size={14} />
            <span className="hidden sm:inline">一键导出合规合同</span>
            <span className="sm:hidden">导出合规</span>
          </button>

          <div className="ml-auto flex items-center">
            <button
              type="button"
              aria-label="下载报告"
              className="grid h-8 w-8 place-items-center rounded-full text-slate-400"
            >
              <Download size={18} />
            </button>
          </div>
        </div>

        <div className="no-scrollbar flex-1 overflow-y-auto">
          {tab === "risk" && <RiskTab risks={data.risks} greenSummary={data.green_summary} />}
          {tab === "parties" && <PartiesTab data={data} />}
          {tab === "original" && <OriginalTab data={data} />}
        </div>
      </div>
    </>
  );
}

/* ========== 结论横幅（§5.3 新增） ========== */

const riskLevelMeta: Record<WorkflowRiskColor, { bg: string; text: string; dot: string; label: string }> = {
  "红": { bg: "bg-red-50 border-red-200", text: "text-red-700", dot: "bg-[#EF4444]", label: "高风险" },
  "黄": { bg: "bg-amber-50 border-amber-200", text: "text-amber-700", dot: "bg-[#F59E0B]", label: "中风险" },
  "绿": { bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700", dot: "bg-[#22C55E]", label: "低风险" },
};

function ConclusionBanner({
  riskLevel,
  conclusion,
}: {
  riskLevel: WorkflowRiskColor;
  conclusion?: string;
}) {
  const meta = riskLevelMeta[riskLevel] ?? riskLevelMeta["绿"];

  return (
    <div className={cn("mx-5 mt-3 rounded-xl border px-4 py-3", meta.bg)}>
      <div className="flex items-center gap-2">
        <span className={cn("h-3 w-3 rounded-full", meta.dot)} />
        <span className={cn("text-sm font-semibold", meta.text)}>
          整体风险：{meta.label}
        </span>
      </div>
      {conclusion && (
        <p className={cn("mt-1.5 text-sm leading-6", meta.text)}>
          {conclusion}
        </p>
      )}
    </div>
  );
}

/* ========== Tab 1：风险 ========== */

function RiskTab({ risks, greenSummary }: { risks: ReviewRisk[]; greenSummary?: string }) {
  const [subTab, setSubTab] = useState<"red" | "yellow">("red");

  const highRisks = risks.filter((r) => r.severity === "high");
  const mediumRisks = risks.filter((r) => r.severity === "medium");
  const filtered = subTab === "red" ? highRisks : mediumRisks;

  return (
    <div className="px-5 pb-8">
      {/* 子标签：红色风险 / 黄色风险 — 粘性定位 */}
      <div className="sticky top-0 z-10 -mx-5 flex items-center justify-between bg-white px-5 pb-3 pt-4">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setSubTab("red")}
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-medium transition-colors",
              subTab === "red"
                ? "bg-[#EF4444] text-white"
                : "bg-slate-100 text-slate-500",
            )}
          >
            红色风险
            {highRisks.length > 0 ? (
              <span className="ml-1">{highRisks.length}</span>
            ) : (
              <span className="ml-1 opacity-70">（无）</span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setSubTab("yellow")}
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-medium transition-colors",
              subTab === "yellow"
                ? "bg-[#F59E0B] text-white"
                : "bg-slate-100 text-slate-500",
            )}
          >
            黄色风险
            {mediumRisks.length > 0 ? (
              <span className="ml-1">{mediumRisks.length}</span>
            ) : (
              <span className="ml-1 opacity-70">（无）</span>
            )}
          </button>
        </div>
      </div>

      {/* 风险卡片列表 */}
      <div className="mt-4 space-y-3">
        {filtered.map((risk) => (
          <RiskCard key={risk.id} risk={risk} />
        ))}
      </div>

      {/* 绿色摘要（§5.3） */}
      {greenSummary && (
        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
          <h3 className="text-xs font-semibold text-emerald-700">合规要点</h3>
          <p className="mt-1 text-sm leading-6 text-emerald-700">
            {greenSummary}
          </p>
        </div>
      )}
    </div>
  );
}

/* ========== 风险卡片 ========== */

function RiskCard({ risk }: { risk: ReviewRisk }) {
  const [expanded, setExpanded] = useState(true);
  const [showDiff, setShowDiff] = useState(false);

  const severityColor = {
    high: "bg-[#EF4444]",
    medium: "bg-[#F59E0B]",
    low: "bg-slate-400",
  }[risk.severity];

  const severityText = {
    high: "text-[#EF4444]",
    medium: "text-[#D97706]",
    low: "text-slate-500",
  }[risk.severity];

  const hasStructuredDiff = risk.diff && risk.diff.length > 0;
  const hasOriginalText =
    risk.original_text && risk.original_text !== "未约定";

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border bg-white shadow-sm",
        risk.severity === "high" ? "border-red-200" : "border-amber-200",
      )}>
      {/* 标题行 */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
      >
        <span className={cn("h-5 w-1 shrink-0 rounded-full", severityColor)} />
        <span className={cn("flex-1 text-sm font-semibold", severityText)}>
          {risk.title}
        </span>
        {expanded ? (
          <ChevronUp size={18} className="text-slate-400" />
        ) : (
          <ChevronDown size={18} className="text-slate-400" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-slate-100 px-4 pb-4">
          {/* 风险分析 */}
          <div className="mt-3">
            <h4 className="text-xs font-semibold text-slate-500">风险分析</h4>
            <div className="mt-2 space-y-3">
              {risk.analysis.map((item, i) => (
                <div key={i}>
                  <p className="text-sm">
                    <span className="font-medium text-slate-500">
                      {i + 1}. {item.point}
                    </span>
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {item.detail}
                  </p>
                  <span className="mt-1.5 inline-block rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                    {item.tag}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 修订建议 */}
          <div className="mt-4">
            <h4 className="text-xs font-semibold text-slate-500">修订建议</h4>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              {risk.suggestion}
            </p>
          </div>

          {/* 一键修改对比卡片 */}
          <div className="mt-4 rounded-xl bg-slate-50 p-4">
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded bg-[#2563EB] px-1.5 py-0.5 text-[10px] font-medium text-white">
                修改
              </span>
            </div>

            {showDiff ? (
              hasStructuredDiff ? (
                /* 有结构化 diff → 逐段渲染 */
                <div className="text-sm leading-6 text-slate-700">
                  {risk.diff.map((seg, i) => (
                    <DiffSegment key={i} segment={seg} />
                  ))}
                </div>
              ) : (
                /* 无结构化 diff → 原文 vs 改后对照 */
                <div className="space-y-3 text-sm leading-6">
                  {hasOriginalText && (
                    <div>
                      <span className="mb-1 inline-block rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-600">
                        原文
                      </span>
                      <p className="mt-1 text-slate-400 line-through">
                        {risk.original_text}
                      </p>
                    </div>
                  )}
                  <div>
                    <span className="mb-1 inline-block rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600">
                      改后
                    </span>
                    <p className="mt-1 text-slate-700">{risk.revised_text}</p>
                  </div>
                </div>
              )
            ) : (
              /* 默认显示改后建议 */
              <div className="text-sm leading-6 text-slate-700">
                {risk.revised_text}
              </div>
            )}

            {/* 底部控制：始终显示对比开关 */}
            <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">
              <span className="rounded-md bg-slate-200/60 px-2 py-0.5 text-xs text-slate-500">
                {risk.clause_tag}
              </span>
              <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-600">
                <span>与原文对比</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={showDiff}
                  onClick={() => setShowDiff(!showDiff)}
                  className={cn(
                    "relative h-[30px] w-[54px] rounded-full transition-colors",
                    showDiff ? "bg-[#2563EB]" : "bg-slate-300",
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-[3px] h-6 w-6 rounded-full bg-white shadow transition-transform",
                      showDiff ? "left-[27px]" : "left-[3px]",
                    )}
                  />
                </button>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ========== Diff 段落渲染 ========== */

function DiffSegment({ segment }: { segment: DiffSegment }) {
  if (segment.type === "delete") {
    return (
      <span className="text-slate-400 line-through">{segment.text}</span>
    );
  }
  if (segment.type === "insert") {
    return (
      <span className="rounded bg-orange-100 px-0.5 text-orange-700">
        {segment.text}
      </span>
    );
  }
  return <>{segment.text}</>;
}

/* ========== 一键导出：原文 + 修改建议 → 合规合同 ========== */

function buildCompliantContract(data: ReviewResult): string {
  let text = data.full_text;

  if (text) {
    // 逐条替换：原文条款 → 修订后条文
    for (const risk of data.risks) {
      if (
        risk.original_text &&
        risk.original_text !== "未约定" &&
        risk.revised_text
      ) {
        text = text.replace(risk.original_text, risk.revised_text);
      }
    }
    return text;
  }

  // 无原文时（文件上传模式），用 metadata + 建议构造合规合同
  const meta = data.contract_meta;
  const parts: string[] = [
    `# ${meta.title || "房屋租赁合同"}（合规修订版）`,
    "",
    "## 一、合同主体",
    `出租方（甲方）：${data.parties.甲方.name}`,
    `承租方（乙方）：${data.parties.乙方.name}`,
    "",
    "## 二、房屋信息与租赁条款",
    `房屋地址：${meta.property_address}`,
    `租赁期限：${meta.lease_start}${meta.lease_end ? ` 至 ${meta.lease_end}` : ""}`,
    `月租金：${meta.rent_per_month}`,
  ];

  if (meta.deposit_amount) parts.push(`押金金额：${meta.deposit_amount}`);
  if (meta.deposit_return)
    parts.push(`押金退还条件：${meta.deposit_return}`);
  if (meta.payment_method) parts.push(`支付方式：${meta.payment_method}`);

  if (data.risks.length > 0) {
    parts.push("", "## 三、修订条款（基于 AI 审查建议）");
    data.risks.forEach((r, i) => {
      parts.push(
        `### ${i + 1}. ${r.title}`,
        `**修订后条文**：${r.revised_text}`,
        "",
      );
    });
  }

  if (data.green_summary) {
    parts.push("## 四、合规说明", data.green_summary);
  }

  return parts.join("\n");
}

/* ========== Tab 3：原文 ========== */

function OriginalTab({ data }: { data: ReviewResult }) {
  if (!data.full_text) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-5 py-16 text-center">
        <p className="text-sm text-slate-400">
          上传文件模式下原文不保留
        </p>
        <p className="mt-1 text-xs text-slate-300">
          可查看"基本信息"和"风险"了解合同详情
        </p>
      </div>
    );
  }

  return (
    <div className="px-5 py-4">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <pre className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
          {data.full_text}
        </pre>
      </div>
    </div>
  );
}

/* ========== Tab 2：基本信息 ========== */

function PartiesTab({ data }: { data: ReviewResult }) {
  const { 甲方, 乙方 } = data.parties;
  const meta = data.contract_meta;

  const infoFields: { label: string; value: string }[] = [
    { label: "合同名称", value: meta.title },
    { label: "房屋地址", value: meta.property_address },
    ...(meta.area && meta.area !== "未约定"
      ? [{ label: "建筑面积", value: `${meta.area}㎡` }]
      : []),
    { label: "月租金", value: meta.rent_per_month ? `¥${meta.rent_per_month}` : "未约定" },
    {
      label: "租赁期限",
      value: meta.lease_end
        ? `${meta.lease_start} 至 ${meta.lease_end}`
        : meta.lease_start || "未约定",
    },
    // 工作流新增：押金 + 支付方式（§5.3）
    ...(meta.deposit_amount
      ? [{ label: "押金金额", value: `¥${meta.deposit_amount}` }]
      : []),
    ...(meta.deposit_return
      ? [{ label: "押金退还", value: meta.deposit_return }]
      : []),
    ...(meta.payment_method
      ? [{ label: "支付方式", value: meta.payment_method }]
      : []),
  ];

  return (
    <div className="space-y-4 px-5 py-4">
      {/* 甲方卡片 */}
      <PartyCard title="甲方（出租方）" info={甲方} />
      {/* 乙方卡片 */}
      <PartyCard title="乙方（承租方）" info={乙方} />
      {/* 合同信息 */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-slate-800">
          合同基本信息
        </h3>
        <div className="space-y-3">
          {infoFields.map((f) => (
            <div key={f.label} className="flex items-center text-sm">
              <span className="w-20 shrink-0 text-slate-400">{f.label}</span>
              <span className="text-slate-700">{f.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PartyCard({
  title,
  info,
}: {
  title: string;
  info: { name: string; id_card: string; phone: string };
}) {
  const isPartyA = title.includes("甲方");
  const showIdCard = info.id_card && info.id_card !== "—";
  const showPhone = info.phone && info.phone !== "—";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <span
          className={cn(
            "grid h-7 w-7 place-items-center rounded-full text-xs font-semibold text-white",
            isPartyA ? "bg-[#F59E0B]" : "bg-[#2563EB]",
          )}
        >
          {isPartyA ? "甲" : "乙"}
        </span>
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      </div>
      <div className="space-y-2 pl-9 text-sm">
        <InfoRow label="姓名" value={info.name} />
        {showIdCard && <InfoRow label="身份证号" value={info.id_card} />}
        {showPhone && <InfoRow label="联系电话" value={info.phone} />}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center">
      <span className="w-16 shrink-0 text-xs text-slate-400">{label}</span>
      <span className="text-sm text-slate-700">{value}</span>
    </div>
  );
}
