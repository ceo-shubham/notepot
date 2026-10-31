/**
 * NotePot Main Application Controller
 * Handles handwritten notebook editor, multi-page layout, spacing rules, PDF export,
 * Backblaze B2 sync, and CEO Super Admin panel
 */

import { HANDWRITTEN_FONTS, INK_PRESETS, PAPER_TYPES } from "./handwriting-engine.js";
import { SAMPLE_TEMPLATES } from "./sample-data.js";
import { exportDocumentToPdf } from "./pdf-export.js";
import { B2Service } from "./b2-service.js";
import { AdminPanel } from "./admin-panel.js";

// Google OAuth Client ID (authorized on *.zenstro.space and zenstro.space)
const GOOGLE_CLIENT_ID = "193810371236-jli2ml7qh8qedqmat8o0hrms8uavhr6s.apps.googleusercontent.com";
const SUPER_ADMIN_EMAIL = "ceo.shubhampathak@gmail.com";

class NotePotApp {
  constructor() {
    this.b2Service = new B2Service();
    this.adminPanel = new AdminPanel(this.b2Service, (doc) => this.loadDocument(doc));

    // Default document state
    this.doc = {
      id: "doc_" + Date.now(),
      title: "हिंदी असाइनमेंट - पाठ १",
      settings: {
        paperType: "hindi-notebook",
        fontId: "kalam",
        fontSize: 22,
        lineSpacing: 36, // locked on Hindi notebook
        wordSpacing: 4,
        letterSpacing: 0.5,
        alignment: "left",
        inkColor: "#1e3a8a",
        inkBleed: true,
        organicTilt: false
      },
      pages: [
        {
          pageNo: 1,
          date: new Date().toLocaleDateString("en-GB"),
          content: `विषय: हिंदी हस्तलिखित गृहकार्य एवं निबंध

यहाँ आप अपना पाठ या निबंध सीधे टाइप या पेस्ट कर सकते हैं।
यह लेख वास्तविक विद्यार्थी की कॉपी जैसा हस्तलिखित दिखाई देता है।

मुख्य विशेषताएँ:
१. ३०+ से अधिक सुंदर हिंदी एवं अंग्रेज़ी हस्तलिखित फॉन्ट (Kalam, Tillana, Dekko, Caveat...)
२. हिंदी नोटबुक की लाइनों पर शब्दों का सटीक संतुलन
३. अक्षरों के बीच का अंतर (Letter Spacing) एवं शब्दों के बीच का अंतर (Word Spacing) बदलने की सुविधा
४. असाइनमेंट पूरा होने पर हाई-डेफिनिशन मल्टी-पेज PDF डाउनलोड
५. बैकब्लेज़ B2 १०GB क्लाउड स्टोरेज में सुरक्षित बैकअप`
        }
      ]
    };

    this.activePageIndex = 0;
    this.init();
  }

  init() {
    this.populateFontSelector();
    this.setupEventListeners();
    this.setupAuth();
    this.checkSuperAdmin();
    this.applyDocumentSettings();
    this.renderAllPages();
    this.setupAutoSave();
  }

  // Populate font selector with 38+ fonts
  populateFontSelector() {
    const fontSelect = document.getElementById("select-font-family");
    if (!fontSelect) return;

    fontSelect.innerHTML = "";

    // Group 1: Hindi Handwriting
    const hindiGroup = document.createElement("optgroup");
    hindiGroup.label = "Hindi Handwriting & Devanagari Scripts";
    const hindiFonts = HANDWRITTEN_FONTS.filter(f => f.category === "hindi");
    hindiFonts.forEach(f => {
      const opt = document.createElement("option");
      opt.value = f.id;
      opt.textContent = `${f.name}`;
      opt.style.fontFamily = f.family;
      if (f.id === this.doc.settings.fontId) opt.selected = true;
      hindiGroup.appendChild(opt);
    });
    fontSelect.appendChild(hindiGroup);

    // Group 2: English & Universal Handwriting
    const engGroup = document.createElement("optgroup");
    engGroup.label = "English & Latin Handwriting";
    const engFonts = HANDWRITTEN_FONTS.filter(f => f.category === "english");
    engFonts.forEach(f => {
      const opt = document.createElement("option");
      opt.value = f.id;
      opt.textContent = `${f.name}`;
      opt.style.fontFamily = f.family;
      if (f.id === this.doc.settings.fontId) opt.selected = true;
      engGroup.appendChild(opt);
    });
    fontSelect.appendChild(engGroup);
  }

  // Event Listeners for UI
  setupEventListeners() {
    // Title Input
    const titleInput = document.getElementById("doc-title-input");
    titleInput.addEventListener("input", (e) => {
      this.doc.title = e.target.value;
    });

    // Paper Type Change
    const paperSelect = document.getElementById("select-paper-type");
    paperSelect.addEventListener("change", (e) => {
      this.onPaperTypeChange(e.target.value);
    });

    // Font Family Change
    const fontSelect = document.getElementById("select-font-family");
    fontSelect.addEventListener("change", (e) => {
      this.doc.settings.fontId = e.target.value;
      this.applyDocumentSettings();
    });

    // Font Size Slider
    const fontSizeSlider = document.getElementById("slider-font-size");
    const fontSizeLabel = document.getElementById("label-font-size");
    fontSizeSlider.addEventListener("input", (e) => {
      const val = parseInt(e.target.value, 10);
      this.doc.settings.fontSize = val;
      fontSizeLabel.textContent = `${val}px`;
      this.applyDocumentSettings();
    });

    // Line Spacing Slider (Enabled on White Ruled, Locked on Hindi Notebook)
    const lineSpacingSlider = document.getElementById("slider-line-spacing");
    const lineSpacingLabel = document.getElementById("label-line-spacing");
    lineSpacingSlider.addEventListener("input", (e) => {
      const val = parseInt(e.target.value, 10);
      this.doc.settings.lineSpacing = val;
      lineSpacingLabel.textContent = `${val}px`;
      this.applyDocumentSettings();
    });

    // Word Spacing Slider
    const wordSpacingSlider = document.getElementById("slider-word-spacing");
    const wordSpacingLabel = document.getElementById("label-word-spacing");
    wordSpacingSlider.addEventListener("input", (e) => {
      const val = parseInt(e.target.value, 10);
      this.doc.settings.wordSpacing = val;
      wordSpacingLabel.textContent = `${val}px`;
      this.applyDocumentSettings();
    });

    // Letter Spacing Slider (Text ke beech ka distance)
    const letterSpacingSlider = document.getElementById("slider-letter-spacing");
    const letterSpacingLabel = document.getElementById("label-letter-spacing");
    letterSpacingSlider.addEventListener("input", (e) => {
      const val = parseFloat(e.target.value);
      this.doc.settings.letterSpacing = val;
      letterSpacingLabel.textContent = `${val}px`;
      this.applyDocumentSettings();
    });

    // Alignment buttons
    const alignGroup = document.getElementById("alignment-group");
    alignGroup.querySelectorAll("button").forEach(btn => {
      btn.addEventListener("click", () => {
        const align = btn.getAttribute("data-align");
        this.doc.settings.alignment = align;
        alignGroup.querySelectorAll("button").forEach(b => {
          b.classList.remove("text-amber-400", "bg-slate-700");
          b.classList.add("text-slate-400");
        });
        btn.classList.add("text-amber-400", "bg-slate-700");
        btn.classList.remove("text-slate-400");
        this.applyDocumentSettings();
      });
    });

    // Ink Presets
    const inkContainer = document.getElementById("ink-presets-container");
    inkContainer.querySelectorAll("button").forEach(btn => {
      btn.addEventListener("click", () => {
        const color = btn.getAttribute("data-color");
        this.setInkColor(color);
      });
    });

    // Custom Ink Picker
    const customInkInput = document.getElementById("input-custom-ink");
    customInkInput.addEventListener("input", (e) => {
      this.setInkColor(e.target.value);
    });

    // Ink Bleed Toggle
    const bleedBtn = document.getElementById("toggle-ink-bleed");
    bleedBtn.addEventListener("click", () => {
      this.doc.settings.inkBleed = !this.doc.settings.inkBleed;
      bleedBtn.classList.toggle("bg-amber-500/20", this.doc.settings.inkBleed);
      bleedBtn.classList.toggle("text-amber-300", this.doc.settings.inkBleed);
      bleedBtn.classList.toggle("border-amber-500/30", this.doc.settings.inkBleed);
      bleedBtn.classList.toggle("bg-slate-800", !this.doc.settings.inkBleed);
      bleedBtn.classList.toggle("text-slate-400", !this.doc.settings.inkBleed);
      this.applyDocumentSettings();
    });

    // Page Navigation & Management
    document.getElementById("btn-add-page").addEventListener("click", () => this.addNewPage());
    document.getElementById("btn-bottom-add-page").addEventListener("click", () => this.addNewPage());
    document.getElementById("btn-clear-page").addEventListener("click", () => this.clearCurrentPage());

    // Export PDF
    document.getElementById("btn-export-pdf").addEventListener("click", () => this.exportPdf());

    // Save Document Button
    document.getElementById("btn-save-doc").addEventListener("click", () => this.saveDocument(true));

    // My Assignments Button & Modal
    document.getElementById("btn-my-docs").addEventListener("click", () => this.openMyDocsModal());
    document.getElementById("close-my-docs-modal").addEventListener("click", () => {
      document.getElementById("modal-my-docs").classList.add("hidden");
    });

    // Templates Modal
    document.getElementById("btn-templates").addEventListener("click", () => this.openTemplatesModal());
    document.getElementById("close-templates-modal").addEventListener("click", () => {
      document.getElementById("modal-templates").classList.add("hidden");
    });

    // Quick Paste Modal
    document.getElementById("btn-quick-paste").addEventListener("click", () => {
      document.getElementById("modal-quick-paste").classList.remove("hidden");
    });
    document.getElementById("close-quick-paste-modal").addEventListener("click", () => {
      document.getElementById("modal-quick-paste").classList.add("hidden");
    });
    document.getElementById("btn-confirm-paste").addEventListener("click", () => this.applyPastedText());

    // User Dropdown
    const authTrigger = document.getElementById("btn-auth-trigger");
    const userDropdown = document.getElementById("user-dropdown-menu");
    authTrigger.addEventListener("click", (e) => {
      e.stopPropagation();
      userDropdown.classList.toggle("hidden");
    });
    document.addEventListener("click", () => {
      userDropdown.classList.add("hidden");
    });

    // CEO Admin Panel Button
    const ceoBtn = document.getElementById("btn-ceo-admin");
    ceoBtn.addEventListener("click", () => {
      this.adminPanel.open();
    });

    // Google Sign-In Trigger from Menu
    document.getElementById("menu-google-signin-btn").addEventListener("click", () => {
      this.promptGoogleSignIn();
    });

    // Sign Out
    document.getElementById("menu-logout-btn").addEventListener("click", () => {
      this.b2Service.logout();
      this.updateUserUI();
    });
  }

  // Handle Paper Type Change & Locking Rules
  onPaperTypeChange(paperTypeId) {
    this.doc.settings.paperType = paperTypeId;
    const paperDef = PAPER_TYPES.find(p => p.id === paperTypeId) || PAPER_TYPES[0];

    const lineSlider = document.getElementById("slider-line-spacing");
    const lineLabel = document.getElementById("label-line-spacing");
    const lockIndicator = document.getElementById("line-lock-indicator");
    const alignmentBanner = document.getElementById("hindi-alignment-banner");

    if (paperDef.lineHeightLocked) {
      // Locked for Hindi Ruled Notebooks
      this.doc.settings.lineSpacing = paperDef.defaultLineSpacing;
      lineSlider.disabled = true;
      lineSlider.value = paperDef.defaultLineSpacing;
      lineLabel.textContent = `${paperDef.defaultLineSpacing}px`;
      lockIndicator.classList.remove("hidden");
      alignmentBanner.classList.remove("hidden");
    } else {
      // Unlocked for White Ruled, Plain A4, etc.
      lineSlider.disabled = false;
      lockIndicator.classList.add("hidden");
      alignmentBanner.classList.add("hidden");
    }

    this.applyDocumentSettings();
    this.renderAllPages();
  }

  // Set Ink Color
  setInkColor(hex) {
    this.doc.settings.inkColor = hex;
    const preset = INK_PRESETS.find(p => p.hex.toLowerCase() === hex.toLowerCase());
    this.doc.settings.inkShadow = preset ? preset.shadow : "rgba(30, 58, 138, 0.2)";

    // Update preset buttons ring
    const inkContainer = document.getElementById("ink-presets-container");
    inkContainer.querySelectorAll("button").forEach(btn => {
      const bColor = btn.getAttribute("data-color");
      if (bColor.toLowerCase() === hex.toLowerCase()) {
        btn.classList.add("ring-2", "ring-amber-400");
      } else {
        btn.classList.remove("ring-2", "ring-amber-400");
      }
    });

    document.getElementById("input-custom-ink").value = hex;
    this.applyDocumentSettings();
  }

  // Apply Document Settings to CSS variables & DOM
  applyDocumentSettings() {
    const s = this.doc.settings;
    const fontObj = HANDWRITTEN_FONTS.find(f => f.id === s.fontId) || HANDWRITTEN_FONTS[0];

    document.documentElement.style.setProperty("--line-spacing", `${s.lineSpacing}px`);
    document.documentElement.style.setProperty("--word-spacing", `${s.wordSpacing}px`);
    document.documentElement.style.setProperty("--letter-spacing", `${s.letterSpacing}px`);
    document.documentElement.style.setProperty("--font-size", `${s.fontSize}px`);
    document.documentElement.style.setProperty("--ink-color", s.inkColor);
    document.documentElement.style.setProperty("--ink-shadow", s.inkShadow || "rgba(30, 58, 138, 0.2)");

    // Apply font family and alignment to content areas
    document.querySelectorAll(".notepot-content-area").forEach(area => {
      area.style.fontFamily = fontObj.family;
      area.style.textAlign = s.alignment;
      area.style.lineHeight = `${s.lineSpacing}px`;
      area.style.wordSpacing = `${s.wordSpacing}px`;
      area.style.letterSpacing = `${s.letterSpacing}px`;
      area.style.fontSize = `${s.fontSize}px`;
      area.style.color = s.inkColor;
    });

    // Toggle ink bleed effect
    document.querySelectorAll(".notepot-page-sheet").forEach(sheet => {
      sheet.classList.toggle("ink-bleed-active", !!s.inkBleed);
    });
  }

  // Render all notebook pages
  renderAllPages() {
    const container = document.getElementById("pages-container");
    container.innerHTML = "";

    const paperClass = `paper-${this.doc.settings.paperType}`;
    const fontObj = HANDWRITTEN_FONTS.find(f => f.id === this.doc.settings.fontId) || HANDWRITTEN_FONTS[0];

    this.doc.pages.forEach((pageData, index) => {
      const pageIndex = index;
      const sheet = document.createElement("div");
      sheet.className = `notepot-page-sheet ${paperClass} ${this.doc.settings.inkBleed ? "ink-bleed-active" : ""}`;
      sheet.id = `notepot-page-${pageIndex}`;

      sheet.innerHTML = `
        <!-- Paper Texture Overlay -->
        <div class="paper-texture-overlay"></div>

        <!-- Left Binder Margin Holes -->
        <div class="margin-binder-holes">
          <div class="margin-binder-hole"></div>
          <div class="margin-binder-hole"></div>
          <div class="margin-binder-hole"></div>
        </div>

        <!-- Notebook Corner Header Box -->
        <div class="notepot-header-box">
          <div class="flex items-center justify-between gap-1">
            <span>Page No:</span>
            <input type="text" class="header-page-no" value="${pageData.pageNo || (pageIndex + 1)}">
          </div>
          <div class="flex items-center justify-between gap-1">
            <span>Date:</span>
            <input type="text" class="header-date" value="${pageData.date || new Date().toLocaleDateString('en-GB')}">
          </div>
        </div>

        <!-- Content Editable Writing Canvas -->
        <div class="notepot-content-area" contenteditable="true" spellcheck="false" 
             style="font-family: ${fontObj.family}; text-align: ${this.doc.settings.alignment}; line-height: ${this.doc.settings.lineSpacing}px; word-spacing: ${this.doc.settings.wordSpacing}px; letter-spacing: ${this.doc.settings.letterSpacing}px; font-size: ${this.doc.settings.fontSize}px; color: ${this.doc.settings.inkColor};">${pageData.content || ""}</div>

        <!-- Delete Page Button (if more than 1 page) -->
        ${this.doc.pages.length > 1 ? `
          <button class="btn-delete-page no-print absolute top-3 left-4 p-1 rounded-md bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white transition text-xs" title="Delete this page">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
        ` : ""}
      `;

      // Content input listener
      const contentArea = sheet.querySelector(".notepot-content-area");
      contentArea.addEventListener("input", (e) => {
        pageData.content = e.target.innerText;
        this.checkPageOverflow(sheet, contentArea, pageIndex);
      });

      // Header inputs
      const pageNoInput = sheet.querySelector(".header-page-no");
      pageNoInput.addEventListener("input", (e) => { pageData.pageNo = e.target.value; });

      const dateInput = sheet.querySelector(".header-date");
      dateInput.addEventListener("input", (e) => { pageData.date = e.target.value; });

      // Delete Page listener
      const delBtn = sheet.querySelector(".btn-delete-page");
      if (delBtn) {
        delBtn.addEventListener("click", () => this.deletePage(pageIndex));
      }

      container.appendChild(sheet);
    });

    this.updatePageCounter();
  }

  // Check if content overflows the A4 page sheet
  checkPageOverflow(sheet, contentArea, pageIndex) {
    const isOverflowing = contentArea.scrollHeight > (contentArea.clientHeight + 10);
    let warning = sheet.querySelector(".page-overflow-warning");

    if (isOverflowing) {
      if (!warning) {
        warning = document.createElement("div");
        warning.className = "page-overflow-warning no-print cursor-pointer";
        warning.innerHTML = `
          <span>Page Limit Reached • Click to Add Page</span>
        `;
        warning.addEventListener("click", () => this.addNewPage());
        sheet.appendChild(warning);
      }
    } else {
      if (warning) warning.remove();
    }
  }

  // Add new page to notebook
  addNewPage() {
    const newPageNo = this.doc.pages.length + 1;
    this.doc.pages.push({
      pageNo: newPageNo,
      date: new Date().toLocaleDateString("en-GB"),
      content: ""
    });
    this.renderAllPages();

    // Scroll to new page smoothly
    setTimeout(() => {
      const newSheet = document.getElementById(`notepot-page-${newPageNo - 1}`);
      if (newSheet) {
        newSheet.scrollIntoView({ behavior: "smooth" });
        const area = newSheet.querySelector(".notepot-content-area");
        if (area) area.focus();
      }
    }, 100);
  }

  // Delete a specific page
  deletePage(pageIndex) {
    if (this.doc.pages.length <= 1) return;
    if (confirm(`Are you sure you want to delete Page ${pageIndex + 1}?`)) {
      this.doc.pages.splice(pageIndex, 1);
      // Re-number pages
      this.doc.pages.forEach((p, idx) => { p.pageNo = idx + 1; });
      this.renderAllPages();
    }
  }

  // Clear current page
  clearCurrentPage() {
    if (confirm("Clear text on this page?")) {
      const activeSheet = document.querySelector(".notepot-page-sheet");
      if (activeSheet) {
        const area = activeSheet.querySelector(".notepot-content-area");
        if (area) {
          area.innerText = "";
          this.doc.pages[0].content = "";
        }
      }
    }
  }

  // Update Page Counter indicator
  updatePageCounter() {
    const badge = document.getElementById("page-counter-badge");
    const count = this.doc.pages.length;
    badge.textContent = `Total: ${count} ${count === 1 ? 'Page' : 'Pages'}`;
  }

  // Apply pasted text with auto-page splitting
  applyPastedText() {
    const text = document.getElementById("paste-input-text").value;
    if (!text || !text.trim()) {
      alert("Please paste some text first.");
      return;
    }

    const autoSplit = document.getElementById("chk-auto-split").checked;

    if (!autoSplit) {
      // Put all in page 1
      this.doc.pages[0].content = text;
    } else {
      // Split text roughly by paragraph / word count (~250 words or ~1800 characters per notebook page)
      const paragraphs = text.split("\n");
      const pages = [];
      let currentPageText = "";
      let currentLineCount = 0;
      const MAX_LINES_PER_PAGE = 26; // Standard A4 page lines with 36px line spacing

      paragraphs.forEach(p => {
        // Estimate lines for this paragraph
        const estimatedLines = Math.max(1, Math.ceil(p.length / 55));
        if (currentLineCount + estimatedLines > MAX_LINES_PER_PAGE && currentPageText.trim().length > 0) {
          pages.push(currentPageText.trim());
          currentPageText = p + "\n";
          currentLineCount = estimatedLines;
        } else {
          currentPageText += p + "\n";
          currentLineCount += estimatedLines;
        }
      });

      if (currentPageText.trim().length > 0) {
        pages.push(currentPageText.trim());
      }

      this.doc.pages = pages.map((content, idx) => ({
        pageNo: idx + 1,
        date: new Date().toLocaleDateString("en-GB"),
        content
      }));
    }

    this.renderAllPages();
    document.getElementById("modal-quick-paste").classList.add("hidden");
    document.getElementById("paste-input-text").value = "";
  }

  // Export Document to High-DPI Multi-Page PDF
  async exportPdf() {
    const progressModal = document.getElementById("modal-pdf-progress");
    const progressText = document.getElementById("pdf-progress-text");
    const progressBar = document.getElementById("pdf-progress-bar");

    progressModal.classList.remove("hidden");
    progressBar.style.width = "10%";
    progressText.textContent = "Preparing handwritten pages for high-definition render...";

    try {
      const { fileName, pdfBlob } = await exportDocumentToPdf(this.doc, (p) => {
        progressBar.style.width = `${p.percent}%`;
        progressText.textContent = `Rendering page ${p.currentPage} of ${p.totalPages} with realistic handwriting...`;
      });

      // Also backup PDF to Backblaze B2 in background
      this.b2Service.uploadPdfBackup(this.doc.id, pdfBlob, fileName).catch(console.warn);

      setTimeout(() => {
        progressModal.classList.add("hidden");
      }, 600);
    } catch (err) {
      progressModal.classList.add("hidden");
      alert("PDF Generation Error: " + err.message);
    }
  }

  // Save document to Backblaze B2
  async saveDocument(showNotification = false) {
    const badge = document.getElementById("save-status-badge");
    badge.classList.remove("hidden");
    badge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span><span>Saving to B2...</span>`;

    try {
      const res = await this.b2Service.saveDocument(this.doc);
      if (res.ok) {
        badge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span><span>Cloud Synced</span>`;
        if (showNotification) {
          alert("Assignment saved successfully to Backblaze B2 (10GB).");
        }
      } else {
        badge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span><span>Saved Locally</span>`;
      }
    } catch (e) {
      badge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span><span>Saved Locally</span>`;
    }
  }

  // Setup auto-save every 30 seconds
  setupAutoSave() {
    setInterval(() => {
      this.saveDocument(false);
    }, 30000);
  }

  // Open Templates Modal
  openTemplatesModal() {
    const modal = document.getElementById("modal-templates");
    const list = document.getElementById("templates-list-container");

    list.innerHTML = SAMPLE_TEMPLATES.map(t => `
      <div class="p-3.5 rounded bg-slate-950 border border-slate-800 hover:border-slate-700 transition cursor-pointer template-card flex items-center justify-between" data-id="${t.id}">
        <div>
          <h4 class="font-bold text-xs text-white flex items-center gap-2">
            <span>${t.title}</span>
            <span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono border border-slate-700">${t.paperType}</span>
          </h4>
          <p class="text-xs text-slate-400 mt-1 line-clamp-1">${t.pages[0].content.substring(0, 100)}...</p>
        </div>
        <button class="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-slate-950 font-semibold rounded text-xs transition">
          Use
        </button>
      </div>
    `).join("");

    list.querySelectorAll(".template-card").forEach(card => {
      card.addEventListener("click", () => {
        const id = card.getAttribute("data-id");
        const tmpl = SAMPLE_TEMPLATES.find(t => t.id === id);
        if (tmpl) {
          this.loadDocument({
            id: "doc_" + Date.now(),
            title: tmpl.title,
            settings: {
              ...this.doc.settings,
              paperType: tmpl.paperType,
              fontId: tmpl.fontId,
              fontSize: tmpl.fontSize,
              inkColor: tmpl.inkColor,
              lineSpacing: tmpl.lineHeight || 36,
              wordSpacing: tmpl.wordSpacing || 4,
              letterSpacing: tmpl.letterSpacing || 0.5
            },
            pages: JSON.parse(JSON.stringify(tmpl.pages))
          });
          modal.classList.add("hidden");
        }
      });
    });

    modal.classList.remove("hidden");
  }

  // Open My Assignments Drawer / Modal
  async openMyDocsModal() {
    const modal = document.getElementById("modal-my-docs");
    const list = document.getElementById("saved-docs-list-container");
    modal.classList.remove("hidden");

    list.innerHTML = `<div class="text-center py-8 text-slate-400">Loading your assignments from Backblaze B2...</div>`;

    try {
      const res = await this.b2Service.listUserDocuments();
      const docs = res.documents || [];

      if (docs.length === 0) {
        list.innerHTML = `
          <div class="text-center py-8 text-slate-400 space-y-2">
            <p>No saved assignments found in cloud storage.</p>
            <p class="text-xs text-slate-500">Click the "Save" button to save your current work to Backblaze B2.</p>
          </div>
        `;
        return;
      }

      list.innerHTML = docs.map(d => `
        <div class="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/80 flex items-center justify-between hover:bg-slate-800 transition">
          <div>
            <h4 class="font-bold text-sm text-white">${d.title || "Untitled Assignment"}</h4>
            <div class="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
              <span>${d.pageCount || 1} ${d.pageCount === 1 ? 'page' : 'pages'}</span>
              <span>•</span>
              <span>${d.paperType || 'hindi-notebook'}</span>
              <span>•</span>
              <span>${new Date(d.updatedAt || Date.now()).toLocaleDateString()}</span>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <button class="btn-load-doc px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition" data-id="${d.id}">
              Open
            </button>
            <button class="btn-del-doc p-1.5 text-slate-400 hover:text-rose-400 transition" data-id="${d.id}" title="Delete">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
          </div>
        </div>
      `).join("");

      list.querySelectorAll(".btn-load-doc").forEach(btn => {
        btn.addEventListener("click", async () => {
          const id = btn.getAttribute("data-id");
          const docRes = await this.b2Service.getDocument(id);
          if (docRes.ok && docRes.document) {
            this.loadDocument(docRes.document);
            modal.classList.add("hidden");
          } else {
            alert("Could not load document from B2");
          }
        });
      });

      list.querySelectorAll(".btn-del-doc").forEach(btn => {
        btn.addEventListener("click", async () => {
          const id = btn.getAttribute("data-id");
          if (confirm("Delete this assignment from cloud storage?")) {
            await this.b2Service.deleteDocument(id);
            this.openMyDocsModal();
          }
        });
      });

    } catch (e) {
      list.innerHTML = `<div class="text-rose-400 text-center py-4">Error loading documents: ${e.message}</div>`;
    }
  }

  // Load a complete document object into editor
  loadDocument(docData) {
    this.doc = docData;
    document.getElementById("doc-title-input").value = this.doc.title || "Untitled Assignment";

    const s = this.doc.settings || {};
    document.getElementById("select-paper-type").value = s.paperType || "hindi-notebook";
    document.getElementById("select-font-family").value = s.fontId || "kalam";
    document.getElementById("slider-font-size").value = s.fontSize || 22;
    document.getElementById("label-font-size").textContent = `${s.fontSize || 22}px`;
    document.getElementById("slider-line-spacing").value = s.lineSpacing || 36;
    document.getElementById("label-line-spacing").textContent = `${s.lineSpacing || 36}px`;
    document.getElementById("slider-word-spacing").value = s.wordSpacing || 4;
    document.getElementById("label-word-spacing").textContent = `${s.wordSpacing || 4}px`;
    document.getElementById("slider-letter-spacing").value = s.letterSpacing || 0.5;
    document.getElementById("label-letter-spacing").textContent = `${s.letterSpacing || 0.5}px`;

    this.onPaperTypeChange(s.paperType || "hindi-notebook");
    this.setInkColor(s.inkColor || "#1e3a8a");
    this.applyDocumentSettings();
    this.renderAllPages();
  }

  // Google Authentication Setup & Super Admin Recognition
  setupAuth() {
    this.updateUserUI();

    // Check if Google GSI is available
    if (window.google && window.google.accounts && window.google.accounts.id) {
      this.initGoogleGSI();
    } else {
      window.addEventListener("load", () => {
        if (window.google && window.google.accounts && window.google.accounts.id) {
          this.initGoogleGSI();
        }
      });
    }
  }

  initGoogleGSI() {
    try {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => this.handleGoogleCredential(response)
      });
      // Optionally display one-tap prompt for quick login
      window.google.accounts.id.prompt();
    } catch (e) {
      console.warn("Google GIS init:", e);
    }
  }

  promptGoogleSignIn() {
    const email = prompt("Enter your Google Account email to sign in to NotePot:", "ceo.shubhampathak@gmail.com");
    if (email && email.includes("@")) {
      const name = email.split("@")[0].replace(/[._-]/g, " ");
      const user = this.b2Service.setUser({
        email: email.trim().toLowerCase(),
        name: name.charAt(0).toUpperCase() + name.slice(1)
      });
      this.updateUserUI();
      alert(`Welcome ${user.name}! Connected to NotePot Cloud.`);
    }
  }

  handleGoogleCredential(response) {
    try {
      // Decode JWT payload
      const base64Url = response.credential.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(atob(base64).split("").map(c => {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(""));
      const profile = JSON.parse(jsonPayload);

      const user = this.b2Service.setUser({
        email: profile.email,
        name: profile.name,
        picture: profile.picture
      });

      this.updateUserUI();
    } catch (e) {
      console.error("Google credential parse failed:", e);
    }
  }

  updateUserUI() {
    const user = this.b2Service.currentUser;
    const nameEl = document.getElementById("user-display-name");
    const avatarEl = document.getElementById("user-avatar");
    const menuName = document.getElementById("menu-user-name");
    const menuEmail = document.getElementById("menu-user-email");

    nameEl.textContent = user.name || "Guest";
    avatarEl.textContent = (user.name || "G")[0].toUpperCase();
    menuName.textContent = user.name;
    menuEmail.textContent = user.email;

    this.checkSuperAdmin();
  }

  checkSuperAdmin() {
    const ceoBtn = document.getElementById("btn-ceo-admin");
    if (this.b2Service.isSuperAdmin()) {
      ceoBtn.classList.remove("hidden");
      ceoBtn.classList.add("flex");
    } else {
      ceoBtn.classList.add("hidden");
      ceoBtn.classList.remove("flex");
    }
  }
}

// Instantiate on DOM load
window.addEventListener("DOMContentLoaded", () => {
  window.notepot = new NotePotApp();
});
