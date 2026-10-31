import { uploadToB2, listB2Files, downloadFromB2, B2_CONFIG, formatBytes } from "./b2.js";

const SUPER_ADMIN_EMAIL = "ceo.shubhampathak@gmail.com";

function getCorsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
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

// Helper: load manifest
async function getManifest(env) {
  try {
    const buf = await downloadFromB2("notepot/manifest.json", env);
    const text = new TextDecoder().decode(buf);
    return JSON.parse(text);
  } catch (e) {
    return {
      appName: "NotePot",
      lastUpdated: new Date().toISOString(),
      users: {},
      documents: []
    };
  }
}

// Helper: save manifest
async function saveManifest(manifest, env) {
  manifest.lastUpdated = new Date().toISOString();
  const text = JSON.stringify(manifest, null, 2);
  const buf = new TextEncoder().encode(text);
  await uploadToB2("notepot/manifest.json", buf, "application/json", env);
}

export async function onRequest(context) {
  const { request, env } = context;
  const method = request.method;
  const url = new URL(request.url);
  const cors = getCorsHeaders();

  if (method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors });
  }

  try {
    // Determine user email from header or query
    const userEmail = (
      request.headers.get("X-User-Email") ||
      url.searchParams.get("userEmail") ||
      "guest@notepot.zenstro.space"
    ).trim().toLowerCase();

    const userName = (
      request.headers.get("X-User-Name") ||
      url.searchParams.get("userName") ||
      userEmail.split("@")[0]
    ).trim();

    const isAdmin = (userEmail === SUPER_ADMIN_EMAIL.toLowerCase());

    // 1. GET /api/documents?id=... OR GET /api/documents (list user's docs or admin docs)
    if (method === "GET") {
      const docId = url.searchParams.get("id");
      const targetUser = url.searchParams.get("targetUser");

      // Admin requesting specific doc or user list
      if (docId) {
        // Fetch specific document
        const targetEmail = (isAdmin && targetUser) ? targetUser.toLowerCase() : userEmail;
        const filePath = `notepot/users/${targetEmail}/${docId}.json`;
        try {
          const buf = await downloadFromB2(filePath, env);
          const docData = JSON.parse(new TextDecoder().decode(buf));
          return new Response(JSON.stringify({ ok: true, document: docData }), {
            status: 200,
            headers: cors
          });
        } catch (e) {
          return new Response(JSON.stringify({ ok: false, error: "Document not found" }), {
            status: 404,
            headers: cors
          });
        }
      }

      // If user wants to list documents
      const manifest = await getManifest(env);
      let docs = manifest.documents || [];

      // Filter by user unless admin requested all
      if (!isAdmin || targetUser) {
        const filterEmail = (isAdmin && targetUser) ? targetUser.toLowerCase() : userEmail;
        docs = docs.filter(d => (d.userEmail || "").toLowerCase() === filterEmail);
      }

      return new Response(JSON.stringify({
        ok: true,
        user: { email: userEmail, name: userName, isAdmin },
        documents: docs
      }), {
        status: 200,
        headers: cors
      });
    }

    // 2. POST /api/documents - Save or Update Document
    if (method === "POST") {
      const body = await request.json();
      const docId = body.id || ("doc_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7));
      const title = (body.title || "Untitled Assignment").trim();
      const pages = body.pages || [];
      const settings = body.settings || {};

      const docPayload = {
        id: docId,
        title,
        userEmail,
        userName,
        pageCount: pages.length,
        settings,
        pages,
        createdAt: body.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const docBuffer = new TextEncoder().encode(JSON.stringify(docPayload, null, 2));
      const filePath = `notepot/users/${userEmail}/${docId}.json`;

      // Upload to Backblaze B2
      await uploadToB2(filePath, docBuffer, "application/json", env);

      // Update Manifest
      const manifest = await getManifest(env);
      if (!manifest.users) manifest.users = {};
      if (!manifest.documents) manifest.documents = [];

      // Update user info
      manifest.users[userEmail] = {
        email: userEmail,
        name: userName,
        lastActive: new Date().toISOString(),
        docCount: (manifest.documents.filter(d => d.userEmail === userEmail).length) + 1
      };

      // Update or insert document summary
      const existingIdx = manifest.documents.findIndex(d => d.id === docId);
      const summary = {
        id: docId,
        title,
        userEmail,
        userName,
        pageCount: pages.length,
        fontFamily: settings.fontFamily || "Kalam",
        paperType: settings.paperType || "hindi-notebook",
        createdAt: docPayload.createdAt,
        updatedAt: docPayload.updatedAt,
        sizeBytes: docBuffer.byteLength,
        filePath
      };

      if (existingIdx >= 0) {
        manifest.documents[existingIdx] = summary;
      } else {
        manifest.documents.unshift(summary);
      }

      await saveManifest(manifest, env);

      return new Response(JSON.stringify({
        ok: true,
        message: "Assignment saved securely to Backblaze B2",
        document: summary
      }), {
        status: 200,
        headers: cors
      });
    }

    // 3. DELETE /api/documents - Delete Document
    if (method === "DELETE") {
      const docId = url.searchParams.get("id");
      if (!docId) {
        return new Response(JSON.stringify({ ok: false, error: "Missing document id" }), {
          status: 400,
          headers: cors
        });
      }

      const manifest = await getManifest(env);
      const doc = (manifest.documents || []).find(d => d.id === docId);

      if (!doc) {
        return new Response(JSON.stringify({ ok: false, error: "Document not found" }), {
          status: 404,
          headers: cors
        });
      }

      // Check permissions: owner or Super Admin
      if (!isAdmin && doc.userEmail !== userEmail) {
        return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), {
          status: 403,
          headers: cors
        });
      }

      manifest.documents = manifest.documents.filter(d => d.id !== docId);
      await saveManifest(manifest, env);

      return new Response(JSON.stringify({
        ok: true,
        message: "Document deleted successfully"
      }), {
        status: 200,
        headers: cors
      });
    }

    return new Response(JSON.stringify({ ok: false, error: "Method not allowed" }), {
      status: 405,
      headers: cors
    });

  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500,
      headers: cors
    });
  }
}
