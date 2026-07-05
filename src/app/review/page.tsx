"use client";

import {
  Camera,
  Check,
  Clock,
  File,
  FileText,
  FolderOpen,
  Image as ImageIcon,
  Loader2,
  Search,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  HomeIndicator,
  PhoneFrame,
  StatusBar,
  TopNav,
} from "@/components/mobile-shell";
import { ReviewResultPage } from "@/components/review-result";
import { RecentRecordList, UploadCard } from "@/components/upload-card";
import { fileOptions, historyFiles, recentRecords } from "@/data/mock";
import { mockReviewContract } from "@/lib/ai-placeholders";
import type { ReviewResult } from "@/lib/types";
import { cn } from "@/lib/utils";

type ReviewStep = "entry" | "sheet" | "album" | "files" | "uploading" | "preview" | "result";

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

  async function showResult() {
    const result = await mockReviewContract();
    setReviewResult(result);
    setStep("result");
  }

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
        />
      ) : step === "uploading" ? (
        <UploadLoading
          progress={uploadProgress}
          onProgress={setUploadProgress}
          onComplete={() => setStep("preview")}
        />
      ) : step === "preview" ? (
        <UploadPreview onBack={() => setStep("entry")} onDone={showResult} />
      ) : step === "result" && reviewResult ? (
        <ReviewResultPage data={reviewResult} onBack={() => setStep("preview")} />
      ) : (
        <ReviewEntry
          showSheet={step === "sheet"}
          onUpload={() => setStep("sheet")}
          onCloseSheet={() => setStep("entry")}
          onAlbum={() => setStep("album")}
          onFile={() => setStep("files")}
          onCamera={startUpload}
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
  onCamera,
}: {
  showSheet: boolean;
  onUpload: () => void;
  onCloseSheet: () => void;
  onAlbum: () => void;
  onFile: () => void;
  onCamera: () => void;
}) {
  const hasRecords = recentRecords.length > 0;

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
        </div>
        {hasRecords ? (
          <div className="mt-24">
            <RecentRecordList records={recentRecords} />
          </div>
        ) : (
          <div className="mt-16 flex flex-1 flex-col items-center justify-center text-center">
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
          onCamera={onCamera}
          onFile={onFile}
        />
      ) : null}
    </>
  );
}

function ImportSheet({
  onClose,
  onAlbum,
  onCamera,
  onFile,
}: {
  onClose: () => void;
  onAlbum: () => void;
  onCamera: () => void;
  onFile: () => void;
}) {
  return (
    <div className="absolute inset-0 z-20 bg-black/40" onClick={onClose}>
      <div
        className="absolute bottom-0 left-0 right-0 rounded-t-3xl bg-white px-6 pb-12 pt-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="text-base font-semibold text-slate-800">导入合同</h2>
        <div className="mt-8 grid grid-cols-3 gap-6">
          <SheetOption label="相册" color="emerald" icon={<ImageIcon size={22} />} onClick={onAlbum} />
          <SheetOption label="相机" color="orange" icon={<Camera size={22} />} onClick={onCamera} />
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
  color: "emerald" | "orange" | "blue";
  onClick: () => void;
}) {
  const bg = {
    emerald: "bg-emerald-500",
    orange: "bg-orange-400",
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
}: {
  selectedFile: string;
  onSelect: (id: string) => void;
  onBack: () => void;
  onConfirm: () => void;
}) {
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
        <div className="flex h-11 items-center gap-2 rounded-xl bg-slate-50 px-4 text-slate-400">
          <Search size={16} />
          <span className="text-sm">搜索文件名</span>
        </div>

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
