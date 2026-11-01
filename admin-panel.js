/**
 * NotePot CEO Super Admin Console — Clean Light Mode Architecture
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
      modal.className = "fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-xs p-4 hidden";
      modal.innerHTML = `
        <div class="bg-white border border-neutral-200 rounded w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl text-neutral-900 overflow-hidden">
          <!-- Header -->
          <div class="px-5 py-3.5 border-b border-neutral-200 flex items-center justify-between bg-white">
            <div class="flex items-center space-x-3">
              <div>
                <h3 class="text-sm font-semibold flex items-center gap-2">
                  <span>NotePot Super Admin Console</span>
                  <span class="text-[11px] px-2 py-0.5 rounded bg-neutral-100 text-neutral-700 font-mono">ceo.shubhampathak@gmail.com</span>
                </h3>
                <p class="text-xs text-neutral-500">Inspect user documents, manage storage on Backblaze B2 (10GB), and monitor Zenstro integration</p>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <a href="https://zenstro.space/admin.html" target="_blank" class="px-3 py-1.5 rounded bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-700 text-xs font-medium transition">
                Zenstro Admin Portal
              </a>
              <button id="close-admin-modal" class="px-2 py-1 text-xs text-neutral-500 hover:text-black font-mono">
                ✕
              </button>
            </div>
          </div>

          <!-- Body -->
          <div class="p-5 overflow-y-auto space-y-5 flex-1 custom-scrollbar bg-white">
            <!-- Storage & Stats Overview Cards -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
              <!-- Backblaze 10GB Card -->
              <div class="bg-white border border-neutral-200 rounded p-4">
                <div class="flex items-center justify-between text-xs text-neutral-500 mb-1">
                  <span>Backblaze B2</span>
                  <span class="text-black font-mono font-semibold" id="b2-used-percent">0%</span>
                </div>
                <div class="text-xl font-bold text-neutral-900 mb-2" id="b2-used-formatted">0 MB <span class="text-xs text-neutral-400 font-normal">/ 10 GB</span></div>
                <div class="w-full bg-neutral-100 rounded h-1.5 overflow-hidden">
                  <div id="b2-storage-bar" class="bg-black h-1.5 rounded transition-all duration-300" style="width: 2%"></div>
                </div>
                <div class="text-[11px] text-neutral-500 mt-2 flex justify-between font-mono">
                  <span>Free: <strong class="text-neutral-800" id="b2-free-formatted">10 GB</strong></span>
                  <span>Bucket: <strong class="text-neutral-800">zenstro</strong></span>
                </div>
              </div>

              <!-- Total Users -->
              <div class="bg-white border border-neutral-200 rounded p-4">
                <span class="text-xs text-neutral-500 block mb-1">Registered Users</span>
                <div class="text-xl font-bold text-neutral-900 font-mono" id="admin-total-users">0</div>
                <p class="text-[11px] text-neutral-400 mt-2">Active creators across platform</p>
              </div>

              <!-- Total Assignments -->
              <div class="bg-white border border-neutral-200 rounded p-4">
                <span class="text-xs text-neutral-500 block mb-1">Total Assignments</span>
                <div class="text-xl font-bold text-neutral-900 font-mono" id="admin-total-docs">0</div>
                <p class="text-[11px] text-neutral-400 mt-2">Multi-page handwritten files</p>
              </div>

              <!-- Storage Files -->
              <div class="bg-white border border-neutral-200 rounded p-4">
                <span class="text-xs text-neutral-500 block mb-1">Stored B2 Files</span>
                <div class="text-xl font-bold text-neutral-900 font-mono" id="admin-total-files">0</div>
                <p class="text-[11px] text-neutral-400 mt-2">Payloads, PDFs, and manifests</p>
              </div>
            </div>

            <!-- Users & Inspection Section -->
            <div class="bg-white border border-neutral-200 rounded p-4">
              <div class="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div>
                  <h4 class="text-sm font-semibold text-neutral-900">Registered Users & Documents</h4>
                  <p class="text-xs text-neutral-500">Select any user to inspect their handwritten notes, verify content, or download their PDF</p>
                </div>
                <div class="flex items-center space-x-2">
                  <input type="text" id="admin-user-search" placeholder="Filter by email or title..." class="bg-white border border-neutral-200 rounded px-2.5 py-1 text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-black w-56">
                  <button id="admin-refresh-btn" class="px-3 py-1 bg-white hover:bg-neutral-50 border border-neutral-200 rounded text-xs font-medium text-neutral-700 transition">
                    Refresh
                  </button>
                </div>
              </div>

              <!-- Users and Documents Table -->
              <div class="overflow-x-auto rounded border border-neutral-200 bg-white">
                <table class="w-full text-left text-xs text-neutral-600">
                  <thead class="bg-neutral-50 text-neutral-500 uppercase font-mono text-[10px] border-b border-neutral-200">
                    <tr>
                      <th class="py-2.5 px-3">User Email</th>
                      <th class="py-2.5 px-3">Assignment Title</th>
                      <th class="py-2.5 px-3">Style & Font</th>
                      <th class="py-2.5 px-3">Pages</th>
                      <th class="py-2.5 px-3">Last Updated</th>
                      <th class="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody id="admin-docs-table-body" class="divide-y divide-neutral-100 bg-white">
                    <tr>
                      <td colspan="6" class="text-center py-6 text-neutral-400">Loading user assignments...</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Inspect User Assignment Detail Modal -->
            <div id="admin-inspect-preview" class="hidden bg-white border border-neutral-200 rounded p-4 space-y-3">
              <div class="flex items-center justify-between border-b border-neutral-200 pb-2">
                <div>
                  <h5 class="text-xs font-semibold text-neutral-900 flex items-center gap-2">
                    <span>Document Inspector:</span>
                    <span id="inspect-doc-title" class="text-neutral-900"></span>
                  </h5>
                  <p class="text-[11px] text-neutral-500">Creator: <strong id="inspect-doc-user" class="text-neutral-800"></strong> | Paper: <span id="inspect-doc-paper"></span></p>
                </div>
                <div class="flex items-center space-x-2">
                  <button id="inspect-load-editor-btn" class="px-3 py-1 bg-black hover:bg-neutral-800 text-white font-medium rounded text-xs transition">
                    Open in NotePot Editor
                  </button>
                  <button id="inspect-close-btn" class="px-2 py-1 text-xs text-neutral-500 hover:text-black font-mono">
                    ✕
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
          <td colspan="6" class="text-center py-6 text-slate-400">
            No assignments recorded yet.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = documents.map(doc => {
      const dateStr = doc.updatedAt ? new Date(doc.updatedAt).toLocaleDateString() : "Recent";
      return `
        <tr class="hover:bg-slate-50 transition">
          <td class="py-2.5 px-3 text-slate-800">
            <div class="font-medium text-slate-900">${doc.userName || "Student"}</div>
            <div class="text-[10px] text-slate-500 font-mono">${doc.userEmail}</div>
          </td>
          <td class="py-2.5 px-3 text-slate-900 font-medium">
            ${doc.title || "Untitled Assignment"}
          </td>
          <td class="py-2.5 px-3 text-slate-600">
            <span class="inline-block px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 border border-slate-200 font-mono">
              ${doc.paperType || "hindi-notebook"}
            </span>
            <span class="text-[10px] text-slate-500 block">${doc.fontFamily || "Kalam"}</span>
          </td>
          <td class="py-2.5 px-3 text-slate-700 font-mono text-[11px]">
            ${doc.pageCount || 1} ${doc.pageCount === 1 ? 'page' : 'pages'}
          </td>
          <td class="py-2.5 px-3 text-slate-500 text-[11px] font-mono">
            ${dateStr}
          </td>
          <td class="py-2.5 px-3 text-right">
            <button class="inspect-btn px-2 py-0.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded text-[11px] font-medium transition shadow-sm"
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
        <div class="p-3 rounded bg-white border border-slate-200 text-xs shadow-sm">
          <div class="flex justify-between text-slate-500 mb-1.5 font-mono text-[10px] border-b border-slate-100 pb-1">
            <span>Page ${idx + 1} of ${doc.pages.length}</span>
            <span>Date: ${page.date || "N/A"}</span>
          </div>
          <div class="whitespace-pre-wrap font-sans text-slate-800 leading-relaxed">${page.content || "(Blank page)"}</div>
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
