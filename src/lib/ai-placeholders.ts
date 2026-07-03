import {
  fullContractDraft,
  riskItems,
  stoppedContractDraft,
} from "@/data/mock";
import type { ContractDraft, RiskItem } from "@/lib/types";

export async function mockGenerateContractDraft(
  prompt: string,
): Promise<ContractDraft> {
  // TODO: 接入大模型 API：把 prompt 发送给合同生成模型，并返回结构化合同文本。
  await new Promise((resolve) => setTimeout(resolve, 500));
  return prompt.length > 18 ? fullContractDraft : stoppedContractDraft;
}

export async function mockReviewContract(): Promise<RiskItem[]> {
  // TODO: 接入大模型 API：上传合同文件后调用合同审查模型，返回风险项数组。
  await new Promise((resolve) => setTimeout(resolve, 400));
  return riskItems;
}
