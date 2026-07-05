/**
 * POST /api/review/upload — 文件上传代理（§3.1）
 *
 * 客户端 multipart(file) → 本 Route → Dify POST /v1/files/upload
 * 返回 { upload_file_id, name, extension }
 */
import { NextRequest, NextResponse } from "next/server";
import { difyRequest } from "@/lib/dify-server";

const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "bmp", "webp", "pdf", "docx"];

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const file = form.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "未提供文件" }, { status: 400 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        { error: `不支持的文件格式 .${ext}，支持：${ALLOWED_EXTENSIONS.join(", ")}` },
        { status: 400 },
      );
    }

    // 构造 multipart/form-data
    const boundary = `----QiheReview${Date.now()}`;
    const CRLF = "\r\n";
    const parts: Buffer[] = [];

    const addPart = (
      name: string,
      value: string | Buffer,
      filename?: string,
      type?: string,
    ) => {
      let header = `--${boundary}${CRLF}Content-Disposition: form-data; name="${name}"`;
      if (filename)
        header += `; filename="${filename}"${CRLF}Content-Type: ${type || "application/octet-stream"}`;
      header += `${CRLF}${CRLF}`;
      parts.push(Buffer.from(header));
      parts.push(typeof value === "string" ? Buffer.from(value) : value);
      parts.push(Buffer.from(CRLF));
    };

    const buffer = Buffer.from(await file.arrayBuffer());
    addPart("file", buffer, file.name, file.type);
    addPart("user", "qihe_user");
    parts.push(Buffer.from(`--${boundary}--${CRLF}`));

    const res = await difyRequest(
      "POST",
      "/v1/files/upload",
      { "Content-Type": `multipart/form-data; boundary=${boundary}` },
      Buffer.concat(parts),
    );

    if (res.status !== 201) {
      console.error("Dify upload error:", res.status, res.data);
      return NextResponse.json(
        { error: `文件上传失败 (${res.status})` },
        { status: 502 },
      );
    }

    return NextResponse.json({
      upload_file_id: res.data.id,
      name: res.data.name,
      extension: res.data.extension,
    });
  } catch (err: any) {
    console.error("Upload proxy error:", err);
    return NextResponse.json(
      { error: err?.message || "上传失败" },
      { status: 500 },
    );
  }
}
