
/* ==========================================================
   DOCGEN STUDIO — SIMPLE & CLEAR ENGINE
========================================================== */
const state = {
  file: null,
  fileName: '',
  fileType: 'pdf',
  fileBase64: '',
  pdfDoc: null,
  currentPage: 1,
  totalPages: 0,
  pageTags: {},
  vars: []
};

const FIELD_TYPES = [
  { val: 'text', label: '📝 Text' },
  { val: 'inr', label: '💰 Currency (₹ INR)' },
  { val: 'number', label: '🔢 Number' },
  { val: 'date', label: '📅 Date' },
  { val: 'calculated', label: '🧮 Auto Calculated' }
];

function goToStep(stepNum) {
  for (let i = 1; i <= 3; i++) {
    const pill = document.getElementById('stepPill' + i);
    const sec = document.getElementById('sectionStep' + i);
    if (pill) {
      pill.classList.remove('active');
      if (i < stepNum) pill.classList.add('done');
      if (i === stepNum) pill.classList.add('active');
    }
    if (sec) {
      if (i === stepNum) {
        sec.style.display = 'block';
        sec.classList.add('highlight-card');
        sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        sec.classList.remove('highlight-card');
      }
    }
  }
}

function showAlert(msg, type = 'info') {
  const box = document.getElementById('statusAlertBox');
  if (!box) return;
  box.style.display = 'flex';
  box.className = 'info-alert ' + type;
  box.innerHTML = msg;
}

/* FILE UPLOAD */
const dropzone = document.getElementById('uploadDropzone');
const filePicker = document.getElementById('filePicker');

if (dropzone) {
  dropzone.addEventListener('dragover', e => { e.preventDefault(); dropzone.classList.add('drag-over'); });
  dropzone.addEventListener('dragleave', () => dropzone.classList.remove('drag-over'));
  dropzone.addEventListener('drop', e => {
    e.preventDefault();
    dropzone.classList.remove('drag-over');
    if (e.dataTransfer.files.length) onFileChosen(e.dataTransfer.files[0]);
  });
}

if (filePicker) {
  filePicker.addEventListener('change', e => {
    if (e.target.files.length) onFileChosen(e.target.files[0]);
  });
}

function onFileChosen(file) {
  state.file = file;
  state.fileName = file.name;
  const ext = file.name.split('.').pop().toLowerCase();
  
  if (ext === 'pdf') state.fileType = 'pdf';
  else if (ext === 'docx') state.fileType = 'docx';
  else state.fileType = 'html';

  const kb = (file.size / 1024).toFixed(1);
  const icon = state.fileType === 'pdf' ? '📕' : state.fileType === 'docx' ? '📝' : '🌐';

  const card = document.getElementById('fileLoadedCard');
  if (card) {
    card.style.display = 'flex';
    card.className = 'loaded-pill';
    card.innerHTML = `
      <div class="loaded-pill-info">
        <span class="loaded-pill-icon">${icon}</span>
        <div>
          <div class="loaded-pill-title">${escapeHtml(file.name)}</div>
          <div class="loaded-pill-meta">${kb} KB · ${state.fileType.toUpperCase()} Document</div>
        </div>
      </div>
      <button class="btn btn-ghost btn-sm" onclick="clearSelectedFile()">✕ Change</button>
    `;
  }

  const btnScan = document.getElementById('btnStartScan');
  if (btnScan) btnScan.style.display = 'inline-flex';
  const alertBox = document.getElementById('statusAlertBox');
  if (alertBox) alertBox.style.display = 'none';

  const reader = new FileReader();
  reader.onload = ev => {
    const bytes = new Uint8Array(ev.target.result);
    let bin = '';
    for (let b of bytes) bin += String.fromCharCode(b);
    state.fileBase64 = btoa(bin);
  };
  reader.readAsArrayBuffer(file);
}

function clearSelectedFile() {
  state.file = null;
  state.fileName = '';
  state.fileBase64 = '';
  state.pdfDoc = null;
  state.vars = [];
  document.getElementById('fileLoadedCard').style.display = 'none';
  document.getElementById('btnStartScan').style.display = 'none';
  document.getElementById('pdfViewerArea').style.display = 'none';
  document.getElementById('sectionStep2').style.display = 'none';
  document.getElementById('sectionStep3').style.display = 'none';
  document.getElementById('statusAlertBox').style.display = 'none';
  if (filePicker) filePicker.value = '';
}

/* SCANNING & DEMO LOADERS */
async function runTagScan() {
  showAlert('🔍 Scanning document for placeholders...', 'info');

  try {
    if (state.fileType === 'pdf') {
      await scanPdfFile();
    } else if (state.fileType === 'docx') {
      await scanDocxFile();
    } else {
      await scanHtmlFile();
    }
  } catch (err) {
    showAlert('❌ Scan error: ' + err.message, 'danger');
  }
}

async function scanPdfFile() {
  const binaryString = atob(state.fileBase64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);

  state.pdfDoc = await pdfjsLib.getDocument({ data: bytes }).promise;
  state.totalPages = state.pdfDoc.numPages;
  state.pageTags = {};

  const tagMap = {};

  for (let p = 1; p <= state.totalPages; p++) {
    const page = await state.pdfDoc.getPage(p);
    const viewport = page.getViewport({ scale: 1.0 });
    const textContent = await page.getTextContent();
    const items = textContent.items;

    state.pageTags[p - 1] = [];
    const fullText = items.map(it => it.str).join(' ');

    const re = /<([A-Za-z0-9_ -]+(?:=[^>]+)?)>/g;
    let match;
    while ((match = re.exec(fullText)) !== null) {
      const inner = match[1].trim();
      const parts = inner.split('=');
      const rawName = parts[0].trim().replace(/\s+/g, '_');
      const formula = parts.length > 1 ? parts[1].trim() : '';

      const tagName = rawName.replace(/[^A-Za-z0-9_]/g, '');
      if (!tagName || tagName.length < 2) continue;

      let matchedItem = items.find(it => it.str.includes(parts[0].trim()) || it.str.includes(tagName));
      if (!matchedItem) {
        const words = tagName.split('_').filter(w => w.length > 2);
        matchedItem = items.find(it => words.some(w => it.str.toLowerCase().includes(w.toLowerCase())));
      }

      let x = 70, y = 500, w = 150, h = 18;
      if (matchedItem) {
        x = Math.round(matchedItem.transform[4]);
        y = Math.round(matchedItem.transform[5]);
        w = Math.round(matchedItem.width || 120);
        h = Math.round(matchedItem.height || matchedItem.transform[0] || 16);
      }

      if (!tagMap[tagName]) {
        tagMap[tagName] = {
          tag: tagName,
          label: formatFriendlyLabel(tagName),
          type: guessTypeByName(tagName, formula),
          formula: formula,
          occurrences: []
        };
      }

      const occ = {
        page: p - 1,
        x: x,
        y: y,
        w: Math.max(w, 80),
        h: Math.max(h, 16),
        top: Math.round(viewport.height - y - h)
      };

      tagMap[tagName].occurrences.push(occ);
      state.pageTags[p - 1].push({ tagName, ...occ });
    }
  }

  state.vars = Object.values(tagMap);
  onScanDone();
  renderPagesStrip();
  renderPdfPage(1);
}

async function scanDocxFile() {
  const binaryString = atob(state.fileBase64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);

  const zip = await JSZip.loadAsync(bytes);
  let allXml = '';
  for (const filename of Object.keys(zip.files)) {
    if (filename.endsWith('.xml')) {
      const xml = await zip.file(filename).async('string');
      allXml += xml + '\n';
    }
  }

  const decoded = allXml.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
  extractTagsFromText(decoded);
}

async function scanHtmlFile() {
  const binaryString = atob(state.fileBase64);
  let html = '';
  try { html = decodeURIComponent(escape(binaryString)); } catch(e) { html = binaryString; }
  extractTagsFromText(html);
}

function extractTagsFromText(text) {
  const tagMap = {};
  const re = /<([A-Za-z0-9_ -]+(?:=[^>]+)?)>/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const inner = m[1].trim();
    const parts = inner.split('=');
    const tagName = parts[0].trim().replace(/\s+/g, '_').replace(/[^A-Za-z0-9_]/g, '');
    const formula = parts.length > 1 ? parts[1].trim() : '';

    if (!tagName || tagName.length < 2) continue;
    if (!tagMap[tagName]) {
      tagMap[tagName] = {
        tag: tagName,
        label: formatFriendlyLabel(tagName),
        type: guessTypeByName(tagName, formula),
        formula: formula,
        occurrences: []
      };
    }
  }

  state.vars = Object.values(tagMap);
  onScanDone();
}

function onScanDone() {
  if (state.vars.length === 0) {
    showAlert('⚠️ No &lt;Tags&gt; found in document. Make sure placeholders look like &lt;Customer_Name&gt;.', 'warning');
    return;
  }

  showAlert(`✅ Found <strong>${state.vars.length} variables</strong> in your document!`, 'success');
  const countSub = document.getElementById('varsCountSub');
  if (countSub) countSub.textContent = `${state.vars.length} fields found`;

  renderVariablesCleanTable();
  goToStep(2);
}

function renderPagesStrip() {
  const area = document.getElementById('pdfViewerArea');
  if (area) area.style.display = 'block';

  const strip = document.getElementById('pagesNavStrip');
  if (!strip) return;
  strip.innerHTML = '';

  for (let p = 1; p <= state.totalPages; p++) {
    const btn = document.createElement('button');
    btn.className = 'page-btn' + (p === state.currentPage ? ' active' : '');
    const count = (state.pageTags[p - 1] || []).length;
    btn.innerHTML = `Page ${p} (${count} tags)`;
    btn.onclick = () => renderPdfPage(p);
    strip.appendChild(btn);
  }
}

async function renderPdfPage(pageNum) {
  state.currentPage = pageNum;
  document.querySelectorAll('.page-btn').forEach((b, i) => {
    b.classList.toggle('active', i === pageNum - 1);
  });

  const page = await state.pdfDoc.getPage(pageNum);
  const canvas = document.getElementById('pdfCanvas');
  const layer = document.getElementById('canvasMarkersLayer');
  if (!canvas || !layer) return;
  layer.innerHTML = '';

  const scale = 1.25;
  const viewport = page.getViewport({ scale: scale });
  canvas.width = viewport.width;
  canvas.height = viewport.height;

  const ctx = canvas.getContext('2d');
  await page.render({ canvasContext: ctx, viewport: viewport }).promise;

  const tags = state.pageTags[pageNum - 1] || [];
  tags.forEach(t => {
    const box = document.createElement('div');
    box.className = 'tag-badge-marker';

    const left = t.x * scale;
    const top = (viewport.height / scale - t.y - t.h) * scale;
    const w = t.w * scale;
    const h = t.h * scale;

    box.style.left = left + 'px';
    box.style.top = top + 'px';
    box.style.width = w + 'px';
    box.style.height = h + 'px';

    box.innerHTML = `<span class="tag-badge-label">&lt;${t.tagName}&gt;</span>`;
    box.title = `Field: <${t.tagName}>`;
    layer.appendChild(box);
  });
}

function loadDemoProposal() {
  if (!window.SAMPLE_PDF_B64) {
    showAlert('Sample data not found. Please upload a file.', 'warning');
    return;
  }

  state.fileBase64 = window.SAMPLE_PDF_B64;
  state.fileName = 'EffiSol_Solar_Proposal_7Pages.pdf';
  state.fileType = 'pdf';

  const card = document.getElementById('fileLoadedCard');
  if (card) {
    card.style.display = 'flex';
    card.className = 'loaded-pill';
    card.innerHTML = `
      <div class="loaded-pill-info">
        <span class="loaded-pill-icon">📕</span>
        <div>
          <div class="loaded-pill-title">EffiSol_Solar_Proposal_7Pages.pdf (7-Page Sample)</div>
          <div class="loaded-pill-meta">15 Variables · Official Solar Proposal Template</div>
        </div>
      </div>
      <button class="btn btn-ghost btn-sm" onclick="clearSelectedFile()">✕ Change</button>
    `;
  }

  const btnScan = document.getElementById('btnStartScan');
  if (btnScan) btnScan.style.display = 'none';

  state.vars = [
    { tag: 'Customer_Name', label: 'Customer Full Name', type: 'text', def: 'Mr. Rama Krishna', formula: '', occurrences: [{ page: 0, x: 242, y: 333, w: 200, h: 22 }] },
    { tag: 'Capacity_kW', label: 'System Capacity (kW)', type: 'number', def: '5.5', formula: '', occurrences: [{ page: 0, x: 120, y: 625, w: 60, h: 18 }, { page: 5, x: 78, y: 399, w: 80, h: 18 }] },
    { tag: 'Panel_Wattage', label: 'Panel Wattage (Wp)', type: 'number', def: '615', formula: '', occurrences: [{ page: 0, x: 181, y: 610, w: 70, h: 16 }, { page: 4, x: 135, y: 489, w: 150, h: 16 }] },
    { tag: 'Panel_Brand', label: 'Solar Panel Brand', type: 'text', def: 'Adani / Luminous', formula: '', occurrences: [{ page: 4, x: 110, y: 474, w: 180, h: 16 }] },
    { tag: 'Inverter_Capacity_kVA', label: 'Inverter Capacity (kW)', type: 'number', def: '5', formula: '', occurrences: [{ page: 4, x: 69, y: 422, w: 200, h: 16 }] },
    { tag: 'Project_Cost_INR', label: 'Total Project Cost (₹)', type: 'inr', def: '325000', formula: '', occurrences: [{ page: 4, x: 315, y: 553, w: 260, h: 18 }] },
    { tag: 'Subsidy_INR', label: 'Government Subsidy (₹)', type: 'inr', def: '78000', formula: '', occurrences: [{ page: 4, x: 315, y: 435, w: 260, h: 18 }] },
    { tag: 'Net_Cost_INR', label: 'Net Cost to Customer (₹)', type: 'calculated', def: '247000', formula: 'Project_Cost_INR - Subsidy_INR', occurrences: [{ page: 4, x: 314, y: 403, w: 260, h: 18 }] },
    { tag: 'Annual_Energy_Units', label: 'Annual Units (kWh)', type: 'calculated', def: '8432', formula: 'Capacity_kW * 4.2 * 365', occurrences: [{ page: 4, x: 181, y: 284, w: 380, h: 18 }] },
    { tag: 'Monthly_Savings_INR', label: 'Monthly Bill Savings (₹)', type: 'calculated', def: '5624', formula: 'round((Annual_Energy_Units / 12) * 8)', occurrences: [{ page: 4, x: 202, y: 218, w: 380, h: 18 }] }
  ];

  showAlert('✅ Loaded 7-Page Solar Proposal Sample with 10 configured variables!', 'success');

  const countSub = document.getElementById('varsCountSub');
  if (countSub) countSub.textContent = '10 fields ready';

  renderVariablesCleanTable();

  // Load canvas preview
  const binaryString = atob(state.fileBase64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);

  pdfjsLib.getDocument({ data: bytes }).promise.then(doc => {
    state.pdfDoc = doc;
    state.totalPages = doc.numPages;
    state.pageTags = {};
    state.vars.forEach(v => {
      (v.occurrences || []).forEach(o => {
        if (!state.pageTags[o.page]) state.pageTags[o.page] = [];
        state.pageTags[o.page].push({ tagName: v.tag, ...o });
      });
    });
    renderPagesStrip();
    renderPdfPage(1);
  });

  goToStep(2);
}

function loadDemoHtml() {
  loadDemoConstruction();
}

function loadDemoConstruction() {
  const sampleHtml = `<!DOCTYPE html>
<html>
<head><title>Construction Quotation - <Client_Name></title>
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; margin: 40px; color: #1e293b; background: #f8fafc; }
  .card { max-width: 750px; margin: 0 auto; background: #fff; padding: 36px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
  .header { display: flex; justify-content: space-between; border-bottom: 2px solid #ea580c; padding-bottom: 16px; margin-bottom: 24px; }
  .title { font-size: 24px; font-weight: bold; color: #ea580c; }
  .subtitle { font-size: 14px; color: #64748b; }
  table { width: 100%; border-collapse: collapse; margin: 20px 0; }
  th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
  th { background: #f1f5f9; font-weight: 600; color: #334155; }
  .total-row { font-weight: bold; font-size: 16px; background: #fff7ed; color: #c2410c; }
  @media print { body { margin: 0; background: #fff; } .card { box-shadow: none; border: none; padding: 20px; } }
</style>
</head>
<body>
<div class="card">
  <div class="header">
    <div>
      <div class="title">🏗️ Apex Infra & Builders</div>
      <div class="subtitle">Commercial & Residential Construction Quotation</div>
    </div>
    <div style="text-align:right">
      <div style="font-weight:600">Date: <Quote_Date></div>
      <div style="color:#64748b;font-size:13px">Ref: APX-<Built_Up_Area_sqft></div>
    </div>
  </div>
  <p><strong>Prepared for:</strong> <Client_Name></p>
  <p><strong>Site Location:</strong> <Site_Address></p>
  <table>
    <thead><tr><th>Description</th><th>Rate / Sqft</th><th>Quantity</th><th>Amount (₹)</th></tr></thead>
    <tbody>
      <tr><td>Civil Construction & Finishing</td><td>₹ <Rate_Per_sqft></td><td><Built_Up_Area_sqft> sq.ft</td><td>₹ <Basic_Cost_INR></td></tr>
      <tr><td>Architectural & MEP Services</td><td>Included</td><td>Lump sum</td><td>₹ 0</td></tr>
      <tr><td colspan="3" style="text-align:right"><strong>Subtotal:</strong></td><td>₹ <Basic_Cost_INR></td></tr>
      <tr><td colspan="3" style="text-align:right"><strong>GST (18%):</strong></td><td>₹ <GST_INR></td></tr>
      <tr class="total-row"><td colspan="3" style="text-align:right"><strong>Grand Total Payable:</strong></td><td>₹ <Total_Cost_INR></td></tr>
    </tbody>
  </table>
  <p style="font-size:12px;color:#94a3b8;margin-top:20px;">* Validity: 30 days. Payment terms: 30% advance, balance milestone based.</p>
</div>
</body>
</html>`;

  state.fileBase64 = btoa(unescape(encodeURIComponent(sampleHtml)));
  state.fileName = 'Construction_Quotation.html';
  state.fileType = 'html';

  state.vars = [
    { tag: 'Client_Name', label: 'Client / Company Name', type: 'text', def: 'Mr. Ananya Verma', formula: '', occurrences: [] },
    { tag: 'Site_Address', label: 'Project Site Location', type: 'text', def: 'Plot 42, Hitech City, Hyderabad', formula: '', occurrences: [] },
    { tag: 'Quote_Date', label: 'Quotation Date', type: 'date', def: '2026-09-22', formula: '', occurrences: [] },
    { tag: 'Built_Up_Area_sqft', label: 'Built-Up Area (sq.ft)', type: 'number', def: '2000', formula: '', occurrences: [] },
    { tag: 'Rate_Per_sqft', label: 'Rate per sq.ft (₹)', type: 'number', def: '1850', formula: '', occurrences: [] },
    { tag: 'Basic_Cost_INR', label: 'Subtotal Cost (₹)', type: 'calculated', def: '3700000', formula: 'Built_Up_Area_sqft * Rate_Per_sqft', occurrences: [] },
    { tag: 'GST_INR', label: 'GST Amount 18% (₹)', type: 'calculated', def: '666000', formula: 'Basic_Cost_INR * 0.18', occurrences: [] },
    { tag: 'Total_Cost_INR', label: 'Grand Total (₹)', type: 'calculated', def: '4366000', formula: 'Basic_Cost_INR + GST_INR', occurrences: [] }
  ];

  showAlert('✅ Loaded Construction Quotation Template (8 variables with live formulas)!', 'success');
  renderVariablesCleanTable();
  goToStep(2);
}

function loadDemoInvoice() {
  const sampleHtml = `<!DOCTYPE html>
<html>
<head><title>Tax Invoice - <Client_Name></title>
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; margin: 40px; color: #0f172a; background: #f8fafc; }
  .card { max-width: 750px; margin: 0 auto; background: #fff; padding: 36px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
  .header { display: flex; justify-content: space-between; border-bottom: 2px solid #2563eb; padding-bottom: 16px; margin-bottom: 24px; }
  .title { font-size: 24px; font-weight: bold; color: #2563eb; }
  .subtitle { font-size: 14px; color: #64748b; }
  table { width: 100%; border-collapse: collapse; margin: 20px 0; }
  th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
  th { background: #eff6ff; font-weight: 600; color: #1e40af; }
  .total-row { font-weight: bold; font-size: 16px; background: #dbeafe; color: #1e3a8a; }
  @media print { body { margin: 0; background: #fff; } .card { box-shadow: none; border: none; padding: 20px; } }
</style>
</head>
<body>
<div class="card">
  <div class="header">
    <div>
      <div class="title">🧾 TechCraft Solutions</div>
      <div class="subtitle">Tax Invoice &amp; Commercial Billing</div>
    </div>
    <div style="text-align:right">
      <div style="font-weight:600">Invoice: #INV-<Invoice_Number></div>
      <div style="color:#64748b;font-size:13px">Date: <Invoice_Date></div>
    </div>
  </div>
  <p><strong>Billed to:</strong> <Client_Name></p>
  <p><strong>GSTIN:</strong> <Client_GSTIN></p>
  <table>
    <thead><tr><th>Item / Service</th><th>Qty / Units</th><th>Rate (₹)</th><th>Amount (₹)</th></tr></thead>
    <tbody>
      <tr><td><Service_Description></td><td>1</td><td>₹ <Base_Amount_INR></td><td>₹ <Base_Amount_INR></td></tr>
      <tr><td colspan="3" style="text-align:right"><strong>Subtotal:</strong></td><td>₹ <Base_Amount_INR></td></tr>
      <tr><td colspan="3" style="text-align:right"><strong>Special Discount:</strong></td><td style="color:#dc2626">- ₹ <Discount_INR></td></tr>
      <tr><td colspan="3" style="text-align:right"><strong>Taxable Amount:</strong></td><td>₹ <Taxable_Amount_INR></td></tr>
      <tr><td colspan="3" style="text-align:right"><strong>GST (18%):</strong></td><td>₹ <GST_Amount_INR></td></tr>
      <tr class="total-row"><td colspan="3" style="text-align:right"><strong>Total Amount Due:</strong></td><td>₹ <Invoice_Total_INR></td></tr>
    </tbody>
  </table>
  <p style="font-size:12px;color:#94a3b8;margin-top:20px;">* Thank you for your business. Payment due within 15 days.</p>
</div>
</body>
</html>`;

  state.fileBase64 = btoa(unescape(encodeURIComponent(sampleHtml)));
  state.fileName = 'Commercial_Tax_Invoice.html';
  state.fileType = 'html';

  state.vars = [
    { tag: 'Client_Name', label: 'Billed Client Name', type: 'text', def: 'Global Logistics Pvt Ltd', formula: '', occurrences: [] },
    { tag: 'Client_GSTIN', label: 'Client GSTIN Number', type: 'text', def: '36AAAAA0000A1Z5', formula: '', occurrences: [] },
    { tag: 'Invoice_Number', label: 'Invoice Number', type: 'text', def: '2026-901', formula: '', occurrences: [] },
    { tag: 'Invoice_Date', label: 'Invoice Date', type: 'date', def: '2026-09-22', formula: '', occurrences: [] },
    { tag: 'Service_Description', label: 'Service Description', type: 'text', def: 'Enterprise Cloud ERP Software & Maintenance', formula: '', occurrences: [] },
    { tag: 'Base_Amount_INR', label: 'Base Fee Amount (₹)', type: 'inr', def: '150000', formula: '', occurrences: [] },
    { tag: 'Discount_INR', label: 'Discount Amount (₹)', type: 'inr', def: '15000', formula: '', occurrences: [] },
    { tag: 'Taxable_Amount_INR', label: 'Taxable Amount (₹)', type: 'calculated', def: '135000', formula: 'Base_Amount_INR - Discount_INR', occurrences: [] },
    { tag: 'GST_Amount_INR', label: 'GST 18% (₹)', type: 'calculated', def: '24300', formula: 'Taxable_Amount_INR * 0.18', occurrences: [] },
    { tag: 'Invoice_Total_INR', label: 'Invoice Total (₹)', type: 'calculated', def: '159300', formula: 'Taxable_Amount_INR + GST_Amount_INR', occurrences: [] }
  ];

  showAlert('✅ Loaded Commercial Tax Invoice Template (10 variables with live formulas)!', 'success');
  renderVariablesCleanTable();
  goToStep(2);
}

/* VARIABLES TABLE */
function formatFriendlyLabel(tag) {
  return tag.replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .replace(/  +/g, ' ')
    .trim();
}

function guessTypeByName(tag, formula) {
  if (formula && formula.trim().length > 0) return 'calculated';
  const t = tag.toLowerCase();
  if (/cost|price|amount|inr|rs|fee|subsidy|total|tax|savings/.test(t)) return 'inr';
  if (/net_cost|basic_cost|annual_|monthly_|savings_|units/.test(t)) return 'calculated';
  if (/date|dob|valid/.test(t)) return 'date';
  if (/kw|kwp|watt|capacity|load|rating|units/.test(t)) return 'number';
  return 'text';
}

function renderVariablesCleanTable() {
  const tbody = document.getElementById('varsCleanTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  state.vars.forEach((v, idx) => {
    const tr = document.createElement('tr');

    const typeOpts = FIELD_TYPES.map(t => 
      `<option value="${t.val}" ${v.type === t.val ? 'selected' : ''}>${t.label}</option>`
    ).join('');

    const isCalc = v.type === 'calculated';

    tr.innerHTML = `
      <td style="color:var(--text-dim);font-family:var(--font-mono);font-size:0.75rem">${idx + 1}</td>
      <td><span class="tag-name-badge">&lt;${escapeHtml(v.tag)}&gt;</span></td>
      <td>
        <input class="table-input" value="${escapeHtml(v.label)}" oninput="updateVarItem(${idx}, 'label', this.value)" style="min-width:140px">
      </td>
      <td>
        <select class="table-input" onchange="updateVarItem(${idx}, 'type', this.value); renderVariablesCleanTable();" style="min-width:140px">
          ${typeOpts}
        </select>
      </td>
      <td>
        <input class="table-input" value="${escapeHtml(v.formula || '')}" oninput="updateVarItem(${idx}, 'formula', this.value)" 
          placeholder="${isCalc ? 'e.g. Project_Cost - Subsidy' : 'optional formula'}"
          style="min-width:180px;${isCalc ? 'border-color:rgba(16,185,129,0.5);background:rgba(16,185,129,0.06);' : ''}">
      </td>
      <td>
        <button class="btn btn-ghost btn-sm" onclick="removeVarItem(${idx})" title="Remove field">✕</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  const secStep2 = document.getElementById('sectionStep2');
  if (secStep2) secStep2.style.display = 'block';
  const secStep3 = document.getElementById('sectionStep3');
  if (secStep3) secStep3.style.display = 'block';
}

function updateVarItem(index, field, value) {
  if (state.vars[index]) state.vars[index][field] = value;
}

function removeVarItem(index) {
  state.vars.splice(index, 1);
  renderVariablesCleanTable();
  const countSub = document.getElementById('varsCountSub');
  if (countSub) countSub.textContent = `${state.vars.length} fields remaining`;
}

function addCustomVariable() {
  const num = state.vars.length + 1;
  state.vars.push({
    tag: 'Custom_Field_' + num,
    label: 'Custom Field ' + num,
    type: 'text',
    formula: '',
    occurrences: []
  });
  renderVariablesCleanTable();
}

function applyQuickFormula(formulaText) {
  const parts = formulaText.split('=');
  const targetTag = parts[0].trim();
  const expr = parts[1].trim();

  let targetVar = state.vars.find(v => v.tag.toLowerCase() === targetTag.toLowerCase());
  if (targetVar) {
    targetVar.formula = expr;
    targetVar.type = 'calculated';
    renderVariablesCleanTable();
    showAlert(`Applied calculation to &lt;${targetVar.tag}&gt;: = ${expr}`, 'success');
  } else {
    showAlert(`Variable &lt;${targetTag}&gt; not found. Formula copied to clipboard!`, 'info');
    navigator.clipboard.writeText(expr);
  }
}

/* STANDALONE APP COMPILER & GENERATOR */
function getStudioConfig() {
  const titleInput = document.getElementById('cfgAppTitle');
  const compInput = document.getElementById('cfgCompanyName');
  const colorInput = document.getElementById('cfgAccentColor');

  return {
    title: (titleInput && titleInput.value) ? titleInput.value : 'Document Generator',
    company: (compInput && compInput.value) ? compInput.value : 'EffiSol Energy Solutions',
    accentColor: (colorInput && colorInput.value) ? colorInput.value : '#FF9A2E',
    templateType: state.fileType || 'pdf',
    templateName: state.fileName || 'template.pdf'
  };
}

function downloadCompiledApp() {
  if (state.vars.length === 0) {
    alert('Please upload a template or click Demo first!');
    goToStep(1);
    return;
  }

  const cfg = getStudioConfig();
  const html = compileStandaloneHtmlApp(cfg, state.vars, state.fileBase64);

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = cfg.title.replace(/[^a-zA-Z0-9_-]/g, '_') + '_Generator.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);

  showAlert(`🎉 <strong>${a.download}</strong> downloaded! Double-click to open in any browser!`, 'success');
}

function openLiveDemoModal() {
  if (state.vars.length === 0) {
    alert('Please upload a template or click Demo first!');
    goToStep(1);
    return;
  }

  const cfg = getStudioConfig();
  const html = compileStandaloneHtmlApp(cfg, state.vars, state.fileBase64);

  const title = document.getElementById('modalLiveDemoTitle');
  if (title) title.textContent = cfg.title + ' — Live Test Preview';
  const iframe = document.getElementById('liveDemoIframe');
  if (iframe) iframe.srcdoc = html;

  const modal = document.getElementById('modalLiveDemo');
  if (modal) modal.classList.add('open');
}

function closeLiveDemoModal() {
  const modal = document.getElementById('modalLiveDemo');
  if (modal) modal.classList.remove('open');
  const iframe = document.getElementById('liveDemoIframe');
  if (iframe) iframe.srcdoc = '';
}

function compileStandaloneHtmlApp(cfg, vars, templateBase64) {
  const accent = cfg.accentColor;
  const isPdf = cfg.templateType === 'pdf';
  const isDocx = cfg.templateType === 'docx';

  // Build calculation expressions
  let calcJs = '';
  vars.filter(v => v.type === 'calculated' && v.formula).forEach(v => {
    let expr = v.formula;
    vars.forEach(ov => {
      var pat = '\\b' + escapeRegex(ov.tag) + '\\b';
      expr = expr.replace(new RegExp(pat, 'g'), `getFieldValue('${ov.tag}')`);
    });
    expr = expr.replace(/\bround\b/g, 'Math.round');
    calcJs += `
    try {
      const calcVal_${v.tag} = ${expr};
      const el_${v.tag} = document.getElementById('field_${v.tag}');
      if (el_${v.tag}) {
        el_${v.tag}.value = isNaN(calcVal_${v.tag}) ? '' : formatNumber(calcVal_${v.tag});
      }
    } catch(err) {}
`;
  });

  // Build fields HTML
  let fieldsHtml = '';
  vars.forEach(v => {
    const id = 'field_' + v.tag;
    const isCalc = v.type === 'calculated';
    const defVal = v.def ? escapeHtml(v.def) : '';

    let inputEl = '';
    if (isCalc) {
      inputEl = `<input class="form-input calc-input" id="${id}" readonly value="${defVal}">`;
    } else if (v.type === 'inr' || v.type === 'number') {
      inputEl = `<input type="text" class="form-input user-input" id="${id}" value="${defVal}" placeholder="Enter ${escapeHtml(v.label)}">`;
    } else if (v.type === 'date') {
      inputEl = `<input type="date" class="form-input user-input" id="${id}" value="${defVal}">`;
    } else {
      inputEl = `<input type="text" class="form-input user-input" id="${id}" value="${defVal}" placeholder="Enter ${escapeHtml(v.label)}">`;
    }

    const calcNote = (isCalc && v.formula) ? `<div class="calc-formula-tag">= ${escapeHtml(v.formula)}</div>` : '';

    fieldsHtml += `
      <div class="field-group">
        <label class="field-label" for="${id}">${escapeHtml(v.label)}</label>
        ${inputEl}
        ${calcNote}
      </div>
    `;
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(cfg.title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@600;700&family=DM+Mono:wght@500&display=swap" rel="stylesheet">

${isPdf ? '<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js"><\/script>' : ''}
${isDocx ? '<script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"><\/script>' : ''}

<style>
:root {
  --bg: #090C15;
  --surface: #101626;
  --surface2: #162035;
  --surface3: #1C2B47;
  --border: #1E2D4A;
  --border-light: #2A3F66;
  --accent: ${accent};
  --text: #F1F5F9;
  --text-muted: #94A3B8;
  --radius: 14px;
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  background: var(--bg);
  color: var(--text);
  font-family: 'Inter', system-ui, sans-serif;
  min-height: 100vh;
  padding: 30px 20px 80px;
  background-image: radial-gradient(circle at 50% 0%, rgba(255,154,46,0.08) 0%, transparent 60%);
}
.app-box { max-width: 860px; margin: 0 auto; }
.header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 28px;
  flex-wrap: wrap;
  gap: 14px;
}
.brand-title { font-family: 'Space Grotesk', sans-serif; font-size: 1.4rem; font-weight: 700; }
.brand-company { font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }

.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 24px;
  margin-bottom: 20px;
}
.fields-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
@media(max-width: 640px) { .fields-grid { grid-template-columns: 1fr; } }

.field-group { display: flex; flex-direction: column; gap: 6px; }
.field-label { font-size: 0.8rem; font-weight: 600; color: var(--text-muted); }
.form-input {
  background: var(--surface2);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  color: var(--text);
  font-size: 0.9rem;
  padding: 10px 14px;
  outline: none;
  transition: border-color 0.2s;
  width: 100%;
}
.form-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(255,154,46,0.15); }
.form-input.calc-input { background: var(--surface3); border-style: dashed; color: var(--accent); font-weight: 600; }
.calc-formula-tag { font-size: 0.72rem; font-family: 'DM Mono', monospace; color: var(--text-muted); }

.action-bar {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 14px;
}
.btn {
  padding: 13px 28px;
  border-radius: 8px;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}
.btn-primary { background: var(--accent); color: #000; box-shadow: 0 4px 18px rgba(255,154,46,0.25); }
.btn-primary:hover { transform: translateY(-2px); }
.btn-secondary { background: var(--surface2); color: var(--text); border: 1px solid var(--border-light); }
.btn-secondary:hover { background: var(--surface3); }

.status-alert {
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 0.85rem;
  margin-bottom: 16px;
  display: none;
  background: rgba(16,185,129,0.12);
  border: 1px solid rgba(16,185,129,0.3);
  color: #6EE7B7;
}
</style>
</head>
<body>

<div class="app-box">
  <div class="header-bar">
    <div>
      <div class="brand-title">${escapeHtml(cfg.title)}</div>
      <div class="brand-company">${escapeHtml(cfg.company)}</div>
    </div>
    <div style="font-size:0.8rem;color:var(--text-muted)">100% Client-Side Generator</div>
  </div>

  <div id="appStatus" class="status-alert"></div>

  <div class="card">
    <div class="fields-grid">
      ${fieldsHtml}
    </div>
  </div>

  <div class="action-bar">
    <div style="display:flex;gap:12px;flex-wrap:wrap">
      ${isPdf ? '<button class="btn btn-primary" onclick="generatePdf()">📥 Download Official PDF</button>' : ''}
      ${isDocx ? '<button class="btn btn-primary" onclick="generateDocx()">📥 Download Word Document</button>' : ''}
      ${!isPdf && !isDocx ? '<button class="btn btn-primary" onclick="printDoc()">🖨️ Print / Save PDF</button>' : ''}
      <button class="btn btn-secondary" onclick="saveMyDraft()">💾 Save Draft</button>
      <button class="btn btn-secondary" onclick="resetMyForm()">🔄 Reset</button>
    </div>
    <div style="font-size:0.75rem;color:var(--text-muted)">Ready to Print &amp; Send</div>
  </div>
</div>

<script>
const TEMPLATE_B64 = "${templateBase64}";
const TEMPLATE_TYPE = "${cfg.templateType}";
const VARS_LIST = ${JSON.stringify(vars)};

function escapeRegex(s) {
  if (!s) return '';
  var specials = ['.', '*', '+', '?', '^', '$', '{', '}', '(', ')', '|', '[', ']', String.fromCharCode(92)];
  var out = '';
  for (var i = 0; i < s.length; i++) {
    var ch = s.charAt(i);
    if (specials.indexOf(ch) !== -1) out += String.fromCharCode(92);
    out += ch;
  }
  return out;
}

function getFieldValue(tag) {
  const el = document.getElementById('field_' + tag);
  if (!el) return 0;
  const raw = el.value.toString().replace(/,/g, '').replace(/[^0-9.-]/g, '');
  const n = parseFloat(raw);
  return isNaN(n) ? 0 : n;
}

function formatNumber(n) {
  if (isNaN(n)) return '';
  return Math.round(n).toLocaleString('en-IN');
}

function runCalculations() {
  ${calcJs}
}

function collectValues() {
  runCalculations();
  const res = {};
  VARS_LIST.forEach(v => {
    const el = document.getElementById('field_' + v.tag);
    if (el) res[v.tag] = el.value;
  });
  return res;
}

function setAppStatus(msg) {
  const el = document.getElementById('appStatus');
  el.style.display = 'block';
  el.innerHTML = msg;
}

async function generatePdf() {
  setAppStatus('⏳ Generating official vector PDF document...');
  const vals = collectValues();

  try {
    const binary = atob(TEMPLATE_B64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

    const pdfDoc = await PDFLib.PDFDocument.load(bytes);
    const boldFont = await pdfDoc.embedFont(PDFLib.StandardFonts.HelveticaBold);
    const pages = pdfDoc.getPages();

    for (const v of VARS_LIST) {
      const val = vals[v.tag];
      if (val === undefined || val === null || val === '') continue;

      for (const occ of (v.occurrences || [])) {
        if (occ.page >= pages.length) continue;
        const page = pages[occ.page];

        page.drawRectangle({
          x: Math.max(0, occ.x - 2),
          y: Math.max(0, occ.y - 2),
          width: occ.w + 6,
          height: Math.max(occ.h + 4, 16),
          color: PDFLib.rgb(1, 1, 1)
        });

        page.drawText(String(val), {
          x: occ.x,
          y: occ.y,
          size: occ.fontSize || 11,
          font: boldFont,
          color: PDFLib.rgb(0.05, 0.08, 0.15)
        });
      }
    }

    const modified = await pdfDoc.save();
    const customer = (vals['Customer_Name'] || vals['Client'] || 'Proposal').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = 'Proposal_' + customer + '.pdf';

    const blob = new Blob([modified], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1200);

    setAppStatus('✅ <strong>' + filename + '</strong> downloaded successfully!');
  } catch (err) {
    setAppStatus('❌ PDF Error: ' + err.message);
  }
}

async function generateDocx() {
  setAppStatus('⏳ Generating Word document...');
  const vals = collectValues();

  try {
    const binary = atob(TEMPLATE_B64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

    const zip = await JSZip.loadAsync(bytes.buffer);
    for (const fn of Object.keys(zip.files)) {
      if (!fn.endsWith('.xml') && !fn.endsWith('.rels')) continue;
      let xml = await zip.file(fn).async('string');

      xml = xml.replace(/&lt;((?:[^&]|&(?!gt;|lt;))*?)&gt;/g, (m, inner) => {
        const t = inner.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
        return t ? '&lt;' + t + '&gt;' : m;
      });

      Object.entries(vals).forEach(([tag, val]) => {
        const safe = (val !== null && val !== undefined) ? String(val)
          .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;') : '';
        const escaped = escapeRegex(tag).replace(/ +/g, '\\s+');
        xml = xml.replace(new RegExp('&lt;\\s*' + escaped + '\\s*&gt;', 'gi'), safe);
      });

      xml = xml.replace(/&lt;[A-Za-z0-9_ -]{1,60}&gt;/g, '');
      zip.file(fn, xml);
    }

    const outputBlob = await zip.generateAsync({
      type: 'blob',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });

    const filename = 'Document.docx';
    const url = URL.createObjectURL(outputBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1200);

    setAppStatus('✅ Word document downloaded successfully!');
  } catch(err) {
    setAppStatus('❌ DOCX Error: ' + err.message);
  }
}

function printDoc() {
  const vals = collectValues();
  const binary = atob(TEMPLATE_B64);
  let html = '';
  try { html = decodeURIComponent(escape(binary)); } catch(e) { html = binary; }

  Object.entries(vals).forEach(([tag, val]) => {
    const escaped = escapeRegex(tag).replace(/ +/g, '\\s+');
    html = html.replace(new RegExp('<\\s*' + escaped + '\\s*>', 'gi'), val || '');
  });
  html = html.replace(/<[A-Za-z0-9_ -]{1,60}>/g, '');

  const win = window.open('', '_blank');
  if (win) {
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 600);
  }
}

function saveMyDraft() {
  const vals = collectValues();
  localStorage.setItem('docgen_saved_draft', JSON.stringify(vals));
  setAppStatus('💾 Draft saved in browser!');
}

function loadMyDraft() {
  const saved = localStorage.getItem('docgen_saved_draft');
  if (!saved) return;
  try {
    const vals = JSON.parse(saved);
    Object.entries(vals).forEach(([tag, val]) => {
      const el = document.getElementById('field_' + tag);
      if (el) el.value = val;
    });
    runCalculations();
  } catch(e) {}
}

function resetMyForm() {
  if (confirm('Reset form fields?')) {
    VARS_LIST.forEach(v => {
      const el = document.getElementById('field_' + v.tag);
      if (el) el.value = v.def || '';
    });
    runCalculations();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.user-input').forEach(inp => {
    inp.addEventListener('input', runCalculations);
  });
  loadMyDraft();
  runCalculations();
});
<\/script>
</body>
</html>`;
}

function escapeHtml(str) {
  if (!str) return '';
  return str.toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeRegex(s) {
  if (!s) return '';
  var specials = ['.', '*', '+', '?', '^', '$', '{', '}', '(', ')', '|', '[', ']', String.fromCharCode(92)];
  var out = '';
  for (var i = 0; i < s.length; i++) {
    var ch = s.charAt(i);
    if (specials.indexOf(ch) !== -1) out += String.fromCharCode(92);
    out += ch;
  }
  return out;
}
