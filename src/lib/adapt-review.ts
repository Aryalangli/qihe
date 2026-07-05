import type { ReviewResult, ReviewRisk, WorkflowReviewResult } from "./types";

/**
 * 工作流输出 → 前端 ReviewResult 适配器（§5.2）
 *
 * 核心映射：
 * - 红/黄/绿 → high/medium/low（severity）
 * - issues → risks（category 全部映射为 "clause"）
 * - key_info → parties + contract_meta
 * - 工作流不提供的字段（证件/电话/diff）填兜底值
 */
export function adaptWorkflowResult(
  w: WorkflowReviewResult,
  ctx?: { fileName?: string; pastedText?: string },
): ReviewResult {
  const k = w.key_info ?? ({} as WorkflowReviewResult["key_info"]);
  const period = (k.租赁期限 ?? "").split(/至|—|~|-(?=\d{4})/);

  const risks: ReviewRisk[] = (w.issues ?? []).map((it, i) => ({
    id: `risk-${i}`,
    title: it.problem?.slice(0, 24) || it.category,
    severity: it.color === "红" ? "high" : "medium",
    category: "clause" as const,
    analysis: [
      { point: "问题分析", detail: it.problem ?? "", tag: it.category ?? "" },
      ...(it.legal_basis
        ? [{ point: "法律依据", detail: it.legal_basis, tag: "法条" }]
        : []),
    ],
    suggestion: it.suggestion ?? "",
    original_text: it.clause ?? "",
    revised_text: it.suggestion ?? "",
    diff: [],
    clause_tag: it.category ?? "",
  }));

  return {
    risk_level: w.risk_level,
    overall_conclusion: w.overall_conclusion,
    green_summary: w.green_summary,
    parties: {
      甲方: { name: k.出租方 || "未约定", id_card: "—", phone: "—" },
      乙方: { name: k.承租方 || "未约定", id_card: "—", phone: "—" },
    },
    contract_meta: {
      title: ctx?.fileName || "房屋租赁合同",
      property_address: k.房屋地址 || "未约定",
      area: "未约定",
      rent_per_month: k.月租金 || "未约定",
      lease_start: period[0]?.trim() || k.租赁期限 || "未约定",
      lease_end: period[1]?.trim() || "",
      deposit_amount: k.押金金额 || undefined,
      deposit_return: k.押金退还条件 || undefined,
      payment_method: k.支付方式 || undefined,
    },
    risks,
    full_text: ctx?.pastedText ?? "",
  };
}

/**
 * 判定工作流原始输出是否成功（§3.4）
 */
export function resolveOutcome(outputs: Record<string, unknown>): {
  kind: "ok";
  result: WorkflowReviewResult;
} | {
  kind: "recognition_failed" | "llm_output_invalid";
  message: string;
} {
  if (typeof outputs.error_message === "string" && outputs.error_message) {
    return { kind: "recognition_failed", message: outputs.error_message };
  }
  if (outputs.json_parse_ok !== 1) {
    return { kind: "llm_output_invalid", message: "AI 输出异常，请重试" };
  }
  try {
    const parsed = JSON.parse(outputs.review_result as string) as WorkflowReviewResult;
    // 防御：issues 兜底为 []
    if (!Array.isArray(parsed.issues)) parsed.issues = [];
    return { kind: "ok", result: parsed };
  } catch {
    return { kind: "llm_output_invalid", message: "审查结果解析失败，请重试" };
  }
}
