import Link from "next/link";
import { ArrowLeft, BatteryFull, MoreVertical, Share2 } from "lucide-react";
import { QiheLogo } from "@/components/brand";
import { cn } from "@/lib/utils";

type PhoneFrameProps = {
  children: React.ReactNode;
  className?: string;
};

export function PhoneFrame({ children, className }: PhoneFrameProps) {
  return (
    <main className="flex min-h-svh items-center justify-center bg-[#F3F6FB] sm:p-8">
      <section
        className={cn(
          "phone-frame relative flex flex-col overflow-hidden bg-white",
          className,
        )}
      >
        {children}
      </section>
    </main>
  );
}

export function StatusBar({ time = "00:20" }: { time?: string }) {
  return (
    <div className="flex h-11 shrink-0 items-center justify-between px-8 pt-3 text-xs font-medium text-slate-900">
      <span>{time}</span>
      <div className="flex items-center gap-1.5">
        <span>5G</span>
        <span className="text-[10px] tracking-[-1px]">▱▱</span>
        <BatteryFull size={16} strokeWidth={1.8} />
        <span>48</span>
      </div>
    </div>
  );
}

type TopNavProps = {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  action?: "more" | "share";
  centeredTitle?: boolean;
};

export function TopNav({
  title,
  subtitle,
  showBack = true,
  action = "share",
  centeredTitle = false,
}: TopNavProps) {
  const actionIcon =
    action === "share" ? (
      <Share2 size={22} strokeWidth={2} />
    ) : (
      <MoreVertical size={22} strokeWidth={2} />
    );

  return (
    <header className="relative flex h-12 shrink-0 items-center px-4">
      <div className="flex w-10 justify-start">
        {showBack ? (
          <Link
            href="/"
            aria-label="返回首页"
            className="grid h-9 w-9 place-items-center rounded-full text-slate-950"
          >
            <ArrowLeft size={24} strokeWidth={2.4} />
          </Link>
        ) : null}
      </div>

      {centeredTitle ? (
        <div className="absolute left-16 right-16 text-center">
          <h1 className="text-lg font-semibold text-slate-950">{title}</h1>
        </div>
      ) : (
        <div className="min-w-0 flex-1">
          {title ? (
            <div className="flex items-center gap-2">
              <QiheLogo compact />
              {subtitle ? null : (
                <span className="truncate text-base font-semibold">{title}</span>
              )}
            </div>
          ) : (
            <QiheLogo compact />
          )}
        </div>
      )}

      <div className="flex w-10 justify-end">
        <button
          type="button"
          aria-label={action === "share" ? "分享" : "更多"}
          className="grid h-9 w-9 place-items-center rounded-full text-slate-950"
        >
          {actionIcon}
        </button>
      </div>
    </header>
  );
}

export function HomeIndicator() {
  return (
    <div className="flex h-7 shrink-0 items-center justify-center">
      <span className="h-1.5 w-36 rounded-full bg-slate-300" />
    </div>
  );
}
