import { FileText } from "lucide-react";
import { FeedbackActions } from "@/components/chat";
import type { ContractDraft } from "@/lib/types";

type ContractCardProps = {
  draft: ContractDraft;
  compact?: boolean;
};

export function ContractCard({ draft, compact = false }: ContractCardProps) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-500">
        <FileText size={16} className="text-slate-300" />
        <span>{draft.label}</span>
      </div>

      {draft.status ? (
        <p className="py-2 text-sm font-medium text-slate-700">{draft.status}</p>
      ) : (
        <>
          <h2 className="mb-2 text-base font-semibold text-slate-800">
            {draft.title}
          </h2>
          <div className="space-y-3 text-sm leading-6 text-slate-700">
            {draft.sections.map((section) => (
              <section key={section.title}>
                {!compact ? (
                  <h3 className="mb-1 font-semibold text-slate-700">
                    {section.title}
                  </h3>
                ) : null}
                {section.body.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </section>
            ))}
          </div>
          <button
            type="button"
            className="mt-4 h-9 w-full rounded-lg bg-slate-100 text-sm font-medium text-slate-600"
          >
            查看完整内容
          </button>
        </>
      )}

      <FeedbackActions />
    </article>
  );
}
