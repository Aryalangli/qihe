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
