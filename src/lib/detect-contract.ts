/**
 * 检测文本中是否包含合同内容（同时支持 Markdown 和纯文本）
 *
 * Markdown 模式：包含 # 标题 + "第X条" 章节标题
 * 纯文本模式：包含合同关键词 + 条款结构
 */
export function hasContractContent(text: string): boolean {
  // Markdown 模式
  const hasMainTitle = /^#\s+.+合同/m.test(text);
  const hasClauses = /^#{1,3}\s+第[一二三四五六七八九十百\d]+条/m.test(text);
  if (hasMainTitle || (hasClauses && text.includes("#"))) return true;

  // 纯文本模式：包含合同核心关键词即可
  const hasPartyKeyword =
    /甲方|乙方|出租方|承租方|出租人|承租人|房东|租客/.test(text);
  const hasContractKeyword = /合同|协议|租赁|租金|押金|租期|违约责任/.test(text);

  return hasPartyKeyword || hasContractKeyword;
}

/**
 * 将 Dify 返回的文本拆分为：对话部分（合同前） + 合同 Markdown
 */
export function splitContractAndChat(text: string): {
  chatText: string;
  contractText: string;
} {
  // 找到 --- 分割线后的 # 标题作为合同起点
  const separatorMatch = text.match(/\n---\n/);
  if (separatorMatch && separatorMatch.index != null) {
    const splitIdx = separatorMatch.index;
    const beforeSep = text.slice(0, splitIdx).trim();
    const afterIdx = splitIdx + separatorMatch[0].length;
    const afterSep = text.slice(afterIdx).trim();

    if (afterSep.startsWith("#")) {
      return { chatText: beforeSep, contractText: afterSep };
    }
  }

  // 如果没有分割线，查找第一个 `# ` 标题作为合同起点
  const headingIdx = text.indexOf("\n# ");
  if (headingIdx !== -1) {
    const before = text.slice(0, headingIdx).trim();
    const after = text.slice(headingIdx + 1).trim();
    return { chatText: before, contractText: after };
  }

  // 非合同文本
  return { chatText: text, contractText: "" };
}
