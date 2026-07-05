/**
 * Markdown 渲染器 — 不可编辑版 + 可编辑版（用于合同）
 */
import { type ChangeEvent, useCallback } from "react";

let keyCounter = 0;
function nextKey() {
  return `md-${Date.now()}-${keyCounter++}`;
}

/* ---------- 纯展示 ---------- */

function parseInlineDisplay(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*(.+?)\*\*)|(【[^】]*】)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    if (match[1]) {
      parts.push(<strong key={nextKey()}>{match[2]}</strong>);
    } else if (match[3]) {
      parts.push(<span key={nextKey()} className="text-slate-300 italic">{match[3]}</span>);
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts.length > 0 ? parts : [text];
}

/* ---------- 可编辑版 ---------- */

type FieldChangeHandler = (fieldName: string, value: string) => void;

function parseInlineEditable(text: string, values: Record<string, string>, onChange: FieldChangeHandler): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*(.+?)\*\*)|(【([^】]*)】)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    if (match[1]) {
      parts.push(<strong key={nextKey()}>{match[2]}</strong>);
    } else if (match[3]) {
      const rawField = match[4];
      const currentValue = values[rawField] || "";
      const displayWidth = Math.max(currentValue.length || rawField.length, 5);
      parts.push(
        <input
          key={nextKey()}
          value={currentValue}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(rawField, e.target.value)}
          placeholder={rawField}
          className="min-w-[50px] border-0 border-b border-dashed border-slate-300 bg-transparent px-1 py-0 text-[15px] leading-6 text-slate-900 outline-none placeholder:text-slate-300 focus:border-blue-400 focus:bg-blue-50/30"
          style={{ width: `${displayWidth * 1.15 + 1}ch` }}
        />,
      );
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts.length > 0 ? parts : [text];
}

/* ---------- 结构解析 ---------- */

function renderBlocks(content: string, inlineParser: (text: string) => React.ReactNode): React.ReactNode[] {
  keyCounter = 0;
  const lines = content.split("\n");
  const items: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === "") { i++; continue; }

    if (/^[-*_]{3,}\s*$/.test(line)) {
      items.push(<hr key={nextKey()} className="my-4 border-slate-200" />);
      i++; continue;
    }

    const h1 = line.match(/^#\s+(.+)/);
    if (h1) {
      items.push(<h1 key={nextKey()} className="mb-4 text-center text-xl font-bold text-slate-900">{inlineParser(h1[1])}</h1>);
      i++; continue;
    }

    const h23 = line.match(/^#{2,3}\s+(.+)/);
    if (h23) {
      items.push(<h3 key={nextKey()} className="mb-1 mt-4 text-[15px] font-semibold text-slate-800">{inlineParser(h23[1])}</h3>);
      i++; continue;
    }

    if (/^\s*\d+[.)]\s+/.test(line)) {
      const liItems: string[] = [];
      while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) {
        liItems.push(lines[i].replace(/^\s*\d+[.)]\s+/, "")); i++;
      }
      items.push(<ol key={nextKey()} className="list-decimal space-y-1 pl-5 text-[15px] leading-6">{liItems.map((li) => <li key={nextKey()}>{inlineParser(li)}</li>)}</ol>);
      continue;
    }

    if (/^\s*[-*]\s+/.test(line)) {
      const liItems: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        liItems.push(lines[i].replace(/^\s*[-*]\s+/, "")); i++;
      }
      items.push(<ul key={nextKey()} className="list-disc space-y-1 pl-5 text-[15px] leading-6">{liItems.map((li) => <li key={nextKey()}>{inlineParser(li)}</li>)}</ul>);
      continue;
    }

    const paraLines: string[] = [];
    while (i < lines.length && lines[i].trim() !== "" && !/^#{1,3}\s+/.test(lines[i]) && !/^[-*_]{3,}\s*$/.test(lines[i]) && !/^\s*\d+[.)]\s+/.test(lines[i]) && !/^\s*[-*]\s+/.test(lines[i])) {
      paraLines.push(lines[i]); i++;
    }
    if (paraLines.length > 0) {
      items.push(<p key={nextKey()} className="text-[15px] leading-6">{paraLines.map((pl, idx) => <span key={idx}>{idx > 0 && <br />}{inlineParser(pl)}</span>)}</p>);
    }
  }
  return items;
}

/* ---------- 导出 ---------- */

export function Markdown({ content }: { content: string }) {
  return <>{renderBlocks(content, (t) => parseInlineDisplay(t))}</>;
}

export function EditableMarkdown({ content, values, onFieldChange }: { content: string; values: Record<string, string>; onFieldChange: FieldChangeHandler }) {
  const render = useCallback((t: string) => parseInlineEditable(t, values, onFieldChange), [values, onFieldChange]);
  return <>{renderBlocks(content, render)}</>;
}

/** 提取 Markdown 中所有 【字段名】 */
export function extractPlaceholders(md: string): string[] {
  const seen = new Set<string>();
  for (const m of md.matchAll(/【([^】]*)】/g)) seen.add(m[1]);
  return [...seen];
}
