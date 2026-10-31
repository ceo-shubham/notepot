/**
 * NotePot CEO Super Admin Panel
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
        <div class="bg-slate-900 border border-amber-500/30 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl text-white overflow-hidden">
          <!-- Header -->
          <div class="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
            <div class="flex items-center space-x-3">
              <span class="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" clip-rule="evenodd"/>
                </svg>
              </span>
              <div>
                <h3 class="text-xl font-bold flex items-center gap-2">
                  <span>NotePot CEO Super Admin Console</span>
                  <span class="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">ceo.shubhampathak@gmail.com</span>
                </h3>
                <p class="text-xs text-slate-400">Inspect user assignments, monitor Backblaze B2 (10GB), and manage Zenstro ecosystem integration</p>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <a href="https://zenstro.space/admin.html" target="_blank" class="px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-300 text-xs font-medium flex items-center gap-1 transition">
                <span>Zenstro Main Admin</span>
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
              </a>
              <button id="close-admin-modal" class="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
          </div>

          <!-- Body -->
          <div class="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
            <!-- Storage & Stats Overview Cards -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <!-- Backblaze 10GB Card -->
              <div class="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
                <div class="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Backblaze B2 Storage</span>
                  <span class="text-emerald-400 font-semibold" id="b2-used-percent">0% Used</span>
                </div>
                <div class="text-2xl font-bold text-white mb-2" id="b2-used-formatted">0 MB <span class="text-xs text-slate-400 font-normal">/ 10 GB</span></div>
                <div class="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div id="b2-storage-bar" class="bg-gradient-to-r from-emerald-500 to-amber-500 h-2 rounded-full transition-all duration-500" style="width: 2%"></div>
                </div>
                <div class="text-[11px] text-slate-400 mt-2 flex justify-between">
                  <span>Free: <strong class="text-slate-200" id="b2-free-formatted">10 GB</strong></span>
                  <span>Bucket: <strong class="text-slate-200">zenstro</strong></span>
                </div>
              </div>

              <!-- Total Users -->
              <div class="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
                <span class="text-xs text-slate-400 block mb-1">Total Registered Users</span>
                <div class="text-2xl font-bold text-sky-400" id="admin-total-users">0</div>
                <p class="text-[11px] text-slate-400 mt-2">Active creators across assignments</p>
              </div>

              <!-- Total Assignments -->
              <div class="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
                <span class="text-xs text-slate-400 block mb-1">Total Assignments Created</span>
                <div class="text-2xl font-bold text-purple-400" id="admin-total-docs">0</div>
                <p class="text-[11px] text-slate-400 mt-2">Hindi & English handwritten notes</p>
              </div>

              <!-- Storage Files -->
              <div class="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
                <span class="text-xs text-slate-400 block mb-1">B2 Cloud Files</span>
                <div class="text-2xl font-bold text-amber-400" id="admin-total-files">0</div>
                <p class="text-[11px] text-slate-400 mt-2">JSON payloads, PDFs & manifests</p>
              </div>
            </div>

            <!-- Users & Inspection Section -->
            <div class="bg-slate-800/40 border border-slate-700/60 rounded-xl p-5">
              <div class="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div>
                  <h4 class="text-base font-semibold text-white">All Users & Created Assignments</h4>
                  <p class="text-xs text-slate-400">Select any user to inspect what they wrote, review their notebook pages, or download their PDF</p>
                </div>
                <div class="flex items-center space-x-2">
                  <input type="text" id="admin-user-search" placeholder="Search by email or title..." class="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 w-64">
                  <button id="admin-refresh-btn" class="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-medium text-white transition flex items-center gap-1">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                    <span>Refresh</span>
                  </button>
                </div>
              </div>

              <!-- Users and Documents Table -->
              <div class="overflow-x-auto rounded-lg border border-slate-700/80">
                <table class="w-full text-left text-xs text-slate-300">
                  <thead class="bg-slate-950 text-slate-400 uppercase font-mono text-[11px]">
                    <tr>
                      <th class="py-3 px-4">User Email / Creator</th>
                      <th class="py-3 px-4">Assignment Title</th>
                      <th class="py-3 px-4">Style & Font</th>
                      <th class="py-3 px-4">Pages</th>
                      <th class="py-3 px-4">Last Updated</th>
                      <th class="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody id="admin-docs-table-body" class="divide-y divide-slate-800 bg-slate-900/50">
                    <tr>
                      <td colspan="6" class="text-center py-8 text-slate-500">Loading NotePot user assignments...</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Inspect User Assignment Detail Modal -->
            <div id="admin-inspect-preview" class="hidden bg-slate-950 border border-slate-700 rounded-xl p-5 space-y-4">
              <div class="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h5 class="text-sm font-bold text-amber-400 flex items-center gap-2">
                    <span>Assignment Inspection Preview</span>
                    <span id="inspect-doc-title" class="text-white"></span>
                  </h5>
                  <p class="text-xs text-slate-400">Creator: <strong id="inspect-doc-user" class="text-slate-200"></strong> | Paper: <span id="inspect-doc-paper"></span></p>
                </div>
                <div class="flex items-center space-x-2">
                  <button id="inspect-load-editor-btn" class="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition flex items-center gap-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                    <span>Open in NotePot Editor</span>
                  </button>
                  <button id="inspect-close-btn" class="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                </div>
              </div>

              <!-- Pages Text Preview -->
              <div id="inspect-pages-container" class="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
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
    document.getElementById("b2-used-percent").textContent = `${sys.usedPercent || 0}% Used`;
    document.getElementById("b2-used-formatted").innerHTML = `${sys.usedFormatted || "0 B"} <span class="text-xs text-slate-400 font-normal">/ 10 GB</span>`;
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
          <td colspan="6" class="text-center py-8 text-slate-500">
            No assignments created yet in NotePot. Create one to test!
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = documents.map(doc => {
      const dateStr = doc.updatedAt ? new Date(doc.updatedAt).toLocaleString() : "Just now";
      return `
        <tr class="hover:bg-slate-800/50 transition">
          <td class="py-3 px-4 font-medium text-slate-200">
            <div class="flex items-center space-x-2">
              <span class="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-[10px] font-bold">
                ${(doc.userEmail || "U")[0].toUpperCase()}
              </span>
              <div>
                <div>${doc.userName || "Student"}</div>
                <div class="text-[10px] text-slate-400 font-mono">${doc.userEmail}</div>
              </div>
            </div>
          </td>
          <td class="py-3 px-4 text-white font-medium">
            ${doc.title || "Untitled Assignment"}
          </td>
          <td class="py-3 px-4 text-slate-300">
            <span class="inline-block px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
              ${doc.paperType || "hindi-notebook"}
            </span>
            <span class="text-[10px] text-slate-400 block">${doc.fontFamily || "Kalam"}</span>
          </td>
          <td class="py-3 px-4 text-slate-300">
            <span class="px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 font-mono text-[10px]">
              ${doc.pageCount || 1} ${doc.pageCount === 1 ? 'page' : 'pages'}
            </span>
          </td>
          <td class="py-3 px-4 text-slate-400 text-[11px]">
            ${dateStr}
          </td>
          <td class="py-3 px-4 text-right space-x-2">
            <button class="inspect-btn px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded text-[11px] font-medium transition"
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
        <div class="p-4 rounded-lg bg-slate-900 border border-slate-800 text-xs">
          <div class="flex justify-between text-slate-400 mb-2 font-mono text-[11px] border-b border-slate-800 pb-1">
            <span>Page ${idx + 1} of ${doc.pages.length}</span>
            <span>Date: ${page.date || "N/A"}</span>
          </div>
          <div class="whitespace-pre-wrap font-sans text-slate-200 leading-relaxed font-hindi">${page.content || "(Blank page)"}</div>
        </div>
      `).join("");

      // Open in Editor button
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
