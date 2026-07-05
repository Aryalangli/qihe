/**
 * Dify Chatflow 流式客户端
 *
 * Dify 的 SSE 格式：
 *   event: message
 *   data: {"answer": "增量文本", "conversation_id": "..."}
 *
 *   event: message_end
 *   data: {"event": "message_end", "conversation_id": "..."}
 *
 *   event: workflow_finished
 *   data: {"event": "workflow_finished", "conversation_id": "..."}
 *
 *   event: error
 *   data: {"event": "error", "message": "..."}
 */

type StreamCallbacks = {
  onMessage: (text: string, conversationId: string) => void;
  onComplete: (conversationId: string) => void;
  onError: (error: string) => void;
};

/**
 * 调用 Dify Chatflow 流式接口
 */
export async function streamDifyChatflow(params: {
  query: string;
  conversationId?: string;
  inputs?: Record<string, unknown>;
} & StreamCallbacks) {
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

    if (!response.ok || !response.body) {
      onError("请求失败，请稍后重试");
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let currentSseEvent = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        // SSE 事件类型行：event: message
        if (line.startsWith("event: ")) {
          currentSseEvent = line.slice(7).trim();
          continue;
        }

        // SSE 数据行：data: {...}
        if (!line.startsWith("data: ")) continue;
        const raw = line.slice(6).trim();
        if (!raw) continue;

        try {
          const payload = JSON.parse(raw);

          // 优先用 payload.event，否则用 SSE event: 行的值
          const eventType = payload.event || currentSseEvent;

          switch (eventType) {
            case "message":
            case "message_replace": {
              const answer = payload.answer;
              if (answer != null) {
                onMessage(answer, payload.conversation_id);
              }
              break;
            }
            case "message_end":
            case "workflow_finished":
              onComplete(payload.conversation_id);
              break;
            case "error":
              onError(payload.message || "未知错误");
              break;
            default:
              // workflow_started / node_started / node_finished 忽略
              break;
          }
        } catch {
          // 忽略非 JSON 行
        }
      }
    }
  } catch {
    onError("网络错误，请检查网络连接");
  }
}

/**
 * Promise 封装：调用 Dify 并返回完整结果
 */
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
