# 契合 AI 租房合同助手

基于 Next.js App Router、TypeScript、Tailwind CSS 的移动端前端骨架。

## 运行

```bash
npm install
npm run dev
```

打开 http://localhost:3000 查看页面。

## 路由

- `/` 首页，含历史对话侧页
- `/generate` 合同生成聊天流
- `/review` 合同审查上传与风险结果流

## 主要目录

- `src/app/page.tsx` 首页与历史对话侧页
- `src/app/generate/page.tsx` 合同生成页
- `src/app/review/page.tsx` 合同审查页
- `src/components/` 可复用 UI 组件
- `src/data/mock.ts` mock 假数据
- `src/lib/ai-placeholders.ts` 大模型占位函数，含 `TODO: 接入大模型 API`

## 当前 mock 替换点

- 历史对话列表：`src/data/mock.ts`
- 合同生成结果：`src/data/mock.ts` 与 `src/lib/ai-placeholders.ts`
- 最近审查记录：`src/data/mock.ts`
- 系统文件列表、相册色块：`src/app/review/page.tsx` 与 `src/data/mock.ts`
- 风险审查结果数组：`src/data/mock.ts` 与 `src/lib/ai-placeholders.ts`
