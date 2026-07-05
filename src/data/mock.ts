import type {
  ContractDraft,
  FileOption,
  RecentRecord,
  ReviewResult,
  RiskItem,
} from "@/lib/types";

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
  // 清空以展示首次进入的空状态页面
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

export const historyFiles: RecentRecord[] = [
  {
    fileName: "房屋租赁合同.pdf",
    date: "2026-07-03",
    status: "审查完成",
  },
  {
    fileName: "房屋租赁合同.pdf",
    date: "2026-07-02",
    status: "审查完成",
  },
  {
    fileName: "房屋租赁合同.pdf",
    date: "2026-07-01",
    status: "审查完成",
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

/** 完整合同审查结果 mock */
export const mockReviewResult: ReviewResult = {
  parties: {
    甲方: { name: "张建国", id_card: "3101**********1234", phone: "138****8888" },
    乙方: { name: "李明", id_card: "3401**********5678", phone: "139****9999" },
  },
  contract_meta: {
    title: "房屋租赁合同",
    property_address: "上海市浦东新区张江路100号2栋301室",
    area: "89.5",
    rent_per_month: "8,500",
    lease_start: "2026-07-15",
    lease_end: "2027-07-14",
  },
  risks: [
    {
      id: "risk_001",
      title: "押金扣除范围过宽",
      severity: "high",
      category: "clause",
      clause_tag: "押金条款",
      original_text: "租赁期满后，甲方有权从押金中扣除房屋维修费、清洁费及其他相关费用。",
      revised_text: "租赁期满后，甲方应于7日内退还押金。因乙方原因造成房屋或设施损坏的，甲方可从押金中扣除合理维修费用，但应提供维修凭证及费用明细。正常使用磨损不纳入扣款范围。",
      suggestion: "明确押金退还期限为合同终止后7日内，限定扣除范围仅为乙方过错造成的实际损失，要求甲方提供费用凭证，排除正常磨损的扣款。",
      analysis: [
        { point: "扣除范围不明确", detail: "条款中'其他相关费用'表述模糊，给甲方随意扣款留下了空间。", tag: "押金条款" },
        { point: "缺少退还期限", detail: "当前条款未约定押金退还的具体时间，可能导致甲方无限期拖延退款。", tag: "押金条款" },
        { point: "缺乏凭证要求", detail: "未要求甲方提供维修费用凭证，乙方无法核实扣款的真实性和合理性。", tag: "押金条款" },
      ],
      diff: [
        { type: "keep", text: "租赁期满后，" },
        { type: "delete", text: "甲方有权从押金中扣除房屋维修费、清洁费及其他相关费用。" },
        { type: "insert", text: "甲方应于7日内退还押金。因乙方原因造成房屋或设施损坏的，甲方可从押金中扣除合理维修费用，但应提供维修凭证及费用明细。正常使用磨损不纳入扣款范围。" },
      ],
    },
    {
      id: "risk_002",
      title: "提前解约责任过重",
      severity: "high",
      category: "clause",
      clause_tag: "合同解除",
      original_text: "乙方提前解除合同的，应支付相当于三个月租金的违约金。",
      revised_text: "乙方提前解除合同的，应提前30日书面通知甲方，并支付相当于一个月租金的违约金，甲方应在扣除合理费用后15日内退还剩余押金及预付租金。",
      suggestion: "将违约金从三个月降至一个月，增加提前通知期的缓冲机制，明确押金和预付租金的退还流程。",
      analysis: [
        { point: "违约金过高", detail: "三倍月租违约金属高额违约金，可能被法院认定为过高而调整，但仍需乙方主动诉讼，增加维权成本。", tag: "合同解除" },
        { point: "缺少通知期", detail: "未约定提前通知期限，乙方无法合理安排退租计划，可能产生额外损失。", tag: "合同解除" },
      ],
      diff: [
        { type: "delete", text: "乙方提前解除合同的，应支付相当于三个月租金的违约金。" },
        { type: "insert", text: "乙方提前解除合同的，应提前30日书面通知甲方，并支付相当于一个月租金的违约金，甲方应在扣除合理费用后15日内退还剩余押金及预付租金。" },
      ],
    },
    {
      id: "risk_003",
      title: "维修责任划分不清",
      severity: "medium",
      category: "clause",
      clause_tag: "维修责任",
      original_text: "租赁期间，房屋及设施设备的维修由乙方负责。",
      revised_text: "租赁期间，房屋主体结构及非因乙方原因损坏的大型设施（空调、热水器、冰箱等）由甲方负责维修；因乙方使用不当造成的损坏由乙方负责维修或赔偿。日常小修（更换灯泡、疏通下水等）由乙方自行处理。",
      suggestion: "区分自然损耗与人为损坏的责任归属，明确大件家电由甲方负责，日常小修由乙方负责，避免责任模糊导致的争议。",
      analysis: [
        { point: "责任划分一锅端", detail: "将全部维修责任推给乙方，不符合《民法典》租赁合同相关规定，自然损耗应由出租人承担。", tag: "维修责任" },
        { point: "大件维修成本高", detail: "空调、热水器等大件维修费用可能高达数千元，全部由乙方承担显失公平。", tag: "维修责任" },
      ],
      diff: [
        { type: "delete", text: "租赁期间，房屋及设施设备的维修由乙方负责。" },
        { type: "insert", text: "租赁期间，房屋主体结构及非因乙方原因损坏的大型设施（空调、热水器、冰箱等）由甲方负责维修；因乙方使用不当造成的损坏由乙方负责维修或赔偿。日常小修（更换灯泡、疏通下水等）由乙方自行处理。" },
      ],
    },
    {
      id: "risk_004",
      title: "租金涨幅条款缺失",
      severity: "low",
      category: "clause",
      clause_tag: "租金调整",
      original_text: "租金为每月人民币8,500元整。",
      revised_text: "租金为每月人民币8,500元整。租赁期内，甲方不得单方面提高租金。如需续租，双方应在合同到期前30日协商新的租金标准。",
      suggestion: "补充约定租赁期内不涨租的保障条款，续租时设置协商期限和租金上限，避免到期时大幅涨价。",
      analysis: [
        { point: "缺少涨价限制", detail: "虽当前约定了金额，但未明确约定租赁期内不涨租，存在甲方中途要求涨价的风险。", tag: "租金调整" },
      ],
      diff: [
        { type: "keep", text: "租金为每月人民币8,500元整。" },
        { type: "insert", text: "租赁期内，甲方不得单方面提高租金。如需续租，双方应在合同到期前30日协商新的租金标准。" },
      ],
    },
  ],
  full_text: `房屋租赁合同

出租人（甲方）：张建国
承租人（乙方）：李明

第一条 房屋基本情况
甲方将位于上海市浦东新区张江路100号2栋301室的房屋出租给乙方使用，房屋建筑面积89.5平方米。

第二条 租赁期限
租赁期限自2026年7月15日起至2027年7月14日止，共计12个月。

第三条 租金及支付方式
租金为每月人民币8,500元整，乙方应于每月5日前支付当月租金。

第四条 押金
乙方应于签约当日向甲方支付押金人民币17,000元。租赁期满后，甲方有权从押金中扣除房屋维修费、清洁费及其他相关费用。

第五条 提前解除
乙方提前解除合同的，应支付相当于三个月租金的违约金。

第六条 维修责任
租赁期间，房屋及设施设备的维修由乙方负责。

第七条 其他约定
双方应遵守法律法规，友好协商解决争议。`,
};
