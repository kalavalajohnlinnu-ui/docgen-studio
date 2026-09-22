
/* ==========================================================
   DOCGEN STUDIO — UNIVERSAL DOCUMENT WEBSITE BUILDER
   100% Independent & Generic for ANY Company & ANY Industry
========================================================== */
const state = {
  file: null,
  fileName: '',
  fileType: 'html',
  fileBase64: '',
  pdfDoc: null,
  currentPage: 1,
  totalPages: 0,
  pageTags: {},
  vars: []
};

const FIELD_TYPES = [
  { val: 'text', label: '📝 Text' },
  { val: 'inr', label: '💰 Currency (₹ / $)' },
  { val: 'number', label: '🔢 Number' },
  { val: 'date', label: '📅 Date' },
  { val: 'calculated', label: '🧮 Auto Calculated' }
];

/* NAVIGATION */
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
        if (typeof sec.scrollIntoView === 'function') {
          sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
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

/* INPUT MODE TABS: UPLOAD vs EDITOR */
function switchInputMode(mode) {
  const tabUpload = document.getElementById('tabModeUpload');
  const tabEditor = document.getElementById('tabModeEditor');
  const paneUpload = document.getElementById('paneModeUpload');
  const paneEditor = document.getElementById('paneModeEditor');

  if (mode === 'upload') {
    if (tabUpload) tabUpload.className = 'input-tab-btn active';
    if (tabEditor) tabEditor.className = 'input-tab-btn';
    if (paneUpload) paneUpload.style.display = 'block';
    if (paneEditor) paneEditor.style.display = 'none';
  } else {
    if (tabUpload) tabUpload.className = 'input-tab-btn';
    if (tabEditor) tabEditor.className = 'input-tab-btn active';
    if (paneUpload) paneUpload.style.display = 'none';
    if (paneEditor) paneEditor.style.display = 'block';
    const codeArea = document.getElementById('htmlTemplateCode');
    if (codeArea && !codeArea.value.trim()) {
      loadBlankStarter();
    }
  }
}

/* BLANK STARTER TEMPLATE (GENERIC FOR ANY COMPANY) */
function loadBlankStarter() {
  const starterHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title><Document_Title> - <Client_Name></title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; margin: 30px; color: #1e293b; line-height: 1.5; }
    .doc-card { max-width: 800px; margin: 0 auto; background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 36px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
    .doc-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #3b82f6; padding-bottom: 18px; margin-bottom: 24px; }
    .doc-title { font-size: 24px; font-weight: 800; color: #1e3a8a; }
    .doc-sub { font-size: 13px; color: #64748b; margin-top: 4px; }
    .doc-meta { text-align: right; font-size: 13px; }
    .client-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 18px; margin-bottom: 24px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px; }
    th, td { padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: left; }
    th { background: #f1f5f9; font-weight: 600; color: #334155; }
    .total-row { font-weight: bold; font-size: 16px; background: #eff6ff; color: #1d4ed8; }
    .doc-footer { margin-top: 30px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; }
    @media print { body { margin: 0; } .doc-card { border: none; box-shadow: none; padding: 20px; } }
  </style>
</head>
<body>
<div class="doc-card">
  <div class="doc-header">
    <div>
      <div class="doc-title"><Company_Name></div>
      <div class="doc-sub"><Document_Title></div>
    </div>
    <div class="doc-meta">
      <div><strong>Date:</strong> <Quote_Date></div>
      <div style="color:#64748b;margin-top:4px"><strong>Ref:</strong> #<Reference_Number></div>
    </div>
  </div>

  <div class="client-box">
    <div><strong>Prepared for:</strong> <Client_Name></div>
    <div style="margin-top:4px;color:#475569"><strong>Contact / Site:</strong> <Client_Contact></div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Item / Service Description</th>
        <th>Quantity</th>
        <th>Rate (₹)</th>
        <th>Amount (₹)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><Item_Description></td>
        <td><Quantity></td>
        <td>₹ <Rate></td>
        <td>₹ <Subtotal></td>
      </tr>
      <tr>
        <td colspan="3" style="text-align:right"><strong>Subtotal:</strong></td>
        <td>₹ <Subtotal></td>
      </tr>
      <tr>
        <td colspan="3" style="text-align:right"><strong>GST / Tax (18%):</strong></td>
        <td>₹ <GST_Amount></td>
      </tr>
      <tr class="total-row">
        <td colspan="3" style="text-align:right"><strong>Total Amount Due:</strong></td>
        <td>₹ <Total_Amount></td>
      </tr>
    </tbody>
  </table>

  <div class="doc-footer">
    * This document is generated automatically. Validity: 30 days from date of issue.
  </div>
</div>
</body>
</html>`;

  const codeArea = document.getElementById('htmlTemplateCode');
  if (codeArea) codeArea.value = starterHtml;

  state.fileBase64 = btoa(unescape(encodeURIComponent(starterHtml)));
  state.fileName = 'Custom_Quotation_Template.html';
  state.fileType = 'html';

  state.vars = [
    { tag: 'Company_Name', label: 'Company / Business Name', type: 'text', def: 'Apex Enterprises', formula: '', occurrences: [] },
    { tag: 'Document_Title', label: 'Document Title', type: 'text', def: 'Commercial Quotation', formula: '', occurrences: [] },
    { tag: 'Quote_Date', label: 'Quotation Date', type: 'date', def: new Date().toISOString().slice(0, 10), formula: '', occurrences: [] },
    { tag: 'Reference_Number', label: 'Quote / Reference #', type: 'text', def: 'QUO-2026-001', formula: '', occurrences: [] },
    { tag: 'Client_Name', label: 'Client / Customer Name', type: 'text', def: 'Acme Global Pvt Ltd', formula: '', occurrences: [] },
    { tag: 'Client_Contact', label: 'Client Contact / Address', type: 'text', def: 'support@acmeglobal.com', formula: '', occurrences: [] },
    { tag: 'Item_Description', label: 'Item / Service Description', type: 'text', def: 'Enterprise Supply & Installation Package', formula: '', occurrences: [] },
    { tag: 'Quantity', label: 'Quantity / Units', type: 'number', def: '10', formula: '', occurrences: [] },
    { tag: 'Rate', label: 'Rate per Unit (₹)', type: 'inr', def: '25000', formula: '', occurrences: [] },
    { tag: 'Subtotal', label: 'Subtotal (₹)', type: 'calculated', def: '250000', formula: 'Quantity * Rate', occurrences: [] },
    { tag: 'GST_Amount', label: 'GST Amount 18% (₹)', type: 'calculated', def: '45000', formula: 'Subtotal * 0.18', occurrences: [] },
    { tag: 'Total_Amount', label: 'Grand Total (₹)', type: 'calculated', def: '295000', formula: 'Subtotal + GST_Amount', occurrences: [] }
  ];

  showAlert('✅ Loaded generic starter template with 12 variables & formulas!', 'success');
  renderVariablesCleanTable();
  goToStep(2);
}

/* FILE UPLOAD LISTENERS */
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
  const card = document.getElementById('fileLoadedCard');
  if (card) card.style.display = 'none';
  const pvArea = document.getElementById('pdfViewerArea');
  if (pvArea) pvArea.style.display = 'none';
  const sec2 = document.getElementById('sectionStep2');
  if (sec2) sec2.style.display = 'none';
  const sec3 = document.getElementById('sectionStep3');
  if (sec3) sec3.style.display = 'none';
  const ab = document.getElementById('statusAlertBox');
  if (ab) ab.style.display = 'none';
  if (filePicker) filePicker.value = '';
}

/* SCANNING LOGIC */
async function runTagScan() {
  const paneEditor = document.getElementById('paneModeEditor');
  const isEditorMode = paneEditor && paneEditor.style.display !== 'none';

  if (isEditorMode) {
    const codeArea = document.getElementById('htmlTemplateCode');
    const text = codeArea ? codeArea.value : '';
    if (!text.trim()) {
      showAlert('⚠️ Please enter or paste HTML code in the box first.', 'warning');
      return;
    }
    state.fileType = 'html';
    state.fileName = 'Custom_Template.html';
    state.fileBase64 = btoa(unescape(encodeURIComponent(text)));
    extractTagsFromText(text);
    return;
  }

  if (!state.fileBase64) {
    showAlert('⚠️ Please select a file to upload first.', 'warning');
    return;
  }

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
    showAlert('⚠️ No &lt;Tags&gt; found in document. You can add variables manually below.', 'warning');
    addCustomVariable();
  } else {
    showAlert(`✅ Found <strong>${state.vars.length} variables</strong> in your document!`, 'success');
  }

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
    box.className = 'tag-box';
    const x = t.x * scale;
    const y = (viewport.height / scale - t.y - t.h) * scale;
    const w = t.w * scale;
    const h = t.h * scale;

    box.style.left = x + 'px';
    box.style.top = y + 'px';
    box.style.width = w + 'px';
    box.style.height = h + 'px';

    box.innerHTML = `<span class="tag-badge-label">&lt;${t.tagName}&gt;</span>`;
    box.title = `Field: <${t.tagName}>`;
    layer.appendChild(box);
  });
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
  if (/cost|price|amount|inr|rs|fee|subsidy|total|tax|rate|subtotal|discount|balance/.test(t)) return 'inr';
  if (/qty|quantity|units|count|area|sqft|hours|days/.test(t)) return 'number';
  if (/date|dob|valid|deadline/.test(t)) return 'date';
  return 'text';
}

function renderVariablesCleanTable() {
  const tbody = document.getElementById('varsCleanTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  state.vars.forEach((v, index) => {
    const tr = document.createElement('tr');

    const typeOptions = FIELD_TYPES.map(ft => 
      `<option value="${ft.val}" ${v.type === ft.val ? 'selected' : ''}>${ft.label}</option>`
    ).join('');

    tr.innerHTML = `
      <td style="color:var(--text-muted);font-size:0.8rem">${index + 1}</td>
      <td>
        <div class="tag-pill-badge">&lt;${escapeHtml(v.tag)}&gt;</div>
      </td>
      <td>
        <input class="table-input" value="${escapeHtml(v.label)}" 
          onchange="updateVarItem(${index}, 'label', this.value)" 
          placeholder="Display label on form">
      </td>
      <td>
        <select class="table-select" onchange="onVarTypeChanged(${index}, this.value)">
          ${typeOptions}
        </select>
      </td>
      <td>
        <input class="table-input ${v.type === 'calculated' ? 'formula' : ''}" 
          id="varFormula_${index}" 
          value="${escapeHtml(v.formula || v.def || '')}" 
          onchange="updateVarItem(${index}, '${v.type === 'calculated' ? 'formula' : 'def'}', this.value)" 
          placeholder="${v.type === 'calculated' ? 'e.g. Quantity * Rate' : 'Default value'}">
      </td>
      <td>
        <button class="delete-icon-btn" onclick="removeVarItem(${index})" title="Remove field">✕</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  const secStep2 = document.getElementById('sectionStep2');
  if (secStep2) secStep2.style.display = 'block';
  const secStep3 = document.getElementById('sectionStep3');
  if (secStep3) secStep3.style.display = 'block';
}

function onVarTypeChanged(index, newType) {
  state.vars[index].type = newType;
  renderVariablesCleanTable();
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
    tag: 'Field_' + num,
    label: 'Field ' + num,
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
    state.vars.push({
      tag: targetTag,
      label: formatFriendlyLabel(targetTag),
      type: 'calculated',
      formula: expr,
      occurrences: []
    });
    renderVariablesCleanTable();
    showAlert(`Added calculated field &lt;${targetTag}&gt; = ${expr}`, 'success');
  }
}

/* THEME & LAYOUT SELECTION OPTIONS */
function selectTheme(themeName) {
  document.getElementById('cfgTheme').value = themeName;
  ['dark-obsidian', 'corporate-light', 'midnight-blue', 'warm-paper', 'cyber-purple'].forEach(t => {
    const card = document.getElementById('themeCard_' + t);
    if (card) card.classList.toggle('selected', t === themeName);
  });
}

function setAccentColor(hex) {
  const picker = document.getElementById('cfgAccentColor');
  if (picker) picker.value = hex;
}

function selectLayout(layoutName) {
  document.getElementById('cfgLayout').value = layoutName;
  ['split', 'form'].forEach(l => {
    const card = document.getElementById('layoutCard_' + l);
    if (card) card.classList.toggle('selected', l === layoutName);
  });
}

/* STANDALONE APP COMPILER & GENERATOR */
function getStudioConfig() {
  const compInput = document.getElementById('cfgCompanyName');
  const titleInput = document.getElementById('cfgAppTitle');
  const subInput = document.getElementById('cfgDocSubtitle');
  const iconInput = document.getElementById('cfgLogoIcon');
  const themeInput = document.getElementById('cfgTheme');
  const colorInput = document.getElementById('cfgAccentColor');
  const layoutInput = document.getElementById('cfgLayout');

  return {
    company: (compInput && compInput.value) ? compInput.value : 'Apex Enterprises',
    title: (titleInput && titleInput.value) ? titleInput.value : 'Quotation & Proposal Portal',
    subtitle: (subInput && subInput.value) ? subInput.value : 'Official Commercial Quotation',
    icon: (iconInput && iconInput.value) ? iconInput.value : '⚡',
    theme: (themeInput && themeInput.value) ? themeInput.value : 'dark-obsidian',
    accentColor: (colorInput && colorInput.value) ? colorInput.value : '#FF9A2E',
    layout: (layoutInput && layoutInput.value) ? layoutInput.value : 'split',
    templateType: state.fileType || 'html',
    templateName: state.fileName || 'template.html'
  };
}

function downloadCompiledApp() {
  if (state.vars.length === 0) {
    alert('Please upload a template or click Blank Starter first!');
    goToStep(1);
    return;
  }

  const cfg = getStudioConfig();
  const html = compileStandaloneHtmlApp(cfg, state.vars, state.fileBase64);

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = cfg.company.replace(/[^a-zA-Z0-9_-]/g, '_') + '_' + cfg.title.replace(/[^a-zA-Z0-9_-]/g, '_') + '.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);

  showAlert(`🎉 <strong>${a.download}</strong> downloaded! Open in any browser!`, 'success');
}

function openLiveDemoModal() {
  if (state.vars.length === 0) {
    alert('Please upload a template or click Blank Starter first!');
    goToStep(1);
    return;
  }

  const cfg = getStudioConfig();
  const html = compileStandaloneHtmlApp(cfg, state.vars, state.fileBase64);

  const title = document.getElementById('modalLiveDemoTitle');
  if (title) title.textContent = `${cfg.company} — ${cfg.title} (Live Preview)`;
  const icon = document.getElementById('modalLiveDemoIcon');
  if (icon) icon.textContent = cfg.icon;

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
  const isHtml = cfg.templateType === 'html';
  const isSplit = cfg.layout === 'split';

  // Theme variable definitions
  let themeCssVars = '';
  if (cfg.theme === 'corporate-light') {
    themeCssVars = `
      --bg: #F8FAFC;
      --surface: #FFFFFF;
      --surface2: #F1F5F9;
      --surface3: #E2E8F0;
      --border: #CBD5E1;
      --border-light: #E2E8F0;
      --text: #0F172A;
      --text-muted: #64748B;
      --card-shadow: 0 4px 20px rgba(0,0,0,0.06);
    `;
  } else if (cfg.theme === 'midnight-blue') {
    themeCssVars = `
      --bg: #0B1329;
      --surface: #111C3D;
      --surface2: #162447;
      --surface3: #1F305E;
      --border: #1E3A8A;
      --border-light: #2563EB;
      --text: #F0F9FF;
      --text-muted: #7DD3FC;
      --card-shadow: 0 8px 30px rgba(11,19,41,0.8);
    `;
  } else if (cfg.theme === 'warm-paper') {
    themeCssVars = `
      --bg: #FDFBF7;
      --surface: #FFFFFF;
      --surface2: #F7F4EB;
      --surface3: #EDE8D8;
      --border: #D8D2C2;
      --border-light: #E5E0D4;
      --text: #292524;
      --text-muted: #78716C;
      --card-shadow: 0 4px 16px rgba(41,37,36,0.06);
    `;
  } else if (cfg.theme === 'cyber-purple') {
    themeCssVars = `
      --bg: #0F0C20;
      --surface: #171330;
      --surface2: #1F1A40;
      --surface3: #2A2454;
      --border: #3B2D6E;
      --border-light: #581C87;
      --text: #FAF5FF;
      --text-muted: #C084FC;
      --card-shadow: 0 8px 30px rgba(15,12,32,0.8);
    `;
  } else {
    // dark-obsidian default
    themeCssVars = `
      --bg: #090C15;
      --surface: #101626;
      --surface2: #162035;
      --surface3: #1C2B47;
      --border: #1E2D4A;
      --border-light: #2A3F66;
      --text: #F1F5F9;
      --text-muted: #94A3B8;
      --card-shadow: 0 8px 30px rgba(0,0,0,0.6);
    `;
  }

  // Build calculation expressions
  let calcJs = '';
  vars.filter(v => v.type === 'calculated' && v.formula).forEach(v => {
    let expr = v.formula;
    vars.forEach(ov => {
      var pat = '\\b' + escapeRegex(ov.tag) + '\\b';
      expr = expr.replace(new RegExp(pat, 'g'), `getFieldValue('${ov.tag}')`);
    });
    expr = expr.replace(/\\bround\\b/g, 'Math.round');
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
      inputEl = `<input type="text" class="form-input user-input" id="${id}" value="${defVal}" placeholder="Enter ${escapeHtml(v.label)}" oninput="onFieldValueChanged()">`;
    } else if (v.type === 'date') {
      inputEl = `<input type="date" class="form-input user-input" id="${id}" value="${defVal}" oninput="onFieldValueChanged()">`;
    } else {
      inputEl = `<input type="text" class="form-input user-input" id="${id}" value="${defVal}" placeholder="Enter ${escapeHtml(v.label)}" oninput="onFieldValueChanged()">`;
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
<title>${escapeHtml(cfg.company)} — ${escapeHtml(cfg.title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@600;700&family=DM+Mono:wght@500&display=swap" rel="stylesheet">

${isPdf ? '<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js">' + '</' + 'script>' : ''}
${isDocx ? '<script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js">' + '</' + 'script>' : ''}

<style>
:root {
  ${themeCssVars}
  --accent: ${accent};
  --radius: 12px;
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  background: var(--bg);
  color: var(--text);
  font-family: 'Inter', system-ui, sans-serif;
  min-height: 100vh;
  padding: 24px 20px 80px;
}
.app-container {
  max-width: ${isSplit ? '1380px' : '880px'};
  margin: 0 auto;
}
.header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 14px;
}
.brand-title { font-family: 'Space Grotesk', sans-serif; font-size: 1.35rem; font-weight: 700; }
.brand-company { font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-top: 2px; }

.main-layout {
  display: ${isSplit ? 'grid' : 'block'};
  grid-template-columns: ${isSplit ? '460px 1fr' : '1fr'};
  gap: 24px;
  align-items: start;
}
@media(max-width: 960px) {
  .main-layout { grid-template-columns: 1fr; }
}

.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 22px;
  margin-bottom: 20px;
  box-shadow: var(--card-shadow);
}
.fields-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
@media(max-width: 540px) { .fields-grid { grid-template-columns: 1fr; } }

.field-group { display: flex; flex-direction: column; gap: 5px; }
.field-label { font-size: 0.78rem; font-weight: 600; color: var(--text-muted); }
.form-input {
  background: var(--surface2);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  color: var(--text);
  font-size: 0.88rem;
  padding: 9px 12px;
  outline: none;
  transition: border-color 0.2s;
  width: 100%;
}
.form-input:focus { border-color: var(--accent); }
.form-input.calc-input { background: var(--surface3); border-style: dashed; color: var(--accent); font-weight: 600; }
.calc-formula-tag { font-size: 0.7rem; font-family: 'DM Mono', monospace; color: var(--text-muted); }

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 22px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}
.btn-primary { background: var(--accent); color: #000; }
.btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
.btn-secondary { background: var(--surface2); border: 1px solid var(--border); color: var(--text); }
.btn-secondary:hover { background: var(--surface3); }

.doc-live-view {
  background: #fff;
  color: #0f172a;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  box-shadow: var(--card-shadow);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.doc-live-header {
  background: var(--surface2);
  border-bottom: 1px solid var(--border);
  padding: 12px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.doc-live-iframe {
  width: 100%;
  height: 650px;
  border: none;
  background: #fff;
}
.status-alert {
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 0.85rem;
  margin-top: 14px;
  display: none;
  background: rgba(16,185,129,0.15);
  border: 1px solid rgba(16,185,129,0.3);
  color: #10B981;
}
</style>
</head>
<body>

<div class="app-container">
  <div class="header-bar">
    <div style="display:flex;align-items:center;gap:12px">
      <div style="width:42px;height:42px;border-radius:10px;background:var(--accent);color:#000;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:bold">
        ${escapeHtml(cfg.icon)}
      </div>
      <div>
        <div class="brand-title">${escapeHtml(cfg.company)}</div>
        <div class="brand-company">${escapeHtml(cfg.title)} · ${escapeHtml(cfg.subtitle)}</div>
      </div>
    </div>
    <div style="display:flex;gap:10px">
      ${isSplit ? '<button class="btn btn-primary" onclick="printLiveDocument()">🖨️ Print / Save Document</button>' : ''}
    </div>
  </div>

  <div class="main-layout">
    <!-- Form Side -->
    <div>
      <div class="card">
        <h3 style="font-family:'Space Grotesk',sans-serif;font-size:1.05rem;margin-bottom:16px;color:var(--text)">
          📝 Enter Quotation Details
        </h3>
        <div class="fields-grid">
          ${fieldsHtml}
        </div>
      </div>

      <div class="card" style="text-align:center">
        <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
          ${isPdf ? '<button class="btn btn-primary" onclick="generatePdf()">📄 Generate &amp; Download PDF</button>' : ''}
          ${isDocx ? '<button class="btn btn-primary" onclick="generateDocx()">📝 Download Word (.docx)</button>' : ''}
          ${isHtml ? '<button class="btn btn-primary" onclick="printLiveDocument()">🖨️ Print / Save as PDF</button>' : ''}
        </div>
        <div id="appStatus" class="status-alert"></div>
      </div>
    </div>

    <!-- Live Document Side (for Split Layout) -->
    ${isSplit ? `
    <div class="doc-live-view">
      <div class="doc-live-header">
        <span style="font-size:0.8rem;font-weight:600;color:var(--text-muted)">📄 Live Quotation Document Preview</span>
        <button class="btn btn-secondary" style="padding:6px 14px;font-size:0.8rem" onclick="printLiveDocument()">🖨️ Print / Save PDF</button>
      </div>
      <iframe class="doc-live-iframe" id="docPreviewIframe"></iframe>
    </div>
    ` : ''}
  </div>
</div>

<script>
const VARS_LIST = ${JSON.stringify(vars)};
const TEMPLATE_B64 = "${templateBase64}";
const TEMPLATE_TYPE = "${cfg.templateType}";

function escapeHtml(s) {
  if (!s) return '';
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function getFieldValue(tag) {
  const el = document.getElementById('field_' + tag);
  if (!el) return 0;
  const v = el.value.replace(/[^0-9.-]/g, '');
  const n = parseFloat(v);
  return isNaN(n) ? 0 : n;
}

function formatNumber(n) {
  if (isNaN(n)) return '0';
  return Number(n).toLocaleString('en-IN');
}

function runCalculations() {
  ${calcJs}
}

function collectValues() {
  const vals = {};
  VARS_LIST.forEach(v => {
    const el = document.getElementById('field_' + v.tag);
    vals[v.tag] = el ? el.value : (v.def || '');
  });
  return vals;
}

function onFieldValueChanged() {
  runCalculations();
  updateLiveDocumentPreview();
}

function updateLiveDocumentPreview() {
  const iframe = document.getElementById('docPreviewIframe');
  if (!iframe) return;

  const vals = collectValues();
  if (TEMPLATE_TYPE === 'html') {
    let rawHtml = '';
    try {
      rawHtml = decodeURIComponent(escape(atob(TEMPLATE_B64)));
    } catch(e) {
      rawHtml = atob(TEMPLATE_B64);
    }
    Object.entries(vals).forEach(([tag, val]) => {
      const reg = new RegExp('<\\s*' + tag + '(\\s*=[^>]*)?\\s*>', 'gi');
      rawHtml = rawHtml.replace(reg, escapeHtml(val));
    });
    iframe.srcdoc = rawHtml;
  }
}

function printLiveDocument() {
  const iframe = document.getElementById('docPreviewIframe');
  if (iframe && iframe.contentWindow) {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
  } else {
    const vals = collectValues();
    let rawHtml = '';
    try { rawHtml = decodeURIComponent(escape(atob(TEMPLATE_B64))); } catch(e) { rawHtml = atob(TEMPLATE_B64); }
    Object.entries(vals).forEach(([tag, val]) => {
      const reg = new RegExp('<\\s*' + tag + '(\\s*=[^>]*)?\\s*>', 'gi');
      rawHtml = rawHtml.replace(reg, escapeHtml(val));
    });
    const win = window.open('', '_blank');
    win.document.write(rawHtml);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 500);
  }
}

function setAppStatus(msg) {
  const el = document.getElementById('appStatus');
  if (!el) return;
  el.style.display = 'block';
  el.innerHTML = msg;
}

${isPdf ? `
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
    const customer = (vals['Customer_Name'] || vals['Client_Name'] || vals['Client'] || 'Document').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = '${escapeHtml(cfg.company.replace(/[^a-zA-Z0-9_-]/g, '_'))}_' + customer + '.pdf';

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
` : ''}

${isDocx ? `
async function generateDocx() {
  setAppStatus('⏳ Generating Word document...');
  const vals = collectValues();

  try {
    const binary = atob(TEMPLATE_B64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

    const zip = await JSZip.loadAsync(bytes);
    for (const filename of Object.keys(zip.files)) {
      if (filename.endsWith('.xml')) {
        let xml = await zip.file(filename).async('string');
        Object.entries(vals).forEach(([tag, val]) => {
          const reg = new RegExp('&lt;\\s*' + tag + '(\\s*=[^&]*)?\\s*&gt;', 'gi');
          xml = xml.replace(reg, escapeHtml(val));
        });
        zip.file(filename, xml);
      }
    }

    const modified = await zip.generateAsync({ type: 'blob' });
    const customer = (vals['Customer_Name'] || vals['Client_Name'] || vals['Client'] || 'Document').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = '${escapeHtml(cfg.company.replace(/[^a-zA-Z0-9_-]/g, '_'))}_' + customer + '.docx';

    const url = URL.createObjectURL(modified);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1200);

    setAppStatus('✅ <strong>' + filename + '</strong> downloaded successfully!');
  } catch (err) {
    setAppStatus('❌ DOCX Error: ' + err.message);
  }
}
` : ''}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
  runCalculations();
  updateLiveDocumentPreview();
});
${'</' + 'script>'}
</body>
</html>`;
}

function escapeHtml(s) {
  if (!s) return '';
  return String(s)
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
