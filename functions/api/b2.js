/**
 * NotePot Backblaze B2 Cloud Storage Engine (10GB Free Storage)
 * Bucket: zenstro (Bucket ID: cf2d1dae48585b43a31e0c17)
 */

export const B2_CONFIG = {
  keyId: "fdde88b33ec7",
  applicationKey: "0058d206d8ac9f9fe392d32a52a8f6d4ba8da12dba",
  bucketId: "cf2d1dae48585b43a31e0c17",
  bucketName: "zenstro",
  maxQuotaBytes: 10 * 1024 * 1024 * 1024 // 10 GB
};

export function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export async function getB2Auth(env) {
  const keyId = (env && env.B2_KEY_ID) || B2_CONFIG.keyId;
  const appKey = (env && env.B2_APPLICATION_KEY) || B2_CONFIG.applicationKey;
  const basicAuth = btoa(`${keyId}:${appKey}`);

  const res = await fetch("https://api.backblazeb2.com/b2api/v2/b2_authorize_account", {
    headers: {
      Authorization: `Basic ${basicAuth}`
    }
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`B2 authorize failed (${res.status}): ${errText}`);
  }

  return await res.json();
}

export async function sha1Hex(arrayBuffer) {
  const hashBuffer = await crypto.subtle.digest("SHA-1", arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

export async function uploadToB2(fileName, dataBuffer, mimeType, env) {
  const auth = await getB2Auth(env);
  const bucketId = (env && env.B2_BUCKET_ID) || B2_CONFIG.bucketId;

  // 1. Get upload URL
  const upUrlRes = await fetch(`${auth.apiUrl}/b2api/v2/b2_get_upload_url`, {
    method: "POST",
    headers: {
      Authorization: auth.authorizationToken,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ bucketId })
  });

  if (!upUrlRes.ok) {
    const err = await upUrlRes.text();
    throw new Error(`b2_get_upload_url failed: ${err}`);
  }

  const upUrlData = await upUrlRes.json();
  const sha1 = await sha1Hex(dataBuffer);

  // 2. Upload file
  const uploadRes = await fetch(upUrlData.uploadUrl, {
    method: "POST",
    headers: {
      Authorization: upUrlData.authorizationToken,
      "X-Bz-File-Name": encodeURIComponent(fileName),
      "Content-Type": mimeType || "application/octet-stream",
      "Content-Length": String(dataBuffer.byteLength),
      "X-Bz-Content-Sha1": sha1
    },
    body: dataBuffer
  });

  if (!uploadRes.ok) {
    const err = await uploadRes.text();
    throw new Error(`b2 upload file failed: ${err}`);
  }

  return await uploadRes.json();
}

export async function listB2Files(prefix = "notepot/", maxFiles = 500, env) {
  const auth = await getB2Auth(env);
  const bucketId = (env && env.B2_BUCKET_ID) || B2_CONFIG.bucketId;

  const res = await fetch(`${auth.apiUrl}/b2api/v2/b2_list_file_names`, {
    method: "POST",
    headers: {
      Authorization: auth.authorizationToken,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      bucketId,
      prefix,
      maxFileCount: maxFiles
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`b2_list_file_names failed: ${err}`);
  }

  return await res.json();
}

export async function downloadFromB2(fileName, env) {
  const auth = await getB2Auth(env);
  const bucketName = (env && env.B2_BUCKET_NAME) || B2_CONFIG.bucketName;
  const bucketId = (env && env.B2_BUCKET_ID) || B2_CONFIG.bucketId;

  // Get download token for this file
  const dlAuthRes = await fetch(`${auth.apiUrl}/b2api/v2/b2_get_download_authorization`, {
    method: "POST",
    headers: {
      Authorization: auth.authorizationToken,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      bucketId,
      fileNamePrefix: fileName,
      validDurationInSeconds: 3600
    })
  });

  let dlToken = "";
  if (dlAuthRes.ok) {
    const dlAuth = await dlAuthRes.json();
    dlToken = dlAuth.authorizationToken;
  }

  const downloadUrl = `${auth.downloadUrl}/file/${bucketName}/${encodeURIComponent(fileName)}` +
    (dlToken ? `?Authorization=${encodeURIComponent(dlToken)}` : "");

  const fileRes = await fetch(downloadUrl);
  if (!fileRes.ok) {
    throw new Error(`Failed to download file from B2: ${fileRes.status}`);
  }

  return await fileRes.arrayBuffer();
}
