/**
 * POST /api/review — 执行合同审查工作流 SSE 代理（§3.2–3.3）
 *
 * 请求体：{ contract_text?: string; files?: { upload_file_id: string; type: "image"|"document" }[] }
 * 响应：SSE 流（text/event-stream），透传 Dify workflow 事件
 *
 * 删除旧 GET 轮询接口（Mock 时代产物）
 */
import { NextRequest } from "next/server";
import { difyStreamRequest } from "@/lib/dify-server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const contractText: string = (body.contract_text ?? "").trim();
    const files: { upload_file_id: string; type: "image" | "document" }[] =
      body.files ?? [];

    // 构造 Dify workflow 请求体
    const difyBody = JSON.stringify({
      inputs: {
        contract_text: contractText,
        contract_files: files.map((f) => ({
          transfer_method: "local_file",
          upload_file_id: f.upload_file_id,
          type: f.type,
        })),
      },
      response_mode: "streaming",
      user: "qihe_user",
    });

    const stream = difyStreamRequest(
      "POST",
      "/v1/workflows/run",
      { "Content-Type": "application/json" },
      difyBody,
    );

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err: any) {
    console.error("Review proxy error:", err);
    return new Response(
      JSON.stringify({ error: err?.message || "审查请求失败" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}

// 删除旧 GET 轮询接口
