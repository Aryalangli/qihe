import { cn } from "@/lib/utils";

type LogoProps = {
  compact?: boolean;
  className?: string;
};

export function QiheLogo({ compact = false, className }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <img
        src="/契合logo.png"
        alt="契合"
        className={cn(compact ? "h-6 w-auto" : "h-12 w-auto")}
      />
      <div>
        <div
          className={cn(
            "font-bold leading-none text-slate-950",
            compact ? "text-lg" : "text-5xl",
          )}
        >
          契合
        </div>
        {compact ? (
          <div className="mt-0.5 text-[11px] text-slate-500">租房合同AI助手</div>
        ) : null}
      </div>
    </div>
  );
}
