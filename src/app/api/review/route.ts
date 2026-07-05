import { NextRequest, NextResponse } from "next/server";
import { mockReviewResult } from "@/data/mock";

/**
 * POST /api/review — 上传合同并启动 AI 审查
 * 当前为 mock 实现，实际接入 Dify 时替换逻辑
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "请上传合同文件" }, { status: 400 });
    }

    // TODO: 真实实现时解析 PDF 文本 + 调用 LLM
    // const buffer = Buffer.from(await file.arrayBuffer());
    // const text = await extractPdfText(buffer);
    // const result = await callLLMForReview(text);

    // Mock: 模拟处理延迟
    const reviewId = `review_${Date.now()}`;

    return NextResponse.json({
      review_id: reviewId,
      status: "processing",
      message: "合同已上传，正在分析中...",
    });
  } catch {
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}

/**
 * GET /api/review?id=xxx — 查询审查结果
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "缺少 review_id" }, { status: 400 });
  }

  // TODO: 真实实现时从数据库/缓存查询
  // Mock: 直接返回 mock 结果
  return NextResponse.json({
    review_id: id,
    status: "completed",
    result: mockReviewResult,
  });
}
