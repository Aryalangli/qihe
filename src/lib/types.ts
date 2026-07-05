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
  parties: {
    甲方: PartyInfo;
    乙方: PartyInfo;
  };
  contract_meta: ContractMeta;
  risks: ReviewRisk[];
  full_text: string;
};

export type ReviewStatus = "processing" | "completed" | "error";
