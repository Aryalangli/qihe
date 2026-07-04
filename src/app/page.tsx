"use client";

import Link from "next/link";
import {
  FileCheck2,
  FilePenLine,
  Menu,
  ScanLine,
  Search,
  X,
} from "lucide-react";
import { useState } from "react";
import { QiheLogo } from "@/components/brand";
import { PromptBox } from "@/components/chat";
import { HomeIndicator, PhoneFrame } from "@/components/mobile-shell";
import { historyItems } from "@/data/mock";
import { cn } from "@/lib/utils";

export default function Home() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [prompt, setPrompt] = useState("");

  return (
    <PhoneFrame>
      <div className="relative flex min-h-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between px-8">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="打开历史对话"
            className="grid h-11 w-11 place-items-center rounded-full text-slate-950"
          >
            <Menu size={34} strokeWidth={2.2} />
          </button>
          <button
            type="button"
            aria-label="功能入口"
            className="grid h-11 w-11 place-items-center rounded-full text-[#F59E0B]"
          >
            <ScanLine size={26} />
          </button>
        </header>

        <section className="flex flex-1 flex-col px-8">
          <div className="mt-24 flex flex-col items-center">
            <QiheLogo />
            <p className="mt-7 text-base font-medium text-slate-500">
              AI 租房合同助手
            </p>
          </div>

          <PromptBox
            value={prompt}
            onChange={setPrompt}
            onSend={() => setPrompt("")}
            multiline
            placeholder={'输入你的租房合同需求，例如："帮我生成一份租房合同"'}
            className="mt-14 border-slate-950 shadow-none"
          />

          <div className="mt-16 grid grid-cols-2 gap-12 px-8">
            <FeatureCard
              href="/generate"
              title="合同生成"
              tint="blue"
              icon={<FilePenLine size={28} />}
            />
            <FeatureCard
              href="/review"
              title="合同审查"
              tint="green"
              icon={<FileCheck2 size={28} />}
            />
          </div>

          <p className="mt-12 text-center text-sm text-slate-300">
            底部导航已删除，保持空白
          </p>
        </section>

        <HomeIndicator />
        <HistoryDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      </div>
    </PhoneFrame>
  );
}

function FeatureCard({
  href,
  title,
  icon,
  tint,
}: {
  href: string;
  title: string;
  icon: React.ReactNode;
  tint: "blue" | "green";
}) {
  return (
    <Link
      href={href}
      className="flex aspect-square flex-col items-center justify-center rounded-[22px] border border-slate-200 bg-white text-slate-900 shadow-sm"
    >
      <span
        className={cn(
          "grid h-16 w-16 place-items-center rounded-full",
          tint === "blue"
            ? "bg-blue-50 text-[#2563EB] ring-1 ring-blue-200"
            : "bg-emerald-50 text-[#34D399] ring-1 ring-emerald-200",
        )}
      >
        {icon}
      </span>
      <span className="mt-3 text-base font-semibold">{title}</span>
    </Link>
  );
}

function HistoryDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <aside
      className={cn(
        "absolute inset-0 z-20 bg-white transition-transform duration-300",
        open ? "translate-x-0" : "-translate-x-full",
      )}
      aria-hidden={!open}
    >
      <div className="flex items-start justify-between px-8 pt-6">
        <div className="flex items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-blue-50 text-2xl font-semibold text-[#2563EB] ring-1 ring-blue-200">
            契
          </div>
          <div>
            <div className="flex items-center gap-1 text-2xl font-medium text-slate-950">
              qihe_user
              <span className="text-lg text-slate-500">›</span>
            </div>
            <p className="mt-1 text-sm text-slate-500">租房合同生成与审查</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="关闭历史对话"
          className="grid h-10 w-10 place-items-center rounded-full text-[#F59E0B]"
        >
          <X size={22} />
        </button>
      </div>

      <div className="px-8 pt-20">
        <div className="mb-10 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-slate-950">历史对话</h2>
        </div>

        <div className="mb-8 flex h-12 items-center gap-3 rounded-xl bg-slate-50 px-4">
          <Search size={18} strokeWidth={1.7} className="shrink-0 text-slate-400" />
          <input
            type="text"
            placeholder="搜索对话"
            className="flex-1 bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none"
          />
        </div>

        <div className="space-y-5">
          {historyItems.map((item) => (
            <button
              key={item.title}
              type="button"
              className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-left shadow-sm"
            >
              <p className="text-lg font-medium text-slate-800">{item.title}</p>
              <p className="mt-2 text-sm text-slate-500">{item.subtitle}</p>
            </button>
          ))}
        </div>

        <p className="mt-36 text-center text-sm text-slate-300">
          下半部分保持空白
        </p>
      </div>

      <div className="absolute bottom-0 left-0 right-0">
        <HomeIndicator />
      </div>
    </aside>
  );
}
