export type ContractSection = {
  title: string;
  body: string[];
};

export type ContractDraft = {
  label: string;
  title: string;
  status?: string;
  sections: ContractSection[];
};

export type RiskLevel = "red" | "yellow" | "green";

export type RiskItem = {
  id: string;
  level: RiskLevel;
  description: string;
  affectedParty: string;
  riskType: string;
  suggestion: string;
};

export type RecentRecord = {
  fileName: string;
  date: string;
  status: string;
};

export type FileOption = {
  id: string;
  fileName: string;
  meta: string;
};

// ---- 合同 AI 审查结果类型 ----

export type PartyInfo = {
  name: string;
  id_card: string;
  phone: string;
};

export type ContractMeta = {
  title: string;
  property_address: string;
  area: string;
  rent_per_month: string;
  lease_start: string;
  lease_end: string;
  /** 工作流新增：押金金额 */
  deposit_amount?: string;
  /** 工作流新增：押金退还条件 */
  deposit_return?: string;
  /** 工作流新增：支付方式 */
  payment_method?: string;
};

export type DiffSegment = {
  type: "delete" | "insert" | "keep";
  text: string;
};

export type RiskAnalysisPoint = {
  point: string;
  detail: string;
  tag: string;
};

export type ReviewRisk = {
  id: string;
  title: string;
  severity: "high" | "medium" | "low";
  category: "clause" | "grammar";
  analysis: RiskAnalysisPoint[];
  suggestion: string;
  original_text: string;
  revised_text: string;
  diff: DiffSegment[];
  clause_tag: string;
};

export type ReviewResult = {
  /** 工作流：整体风险等级 */
  risk_level?: WorkflowRiskColor;
  /** 工作流：总体结论 */
  overall_conclusion?: string;
  /** 工作流：合规条款归纳 */
  green_summary?: string;
  parties: {
    甲方: PartyInfo;
    乙方: PartyInfo;
  };
  contract_meta: ContractMeta;
  risks: ReviewRisk[];
  full_text: string;
};

export type ReviewStatus = "processing" | "completed" | "error";

// ---- Dify 工作流原始输出类型（§4）----

export type WorkflowRiskColor = "红" | "黄" | "绿";

export interface WorkflowKeyInfo {
  出租方: string;
  承租方: string;
  房屋地址: string;
  租赁期限: string;
  月租金: string;
  押金金额: string;
  押金退还条件: string;
  支付方式: string;
}

export interface WorkflowIssue {
  color: "红" | "黄";
  category: string; // "R1 主体权属" ... "Y7 特殊情形"
  clause: string; // 原文摘录 或 "未约定"
  problem: string;
  legal_basis: string; // 黄色为 ""
  suggestion: string;
}

export interface WorkflowReviewResult {
  key_info: WorkflowKeyInfo;
  risk_level: WorkflowRiskColor;
  overall_conclusion: string;
  issues: WorkflowIssue[];
  green_summary: string;
}
