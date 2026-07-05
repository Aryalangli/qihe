"use client";

import { useCallback, useState } from "react";
import { Download, FileText, Paperclip } from "lucide-react";
import { ChatBubble, FeedbackActions, LoadingMessage, PromptBox } from "@/components/chat";
import { HomeIndicator, PhoneFrame, StatusBar, TopNav } from "@/components/mobile-shell";
import { generateContractDraft } from "@/lib/ai-placeholders";
import { Markdown, EditableMarkdown } from "@/lib/markdown";
import { hasContractContent, splitContractAndChat } from "@/lib/detect-contract";
import { downloadContractAsPdf } from "@/lib/download-contract";

type ChatMessage =
  | { id: string; kind: "user"; text: string }
  | { id: string; kind: "assistant"; text: string }
  | { id: string; kind: "file"; fileName: string };

export default function GeneratePage() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [conversationId, setConversationId] = useState("");

  // 合同：只有一张，原地更新
  const [contractMarkdown, setContractMarkdown] = useState("");
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});

  const handleFieldChange = useCallback((fieldName: string, value: string) => {
    setFieldValues((prev) => ({ ...prev, [fieldName]: value }));
  }, []);

  function handleFileUpload(file: File) {
    setPendingFile(file);
  }

  async function handleSend() {
    const text = input.trim();
    if (!text) return;
    setInput("");

    const userMsg: ChatMessage = { id: `user-${Date.now()}`, kind: "user", text };
    const newMsgs: ChatMessage[] = [userMsg];
    if (pendingFile) {
      newMsgs.push({ id: `file-${Date.now()}`, kind: "file", fileName: pendingFile.name });
    }

    setMessages((prev) => [...prev, ...newMsgs]);
    setPendingFile(null);
    setLoading(true);

    try {
      const result = await generateContractDraft(text, conversationId);
      setConversationId(result.conversationId);

      if (hasContractContent(result.text)) {
        const { chatText, contractText } = splitContractAndChat(result.text);

        // 对话说明
        if (chatText) {
          setMessages((prev) => [...prev, { id: `assistant-${Date.now()}`, kind: "assistant", text: chatText }]);
        }

        // 合同原地更新：新模板自动填入已手动填写的字段
        setContractMarkdown((prev) => {
          if (prev && contractText) {
            return mergeFieldValues(contractText, fieldValues);
          }
          return contractText;
        });
        setFieldValues((prev) => mergeNewPlaceholders(contractText, prev));
      } else {
        setMessages((prev) => [...prev, { id: `assistant-${Date.now()}`, kind: "assistant", text: result.text }]);
      }
    } catch {
      setMessages((prev) => [...prev, { id: `error-${Date.now()}`, kind: "assistant", text: "抱歉，请求失败，请稍后重试。" }]);
    } finally {
      setLoading(false);
    }
  }

  /** 下载时把已填值代入 */
  const filledPdf = contractMarkdown.replace(/【([^】]*)】/g, (_, key) => fieldValues[key] || `【${key}】`);
  const hasContract = contractMarkdown.length > 0;

  return (
    <PhoneFrame>
      <StatusBar />
      <TopNav action="none" />

      {messages.length === 0 && !hasContract ? (
        <InitialGenerateState value={input} onChange={setInput} onSend={handleSend} onFileUpload={handleFileUpload} />
      ) : (
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="no-scrollbar flex-1 space-y-5 overflow-y-auto px-5 pb-5 pt-16">
            <p className="text-center text-xs text-slate-200">00:23</p>

            {messages.map((msg) => {
              if (msg.kind === "user") return <ChatBubble key={msg.id} role="user">{msg.text}</ChatBubble>;
              if (msg.kind === "assistant") return <ChatBubble key={msg.id} role="assistant"><Markdown content={msg.text} /></ChatBubble>;
              if (msg.kind === "file") return (
                <div key={msg.id} className="flex justify-end">
                  <div className="flex items-center gap-2 rounded-2xl rounded-tr-md bg-slate-100 px-4 py-3 text-sm text-slate-700">
                    <Paperclip size={16} className="text-slate-400" />
                    <span className="max-w-[200px] truncate">{msg.fileName}</span>
                  </div>
                </div>
              );
              return null;
            })}

            {/* 可编辑合同 — 只有一张，内容原地更新 */}
            {hasContract && (
              <article className="relative rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-100">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                    <FileText size={14} />
                    <span>租房合同</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => downloadContractAsPdf(filledPdf)}
                    className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-100"
                  >
                    <Download size={13} />下载 PDF
                  </button>
                </div>
                <div className="text-slate-700">
                  <EditableMarkdown content={contractMarkdown} values={fieldValues} onFieldChange={handleFieldChange} />
                </div>
                <FeedbackActions content={filledPdf} />
              </article>
            )}

            {loading ? <LoadingMessage /> : null}
          </div>

          <div className="px-4 pb-2">
            <PromptBox value={input} onChange={setInput} onSend={handleSend} placeholder="请输入问题" className="rounded-2xl" />
          </div>
          <HomeIndicator />
        </div>
      )}
    </PhoneFrame>
  );
}

/* ---------- 辅助 ---------- */

/** 将已填值代入新合同模板 */
function mergeFieldValues(md: string, values: Record<string, string>): string {
  let result = md;
  for (const [key, val] of Object.entries(values)) {
    if (val) result = result.replace(new RegExp(`【${escapeRx(key)}】`, "g"), val);
  }
  return result;
}

/** 新模板可能引入新的占位符，全部保留 */
function mergeNewPlaceholders(md: string, prev: Record<string, string>): Record<string, string> {
  const newFields = new Set(md.match(/【([^】]*)】/g)?.map((m) => m.slice(1, -1)) || []);
  const result: Record<string, string> = {};
  for (const f of newFields) result[f] = prev[f] || "";
  return result;
}

function escapeRx(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/* ---------- 首屏 ---------- */

function InitialGenerateState({ value, onChange, onSend, onFileUpload }: {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  onFileUpload?: (f: File) => void;
}) {
  return (
    <section className="flex flex-1 flex-col px-8 pt-28">
      <h1 className="text-center text-3xl font-bold text-slate-950">合同生成</h1>
      <PromptBox value={value} onChange={onChange} onSend={onSend} onFileUpload={onFileUpload}
        multiline placeholder="请描述你的租房合同需求，例如：帮我写一份租房合同。"
        className="mt-8 border-slate-950 shadow-none"
      />
      <div className="mt-auto"><HomeIndicator /></div>
    </section>
  );
}
