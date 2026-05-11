const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const XLSX = require('xlsx');

// ─────────────────────────────────────────────
//  DESIGN TOKENS
// ─────────────────────────────────────────────
const CONFIG = {
  // Card dimensions (px) — equal for ALL hierarchy types
  CARD_W: 210,
  CARD_H: 80,
  HGAP:   28,   // horizontal gap between sibling cards
  VGAP:   72,   // vertical gap between levels

  // Hierarchy visual tokens
  HIERARCHY: {
    'decision maker': {
      strip:    '#10b981',
      badge_bg: '#ecfdf5',
      badge_txt:'#065f46',
      dot:      '#10b981',
      label:    'Decision Maker',
    },
    'influencer': {
      strip:    '#f59e0b',
      badge_bg: '#fffbeb',
      badge_txt:'#92400e',
      dot:      '#f59e0b',
      label:    'Influencer',
    },
    'direct reportee': {
      strip:    '#6366f1',
      badge_bg: '#eef2ff',
      badge_txt:'#3730a3',
      dot:      '#6366f1',
      label:    'Direct Reportee',
    },
  },

  // Avatar gradient pairs  [from, to]
  AVATAR_GRADIENTS: [
    ['#4f46e5','#818cf8'], ['#0891b2','#22d3ee'], ['#be185d','#f472b6'],
    ['#7c3aed','#a78bfa'], ['#0d9488','#2dd4bf'], ['#c2410c','#fb923c'],
    ['#1d4ed8','#60a5fa'], ['#15803d','#4ade80'],
  ],

  COLOR_CONNECTOR: '#94a3b8',
  COLOR_BG:        '#f1f5f9',
  COLOR_CARD_BG:   '#ffffff',
  FONT_FAMILY:     "'Segoe UI', system-ui, -apple-system, sans-serif",

  // Legacy compat kept for PNG/puppeteer path
  MIN_CANVAS_WIDTH:  900,
  MIN_CANVAS_HEIGHT: 500,
};

// ─────────────────────────────────────────────
//  UTILITY HELPERS
// ─────────────────────────────────────────────
function nameHash(str) {
  let h = 0;
  for (const c of String(str)) h = (h * 31 + c.charCodeAt(0)) & 0xfffffff;
  return h;
}

function initials(name) {
  return String(name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function avatarGradient(name) {
  const [a, b] = CONFIG.AVATAR_GRADIENTS[nameHash(name) % CONFIG.AVATAR_GRADIENTS.length];
  return `linear-gradient(135deg,${a},${b})`;
}

function hierarchyConfig(raw) {
  const key = String(raw || '').toLowerCase().trim();
  return CONFIG.HIERARCHY[key] || {
    strip:    '#94a3b8',
    badge_bg: '#f8fafc',
    badge_txt:'#475569',
    dot:      '#94a3b8',
    label:    raw || 'Other',
  };
}

function sanitizeFilename(name) {
  name = String(name);
  name = name.replace(/[^\w\s-]/g, '').trim();
  name = name.replace(/[-\s]+/g, '_');
  return name || 'untitled_chart';
}

// ─────────────────────────────────────────────
//  CSV / FILE READERS
// ─────────────────────────────────────────────
function readCSVFile(csvFilePath) {
  return new Promise((resolve, reject) => {
    const data = [];
    if (!fs.existsSync(csvFilePath)) {
      reject(new Error(`CSV file not found: ${csvFilePath}`));
      return;
    }
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', row => data.push(row))
      .on('end', () => resolve(data))
      .on('error', err => reject(err));
  });
}

async function readJSONFile(jsonFilePath) {
  const raw = fs.readFileSync(jsonFilePath, 'utf-8');
  const companies = JSON.parse(raw);
  const rows = [];
  for (const company of companies) {
    for (const emp of (company.employees || [])) {
      rows.push({
        'Unique ID':    emp.uniqueId    || '',
        'Company Name': company.companyName || '',
        'Name':         emp.name        || '',
        'Role':         emp.designation || emp.fullRole || '',
        'Reports To':   emp.reportsTo   || '',
        'hierarchy':    emp.hierarchy   || 'Other',
        'Category':     emp.category    || '',
        'Linkedin':     emp.linkedin    || '',
        'email':        emp.email       || '',
        'Mobile DID':   emp.mobileDID   || '',
        'Location':     company.location || '',
      });
    }
  }
  return rows;
}

// ─────────────────────────────────────────────
//  TREE BUILDER
// ─────────────────────────────────────────────
function buildTreeFromData(data) {
  const employees = {};
  const allNames = new Set(data.map(r => String(r.Name || '').trim()).filter(Boolean));

  for (const row of data) {
    const name      = String(row.Name || 'Unnamed').trim();
    const reportsTo = String(row['Reports To'] || '').trim();
    const manager   = reportsTo && reportsTo !== '-' && allNames.has(reportsTo) ? reportsTo : null;

    employees[name] = {
      name,
      role:       String(row.Role || row['Short Role'] || 'N/A'),
      shortRole:  String(row['Short Role'] || row.Role || 'N/A'),
      fullRole:   String(row['Full role'] || row.Role || 'N/A'),
      reports_to: manager,
      hierarchy:  String(row.hierarchy || 'Other').trim(),
      children:   [],
      uniqueId:   row['Unique ID']    || '',
      companyName:row['Company Name'] || '',
      linkedin:   row['Linkedin']     || '',
      email:      row['email']        || '',
      category:   row['Category']     || '',
    };
  }

  const managed = new Set();
  for (const emp of Object.values(employees)) {
    if (emp.reports_to && emp.reports_to in employees) {
      employees[emp.reports_to].children.push(emp.name);
      managed.add(emp.name);
    }
  }

  let roots = Object.keys(employees).filter(n => !managed.has(n));
  if (!roots.length && Object.keys(employees).length) roots = [Object.keys(employees)[0]];

  const edges = [];
  for (const emp of Object.values(employees)) {
    for (const child of emp.children) edges.push([emp.name, child]);
  }

  return { employees, roots, edges };
}

// ─────────────────────────────────────────────
//  PIXEL-BASED TREE LAYOUT
// ─────────────────────────────────────────────
function subtreeWidth(name, cm, memo = {}) {
  if (name in memo) return memo[name];
  const kids = cm[name] || [];
  if (!kids.length) { memo[name] = CONFIG.CARD_W; return CONFIG.CARD_W; }
  const w = kids.reduce((s, c) => s + subtreeWidth(c, cm, memo), 0) + (kids.length - 1) * CONFIG.HGAP;
  memo[name] = Math.max(CONFIG.CARD_W, w);
  return memo[name];
}

function placeNodes(name, slotX, level, cm, memo, pos) {
  const w  = memo[name];
  const cx = slotX + w / 2;
  pos[name] = {
    x:  cx - CONFIG.CARD_W / 2,
    y:  level * (CONFIG.CARD_H + CONFIG.VGAP),
    cx, cy: level * (CONFIG.CARD_H + CONFIG.VGAP) + CONFIG.CARD_H / 2,
  };
  const kids = cm[name] || [];
  if (!kids.length) return;
  const kw = kids.reduce((s, c) => s + memo[c], 0) + (kids.length - 1) * CONFIG.HGAP;
  let kx = cx - kw / 2;
  kids.forEach(c => { placeNodes(c, kx, level + 1, cm, memo, pos); kx += memo[c] + CONFIG.HGAP; });
}

function computeLayout(employees, roots) {
  const cm = {};
  Object.values(employees).forEach(e => { cm[e.name] = e.children; });

  const memo = {};
  roots.forEach(r => subtreeWidth(r, cm, memo));

  const totalRootsW = roots.reduce((s, r) => s + memo[r], 0) + (roots.length - 1) * CONFIG.HGAP;
  // Start from x=0 (no left padding) — centering is done at runtime via JS
  const pos = {};
  let rx = 0;
  roots.forEach(r => { placeNodes(r, rx, 0, cm, memo, pos); rx += memo[r] + CONFIG.HGAP; });

  let maxY = 0;
  Object.values(pos).forEach(p => { maxY = Math.max(maxY, p.y + CONFIG.CARD_H); });

  // treeWidth = actual pixel span of the tree (no padding)
  const treeWidth = totalRootsW;
  return { pos, treeWidth, totalW: treeWidth, totalH: maxY + 40 };
}

// ─────────────────────────────────────────────
//  SVG CONNECTORS
// ─────────────────────────────────────────────
function buildConnectorsSVG(employees, pos, totalW, totalH) {
  const lines = [];
  Object.values(employees).forEach(emp => {
    const rt = emp.reports_to;
    if (!rt || !pos[emp.name] || !pos[rt]) return;
    const p  = pos[rt];
    const c  = pos[emp.name];
    const x1 = p.cx, y1 = p.y + CONFIG.CARD_H;
    const x2 = c.cx, y2 = c.y;
    const my = y1 + (y2 - y1) / 2;

    lines.push(`<path d="M${x1},${y1} L${x1},${my} L${x2},${my} L${x2},${y2}"
      fill="none" stroke="${CONFIG.COLOR_CONNECTOR}" stroke-width="1.5"/>`);
    lines.push(`<circle cx="${x2}" cy="${my}" r="3" fill="${CONFIG.COLOR_CONNECTOR}"/>`);
  });

  return `<svg class="og-svg" width="100%" height="${totalH}"
    xmlns="http://www.w3.org/2000/svg" style="position:absolute;top:0;left:0;pointer-events:none;overflow:visible">
    ${lines.join('\n    ')}
  </svg>`;
}

// ─────────────────────────────────────────────
//  CARD HTML
// ─────────────────────────────────────────────
function buildCardHTML(emp, pos) {
  const p   = pos[emp.name];
  if (!p) return '';
  const hc  = hierarchyConfig(emp.hierarchy);
  const av  = avatarGradient(emp.name);
  const ini = initials(emp.name);
  const shortRole = emp.shortRole || emp.role;

  // Escape for HTML attribute
  const dataStr = JSON.stringify({
    name:       emp.name,
    fullRole:   emp.fullRole,
    shortRole:  emp.shortRole,
    email:      emp.email,
    linkedin:   emp.linkedin,
    category:   emp.category,
    hierarchy:  emp.hierarchy,
    reportsTo:  emp.reports_to || '',
    companyName:emp.companyName,
  }).replace(/"/g, '&quot;');

  return `
  <div class="og-card" data-name="${emp.name.replace(/"/g,'&quot;')}"
       data-hierarchy="${emp.hierarchy.toLowerCase()}" data-emp='${dataStr}'
       style="left:${p.x}px;top:${p.y}px;width:${CONFIG.CARD_W}px;height:${CONFIG.CARD_H}px">
    <div class="og-inner">
      <div class="og-strip" style="background:${hc.strip}"></div>
      <div class="og-body">
        <div class="og-av" style="background:${av}">${ini}</div>
        <div class="og-info">
          <div class="og-badge" style="background:${hc.badge_bg};color:${hc.badge_txt}">
            <span class="og-bdot" style="background:${hc.dot}"></span>${hc.label}
          </div>
          <div class="og-name" title="${emp.name}">${emp.name}</div>
          <div class="og-role" title="${shortRole}">${shortRole}</div>
        </div>
      </div>
    </div>
  </div>`;
}

// ─────────────────────────────────────────────
//  MAIN HTML GENERATOR  (replaces old Plotly version)
// ─────────────────────────────────────────────
function generateOrgChartHTML(data, companyName = 'Organization', location = '') {
  // Normalise hierarchy field
  data.forEach(r => { r.hierarchy = r.hierarchy || 'Other'; });

  const { employees, roots } = buildTreeFromData(data);
  const { pos, treeWidth, totalW, totalH } = computeLayout(employees, roots);

  const connectorsSVG = buildConnectorsSVG(employees, pos, totalW, totalH);
  const cardHTMLs     = Object.values(employees).map(e => buildCardHTML(e, pos)).join('');

  const title = String(companyName);

  // Serialise employee map for detail panel
  const empMapJSON = JSON.stringify(
    Object.fromEntries(Object.entries(employees).map(([k, v]) => [k, {
      name: v.name, fullRole: v.fullRole, shortRole: v.shortRole,
      email: v.email, linkedin: v.linkedin, category: v.category,
      hierarchy: v.hierarchy, reportsTo: v.reports_to || '', companyName: v.companyName,
      directReports: v.children,
    }]))
  );

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} – Org Chart</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:${CONFIG.FONT_FAMILY};background:${CONFIG.COLOR_BG};min-height:100vh;color:#0f172a}

/* ── Header ── */
.og-header{padding:18px 24px 0}
.og-brand{display:flex;align-items:center;gap:10px}
.og-icon{width:38px;height:38px;border-radius:8px;
  background:linear-gradient(135deg,#10b981,#059669);
  display:flex;align-items:center;justify-content:center;
  color:#fff;font-size:15px;font-weight:700;letter-spacing:-.5px;flex-shrink:0}
.og-title{font-size:18px;font-weight:700;color:#0f172a;letter-spacing:-.3px}

/* ── Chart area ── */
.og-scroll{overflow-x:auto;overflow-y:visible;padding:16px 0 20px;width:100%}
.og-chart-wrap{width:100%;padding:0 24px}
.og-chart{position:relative;width:100%}

/* ── Cards ── */
.og-card{position:absolute;cursor:pointer;transition:transform .16s,opacity .16s}
.og-card:hover .og-inner{box-shadow:0 6px 22px rgba(15,23,42,.13);transform:translateY(-2px)}
.og-card.selected .og-inner{outline:2.5px solid var(--strip-color,#10b981);outline-offset:2px}
.og-card.dimmed{opacity:.25;filter:grayscale(.4)}
.og-card.highlighted .og-inner{
  outline:2.5px solid #f59e0b;outline-offset:2px;
  box-shadow:0 0 0 4px rgba(245,158,11,.18),0 4px 16px rgba(245,158,11,.22);
  transform:translateY(-2px)
}
.og-card.highlighted .og-strip{visibility:hidden}
.og-inner{background:${CONFIG.COLOR_CARD_BG};border-radius:10px;display:flex;overflow:hidden;
  height:100%;box-shadow:0 1px 4px rgba(15,23,42,.07),0 1px 2px rgba(15,23,42,.04);
  transition:box-shadow .16s,transform .16s;border:1px solid #eef0f3}
.og-strip{width:5px;flex-shrink:0}
.og-body{display:flex;align-items:center;gap:10px;padding:10px 12px;flex:1;min-width:0}
.og-av{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;
  justify-content:center;font-size:12px;font-weight:700;color:#fff;flex-shrink:0;letter-spacing:.3px}
.og-info{flex:1;min-width:0}
.og-badge{display:inline-flex;align-items:center;gap:4px;padding:2px 6px;border-radius:4px;
  font-size:9px;font-weight:700;letter-spacing:.3px;text-transform:uppercase;margin-bottom:4px}
.og-bdot{width:5px;height:5px;border-radius:50%;flex-shrink:0}
.og-name{font-size:12.5px;font-weight:600;color:#0f172a;white-space:nowrap;
  overflow:hidden;text-overflow:ellipsis;line-height:1.3}
.og-role{font-size:11px;color:#64748b;white-space:nowrap;
  overflow:hidden;text-overflow:ellipsis;line-height:1.3;margin-top:1px}

/* ── SVG connectors ── */
.og-svg{position:absolute;top:0;left:0;pointer-events:none;overflow:visible}
</style>
</head>
<body>

<div class="og-header">
  <div class="og-brand">
    <div class="og-icon" id="og-icon">?</div>
    <div class="og-title" id="og-title">${title}</div>
  </div>
</div>

<div class="og-scroll">
  <div class="og-chart-wrap">
    <div class="og-chart" id="og-chart" style="height:${totalH}px">
      ${connectorsSVG}
      ${cardHTMLs}
    </div>
  </div>
</div>

<script>
(function(){
  const EMP = ${empMapJSON};
  const HIER_COLORS = {
    'decision maker': { strip:'#10b981', badge_bg:'#ecfdf5', badge_txt:'#065f46', dot:'#10b981', label:'Decision Maker' },
    'influencer':     { strip:'#f59e0b', badge_bg:'#fffbeb', badge_txt:'#92400e', dot:'#f59e0b', label:'Influencer' },
    'direct reportee':{ strip:'#6366f1', badge_bg:'#eef2ff', badge_txt:'#3730a3', dot:'#6366f1', label:'Direct Reportee' },
  };
  function hc(raw){return HIER_COLORS[String(raw||'').toLowerCase().trim()]||{strip:'#94a3b8',badge_bg:'#f8fafc',badge_txt:'#475569',dot:'#94a3b8',label:raw||'Other'};}

  // ── Card icon ──
  const coName = Object.values(EMP)[0]?.companyName || '?';
  document.getElementById('og-icon').textContent = (coName[0]||'?').toUpperCase();

  document.querySelectorAll('.og-card').forEach((card,i) => {
    card.style.opacity='0'; card.style.transform='translateY(8px)';
    setTimeout(()=>{ card.style.transition='opacity .25s ease,transform .25s ease';
      card.style.opacity='1'; card.style.transform='none'; }, i*30);
  });

  // ── Public API (iframe postMessage compatible) ──
  window.OrgChartAPI = {
    getAllEmployees: () => EMP,
    getEmployee: name => EMP[name]||null,
    getEmployeesByHierarchy: h => Object.values(EMP).filter(e=>e.hierarchy===h),
    getEmployeesByCategory: cat => Object.values(EMP).filter(e=>(e.category||'').includes(cat)),
    getDirectReports: manager => Object.values(EMP).filter(e=>e.reportsTo===manager),
    highlightCategory: cat => {
      const isAll = !cat || cat.toLowerCase() === 'all';
      document.querySelectorAll('.og-card').forEach(card => {
        const e = EMP[card.dataset.name];
        if (isAll) {
          card.classList.remove('dimmed', 'highlighted');
          return;
        }
        const empCats = (e?.category || '').split(',').map(c => c.trim().toLowerCase());
        const match = empCats.includes(cat.trim().toLowerCase());
        card.classList.toggle('highlighted', match);
        card.classList.toggle('dimmed', !match);
      });
    },
    getStatistics: () => {
      const emps = Object.values(EMP);
      const roles={}, categories={}, hierarchies={};
      emps.forEach(e=>{
        roles[e.fullRole]=(roles[e.fullRole]||0)+1;
        hierarchies[e.hierarchy]=(hierarchies[e.hierarchy]||0)+1;
        (e.category||'').split(',').forEach(c=>{const t=c.trim();if(t)categories[t]=(categories[t]||0)+1;});
      });
      return {totalEmployees:emps.length,roles,categories,hierarchies};
    },
    exportAsJSON: () => JSON.stringify(EMP,null,2),
  };

  window.addEventListener('message', ev => {
    if (!ev.data) return;
    if (ev.data.type==='highlightCategory') window.OrgChartAPI.highlightCategory(ev.data.category);
    if (ev.data.type==='setZoom') {
      const z = ev.data.zoomLevel/100;
      const chart = document.getElementById('og-chart');
      chart.style.transformOrigin = 'top center';
      chart.style.transform = 'scale('+z+')';
      // Re-center after zoom changes effective width
      setTimeout(centerTree, 50);
    }
  });

  // ── Center tree horizontally at runtime ──
  const TREE_W = ${treeWidth};
  function centerTree() {
    const chart = document.getElementById('og-chart');
    if (!chart) return;
    const containerW = chart.offsetWidth;
    const offset = Math.max(0, (containerW - TREE_W) / 2);
    // Shift all cards
    document.querySelectorAll('.og-card').forEach(card => {
      const origLeft = parseFloat(card.dataset.origLeft);
      card.style.left = (origLeft + offset) + 'px';
    });
    // Shift SVG contents via a group transform
    const svg = chart.querySelector('.og-svg');
    if (svg) {
      let g = svg.querySelector('g.og-shift');
      if (!g) {
        g = document.createElementNS('http://www.w3.org/2000/svg','g');
        g.classList.add('og-shift');
        while (svg.firstChild) g.appendChild(svg.firstChild);
        svg.appendChild(g);
      }
      g.setAttribute('transform', 'translate('+offset+',0)');
    }
  }

  // Store original left values before any centering
  document.querySelectorAll('.og-card').forEach(card => {
    card.dataset.origLeft = parseFloat(card.style.left) || 0;
  });

  window.addEventListener('load', centerTree);
  window.addEventListener('resize', centerTree);
})();
</script>
</body>
</html>`;
}

// ─────────────────────────────────────────────
//  PNG EXPORT  (puppeteer — unchanged contract)
// ─────────────────────────────────────────────
async function generateOrgChartPNG(data, companyName = 'Organization', location = '', outputPath = '') {
  let puppeteer;
  try { puppeteer = require('puppeteer'); } catch { return false; }

  const { employees } = buildTreeFromData(data);
  const { totalW, totalH } = computeLayout(employees, Object.keys(employees).filter(n =>
    !Object.values(employees).some(e => e.children.includes(n))));
  const w = Math.max(totalW + 48, CONFIG.MIN_CANVAS_WIDTH);
  const h = Math.max(totalH + 80, CONFIG.MIN_CANVAS_HEIGHT);

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    });
    const page = await browser.newPage();
    await page.setViewport({ width: w, height: h });
    await page.setContent(generateOrgChartHTML(data, companyName, location), { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: outputPath, fullPage: false });
    await browser.close();
    return true;
  } catch (err) {
    if (browser) await browser.close();
    return false;
  }
}

// ─────────────────────────────────────────────
//  COMPANY-LEVEL HELPERS
// ─────────────────────────────────────────────

/**
 * Generate org chart HTML from a BuyingGroup MongoDB document.
 * @param {object} buyingGroupDoc - Mongoose BuyingGroup document (plain object or Mongoose doc)
 * @returns {string} HTML string
 */
function generateOrgChartFromDoc(buyingGroupDoc) {
  const doc = buyingGroupDoc.toObject ? buyingGroupDoc.toObject() : buyingGroupDoc;
  const rows = (doc.employees || []).map(emp => ({
    'Unique ID':    emp.uniqueId    || '',
    'Company Name': doc.companyName || '',
    'Name':         emp.name        || '',
    'Role':         emp.role        || '',
    'Reports To':   emp.reportsTo   || '',
    'hierarchy':    emp.hierarchy   || 'Other',
    'Category':     emp.category    || '',
    'Linkedin':     emp.linkedin    || '',
    'email':        emp.email       || '',
    'Mobile DID':   emp.mobileDID   || '',
    'Location':     doc.location    || '',
  }));
  const location = String(doc.location || '').trim();
  return generateOrgChartHTML(rows, doc.companyName, location);
}

// CSV-based helper kept for backward compat / CLI usage
async function generateOrgChartForCompany(csvFilePath, companyName) {
  if (!fs.existsSync(csvFilePath)) throw new Error(`CSV file not found: ${csvFilePath}`);
  const allData = await readCSVFile(csvFilePath);
  allData.forEach(r => { r.hierarchy = r.hierarchy || 'Other'; });
  const companyData = allData.filter(r => r['Company Name'] === companyName);
  if (!companyData.length) throw new Error(`No data found for company: ${companyName}`);
  const location = companyData[0]['Location'] ? String(companyData[0]['Location']).trim() : '';
  return generateOrgChartHTML(companyData, companyName, location);
}

async function getCompaniesFromCSV(csvFilePath) {
  if (!fs.existsSync(csvFilePath)) throw new Error(`CSV file not found: ${csvFilePath}`);
  const data = await readCSVFile(csvFilePath);
  return [...new Set(data.map(r => r['Company Name']).filter(Boolean))];
}

// ─────────────────────────────────────────────
//  MAIN  — reads from MongoDB, uploads to S3
// ─────────────────────────────────────────────
async function main() {
  require('dotenv').config();
  const connectDB   = require('./config/db');
  const BuyingGroup = require('./models/BuyingGroup');
  const { uploadOrgChartToS3, orgChartExistsInS3, ORG_CHART_FOLDER } = require('./config/s3');

  await connectDB();

  const companies = await BuyingGroup.find({}).lean();
  if (!companies.length) { console.error('No companies found in MongoDB'); process.exit(0); }

  console.log(`Found ${companies.length} companies. Generating & uploading HTML files...`);
  let generated = 0, skipped = 0;

  for (const company of companies) {
    const companyName = company.companyName;
    const location    = String(company.location || '').trim();
    const safeCompany = sanitizeFilename(companyName);
    const filename    = location ? `${safeCompany}_${sanitizeFilename(location)}.html` : `${safeCompany}.html`;
    const s3Key       = `${ORG_CHART_FOLDER}/${filename}`;

    // Convert MongoDB employee docs to the flat row format generateOrgChartHTML expects
    const rows = (company.employees || []).map(emp => ({
      'Company Name': companyName,
      'Location':     location,
      'Name':         emp.name,
      'Role':         emp.role,
      'Email':        emp.email || '',
      'Phone':        emp.phone || '',
      'LinkedIn':     emp.linkedin || '',
      'Reports To':   emp.reportsTo || '',
      'Hierarchy':    emp.hierarchy || 'OTHER',
      'Category':     emp.category || '',
    }));

    if (!rows.length) { console.log(`  ~ skipped (no employees): ${companyName}`); skipped++; continue; }

    try {
      const html = generateOrgChartHTML(rows, companyName, location);

      // Upload to S3
      const result = await uploadOrgChartToS3(filename, html);

      // Update the orgChart field in MongoDB
      await BuyingGroup.updateOne(
        { companyName },
        { $set: { orgChart: { s3Key: result.s3Key, s3Url: result.s3Url, generatedAt: new Date(), fileSize: result.fileSize } } }
      );

      console.log(`  ✓ ${filename} (${result.fileSize} bytes)`);
      generated++;
    } catch (err) {
      console.error(`  ✗ Failed for "${companyName}": ${err.message}`);
    }
  }

  console.log(`\nDone: ${generated} uploaded, ${skipped} skipped.`);
  process.exit(0);
}

// ─────────────────────────────────────────────
//  EXPORTS
// ─────────────────────────────────────────────
module.exports = { generateOrgChartHTML, generateOrgChartFromDoc, buildTreeFromData, generateOrgChartForCompany, getCompaniesFromCSV };

if (require.main === module) main().catch(() => {});