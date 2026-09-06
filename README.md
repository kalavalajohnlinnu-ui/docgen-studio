# ⚡ DocGen Studio

> **Universal Document & Quotation Web App Generator**  
> Turn any tagged **PDF**, **Word (DOCX)**, or **HTML** template into a production-grade, standalone generator web application — 100% client-side, zero backend required.

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live%20Demo-brightgreen?logo=github)](https://kalavalajohnlinnu-ui.github.io/docgen-studio/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Zero-Server](https://img.shields.io/badge/Architecture-Zero--Server%20%C2%B7%20Client--Side-blue)](#)
[![Formats](https://img.shields.io/badge/Formats-PDF%20%7C%20DOCX%20%7C%20HTML-orange)](#)

---

## 🎯 What is DocGen Studio?

If you frequently build quotation generators, proposal web apps, invoice creators, or agreement tools for clients, **DocGen Studio is the meta-app that builds them for you in seconds**.

1. **Tag your template**: Wrap dynamic variables in angle brackets (e.g. `<Customer_Name>`, `<Capacity_kW>`, `<Project_Cost_INR>`).
2. **Drop into DocGen Studio**: Scans all tags, extracts page coordinates, detects formulas, and previews all pages visually.
3. **One-Click Generate**: Compiles a single, self-contained `.html` web app that can be sent to clients or sales teams.

The generated web app has a dark glassmorphic UI, live calculations, draft auto-saving, and generates official documents on the first try with **zero errors**.

---

## ✨ Features

### 📕 1. Native Vector PDF Overlay (`pdf-lib`)
- Upload any tagged PDF (proposals, quotations, contracts).
- **Interactive Page Inspector**: Browse thumbnail cards for every page and view highlighted bounding boxes over every detected `<Tag>`.
- **Visual Marker Placer**: Click anywhere on the canvas to place a new variable marker at exact coordinates.
- **Flawless Output**: Uses `pdf-lib` to overlay clean cover rectangles and write sharp vector typography (`Helvetica-Bold`) onto the original template pages.

### 📝 2. Word DOCX Engine (`JSZip`)
- Unpacks DOCX templates in the browser.
- **XML Run-Merge Healing**: Solves Word's notorious split `<w:r>` runs across placeholders before replacement.
- Single-click download of the filled `.docx` document.

### 🌐 3. Print-Ready HTML Generator
- Replaces `<Tag>` placeholders in HTML templates.
- Built-in `@media print` layout and print-to-PDF dialog.

### 🧮 4. Real-Time Formula Engine
- Detects formulas directly from tags: `<Net_Cost_INR = Project_Cost_INR - Subsidy_INR>`.
- Supports math expressions: `Annual_Energy = Capacity_kW * 4.2 * 365`, `Monthly_Savings = round(Annual_Energy / 12 * 8)`.
- Auto-formats currency in Indian Lakhs (`₹ 3,25,000`) or International Millions (`$325,000`).

### 📦 5. Zero-Server Standalone Compilation
- The generated web app is a **single `.html` file** with the template embedded as base64.
- Works 100% offline or online in any modern browser (Chrome, Edge, Safari, Firefox).
- Includes `localStorage` auto-saving so input data is never lost.

---

## 🚀 Quick Start

### Option A: Use it Online
Open the live GitHub Pages app:  
👉 **[https://kalavalajohnlinnu-ui.github.io/docgen-studio/](https://kalavalajohnlinnu-ui.github.io/docgen-studio/)**

### Option B: Run Locally
Simply clone and double-click `index.html`:
```bash
git clone https://github.com/kalavalajohnlinnu-ui/docgen-studio.git
cd docgen-studio
start index.html
```

---

## 📋 Step-by-Step Workflow

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│ 1. Upload &     │  ───> │ 2. Configure    │  ───> │ 3. Brand &      │  ───> │ 4. Generate     │
│    Visual Scan  │       │    Formulas     │       │    Settings     │       │    Standalone   │
└─────────────────Reset───┘       └─────────────────┘       └─────────────────┘       └─────────────────┘
```

1. **Upload Template**: Drag & drop `.pdf`, `.docx`, or `.html`. Or click *"✨ Load 7-Page Solar Proposal Sample"* to try it instantly.
2. **Configure Variables**: Review auto-detected field types (Currency, Number, Text, Date, Dropdown, Calculated). Add or tweak formulas.
3. **App Settings**: Customize title, company name, primary accent color (7 swatches), and theme.
4. **Generate**: Click **"🚀 Download Standalone Web App (.html)"** or click **"⚡ Test & Launch Live Generator"** to test it right inside your browser!

---

## 🛠️ Built With

- [PDF-Lib](https://pdf-lib.js.org/) — In-browser vector PDF manipulation
- [PDF.js](https://mozilla.github.io/pdf.js/) — In-browser PDF parsing and canvas rendering
- [JSZip](https://stuk.github.io/jszip/) — Client-side Word DOCX extraction and repackaging
- [Google Fonts](https://fonts.google.com/) — Inter, Space Grotesk, DM Mono

---

## 📄 License

MIT License — free to use for personal and commercial projects.
