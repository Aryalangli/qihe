import { FileUp, MoreHorizontal } from "lucide-react";
import type { RecentRecord } from "@/lib/types";

type UploadCardProps = {
  onClick: () => void;
};

export function UploadCard({ onClick }: UploadCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-36 w-full flex-col items-center justify-center rounded-xl border border-dashed border-[#2563EB] bg-blue-50/20 text-center"
    >
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-blue-100 text-[#2563EB]">
        <FileUp size={22} />
      </span>
      <span className="mt-3 text-base font-semibold text-slate-800">上传合同</span>
      <span className="mt-1 text-xs text-slate-400">支持 word / pdf / 图片</span>
    </button>
  );
}

export function RecentRecordList({ records }: { records: RecentRecord[] }) {
  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-slate-800">最近记录</h2>
      <div className="space-y-3">
        {records.map((record) => (
          <div key={record.fileName} className="flex items-center gap-3">
            <span className="grid h-5 w-5 place-items-center rounded-sm border-2 border-[#7AA2FF]">
              <span className="h-1.5 w-1.5 rounded-sm bg-[#2563EB]" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-700">
                {record.fileName}
              </p>
              <p className="text-xs text-slate-400">
                {record.date} · {record.status}
              </p>
            </div>
            <button
              type="button"
              aria-label="更多"
              className="grid h-8 w-8 place-items-center rounded-full text-slate-400"
            >
              <MoreHorizontal size={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
