# NotePot ✍️📔
> **Authentic Handwritten Hindi & English Notebook Assignment Web Application**
> Part of the **ZENSTRO** Ecosystem (`zenstro.space`)

---

## 🌟 Overview
**NotePot** is an intelligent web-based handwriting simulator and assignment builder. Users can type or paste text in Hindi, English, or any language and instantly convert it into authentic handwritten notebook pages with 38+ realistic handwriting fonts, ruled line alignment, customizable word & letter spacing, and instant high-DPI multi-page PDF generation.

---

## 🚀 Key Features

1. **Authentic Paper Styles**:
   - **Hindi Notebook Page (हिंदी कॉपी)**: Traditional ruled blue lines, red vertical left margin, double header line, and corner Date/Page No box.
   - **Hindi Two-Line Notebook (दो लाइन वाली कॉपी)**: Traditional double guide lines for primary handwriting practice.
   - **White Ruled A4**: Clean white A4 paper with customizable ruled line height.
   - **White Plain A4**: Clean blank A4 sheet for freeform handwritten assignments.
   - **Math & Graph Notebook**: Square grid lines for mathematics and science diagrams.
   - **Vintage Parchment**: Warm aged parchment paper with natural texture.

2. **38+ Authentic Handwritten Fonts**:
   - **Hindi / Devanagari Scripts**: Kalam, Tillana, Dekko, Amita, Yatra One, Rozha One, Kurale, Sahitya, Halant, Modak.
   - **English & Universal Handwriting**: Caveat, Indie Flower, Shadows Into Light, Dancing Script, Patrick Hand, Mali, Gochi Hand, Homemade Apple, Reenie Beanie, Bad Script, Courgette, Covered By Your Grace, Just Another Hand, Nothing You Could Do, Schoolbell, Loved by the King, Over the Rainbow, Sacramento, Great Vibes, Satisfy, Marck Script, Gloria Hallelujah, Permanent Marker, Nanum Pen Script, Yellowtail, Alex Brush, Beth Ellen, Rock Salt.

3. **Intelligent Spacing & Alignment Engine**:
   - **Hindi Notebook Line Locking**: Line distance is precisely locked on Hindi ruled pages to ensure characters hang and align authentically with notebook lines.
   - **White Page Adjustable Line Spacing**: On White Ruled A4, users can adjust line distance from 24px to 56px with dynamic re-drawing.
   - **Word Gap (Word Spacing)**: Customizable from -2px to +20px.
   - **Letter Gap (Text ke beech ka distance)**: Customizable from -1px to +10px.

4. **Multi-Page & Auto-Flow Pagination**:
   - Add, duplicate, reorder, or delete as many pages as needed.
   - Auto-split feature: Paste entire chapters or long essays, and NotePot automatically splits them across multiple pages.

5. **High-Definition PDF Download**:
   - 2x/3x high-DPI A4 vector rasterization with preserved handwritten fonts, ruled lines, ink bleed, and margins.

6. **Backblaze B2 10GB Cloud Storage**:
   - Integrates Backblaze B2 S3/Native API using user's Master Application Key.
   - Automatic background syncing of assignments and generated PDFs.

7. **CEO Super Admin Console (`ceo.shubhampathak@gmail.com`)**:
   - Direct access to inspect any user's created assignments and text.
   - Live 10GB Backblaze B2 storage monitoring (used MB, free GB, total files).
   - Real-time search across all users and documents.
   - Seamless integration with Zenstro Main Admin panel (`zenstro.space/admin.html`).

---

## 🛠️ Tech Stack
- **Frontend**: HTML5, Tailwind CSS, Vanilla Modern JS (ES Modules)
- **PDF Engine**: `jspdf` & `html2canvas`
- **Cloud Backend**: Cloudflare Pages Functions
- **Storage**: Backblaze B2 (10GB Tier)
- **Authentication**: Google Identity Services (GIS)
- **Deployment**: Cloudflare Pages (`notepot.zenstro.space` / `notepot.pages.dev`)
