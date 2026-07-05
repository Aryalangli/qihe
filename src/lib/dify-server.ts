/**
 * Dify API 服务端请求工具（仅用于 Next.js API Route，绝不导入客户端）
 *
 * 使用 Node 原生 https 模块而非 fetch()——
 * Node 24 内置 fetch 连接 api.dify.ai 存在兼容性问题（避坑指南 #3）。
 */
import https from "https";

const DIFY_API_HOST = "api.dify.ai";

function getApiKey(): string {
  const key = process.env.DIFY_REVIEW_API_KEY;
  if (!key || key.startsWith("app-xxx")) {
    throw new Error("DIFY_REVIEW_API_KEY 未配置，请在 .env.local 中设置");
  }
  return key;
}

/**
 * 缓冲式请求：等响应完全接收后返回 JSON（适用于文件上传等短请求）
 */
export function difyRequest(
  method: string,
  path: string,
  headers: Record<string, string>,
  body?: Buffer | string,
): Promise<{ status: number; data: any }> {
  const apiKey = getApiKey();

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: DIFY_API_HOST,
        path,
        method,
        headers: {
          ...headers,
          Authorization: `Bearer ${apiKey}`,
          "Content-Length": body ? String(Buffer.byteLength(body)) : "0",
        },
        timeout: 300_000,
      },
      (res) => {
        let raw = "";
        res.on("data", (c) => (raw += c));
        res.on("end", () => {
          try {
            resolve({ status: res.statusCode ?? 500, data: JSON.parse(raw) });
          } catch {
            resolve({ status: res.statusCode ?? 500, data: raw });
          }
        });
      },
    );
    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Dify API 请求超时"));
    });
    if (body) req.write(body as any);
    req.end();
  });
}

/**
 * 流式请求：返回 Web ReadableStream，用于透传 SSE 到客户端（适用于工作流执行）
 */
export function difyStreamRequest(
  method: string,
  path: string,
  headers: Record<string, string>,
  body?: string,
): ReadableStream<Uint8Array> {
  const apiKey = getApiKey();

  return new ReadableStream({
    start(controller) {
      const req = https.request(
        {
          hostname: DIFY_API_HOST,
          path,
          method,
          headers: {
            ...headers,
            Authorization: `Bearer ${apiKey}`,
            "Content-Length": body ? String(Buffer.byteLength(body)) : "0",
          },
          timeout: 600_000, // 审查最长 10 分钟
        },
        (res) => {
          // 非 2xx：缓冲错误信息后 reject
          if (res.statusCode && res.statusCode >= 400) {
            let raw = "";
            res.on("data", (c) => (raw += c));
            res.on("end", () =>
              controller.error(
                new Error(`Dify API ${res.statusCode}: ${raw.slice(0, 500)}`),
              ),
            );
            return;
          }
          res.on("data", (chunk: Buffer) =>
            controller.enqueue(new Uint8Array(chunk)),
          );
          res.on("end", () => controller.close());
          res.on("error", (err) => controller.error(err));
        },
      );
      req.on("error", (err) => controller.error(err));
      req.on("timeout", () => {
        req.destroy();
        controller.error(new Error("Dify API 请求超时"));
      });
      if (body) req.write(body);
      req.end();
    },
  });
}
