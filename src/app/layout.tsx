import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "契合 | AI 租房合同助手",
  description: "租房合同生成与审查前端原型",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full">
      <body className="min-h-full bg-[#F3F6FB] text-slate-950 antialiased">
        {children}
      </body>
    </html>
  );
}
