/**
 * 合同下载工具：去掉占位提示后导出为 PDF（通过浏览器打印）
 */

/** 去掉所有 【...】 占位提示 */
function stripPlaceholders(text: string): string {
  return text.replace(/【[^】]*】/g, "");
}

/** 内联样式：**粗体** → <strong>，然后转义其余 HTML */
function parseAndEscapeInline(text: string): string {
  // 先处理 **粗体** → <strong>
  const withBold = text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  // 再转义其他 HTML 特殊字符（但保留已生成的 <strong> 标签）
  return withBold
    .replace(/&/g, "&amp;")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    // 还原 <strong> 标签
    .replace(/&lt;strong&gt;/g, "<strong>")
    .replace(/&lt;\/strong&gt;/g, "</strong>");
}

/** 将 Markdown 文本转为打印友好的纯 HTML */
function markdownToPrintHtml(md: string): string {
  const rawLines = md.split("\n");
  let result = "";
  let inList = false;
  let listTag = "";
  let pendingHeading = ""; // 暂存待确认是否有效的标题

  for (let i = 0; i < rawLines.length; i++) {
    const trimmed = rawLines[i].trim();

    // 空行 → 如果之前有 pending 标题且接下来无内容，吞掉标题
    if (trimmed === "") {
      if (inList) {
        result += `</${listTag}>\n`;
        inList = false;
      }
      continue;
    }

    // 分割线
    if (/^[-*_]{3,}\s*$/.test(trimmed)) {
      if (inList) { result += `</${listTag}>\n`; inList = false; }
      result += '<hr style="border:none;border-top:1px solid #ccc;margin:16px 0">\n';
      continue;
    }

    // 标题 —— 先暂存，看后面是否有实质内容
    const h1Match = trimmed.match(/^#\s+(.+)/);
    if (h1Match) {
      if (inList) { result += `</${listTag}>\n`; inList = false; }
      const title = stripPlaceholders(h1Match[1]).trim();
      if (!title) continue;
      result += `<h1 style="text-align:center;font-size:22px;font-weight:bold;margin:24px 0 16px">${parseAndEscapeInline(title)}</h1>\n`;
      continue;
    }
    const h23Match = trimmed.match(/^#{2,3}\s+(.+)/);
    if (h23Match) {
      if (inList) { result += `</${listTag}>\n`; inList = false; }
      const headingText = stripPlaceholders(h23Match[1]).trim();
      if (!headingText) continue;
      // 暂存，等确认有实质内容再输出
      pendingHeading = `<h3 style="font-size:15px;font-weight:bold;margin:16px 0 4px">${parseAndEscapeInline(headingText)}</h3>\n`;
      continue;
    }

    // 有序列表
    if (/^\s*\d+[.)]\s+/.test(trimmed)) {
      if (!inList || listTag !== "ol") {
        if (inList) result += `</${listTag}>\n`;
        result += '<ol style="padding-left:24px;margin:4px 0;font-size:15px;line-height:1.6">\n';
        listTag = "ol";
        inList = true;
      }
      const item = stripPlaceholders(trimmed.replace(/^\s*\d+[.)]\s+/, ""));
      if (item.trim()) {
        // 输出暂存的标题
        if (pendingHeading) { result += pendingHeading; pendingHeading = ""; }
        result += `<li>${parseAndEscapeInline(item)}</li>\n`;
      }
      continue;
    }

    // 无序列表
    if (/^\s*[-*]\s+/.test(trimmed)) {
      if (!inList || listTag !== "ul") {
        if (inList) result += `</${listTag}>\n`;
        result += '<ul style="padding-left:24px;margin:4px 0;font-size:15px;line-height:1.6">\n';
        listTag = "ul";
        inList = true;
      }
      const item = stripPlaceholders(trimmed.replace(/^\s*[-*]\s+/, ""));
      if (item.trim()) {
        if (pendingHeading) { result += pendingHeading; pendingHeading = ""; }
        result += `<li>${parseAndEscapeInline(item)}</li>\n`;
      }
      continue;
    }

    // 正文行
    if (inList) {
      result += `</${listTag}>\n`;
      inList = false;
    }
    const stripped = stripPlaceholders(trimmed);
    if (stripped.trim()) {
      if (pendingHeading) { result += pendingHeading; pendingHeading = ""; }
      result += `<p style="font-size:15px;line-height:1.6;margin:0">${parseAndEscapeInline(stripped)}</p>\n`;
    }
  }

  if (inList) {
    result += `</${listTag}>\n`;
  }

  return result;
}

/** 打开打印窗口（用户可保存为 PDF） */
export function downloadContractAsPdf(markdown: string, title = "房屋租赁合同") {
  const bodyHtml = markdownToPrintHtml(markdown);

  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>${parseAndEscapeInline(title)}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "SimSun", serif;
    color: #1a1a1a;
    max-width: 720px;
    margin: 0 auto;
    padding: 48px 40px;
    line-height: 1.8;
  }
  @media print {
    body { padding: 30px 35px; }
    @page { margin: 20mm; }
  }
</style>
</head>
<body>
${bodyHtml}
<script>
  window.onload = function() { window.print(); };
</script>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html;charset=UTF-8" });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, "_blank");
  if (win) {
    win.onload = () => {
      URL.revokeObjectURL(url);
    };
  }
}
