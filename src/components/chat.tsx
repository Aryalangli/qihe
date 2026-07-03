"use client";

import { Copy, Plus, Send, ThumbsDown, ThumbsUp } from "lucide-react";
import { QiheLogo } from "@/components/brand";
import { cn } from "@/lib/utils";

type PromptBoxProps = {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  multiline?: boolean;
  className?: string;
};

export function PromptBox({
  placeholder,
  value,
  onChange,
  onSend,
  multiline = false,
  className,
}: PromptBoxProps) {
  return (
    <div
      className={cn(
        "rounded-[20px] border border-slate-200 bg-white shadow-sm",
        multiline ? "p-4" : "flex items-center gap-2 px-3 py-2",
        className,
      )}
    >
      {multiline ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="h-24 w-full resize-none bg-transparent text-base leading-7 text-slate-800 outline-none placeholder:text-slate-400"
        />
      ) : (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") onSend();
          }}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
        />
      )}

      <div className={cn("flex items-center gap-2", multiline && "justify-end")}>
        <button
          type="button"
          aria-label="添加附件"
          className="grid h-10 w-10 place-items-center rounded-full border border-slate-950 text-slate-950"
        >
          <Plus size={22} />
        </button>
        <button
          type="button"
          onClick={onSend}
          aria-label="发送"
          className="grid h-10 w-10 place-items-center rounded-full bg-[#2563EB] text-white shadow-sm"
        >
          <Send size={18} fill="currentColor" />
        </button>
      </div>
    </div>
  );
}

export function ChatBubble({
  role,
  children,
}: {
  role: "user" | "assistant";
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex", role === "user" ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm",
          role === "user"
            ? "rounded-tr-md bg-[#2563EB] text-white"
            : "rounded-tl-md bg-slate-50 text-slate-700 ring-1 ring-slate-100",
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function LoadingMessage() {
  return (
    <div className="flex items-center gap-3 px-2 py-2 text-sm text-slate-600">
      <QiheLogo compact className="[&>div:last-child]:hidden" />
      <span>资料检索中...</span>
      <span className="flex gap-1">
        <i className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
        <i className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:120ms]" />
        <i className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:240ms]" />
      </span>
    </div>
  );
}

export function FeedbackActions() {
  const actions = [
    { label: "点赞", icon: ThumbsUp },
    { label: "点踩", icon: ThumbsDown },
    { label: "复制", icon: Copy },
  ];

  return (
    <div className="mt-3 flex items-center gap-4 text-slate-400">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.label}
            type="button"
            aria-label={action.label}
            className="grid h-8 w-8 place-items-center rounded-full hover:bg-slate-50"
          >
            <Icon size={18} />
          </button>
        );
      })}
    </div>
  );
}
