/**
 * NotePot CEO Super Admin Console
 * Exclusive for ceo.shubhampathak@gmail.com
 * Allows viewing all users, inspecting all documents, and monitoring Backblaze B2 storage
 */

export class AdminPanel {
  constructor(b2Service, onOpenUserDoc) {
    this.b2Service = b2Service;
    this.onOpenUserDoc = onOpenUserDoc;
    this.adminData = null;
  }

  renderModal() {
    let modal = document.getElementById("notepot-admin-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "notepot-admin-modal";
      modal.className = "fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 hidden";
      modal.innerHTML = `
        <div class="bg-slate-900 border border-slate-800 rounded w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl text-white overflow-hidden">
          <!-- Header -->
          <div class="px-5 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-950">
            <div class="flex items-center space-x-3">
              <span class="p-1.5 rounded bg-slate-800 text-amber-500 border border-slate-700">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
              </span>
              <div>
                <h3 class="text-base font-bold flex items-center gap-2">
                  <span>NotePot Super Admin Console</span>
                  <span class="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">ceo.shubhampathak@gmail.com</span>
                </h3>
                <p class="text-xs text-slate-400">Inspect user documents, manage storage on Backblaze B2 (10GB), and monitor Zenstro integration</p>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <a href="https://zenstro.space/admin.html" target="_blank" class="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition">
                <span>Zenstro Admin Portal</span>
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
              </a>
              <button id="close-admin-modal" class="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
          </div>

          <!-- Body -->
          <div class="p-5 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
            <!-- Storage & Stats Overview Cards -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
              <!-- Backblaze 10GB Card -->
              <div class="bg-slate-950 border border-slate-800 rounded p-4">
                <div class="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Backblaze B2</span>
                  <span class="text-emerald-400 font-mono" id="b2-used-percent">0%</span>
                </div>
                <div class="text-xl font-bold text-white mb-2" id="b2-used-formatted">0 MB <span class="text-xs text-slate-500 font-normal">/ 10 GB</span></div>
                <div class="w-full bg-slate-800 rounded h-1.5 overflow-hidden">
                  <div id="b2-storage-bar" class="bg-emerald-500 h-1.5 rounded transition-all duration-300" style="width: 2%"></div>
                </div>
                <div class="text-[11px] text-slate-400 mt-2 flex justify-between font-mono">
                  <span>Free: <strong class="text-slate-200" id="b2-free-formatted">10 GB</strong></span>
                  <span>Bucket: <strong class="text-slate-200">zenstro</strong></span>
                </div>
              </div>

              <!-- Total Users -->
              <div class="bg-slate-950 border border-slate-800 rounded p-4">
                <span class="text-xs text-slate-400 block mb-1">Registered Users</span>
                <div class="text-xl font-bold text-sky-400 font-mono" id="admin-total-users">0</div>
                <p class="text-[11px] text-slate-500 mt-2">Active accounts across platform</p>
              </div>

              <!-- Total Assignments -->
              <div class="bg-slate-950 border border-slate-800 rounded p-4">
                <span class="text-xs text-slate-400 block mb-1">Total Assignments</span>
                <div class="text-xl font-bold text-amber-400 font-mono" id="admin-total-docs">0</div>
                <p class="text-[11px] text-slate-500 mt-2">Multi-page handwritten files</p>
              </div>

              <!-- Storage Files -->
              <div class="bg-slate-950 border border-slate-800 rounded p-4">
                <span class="text-xs text-slate-400 block mb-1">Stored B2 Files</span>
                <div class="text-xl font-bold text-slate-200 font-mono" id="admin-total-files">0</div>
                <p class="text-[11px] text-slate-500 mt-2">Payloads, PDFs, and manifests</p>
              </div>
            </div>

            <!-- Users & Inspection Section -->
            <div class="bg-slate-950 border border-slate-800 rounded p-4">
              <div class="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div>
                  <h4 class="text-sm font-semibold text-white">Registered Users & Documents</h4>
                  <p class="text-xs text-slate-400">Select any user to inspect their handwritten notes, verify content, or download their PDF</p>
                </div>
                <div class="flex items-center space-x-2">
                  <input type="text" id="admin-user-search" placeholder="Filter by email or title..." class="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-slate-500 w-56">
                  <button id="admin-refresh-btn" class="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded text-xs font-medium text-white transition flex items-center gap-1">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                    <span>Refresh</span>
                  </button>
                </div>
              </div>

              <!-- Users and Documents Table -->
              <div class="overflow-x-auto rounded border border-slate-800">
                <table class="w-full text-left text-xs text-slate-300">
                  <thead class="bg-slate-900 text-slate-400 uppercase font-mono text-[10px]">
                    <tr>
                      <th class="py-2.5 px-3">User Email</th>
                      <th class="py-2.5 px-3">Assignment Title</th>
                      <th class="py-2.5 px-3">Style & Font</th>
                      <th class="py-2.5 px-3">Pages</th>
                      <th class="py-2.5 px-3">Last Updated</th>
                      <th class="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody id="admin-docs-table-body" class="divide-y divide-slate-800/80 bg-slate-950">
                    <tr>
                      <td colspan="6" class="text-center py-6 text-slate-500">Loading user assignments...</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Inspect User Assignment Detail Modal -->
            <div id="admin-inspect-preview" class="hidden bg-slate-950 border border-slate-800 rounded p-4 space-y-3">
              <div class="flex items-center justify-between border-b border-slate-800 pb-2">
                <div>
                  <h5 class="text-xs font-bold text-amber-500 flex items-center gap-2">
                    <span>Document Inspector:</span>
                    <span id="inspect-doc-title" class="text-white"></span>
                  </h5>
                  <p class="text-[11px] text-slate-400">Creator: <strong id="inspect-doc-user" class="text-slate-200"></strong> | Paper: <span id="inspect-doc-paper"></span></p>
                </div>
                <div class="flex items-center space-x-2">
                  <button id="inspect-load-editor-btn" class="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-slate-950 font-semibold rounded text-xs transition flex items-center gap-1">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                    <span>Open in NotePot Editor</span>
                  </button>
                  <button id="inspect-close-btn" class="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                </div>
              </div>

              <!-- Pages Text Preview -->
              <div id="inspect-pages-container" class="space-y-3 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                <!-- Dynamically rendered pages -->
              </div>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      // Event listeners
      modal.querySelector("#close-admin-modal").addEventListener("click", () => {
        modal.classList.add("hidden");
      });
      modal.querySelector("#admin-refresh-btn").addEventListener("click", () => {
        this.loadAdminData();
      });
      modal.querySelector("#admin-user-search").addEventListener("input", (e) => {
        this.filterTable(e.target.value);
      });
      modal.querySelector("#inspect-close-btn").addEventListener("click", () => {
        modal.querySelector("#admin-inspect-preview").classList.add("hidden");
      });
    }
    return modal;
  }

  async open() {
    const modal = this.renderModal();
    modal.classList.remove("hidden");
    await this.loadAdminData();
  }

  async loadAdminData() {
    try {
      const data = await this.b2Service.getAdminOverview();
      if (!data.ok) {
        alert("Could not load admin data: " + (data.error || "Unknown error"));
        return;
      }
      this.adminData = data;
      this.updateUI(data);
    } catch (e) {
      console.error("Admin data load error:", e);
      alert("Admin load error: " + e.message);
    }
  }

  updateUI(data) {
    const sys = data.system || {};
    const stats = data.stats || {};

    // Update Storage Cards
    document.getElementById("b2-used-percent").textContent = `${sys.usedPercent || 0}%`;
    document.getElementById("b2-used-formatted").innerHTML = `${sys.usedFormatted || "0 B"} <span class="text-xs text-slate-500 font-normal">/ 10 GB</span>`;
    document.getElementById("b2-storage-bar").style.width = `${Math.min(100, Math.max(2, sys.usedPercent || 0))}%`;
    document.getElementById("b2-free-formatted").textContent = sys.freeFormatted || "10 GB";

    document.getElementById("admin-total-users").textContent = stats.totalUsers || 0;
    document.getElementById("admin-total-docs").textContent = stats.totalAssignments || 0;
    document.getElementById("admin-total-files").textContent = sys.totalFiles || 0;

    // Render table
    this.renderTable(data.allDocuments || []);
  }

  renderTable(documents) {
    const tbody = document.getElementById("admin-docs-table-body");
    if (!documents || documents.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center py-6 text-slate-500">
            No assignments recorded yet.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = documents.map(doc => {
      const dateStr = doc.updatedAt ? new Date(doc.updatedAt).toLocaleDateString() : "Recent";
      return `
        <tr class="hover:bg-slate-900 transition">
          <td class="py-2.5 px-3 text-slate-200">
            <div class="font-medium text-white">${doc.userName || "Student"}</div>
            <div class="text-[10px] text-slate-400 font-mono">${doc.userEmail}</div>
          </td>
          <td class="py-2.5 px-3 text-white font-medium">
            ${doc.title || "Untitled Assignment"}
          </td>
          <td class="py-2.5 px-3 text-slate-300">
            <span class="inline-block px-1.5 py-0.5 rounded text-[10px] bg-slate-900 text-slate-300 border border-slate-800 font-mono">
              ${doc.paperType || "hindi-notebook"}
            </span>
            <span class="text-[10px] text-slate-400 block">${doc.fontFamily || "Kalam"}</span>
          </td>
          <td class="py-2.5 px-3 text-slate-300 font-mono text-[11px]">
            ${doc.pageCount || 1} ${doc.pageCount === 1 ? 'page' : 'pages'}
          </td>
          <td class="py-2.5 px-3 text-slate-400 text-[11px] font-mono">
            ${dateStr}
          </td>
          <td class="py-2.5 px-3 text-right">
            <button class="inspect-btn px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-[11px] font-medium transition"
                    data-user="${doc.userEmail}" data-id="${doc.id}">
              Inspect
            </button>
          </td>
        </tr>
      `;
    }).join("");

    // Attach inspect handlers
    tbody.querySelectorAll(".inspect-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const user = btn.getAttribute("data-user");
        const docId = btn.getAttribute("data-id");
        this.inspectDocument(user, docId);
      });
    });
  }

  filterTable(query) {
    if (!this.adminData || !this.adminData.allDocuments) return;
    const q = (query || "").toLowerCase();
    const filtered = this.adminData.allDocuments.filter(d => 
      (d.userEmail || "").toLowerCase().includes(q) ||
      (d.userName || "").toLowerCase().includes(q) ||
      (d.title || "").toLowerCase().includes(q)
    );
    this.renderTable(filtered);
  }

  async inspectDocument(targetEmail, docId) {
    try {
      const res = await this.b2Service.inspectUserDocument(targetEmail, docId);
      if (!res.ok) {
        alert("Failed to load user document: " + (res.error || "Unknown"));
        return;
      }

      const doc = res.document;
      const preview = document.getElementById("admin-inspect-preview");
      document.getElementById("inspect-doc-title").textContent = doc.title || "Untitled Assignment";
      document.getElementById("inspect-doc-user").textContent = `${doc.userName || "Student"} (${doc.userEmail})`;
      document.getElementById("inspect-doc-paper").textContent = doc.settings?.paperType || "Hindi Notebook";

      const container = document.getElementById("inspect-pages-container");
      container.innerHTML = (doc.pages || []).map((page, idx) => `
        <div class="p-3 rounded bg-slate-900 border border-slate-800 text-xs">
          <div class="flex justify-between text-slate-400 mb-1.5 font-mono text-[10px] border-b border-slate-800 pb-1">
            <span>Page ${idx + 1} of ${doc.pages.length}</span>
            <span>Date: ${page.date || "N/A"}</span>
          </div>
          <div class="whitespace-pre-wrap font-sans text-slate-200 leading-relaxed">${page.content || "(Blank page)"}</div>
        </div>
      `).join("");

      const openBtn = document.getElementById("inspect-load-editor-btn");
      openBtn.onclick = () => {
        if (this.onOpenUserDoc) {
          this.onOpenUserDoc(doc);
          document.getElementById("notepot-admin-modal").classList.add("hidden");
        }
      };

      preview.classList.remove("hidden");
      preview.scrollIntoView({ behavior: "smooth" });
    } catch (e) {
      alert("Error inspecting document: " + e.message);
    }
  }
}
