import type { ContractDraft, FileOption, RecentRecord, RiskItem } from "@/lib/types";

export const historyItems = [
  {
    title: "我要生成一份租房合同",
    subtitle: "合同生成 · 信息待补充",
  },
  {
    title: "帮我审查这份租房合同有没有风险",
    subtitle: "合同审查 · 发现 3 个风险点",
  },
  {
    title: "房租 3000 元，帮我写合同",
    subtitle: "合同生成 · 已追问缺失字段",
  },
];

export const recentRecords: RecentRecord[] = [
  {
    fileName: "1783078708618.jpg",
    date: "2026-07-03",
    status: "审查完成",
  },
  {
    fileName: "1783075303150.jpg",
    date: "2026-07-03",
    status: "审查完成",
  },
];

export const fileOptions: FileOption[] = [
  {
    id: "lease-pdf",
    fileName: "房屋租赁合同.pdf",
    meta: "PDF · 2.4 MB · 今天 00:18",
  },
  {
    id: "scan-jpg",
    fileName: "租房合同扫描件.jpg",
    meta: "图片 · 1.1 MB · 昨天",
  },
  {
    id: "template-docx",
    fileName: "合同补充协议.docx",
    meta: "Word · 184 KB · 2026-07-02",
  },
  {
    id: "deposit-png",
    fileName: "押金收据.png",
    meta: "图片 · 860 KB · 2026-07-01",
  },
];

export const stoppedContractDraft: ContractDraft = {
  label: "合同生成",
  title: "房屋租赁合同",
  status: "（用户停止）",
  sections: [],
};

export const fullContractDraft: ContractDraft = {
  label: "合同生成",
  title: "房屋租赁合同",
  sections: [
    {
      title: "合同主体",
      body: [
        "出租人（以下简称“甲方”）：[甲方姓名/名称]，身份证号/统一社会信用代码：[甲方证件号码]，住址/住所地：[甲方联系地址]，联系电话：[甲方联系电话]；",
        "承租人（以下简称“乙方”）：[乙方姓名/名称]，身份证号/统一社会信用代码：[乙方证件号码]，住址/住所地：[乙方联系地址]，联系电话：[乙方联系电话]；",
      ],
    },
    {
      title: "房屋信息与租赁用途",
      body: [
        "甲方将位于[房屋详细地址]的房屋出租给乙方使用，房屋建筑面积约[面积]平方米，租赁用途为居住。",
      ],
    },
    {
      title: "租金、押金与期限",
      body: [
        "租赁期限自[起租日期]起至[到期日期]止。租金为人民币[租金金额]元/月，押金为人民币[押金金额]元。",
      ],
    },
  ],
};

export const riskItems: RiskItem[] = [
  {
    id: "deposit-withheld",
    level: "red",
    description:
      "乙方丧失优先购买权且退租需双重同意，可能限制承租人的法定权益；若同时存在押金退还不清、提前解除流程不明确等条款，履约时容易产生扣款、退租和责任承担争议。",
    affectedParty: "承租人",
    riskType: "权利剥夺 / 退租争议",
    suggestion:
      "建议删除或改写优先购买权等单方剥夺条款；将提前退租责任改为明确通知期、实际损失范围和押金退还期限，对卫生清洁费、物品维修费等扣款项目写明标准、凭证和上限。",
  },
];
