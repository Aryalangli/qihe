"use client";

import {
  AlignLeft,
  Brain,
  Check,
  ClipboardCheck,
  Clock,
  File,
  FileSearch,
  FileText,
  FolderOpen,
  Image as ImageIcon,
  ScanSearch,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  HomeIndicator,
  PhoneFrame,
  StatusBar,
  TopNav,
} from "@/components/mobile-shell";
import { ReviewResultPage } from "@/components/review-result";
import { RecentRecordList, UploadCard } from "@/components/upload-card";
import { fileOptions, historyFiles, recentRecords } from "@/data/mock";
import { mockReviewContract, reviewContract, reviewContractByText } from "@/lib/ai-placeholders";
import { hasContractContent } from "@/lib/detect-contract";
import type { ReviewResult } from "@/lib/types";
import { cn } from "@/lib/utils";

type ReviewStep =
  | "entry"
  | "sheet"
  | "album"
  | "files"
  | "uploading"
  | "reviewing"
  | "preview"
  | "result"
  | "failed";

const albumTiles = [
  "bg-[#D9D367]",
  "bg-[#76709A]",
  "bg-[#CFA9D0]",
  "bg-[#7F77AD]",
  "bg-[#9ED38B]",
  "bg-[#8FB895]",
  "bg-[#E9EAF0]",
  "bg-[#A895B2]",
  "bg-[#D6929D]",
  "bg-[#79CC55]",
  "bg-[#CF5D8B]",
  "bg-[#CE858D]",
  "bg-[#B8B878]",
  "bg-[#6FA7A3]",
  "bg-[#91A9C5]",
  "bg-[#9C61CE]",
];

export default function ReviewPage() {
  const [step, setStep] = useState<ReviewStep>("entry");
  const [selectedFile, setSelectedFile] = useState(fileOptions[0].id);
  const [selectedPhoto, setSelectedPhoto] = useState(2);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [reviewResult, setReviewResult] = useState<ReviewResult | null>(null);

  // 新增：真实文件上传 + 审查状态
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewStage, setReviewStage] = useState<string>("");
  const [reviewPhase, setReviewPhase] = useState(1);

  /** 根据 SSE 阶段文案映射到审查阶段编号 */
  function mapStageToPhase(stage: string) {
    if (/OCR|PDF|转图|识别图片|文档提取|提取文档/.test(stage)) {
      setReviewPhase(2);
    } else if (/LLM|审核|抽取/.test(stage)) {
      setReviewPhase(3);
    }
  }

  /** 真实审查：上传文件 → 执行工作流 → 展示结果 */
  async function startRealReview(file: File) {
    setUploadedFile(file);
    setReviewError(null);
    setReviewStage("");
    setReviewPhase(1);

    // 阶段 1：上传中（同时展示进度条，上传完成后切到审查中阶段视图）
    setStep("uploading");
    setUploadProgress(0);

    try {
      // 模拟上传进度
      const progressTimer = setInterval(() => {
        setUploadProgress((p) => Math.min(p + Math.random() * 20 + 5, 90));
      }, 300);

      // 上传完成后切到审查阶段视图
      setTimeout(() => {
        clearInterval(progressTimer);
        setUploadProgress(100);
        setStep("reviewing");
      }, 800);

      const result = await reviewContract(file, (stage) => {
        setReviewStage(stage);
        mapStageToPhase(stage);
      });

      // 审查完成 → 短暂展示"生成报告"阶段
      setReviewPhase(4);
      await new Promise((r) => setTimeout(r, 600));

      setReviewResult(result);
      setStep("result");
    } catch (err: any) {
      setReviewError(err.message || "审查请求失败，请检查网络后重试");
      setStep("failed");
    }
  }

  /** 真实审查（文本粘贴）：传文本到工作流 */
  async function handleTextReview(text: string) {
    setReviewError(null);
    setReviewStage("");
    setReviewPhase(1);

    setStep("reviewing");

    try {
      const result = await reviewContractByText(text, (stage) => {
        setReviewStage(stage);
        mapStageToPhase(stage);
      });

      // 审查完成 → 短暂展示"生成报告"阶段
      setReviewPhase(4);
      await new Promise((r) => setTimeout(r, 600));

      setReviewResult(result);
      setStep("result");
    } catch (err: any) {
      setReviewError(err.message || "审查请求失败，请检查网络后重试");
      setStep("failed");
    }
  }

  /** Mock 审查（文本粘贴 / 无文件时 fallback） */
  async function showMockResult() {
    setStep("uploading");
    setUploadProgress(0);
    // 模拟进度
    const timer = setInterval(() => {
      setUploadProgress((p) => Math.min(p + Math.random() * 30 + 10, 100));
    }, 200);
    const result = await mockReviewContract();
    clearInterval(timer);
    setUploadProgress(100);
    setReviewResult(result);
    setStep("result");
  }

  /** FilePicker 确认上传（mock 文件选择 → 切到 mock 审查） */
  function startUpload() {
    setStep("uploading");
    setUploadProgress(0);
  }

  return (
    <PhoneFrame className={step === "album" ? "bg-[#2E333B]" : undefined}>
      {step === "album" ? (
        <AlbumPicker
          selectedPhoto={selectedPhoto}
          onSelect={setSelectedPhoto}
          onCancel={() => setStep("entry")}
          onDone={startUpload}
        />
      ) : step === "files" ? (
        <FilePicker
          selectedFile={selectedFile}
          onSelect={setSelectedFile}
          onBack={() => setStep("entry")}
          onConfirm={startUpload}
          onFilePicked={(file) => startRealReview(file)}
        />
      ) : step === "uploading" ? (
        <UploadLoading
          progress={uploadProgress}
          onProgress={setUploadProgress}
          onComplete={() => setStep("preview")}
        />
      ) : step === "reviewing" ? (
        <ReviewingStage phase={reviewPhase} stage={reviewStage} />
      ) : step === "preview" ? (
        <UploadPreview onBack={() => setStep("entry")} onDone={showMockResult} />
      ) : step === "result" && reviewResult ? (
        <ReviewResultPage data={reviewResult} onBack={() => setStep("entry")} />
      ) : step === "failed" ? (
        <FailedStage
          error={reviewError}
          onRetry={() => {
            if (uploadedFile) startRealReview(uploadedFile);
          }}
          onBack={() => {
            setStep("entry");
            setUploadedFile(null);
            setReviewError(null);
          }}
        />
      ) : (
        <ReviewEntry
          showSheet={step === "sheet"}
          onUpload={() => setStep("sheet")}
          onCloseSheet={() => setStep("entry")}
          onAlbum={() => setStep("album")}
          onFile={() => setStep("files")}
          onTextSubmit={handleTextReview}
          onFilePicked={(file) => startRealReview(file)}
        />
      )}
    </PhoneFrame>
  );
}

function ReviewEntry({
  showSheet,
  onUpload,
  onCloseSheet,
  onAlbum,
  onFile,
  onTextSubmit,
  onFilePicked,
}: {
  showSheet: boolean;
  onUpload: () => void;
  onCloseSheet: () => void;
  onAlbum: () => void;
  onFile: () => void;
  onTextSubmit: (text: string) => void;
  onFilePicked: (file: File) => void;
}) {
  const hasRecords = recentRecords.length > 0;
  const [contractText, setContractText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const textLength = contractText.trim().length;
  const textTooShort = contractText.trim().length > 0 && textLength <= 10;
  const notContract = textLength > 10 && !hasContractContent(contractText.trim());

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      onFilePicked(file);
      e.target.value = "";
    }
  }

  return (
    <>
      <StatusBar />
      <TopNav />
      <section className="flex flex-1 flex-col px-7 pt-14">
        <h1 className="text-center text-2xl font-bold text-slate-950">
          AI 合同审查
        </h1>
        <div className="mt-8">
          <UploadCard onClick={onUpload} />
          {/* 隐藏的真实文件 input，ImportSheet 或 FilePicker 内触发 */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.bmp,.webp"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* 文本输入区域 */}
        <div className="mt-5 flex items-center gap-3">
          <span className="h-px flex-1 bg-slate-200" />
          <span className="text-xs text-slate-400">或</span>
          <span className="h-px flex-1 bg-slate-200" />
        </div>
        <div className="mt-4">
          <div className="relative">
            <textarea
              value={contractText}
              onChange={(e) => setContractText(e.target.value)}
              placeholder="直接粘贴合同文本内容..."
              rows={5}
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-4 pr-10 text-sm text-slate-700 placeholder:text-slate-400 focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
            />
            <AlignLeft size={16} className="absolute right-3 top-4 text-slate-300" />
          </div>
          {textTooShort && (
            <p className="mt-1 text-xs text-amber-500">
              文本需超过 10 字才能开始审查（当前 {textLength} 字）
            </p>
          )}
          {notContract && (
            <p className="mt-1 text-xs text-amber-500">
              未识别到合同，请输入您的合同。
            </p>
          )}
          <button
            type="button"
            onClick={() => {
              if (contractText.trim().length > 10) {
                onTextSubmit(contractText.trim());
              }
            }}
            disabled={contractText.trim().length <= 10 || notContract}
            className="mt-3 h-10 w-full rounded-xl bg-[#2563EB] text-sm font-semibold text-white shadow-sm disabled:opacity-40"
          >
            开始审查
          </button>
        </div>

        {hasRecords ? (
          <div className="mt-8">
            <RecentRecordList records={recentRecords} />
          </div>
        ) : (
          <div className="mt-8 flex flex-1 flex-col items-center justify-center text-center">
            <div className="grid h-20 w-20 place-items-center rounded-full bg-slate-50">
              <File size={36} strokeWidth={1.5} className="text-slate-300" />
            </div>
            <p className="mt-6 text-base font-medium text-slate-500">暂无历史记录</p>
            <p className="mt-2 text-sm text-slate-400">
              上传你的第一份合同，开始智能审查
            </p>
          </div>
        )}
        {hasRecords ? (
          <div className="mt-auto">
            <HomeIndicator />
          </div>
        ) : null}
      </section>
      {showSheet ? (
        <ImportSheet
          onClose={onCloseSheet}
          onAlbum={onAlbum}
          onFile={() => fileInputRef.current?.click()}
        />
      ) : null}
    </>
  );
}

function ImportSheet({
  onClose,
  onAlbum,
  onFile,
}: {
  onClose: () => void;
  onAlbum: () => void;
  onFile: () => void;
}) {
  return (
    <div className="absolute inset-0 z-20 bg-black/40" onClick={onClose}>
      <div
        className="absolute bottom-0 left-0 right-0 rounded-t-3xl bg-white px-6 pb-12 pt-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="text-base font-semibold text-slate-800">导入合同</h2>
        <div className="mt-8 grid grid-cols-2 gap-6">
          <SheetOption label="相册" color="emerald" icon={<ImageIcon size={22} />} onClick={onAlbum} />
          <SheetOption label="系统文件" color="blue" icon={<File size={22} />} onClick={onFile} />
        </div>
      </div>
    </div>
  );
}

function SheetOption({
  label,
  icon,
  color,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  color: "emerald" | "blue";
  onClick: () => void;
}) {
  const bg = {
    emerald: "bg-emerald-500",
    blue: "bg-blue-500",
  }[color];

  return (
    <button type="button" onClick={onClick} className="flex flex-col items-center">
      <span className={`grid h-12 w-12 place-items-center rounded-xl ${bg} text-white`}>
        {icon}
      </span>
      <span className="mt-3 text-xs text-slate-500">{label}</span>
    </button>
  );
}

function UploadLoading({
  progress,
  onProgress,
  onComplete,
}: {
  progress: number;
  onProgress: (value: number) => void;
  onComplete: () => void;
}) {
  useEffect(() => {
    if (progress >= 100) {
      const timer = setTimeout(onComplete, 500);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => {
      onProgress(Math.min(progress + Math.random() * 30 + 10, 100));
    }, 400);
    return () => clearTimeout(timer);
  }, [progress, onProgress, onComplete]);

  return (
    <>
      <StatusBar />
      <TopNav centeredTitle title="上传合同" />
      <section className="flex flex-1 flex-col items-center justify-center px-7">
        <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-50">
          <Upload size={36} strokeWidth={1.8} className="text-[#2563EB]" />
        </div>
        <h2 className="text-lg font-semibold text-slate-800">正在上传合同...</h2>
        <p className="mt-2 text-sm text-slate-400">请稍后，正在解析文件内容</p>

        <div className="mt-10 h-1.5 w-56 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-[#2563EB] transition-all duration-300 ease-out"
            style={{ width: `${Math.round(progress)}%` }}
          />
        </div>
        <p className="mt-3 text-xs text-slate-400">{Math.round(progress)}%</p>
      </section>
    </>
  );
}

/** 审查中阶段 — 四阶段进度可视化 */
function ReviewingStage({ phase, stage }: { phase: number; stage: string }) {
  const phases = [
    {
      key: 1,
      icon: FileSearch,
      title: "文件解析",
      desc: "正在上传并解析合同文件…",
    },
    {
      key: 2,
      icon: ScanSearch,
      title: "内容提取",
      desc: "正在识别文档中的关键信息…",
    },
    {
      key: 3,
      icon: Brain,
      title: "AI 逐条审核",
      desc: "AI 律师正在逐条审查合同条款…",
    },
    {
      key: 4,
      icon: ClipboardCheck,
      title: "生成报告",
      desc: "正在生成审查报告…",
    },
  ];

  return (
    <>
      <StatusBar />
      <TopNav centeredTitle title="AI 审查中" />
      <section className="flex flex-1 flex-col items-center px-7 pt-10">
        {/* 标题：偏中间 */}
        <h2 className="text-center text-lg font-semibold text-slate-800">
          AI 合同审查中
        </h2>

        {/* 四阶段进度条 — 缩小版，往下放 */}
        <div className="mt-10 w-full max-w-xs space-y-0">
          {phases.map((p, i) => {
            const isDone = phase > p.key;
            const isActive = phase === p.key;
            const isPending = phase < p.key;

            return (
              <div key={p.key} className="flex gap-3">
                {/* 左侧：图标 + 连接线 */}
                <div className="flex flex-col items-center">
                  {/* 圆 */}
                  <div
                    className={cn(
                      "relative z-10 grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 transition-colors duration-500",
                      isDone &&
                        "border-emerald-400 bg-emerald-50 text-emerald-500",
                      isActive &&
                        "border-[#2563EB] bg-blue-50 text-[#2563EB]",
                      isPending && "border-slate-200 bg-white text-slate-300",
                    )}
                  >
                    {isDone ? (
                      <Check size={13} strokeWidth={2.5} />
                    ) : isActive ? (
                      <>
                        <p.icon size={13} strokeWidth={2} />
                        {/* 脉冲波纹 */}
                        <span className="absolute inset-0 animate-ping rounded-full border-2 border-[#2563EB] opacity-20" />
                      </>
                    ) : (
                      <p.icon size={13} strokeWidth={1.5} />
                    )}
                  </div>
                  {/* 连接线（最后一项不画） */}
                  {i < phases.length - 1 && (
                    <div
                      className={cn(
                        "h-5 w-0.5 transition-colors duration-500",
                        isDone ? "bg-emerald-300" : "bg-slate-200",
                      )}
                    />
                  )}
                </div>

                {/* 右侧：标题 + 描述 */}
                <div
                  className={cn(
                    "pb-5 pt-1.5 transition-colors duration-500",
                    isDone && "text-slate-400",
                    isActive && "text-slate-800",
                    isPending && "text-slate-300",
                  )}
                >
                  <p
                    className={cn(
                      "text-xs font-semibold",
                      isActive && "text-[#2563EB]",
                    )}
                  >
                    {p.title}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-relaxed">
                    {isActive ? stage || p.desc : p.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* 底部三个跳动的点 */}
        <div className="mt-auto mb-8 flex justify-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-2 w-2 animate-bounce rounded-full bg-[#2563EB]"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      </section>
    </>
  );
}

/** 失败态（§6.1：recognition_failed / llm_output_invalid / 网络错误） */
function FailedStage({
  error,
  onRetry,
  onBack,
}: {
  error: string | null;
  onRetry: () => void;
  onBack: () => void;
}) {
  const isRecognitionFailed = error?.includes("识别到的有效文本过短");

  return (
    <>
      <StatusBar />
      <TopNav centeredTitle title="审查失败" onBack={onBack} />
      <section className="flex flex-1 flex-col items-center justify-center px-7">
        <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-red-50">
          <X size={36} strokeWidth={1.8} className="text-red-400" />
        </div>
        <h2 className="text-lg font-semibold text-slate-800">
          {isRecognitionFailed ? "无法识别合同内容" : "审查失败"}
        </h2>
        <p className="mt-3 text-center text-sm leading-6 text-slate-500">
          {error || "未知错误"}
        </p>

        <div className="mt-10 flex w-full flex-col gap-3">
          {isRecognitionFailed ? (
            <>
              <button
                type="button"
                onClick={onBack}
                className="h-11 w-full rounded-xl bg-[#2563EB] text-sm font-semibold text-white"
              >
                重新上传文件
              </button>
              <button
                type="button"
                onClick={onBack}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-600"
              >
                改为粘贴文本
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onRetry}
                className="h-11 w-full rounded-xl bg-[#2563EB] text-sm font-semibold text-white"
              >
                重试
              </button>
              <button
                type="button"
                onClick={onBack}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-600"
              >
                返回
              </button>
            </>
          )}
        </div>
      </section>
    </>
  );
}

function AlbumPicker({
  selectedPhoto,
  onSelect,
  onCancel,
  onDone,
}: {
  selectedPhoto: number;
  onSelect: (index: number) => void;
  onCancel: () => void;
  onDone: () => void;
}) {
  return (
    <>
      <div className="flex h-16 items-center justify-between bg-[#2E333B] px-4 pt-3 text-white">
        <button type="button" onClick={onCancel} aria-label="返回">
          ‹
        </button>
        <h1 className="text-base font-medium">相机胶卷</h1>
        <button type="button" onClick={onCancel} className="text-sm">
          取消
        </button>
      </div>
      <div className="grid grid-cols-4 gap-1 bg-[#2E333B] p-2">
        {albumTiles.map((tile, index) => (
          <button
            key={`${tile}-${index}`}
            type="button"
            onClick={() => onSelect(index)}
            className={cn("relative aspect-square overflow-hidden", tile)}
          >
            <span className="absolute left-4 top-4 h-6 w-6 rounded-full bg-blue-100/80" />
            <span className="absolute inset-x-5 top-8 h-10 rounded-sm bg-slate-100/80" />
            <span className="absolute inset-x-7 top-12 h-px bg-slate-400/50" />
            <span className="absolute inset-x-7 top-16 h-px bg-slate-400/50" />
            <span
              className={cn(
                "absolute right-2 top-2 grid h-5 w-5 place-items-center rounded-full border border-white",
                selectedPhoto === index && "border-emerald-500 bg-emerald-500",
              )}
            >
              {selectedPhoto === index ? <Check size={13} className="text-white" /> : null}
            </span>
          </button>
        ))}
      </div>
      <div className="mt-auto flex items-center justify-between bg-[#2E333B] px-6 py-4 text-sm">
        <button type="button" className="text-[#F97316]">
          预览(1)
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-full bg-[#F97316] px-3 py-1 text-white"
        >
          1 已完成
        </button>
      </div>
    </>
  );
}

function FilePicker({
  selectedFile,
  onSelect,
  onBack,
  onConfirm,
  onFilePicked,
}: {
  selectedFile: string;
  onSelect: (id: string) => void;
  onBack: () => void;
  onConfirm: () => void;
  onFilePicked: (file: File) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      onFilePicked(file);
      e.target.value = "";
    }
  }

  return (
    <>
      <StatusBar />
      <header className="flex h-12 items-center px-4">
        <button type="button" onClick={onBack} className="grid h-9 w-9 place-items-center text-[24px]">
          ‹
        </button>
        <h1 className="flex-1 text-center text-lg font-semibold text-slate-950">
          系统文件
        </h1>
        <div className="w-9" />
      </header>
      <section className="no-scrollbar flex flex-1 flex-col overflow-y-auto px-6 pt-2">
        {/* 真实文件上传入口 */}
        <label className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-50 text-sm font-medium text-[#2563EB] transition-colors hover:bg-blue-100">
          <Upload size={16} />
          点击选择本地文件（PDF / Word / 图片）
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.bmp,.webp"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>

        <h2 className="mt-8 text-base font-semibold text-slate-800">文件类型</h2>
        <div className="mt-4 space-y-3">
          {fileOptions.map((file) => (
            <button
              key={file.id}
              type="button"
              onClick={() => onSelect(file.id)}
              className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left shadow-sm"
            >
              <FolderOpen size={22} className="text-[#7AA2FF]" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-700">
                  {file.fileName}
                </p>
                <p className="mt-1 text-xs text-slate-400">{file.meta}</p>
              </div>
              <span
                className={cn(
                  "grid h-6 w-6 place-items-center rounded-full border border-slate-300",
                  selectedFile === file.id && "border-[#2563EB] bg-[#2563EB]",
                )}
              >
                {selectedFile === file.id ? <Check size={15} className="text-white" /> : null}
              </span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onConfirm}
          className="mx-auto mt-10 h-12 w-48 rounded-xl bg-[#2563EB] font-semibold text-white shadow-sm"
        >
          确认上传
        </button>

        <h2 className="mt-10 text-base font-semibold text-slate-800">历史文件</h2>
        <div className="mt-4 space-y-3">
          {historyFiles.map((file) => (
            <button
              key={`${file.fileName}-${file.date}`}
              type="button"
              onClick={onConfirm}
              className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left shadow-sm"
            >
              <Clock size={22} className="text-slate-400" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-700">
                  {file.fileName}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {file.date} · {file.status}
                </p>
              </div>
            </button>
          ))}
        </div>

        <HomeIndicator />
      </section>
    </>
  );
}

function UploadPreview({
  onBack,
  onDone,
}: {
  onBack: () => void;
  onDone: () => void;
}) {
  const previewFiles = [
    {
      name: "房屋租赁合同.pdf",
      type: "PDF",
      date: "2026-07-04",
      status: "待审查" as const,
    },
  ];

  const statusStyle = (status: string) => {
    switch (status) {
      case "审查完成":
        return "text-emerald-500";
      case "审查中":
        return "text-orange-400";
      default:
        return "text-slate-400";
    }
  };

  const getPreviewFileIcon = (name: string) => {
    const ext = name.split(".").pop()?.toLowerCase() ?? "";
    if (ext === "doc" || ext === "docx") return <FileText size={16} className="inline text-[#2563EB]" />;
    if (ext === "pdf") return <FileText size={16} className="inline text-[#DC2626]" />;
    return <ImageIcon size={16} className="inline text-[#059669]" />;
  };

  return (
    <>
      <StatusBar />
      <TopNav centeredTitle title="AI合同审查" onBack={onBack} action="none" />
      <section className="flex flex-1 flex-col px-7 pt-8">
        <button
          type="button"
          onClick={onDone}
          className="relative aspect-[0.72] w-full rounded-xl bg-[#E9C2C9] p-5 text-left"
        >
          <div className="mt-4 space-y-3">
            {Array.from({ length: 7 }).map((_, index) => (
              <span
                key={index}
                className="block h-px rounded-full bg-slate-500/45"
              />
            ))}
          </div>
          <span className="absolute bottom-5 left-4 text-xs text-white/70">01</span>
        </button>
        {previewFiles.map((file) => (
          <div key={file.name} className="mt-3">
            <p className="truncate text-sm text-slate-400 whitespace-nowrap">
              {getPreviewFileIcon(file.name)}{" "}
              <span className="font-semibold text-slate-700">{file.name}</span>
              &nbsp;&nbsp;·&nbsp;&nbsp;{file.date}&nbsp;&nbsp;·&nbsp;&nbsp;
              <span className={statusStyle(file.status)}>
                ● {file.status}
              </span>
            </p>
          </div>
        ))}

        <button
          type="button"
          onClick={onDone}
          className="mx-auto mt-auto h-12 w-48 rounded-xl bg-[#2563EB] font-semibold text-white shadow-sm"
        >
          开始审查
        </button>
        <HomeIndicator />
      </section>
    </>
  );
}
