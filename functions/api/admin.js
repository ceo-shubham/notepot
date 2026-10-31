import { listB2Files, downloadFromB2, B2_CONFIG, formatBytes } from "./b2.js";

const SUPER_ADMIN_EMAIL = "ceo.shubhampathak@gmail.com";

function getCorsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-User-Email",
    "Content-Type": "application/json"
  };
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders()
  });
}

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const cors = getCorsHeaders();

  const userEmail = (
    request.headers.get("X-User-Email") ||
    url.searchParams.get("adminEmail") ||
    ""
  ).trim().toLowerCase();

  // Validate Super Admin
  if (userEmail !== SUPER_ADMIN_EMAIL.toLowerCase()) {
    return new Response(JSON.stringify({
      ok: false,
      error: "Access denied. Only ceo.shubhampathak@gmail.com can access the NotePot Super Admin Panel."
    }), {
      status: 403,
      headers: cors
    });
  }

  const action = url.searchParams.get("action") || "overview";

  try {
    // 1. Storage Stats & Overview
    if (action === "storage" || action === "overview") {
      const b2Data = await listB2Files("notepot/", 1000, env);
      const files = b2Data.files || [];

      let totalBytesUsed = 0;
      files.forEach(f => {
        totalBytesUsed += (f.contentLength || 0);
      });

      const maxQuota = B2_CONFIG.maxQuotaBytes; // 10 GB
      const freeBytes = Math.max(0, maxQuota - totalBytesUsed);
      const usedPercent = ((totalBytesUsed / maxQuota) * 100).toFixed(2);

      // Load manifest for user and document stats
      let manifest = { users: {}, documents: [] };
      try {
        const buf = await downloadFromB2("notepot/manifest.json", env);
        manifest = JSON.parse(new TextDecoder().decode(buf));
      } catch (e) {
        // manifest not created yet
      }

      // Group documents by user
      const usersList = Object.keys(manifest.users || {}).map(email => {
        const u = manifest.users[email];
        const userDocs = (manifest.documents || []).filter(d => (d.userEmail || "").toLowerCase() === email.toLowerCase());
        return {
          email,
          name: u.name || email.split("@")[0],
          lastActive: u.lastActive,
          documentCount: userDocs.length,
          documents: userDocs
        };
      });

      return new Response(JSON.stringify({
        ok: true,
        superAdmin: SUPER_ADMIN_EMAIL,
        system: {
          app: "NotePot",
          version: "1.0.0",
          platform: "Cloudflare Pages & Backblaze B2",
          storageProvider: "Backblaze B2 (10GB Free Tier)",
          bucketName: B2_CONFIG.bucketName,
          totalFiles: files.length,
          usedBytes: totalBytesUsed,
          usedFormatted: formatBytes(totalBytesUsed),
          freeBytes: freeBytes,
          freeFormatted: formatBytes(freeBytes),
          quotaFormatted: "10.00 GB",
          usedPercent: Number(usedPercent)
        },
        stats: {
          totalUsers: usersList.length,
          totalAssignments: (manifest.documents || []).length,
          recentAssignments: (manifest.documents || []).slice(0, 10)
        },
        users: usersList,
        allDocuments: manifest.documents || []
      }), {
        status: 200,
        headers: cors
      });
    }

    // 2. Inspect specific user's document
    if (action === "inspect_document") {
      const targetEmail = url.searchParams.get("targetEmail");
      const docId = url.searchParams.get("docId");

      if (!targetEmail || !docId) {
        return new Response(JSON.stringify({ ok: false, error: "targetEmail and docId required" }), {
          status: 400,
          headers: cors
        });
      }

      const filePath = `notepot/users/${targetEmail.toLowerCase()}/${docId}.json`;
      const buf = await downloadFromB2(filePath, env);
      const doc = JSON.parse(new TextDecoder().decode(buf));

      return new Response(JSON.stringify({
        ok: true,
        inspectedUser: targetEmail,
        document: doc
      }), {
        status: 200,
        headers: cors
      });
    }

    return new Response(JSON.stringify({ ok: false, error: "Unknown admin action" }), {
      status: 400,
      headers: cors
    });

  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500,
      headers: cors
    });
  }
}
