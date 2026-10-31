/**
 * NotePot Cloud Client & Backblaze B2 Service
 * Handles sync, user session, documents CRUD, and Super Admin access
 */

const SUPER_ADMIN_EMAIL = "ceo.shubhampathak@gmail.com";
const LOCAL_STORAGE_KEY = "notepot_current_doc_v1";
const USER_SESSION_KEY = "notepot_user_session_v1";

export class B2Service {
  constructor() {
    this.currentUser = this.loadStoredUser();
  }

  loadStoredUser() {
    try {
      const stored = localStorage.getItem(USER_SESSION_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn("Could not read stored user:", e);
    }
    // Default guest session
    return {
      email: "guest@notepot.zenstro.space",
      name: "Guest Student",
      picture: "",
      isAdmin: false
    };
  }

  setUser(user) {
    const isAdmin = (user.email || "").trim().toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
    this.currentUser = {
      email: user.email,
      name: user.name || user.email.split("@")[0],
      picture: user.picture || "",
      isAdmin
    };
    try {
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(this.currentUser));
    } catch (e) {}
    return this.currentUser;
  }

  logout() {
    localStorage.removeItem(USER_SESSION_KEY);
    this.currentUser = {
      email: "guest@notepot.zenstro.space",
      name: "Guest Student",
      picture: "",
      isAdmin: false
    };
    return this.currentUser;
  }

  isSuperAdmin() {
    return (this.currentUser.email || "").trim().toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
  }

  getHeaders() {
    return {
      "Content-Type": "application/json",
      "X-User-Email": this.currentUser.email,
      "X-User-Name": this.currentUser.name
    };
  }

  // Save document to Backblaze B2 and localStorage
  async saveDocument(doc) {
    // 1. Save locally for instant persistence
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(doc));
    } catch (e) {}

    // 2. Sync to Backblaze B2
    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(doc)
      });
      const data = await res.json();
      return data;
    } catch (err) {
      console.warn("Backblaze B2 sync warning (saved locally):", err);
      return { ok: true, savedLocally: true, warning: err.message };
    }
  }

  // Fetch user's documents
  async listUserDocuments(targetUserEmail = null) {
    try {
      let url = "/api/documents";
      if (targetUserEmail) {
        url += `?targetUser=${encodeURIComponent(targetUserEmail)}`;
      }
      const res = await fetch(url, {
        headers: this.getHeaders()
      });
      return await res.json();
    } catch (err) {
      console.error("List documents failed:", err);
      return { ok: false, error: err.message, documents: [] };
    }
  }

  // Load a single document by ID
  async getDocument(docId, targetUserEmail = null) {
    try {
      let url = `/api/documents?id=${encodeURIComponent(docId)}`;
      if (targetUserEmail) {
        url += `&targetUser=${encodeURIComponent(targetUserEmail)}`;
      }
      const res = await fetch(url, {
        headers: this.getHeaders()
      });
      return await res.json();
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }

  // Delete a document
  async deleteDocument(docId) {
    try {
      const res = await fetch(`/api/documents?id=${encodeURIComponent(docId)}`, {
        method: "DELETE",
        headers: this.getHeaders()
      });
      return await res.json();
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }

  // Upload PDF Blob to Backblaze B2
  async uploadPdfBackup(docId, pdfBlob, fileName) {
    try {
      const formData = new FormData();
      formData.append("file", pdfBlob, fileName);
      formData.append("path", `notepot/users/${this.currentUser.email}/pdfs/${docId}.pdf`);

      const res = await fetch("/api/storage", {
        method: "POST",
        headers: {
          "X-User-Email": this.currentUser.email
        },
        body: formData
      });
      return await res.json();
    } catch (e) {
      console.warn("PDF B2 backup failed:", e);
      return { ok: false };
    }
  }

  // Super Admin: Fetch all users and inspect platform documents
  async getAdminOverview() {
    if (!this.isSuperAdmin()) {
      throw new Error("Unauthorized: Super Admin access required");
    }
    const res = await fetch("/api/admin?action=overview", {
      headers: this.getHeaders()
    });
    return await res.json();
  }

  // Super Admin: Inspect specific user's document
  async inspectUserDocument(targetEmail, docId) {
    if (!this.isSuperAdmin()) {
      throw new Error("Unauthorized: Super Admin access required");
    }
    const res = await fetch(`/api/admin?action=inspect_document&targetEmail=${encodeURIComponent(targetEmail)}&docId=${encodeURIComponent(docId)}`, {
      headers: this.getHeaders()
    });
    return await res.json();
  }

  // Super Admin: Fetch Backblaze B2 10GB storage details
  async getStorageStats() {
    const res = await fetch("/api/storage", {
      headers: this.getHeaders()
    });
    return await res.json();
  }
}
