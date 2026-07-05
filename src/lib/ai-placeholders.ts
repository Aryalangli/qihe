import {
  fullContractDraft,
  riskItems,
  stoppedContractDraft,
} from "@/data/mock";
import { callDifyChatflow } from "@/lib/dify";
import type { ContractDraft, RiskItem } from "@/lib/types";

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

/** @deprecated 已接入真实 Dify，保留用于参考 */
export async function mockReviewContract(): Promise<RiskItem[]> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return riskItems;
}
