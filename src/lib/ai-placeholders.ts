import {
  fullContractDraft,
  mockReviewResult,
  riskItems,
  stoppedContractDraft,
} from "@/data/mock";
import { callDifyChatflow, runReviewWorkflow, uploadReviewFile } from "@/lib/dify";
import { adaptWorkflowResult, resolveOutcome } from "@/lib/adapt-review";
import type { ContractDraft, ReviewResult, RiskItem } from "@/lib/types";

/**
 * 通过 Dify Chatflow 生成合同（多轮对话）
 */
export async function generateContractDraft(
  query: string,
  conversationId?: string,
): Promise<{ text: string; conversationId: string }> {
  return callDifyChatflow({
    query,
    conversationId,
    inputs: {},
  });
}

/** @deprecated 已接入真实 Dify，保留用于参考 */
export async function mockGenerateContractDraft(
  prompt: string,
): Promise<ContractDraft> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return prompt.length > 18 ? fullContractDraft : stoppedContractDraft;
}

// ============================================================
// 合同审查 — 通过本地 API Route 代理调用 Dify 工作流
// ============================================================

/**
 * 真实审查：上传文件 → 执行工作流 → 适配为 ReviewResult
 */
export async function reviewContract(
  file: File,
  onStageChange?: (stage: string) => void,
): Promise<ReviewResult> {
  // 1. 上传文件
  onStageChange?.("正在上传并解析合同文件…");
  const fileInfo = await uploadReviewFile(file);

  // 2. 执行工作流（SSE streaming），透传阶段回调
  const outputs = await runReviewWorkflow(
    {
      files: [{ upload_file_id: fileInfo.upload_file_id, type: fileInfo.type }],
    },
    onStageChange,
  );

  // 3. 判定结果
  const outcome = resolveOutcome(outputs);
  if (outcome.kind !== "ok") {
    throw new Error(outcome.message);
  }

  // 4. 适配为前端 ReviewResult
  return adaptWorkflowResult(outcome.result, { fileName: file.name });
}

/**
 * 真实审查（文本粘贴）：直接传 contract_text 执行工作流 → 适配为 ReviewResult
 */
export async function reviewContractByText(
  text: string,
  onStageChange?: (stage: string) => void,
): Promise<ReviewResult> {
  // 1. 执行工作流（仅传文本，不传文件）
  onStageChange?.("正在解析合同文本结构…");
  const outputs = await runReviewWorkflow(
    {
      contract_text: text,
    },
    onStageChange,
  );

  // 2. 判定结果
  const outcome = resolveOutcome(outputs);
  if (outcome.kind !== "ok") {
    throw new Error(outcome.message);
  }

  // 3. 适配为前端 ReviewResult（传入原文，供"原文"Tab 展示）
  return adaptWorkflowResult(outcome.result, { fileName: "文本粘贴", pastedText: text });
}

/** @deprecated 开发/无 Dify 时使用的 mock 审查，保留用于 fallback */
export async function mockReviewContract(): Promise<ReviewResult> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return mockReviewResult;
}
