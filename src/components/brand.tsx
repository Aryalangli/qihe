import { cn } from "@/lib/utils";

type LogoProps = {
  compact?: boolean;
  className?: string;
};

export function QiheLogo({ compact = false, className }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className={cn("grid gap-1", compact ? "gap-0.5" : "gap-1.5")}>
        <span
          className={cn(
            "block rounded-full bg-[#2563EB]",
            compact ? "h-1.5 w-6" : "h-3 w-12",
          )}
        />
        <span
          className={cn(
            "block rounded-full bg-[#34D399]",
            compact ? "h-1.5 w-8" : "h-3 w-16",
          )}
        />
        <span
          className={cn(
            "block rounded-full bg-[#7AA2FF]",
            compact ? "h-1.5 w-7" : "h-3 w-11",
          )}
        />
      </div>
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
