"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Download,
  Share2,
} from "lucide-react";
import type { ReviewResult, ReviewRisk, DiffSegment } from "@/lib/types";
import { StatusBar } from "@/components/mobile-shell";
import { cn } from "@/lib/utils";

/* ========== 主组件 ========== */

type Tab = "risk" | "original" | "parties";

export function ReviewResultPage({ data, onBack }: { data: ReviewResult; onBack: () => void }) {
  const [tab, setTab] = useState<Tab>("risk");

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
          <h1 className="text-lg font-semibold text-slate-950">风险</h1>
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

      <div className="flex flex-1 flex-col">
        <div className="flex shrink-0 border-b border-slate-200 px-5">
          {(
            [
              { key: "risk", label: "风险", icon: null },
              { key: "original", label: "原文", icon: null },
              { key: "parties", label: "主体", icon: null },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={cn(
                "relative px-4 py-3 text-sm font-medium transition-colors",
                tab === t.key ? "text-[#2563EB]" : "text-slate-400",
              )}
            >
              {t.label}
              {tab === t.key && (
                <span className="absolute bottom-0 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-[#2563EB]" />
              )}
            </button>
          ))}

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
          {tab === "risk" && <RiskTab risks={data.risks} />}
          {tab === "original" && <OriginalTab data={data} />}
          {tab === "parties" && <PartiesTab data={data} />}
        </div>
      </div>
    </>
  );
}

/* ========== Tab 1：风险 ========== */

type RiskSubTab = "clause" | "grammar";

function RiskTab({ risks }: { risks: ReviewRisk[] }) {
  const [subTab, setSubTab] = useState<RiskSubTab>("clause");
  const [viewMode, setViewMode] = useState<"lessee" | "lessor">("lessee");

  const filtered =
    subTab === "clause"
      ? risks.filter((r) => r.category === "clause")
      : risks.filter((r) => r.category === "grammar");

  const highCount = risks.filter((r) => r.severity === "high").length;

  return (
    <div className="px-5 pb-8 pt-4">
      {/* 子 Tag 切换 */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setSubTab("clause")}
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-medium transition-colors",
              subTab === "clause"
                ? "bg-[#2563EB] text-white"
                : "bg-slate-100 text-slate-500",
            )}
          >
            条款风险{" "}
            {highCount > 0 && (
              <span className="ml-1">{risks.filter((r) => r.severity === "high" && r.category === "clause").length}</span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setSubTab("grammar")}
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-medium transition-colors",
              subTab === "grammar"
                ? "bg-[#2563EB] text-white"
                : "bg-slate-100 text-slate-500",
            )}
          >
            文法逻辑
          </button>
        </div>

        <button
          type="button"
          onClick={() =>
            setViewMode(viewMode === "lessee" ? "lessor" : "lessee")
          }
          className="rounded-full bg-slate-100 px-3 py-1.5 text-xs text-slate-500"
        >
          {viewMode === "lessee" ? "承租人视角" : "出租人视角"}
        </button>
      </div>

      {/* 风险卡片列表 */}
      <div className="mt-4 space-y-3">
        {filtered.map((risk) => (
          <RiskCard key={risk.id} risk={risk} />
        ))}
      </div>
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

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
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

          {/* 修改对比卡片 */}
          <div className="mt-4 rounded-xl bg-slate-50 p-4">
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded bg-[#2563EB] px-1.5 py-0.5 text-[10px] font-medium text-white">
                修改
              </span>
            </div>

            <div className="text-sm leading-6 text-slate-700">
              {showDiff
                ? risk.diff.map((seg, i) => (
                    <DiffSegment key={i} segment={seg} />
                  ))
                : risk.revised_text}
            </div>

            {/* 底部控制 */}
            <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">
              <span className="rounded-md bg-slate-200/60 px-2 py-0.5 text-xs text-slate-500">
                {risk.clause_tag}
              </span>
              <label className="flex cursor-pointer items-center gap-1.5 text-xs text-slate-400">
                <span>比对</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={showDiff}
                  onClick={() => setShowDiff(!showDiff)}
                  className={cn(
                    "relative h-5 w-9 rounded-full transition-colors",
                    showDiff ? "bg-[#2563EB]" : "bg-slate-300",
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform",
                      showDiff ? "left-[18px]" : "left-0.5",
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

/* ========== Tab 2：原文 ========== */

function OriginalTab({ data }: { data: ReviewResult }) {
  const riskSpans = data.risks.map((r) => r.original_text);
  const highlights = ["租金", "押金", "违约金", "租赁期限", "建筑面积"].flatMap(
    (kw) => {
      const matches: { start: number; end: number }[] = [];
      let idx = data.full_text.indexOf(kw);
      while (idx !== -1) {
        matches.push({ start: idx, end: idx + kw.length });
        idx = data.full_text.indexOf(kw, idx + 1);
      }
      return matches;
    },
  );

  let lastIdx = 0;
  const segments: { text: string; type: "normal" | "risk" | "highlight" }[] =
    [];

  const allHighlights = [
    ...highlights.map((h) => ({ ...h, type: "highlight" as const })),
    ...riskSpans.flatMap((span) => {
      const s = data.full_text.indexOf(span);
      if (s === -1) return [];
      return [{ start: s, end: s + span.length, type: "risk" as const }];
    }),
  ].sort((a, b) => a.start - b.start);

  allHighlights.forEach((h) => {
    if (h.start > lastIdx) {
      segments.push({
        text: data.full_text.slice(lastIdx, h.start),
        type: "normal",
      });
    }
    segments.push({
      text: data.full_text.slice(h.start, h.end),
      type: h.type,
    });
    lastIdx = h.end;
  });

  if (lastIdx < data.full_text.length) {
    segments.push({ text: data.full_text.slice(lastIdx), type: "normal" });
  }

  return (
    <div className="px-5 py-4">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center gap-2 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-amber-100" />{" "}
            风险条款
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-blue-100" />{" "}
            关键信息
          </span>
        </div>
        <pre className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
          {segments.map((seg, i) => (
            <span
              key={i}
              className={
                seg.type === "risk"
                  ? "rounded bg-amber-100 px-0.5 text-amber-900"
                  : seg.type === "highlight"
                    ? "rounded bg-blue-100 px-0.5 text-blue-800"
                    : ""
              }
            >
              {seg.text}
            </span>
          ))}
        </pre>
      </div>
    </div>
  );
}

/* ========== Tab 3：主体信息 ========== */

function PartiesTab({ data }: { data: ReviewResult }) {
  const { 甲方, 乙方 } = data.parties;
  const meta = data.contract_meta;

  const infoFields: { label: string; value: string }[] = [
    { label: "合同名称", value: meta.title },
    { label: "房屋地址", value: meta.property_address },
    { label: "建筑面积", value: `${meta.area}㎡` },
    { label: "月租金", value: `¥${meta.rent_per_month}` },
    {
      label: "租赁期限",
      value: `${meta.lease_start} 至 ${meta.lease_end}`,
    },
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
        <InfoRow label="身份证号" value={info.id_card} />
        <InfoRow label="联系电话" value={info.phone} />
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
