import { uploadToB2, listB2Files, B2_CONFIG, formatBytes } from "./b2.js";

function getCorsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-User-Email",
    "Content-Type": "application/json"
  };
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: getCorsHeaders() });
}

export async function onRequest(context) {
  const { request, env } = context;
  const cors = getCorsHeaders();
  const method = request.method;

  if (method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors });
  }

  try {
    if (method === "GET") {
      const b2Data = await listB2Files("notepot/", 500, env);
      const files = b2Data.files || [];
      let totalBytes = 0;
      files.forEach(f => { totalBytes += (f.contentLength || 0); });

      return new Response(JSON.stringify({
        ok: true,
        bucket: B2_CONFIG.bucketName,
        totalFiles: files.length,
        usedBytes: totalBytes,
        usedFormatted: formatBytes(totalBytes),
        maxQuota: "10.00 GB",
        percentUsed: ((totalBytes / B2_CONFIG.maxQuotaBytes) * 100).toFixed(2)
      }), {
        status: 200,
        headers: cors
      });
    }

    if (method === "POST") {
      const formData = await request.formData();
      const file = formData.get("file");
      const path = formData.get("path") || `notepot/uploads/${Date.now()}-${file.name || "file"}`;

      if (!file) {
        return new Response(JSON.stringify({ ok: false, error: "No file provided" }), {
          status: 400,
          headers: cors
        });
      }

      const buffer = await file.arrayBuffer();
      const uploaded = await uploadToB2(path, buffer, file.type, env);

      return new Response(JSON.stringify({
        ok: true,
        file: uploaded,
        path
      }), {
        status: 200,
        headers: cors
      });
    }

    return new Response(JSON.stringify({ ok: false, error: "Method not allowed" }), {
      status: 405,
      headers: cors
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e.message }), {
      status: 500,
      headers: cors
    });
  }
}
