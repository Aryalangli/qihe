/**
 * Dify 客户端库（浏览器端使用，通过 Next.js API Route 代理）
 *
 * - Chatflow（合同生成）：streamDifyChatflow / callDifyChatflow
 * - Workflow（合同审查）：uploadReviewFile / streamReviewWorkflow / runReviewWorkflow
 */

/* ================================================================
 * 通用 SSE 流读取器
 * ================================================================ */

type SSEEventHandler = (eventType: string, data: any) => void;

async function readSSEStream(
  response: Response,
  onEvent: SSEEventHandler,
): Promise<void> {
  if (!response.ok || !response.body) {
    throw new Error(`请求失败 (${response.status})`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let currentEvent = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (line.startsWith("event: ")) {
        currentEvent = line.slice(7).trim();
        continue;
      }
      if (!line.startsWith("data: ")) continue;
      const raw = line.slice(6).trim();
      if (!raw) continue;

      try {
        const payload = JSON.parse(raw);
        const eventType = payload.event || currentEvent;
        onEvent(eventType, payload);
      } catch {
        // 忽略非 JSON 行
      }
    }
  }
}

/* ================================================================
 * Chatflow（合同生成）— 保留不动
 * ================================================================ */

type StreamCallbacks = {
  onMessage: (text: string, conversationId: string) => void;
  onComplete: (conversationId: string) => void;
  onError: (error: string) => void;
};

export async function streamDifyChatflow(
  params: {
    query: string;
    conversationId?: string;
    inputs?: Record<string, unknown>;
  } & StreamCallbacks,
) {
  const { query, conversationId, inputs, onMessage, onComplete, onError } =
    params;

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query,
        conversation_id: conversationId || "",
        inputs: inputs || {},
      }),
    });

    await readSSEStream(response, (eventType, payload) => {
      switch (eventType) {
        case "message":
        case "message_replace": {
          const answer = payload.answer;
          if (answer != null) onMessage(answer, payload.conversation_id);
          break;
        }
        case "message_end":
        case "workflow_finished":
          onComplete(payload.conversation_id);
          break;
        case "error":
          onError(payload.message || "未知错误");
          break;
        // workflow_started / node_started / node_finished 忽略
      }
    });
  } catch {
    onError("网络错误，请检查网络连接");
  }
}

export function callDifyChatflow(params: {
  query: string;
  conversationId?: string;
  inputs?: Record<string, unknown>;
}): Promise<{ text: string; conversationId: string }> {
  return new Promise((resolve, reject) => {
    let fullText = "";
    let finalConversationId = params.conversationId || "";

    streamDifyChatflow({
      ...params,
      onMessage: (text, conversationId) => {
        fullText += text;
        finalConversationId = conversationId;
      },
      onComplete: (conversationId) => {
        resolve({ text: fullText, conversationId });
      },
      onError: (error) => {
        reject(new Error(error));
      },
    });
  });
}

/* ================================================================
 * Workflow 审查 — 文件上传
 * ================================================================ */

export interface UploadedFileInfo {
  upload_file_id: string;
  name: string;
  extension: string;
  type: "image" | "document";
}

function getFileType(extension: string): "image" | "document" {
  const imageExts = ["jpg", "jpeg", "png", "bmp", "webp"];
  return imageExts.includes(extension.toLowerCase()) ? "image" : "document";
}

/**
 * 上传单个文件到 Dify（通过 /api/review/upload 代理）
 */
export async function uploadReviewFile(file: File): Promise<UploadedFileInfo> {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch("/api/review/upload", {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error || `上传失败 (${res.status})`);
  }

  const data = await res.json();
  const ext = data.extension || file.name.split(".").pop() || "";

  return {
    upload_file_id: data.upload_file_id,
    name: data.name || file.name,
    extension: ext,
    type: getFileType(ext),
  };
}

/* ================================================================
 * Workflow 审查 — SSE 流式执行
 * ================================================================ */

export interface ReviewWorkflowParams {
  files?: { upload_file_id: string; type: "image" | "document" }[];
  contract_text?: string;
}

export interface ReviewStreamCallbacks {
  onStageChange?: (stage: string) => void;
  onComplete: (outputs: Record<string, unknown>) => void;
  onError: (error: string) => void;
}

/**
 * 流式执行审查工作流，通过 /api/review SSE 代理
 */
export async function streamReviewWorkflow(
  params: ReviewWorkflowParams,
  callbacks: ReviewStreamCallbacks,
): Promise<void> {
  const { onStageChange, onComplete, onError } = callbacks;

  try {
    const response = await fetch("/api/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contract_text: params.contract_text || "",
        files: params.files || [],
      }),
    });

    await readSSEStream(response, (eventType, payload) => {
      switch (eventType) {
        case "workflow_started":
          onStageChange?.("AI 审核中，扫描件较多时约需 1–3 分钟");
          break;
        case "node_started":
          // 可选：根据节点标题更新阶段文案（§6.3）
          if (payload.data?.title && onStageChange) {
            const title: string = payload.data.title;
            if (title.includes("OCR") || title.includes("百度")) {
              onStageChange("正在识别图片文字…");
            } else if (title.includes("PDF") || title.includes("转图片")) {
              onStageChange("检测到扫描件，正在转换…");
            } else if (title.includes("文档提取")) {
              onStageChange("正在提取文档内容…");
            } else if (title.includes("LLM") || title.includes("审核") || title.includes("抽取")) {
              onStageChange("AI 律师正在逐条审核…（约需 30–90 秒）");
            }
          }
          break;
        case "workflow_finished":
          if (payload.data?.status === "failed") {
            onError(payload.data?.error || "工作流执行失败");
          } else {
            onComplete(payload.data?.outputs ?? {});
          }
          break;
        case "error":
          onError(payload.message || payload.data?.message || "未知错误");
          break;
        // node_finished 忽略
      }
    });
  } catch (err: any) {
    onError(err.message || "网络错误，请检查网络连接");
  }
}

/**
 * Promise 封装：执行审查工作流并返回最终 outputs
 */
export function runReviewWorkflow(
  params: ReviewWorkflowParams,
  onStageChange?: (stage: string) => void,
): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    streamReviewWorkflow(params, {
      onStageChange,
      onComplete: (outputs) => resolve(outputs),
      onError: (error) => reject(new Error(error)),
    });
  });
}
