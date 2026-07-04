"use client";

import { useState } from "react";
import { ChatBubble, LoadingMessage, PromptBox } from "@/components/chat";
import { ContractCard } from "@/components/contract-card";
import {
  HomeIndicator,
  PhoneFrame,
  TopNav,
} from "@/components/mobile-shell";
import { fullContractDraft, stoppedContractDraft } from "@/data/mock";
import { mockGenerateContractDraft } from "@/lib/ai-placeholders";
import type { ContractDraft } from "@/lib/types";

type ChatMessage =
  | { id: string; kind: "user"; text: string }
  | { id: string; kind: "assistant"; text: string }
  | { id: string; kind: "contract"; draft: ContractDraft };

export default function GeneratePage() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  async function handleSend() {
    const text = input.trim() || "帮我写一份租房合同。";
    setInput("");

    if (messages.length === 0) {
      setMessages([{ id: "user-1", kind: "user", text }]);
      setLoading(true);
      await mockGenerateContractDraft(text);
      setLoading(false);
      setMessages([
        { id: "user-1", kind: "user", text },
        {
          id: "assistant-1",
          kind: "assistant",
          text: "请介绍案件背景、您的立场、您的要求和文书类型。描述越详细，起草越高效",
        },
        { id: "contract-1", kind: "contract", draft: stoppedContractDraft },
      ]);
      return;
    }

    const nextDraft = await mockGenerateContractDraft(text);
    setMessages((current) => [
      ...current,
      { id: `user-${current.length}`, kind: "user", text },
      {
        id: `contract-${current.length}`,
        kind: "contract",
        draft: nextDraft.status ? fullContractDraft : nextDraft,
      },
    ]);
  }

  return (
    <PhoneFrame>
      <TopNav />

      {messages.length === 0 ? (
        <InitialGenerateState
          value={input}
          onChange={setInput}
          onSend={handleSend}
        />
      ) : (
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="no-scrollbar flex-1 space-y-5 overflow-y-auto px-5 pb-5 pt-16">
            <p className="text-center text-xs text-slate-200">00:23</p>
            {messages.map((message) => {
              if (message.kind === "user") {
                return (
                  <ChatBubble key={message.id} role="user">
                    {message.text}
                  </ChatBubble>
                );
              }

              if (message.kind === "assistant") {
                return (
                  <ChatBubble key={message.id} role="assistant">
                    {message.text}
                  </ChatBubble>
                );
              }

              return <ContractCard key={message.id} draft={message.draft} />;
            })}
            {loading ? <LoadingMessage /> : null}
          </div>

          <div className="px-4 pb-2">
            <PromptBox
              value={input}
              onChange={setInput}
              onSend={handleSend}
              placeholder="请输入问题"
              className="rounded-2xl"
            />
          </div>
          <HomeIndicator />
        </div>
      )}
    </PhoneFrame>
  );
}

function InitialGenerateState({
  value,
  onChange,
  onSend,
}: {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
}) {
  return (
    <section className="flex flex-1 flex-col px-8 pt-28">
      <h1 className="text-center text-3xl font-bold text-slate-950">合同生成</h1>
      <PromptBox
        value={value}
        onChange={onChange}
        onSend={onSend}
        multiline
        placeholder="请描述你的租房合同需求，例如：帮我写一份租房合同。"
        className="mt-8 border-slate-950 shadow-none"
      />
      <p className="mt-28 text-center text-sm text-slate-200">聊天框以下保持空白</p>
      <div className="mt-auto">
        <HomeIndicator />
      </div>
    </section>
  );
}
