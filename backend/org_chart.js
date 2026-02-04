/**
 * Organization Chart Generator - Node.js Version
 * Complete port of Python org_chart.py using Plotly
 */

const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const archiver = require('archiver');
const puppeteer = require('puppeteer');

// ================================
// CONFIGURATION CONSTANTS
// ================================

const CONFIG = {
  BOX_WIDTH: 0.85,
  BOX_HEIGHT: 0.42,
  BOX_CORNER_RADIUS: 0.015,
  HORIZONTAL_GAP: 0.08,
  VERTICAL_GAP: 0.15,
  TOP_PADDING: 0.12,
  SIDE_PADDING: 0.05,
  MAX_CHARS_PER_LINE: 16,
  MAX_NAME_LINES: 1,
  MAX_ROLE_LINES: 2,
  CHART_GLOBAL_X_OFFSET: 0.8,
  SMALL_CHART_THRESHOLD: 5,
  SMALL_CHART_BOX_WIDTH: 0.58,
  SMALL_CHART_BOX_HEIGHT: 0.34,
  MIN_VIEWPORT_SPAN: 0.9,
  AXIS_PADDING: 0.10,

  // Colors
  COLOR_DECISION_MAKER_FILL: '#0070C0',
  COLOR_INFLUENCER_FILL: '#00B0F0',
  COLOR_DIRECT_REPORTEE_FILL: '#CCECFF',
  COLOR_OTHER_NODE_FILL: '#000000',
  COLOR_LINES: '#355A9C',
  COLOR_BACKGROUND: '#FFFFFF',

  // Fonts - Adjusted for better fit
  FONT_COLOR_ON_LIGHT_BG: '#000000',
  FONT_COLOR_ON_DARK_BG: '#FFFFFF',
  COLOR_DIRECT_REPORTEE_FONT: '#002060',
  NAME_TEXT_SIZE: 12,
  ROLE_TEXT_SIZE: 10,

  // Canvas dimensions
  CANVAS_WIDTH: 900,
  CANVAS_HEIGHT: 500
};

// ================================
// UTILITY FUNCTIONS
// ================================

/**
 * Wrap text to fit within character limit and line limit
 */
function wrapText(text, maxChars, maxLines = null) {
  if (typeof text !== 'string') {
    text = String(text);
  }

  if (text.includes('<br>')) {
    return text;
  }

  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    if (!currentLine) {
      currentLine = word;
    } else if (currentLine.length + 1 + word.length <= maxChars) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  if (maxLines !== null && lines.length > maxLines) {
    lines.splice(maxLines);
    if (lines.length > 0) {
      lines[lines.length - 1] = lines[lines.length - 1].substring(0, Math.max(1, maxChars - 3)) + '...';
    }
  }

  return lines.join('<br>');
}

/**
 * Create SVG path for rounded rectangle
 */
function createRoundedRectPath(xCenter, yCenter, width, height, radius) {
  const x0 = xCenter - width / 2;
  const y0 = yCenter - height / 2;
  const x1 = xCenter + width / 2;
  const y1 = yCenter + height / 2;

  return `M ${x0 + radius},${y1} L ${x1 - radius},${y1} Q ${x1},${y1} ${x1},${y1 - radius} L ${x1},${y0 + radius} Q ${x1},${y0} ${x1 - radius},${y0} L ${x0 + radius},${y0} Q ${x0},${y0} ${x0},${y0 + radius} L ${x0},${y1 - radius} Q ${x0},${y1} ${x0 + radius},${y1} Z`;
}

/**
 * Sanitize filename
 */
function sanitizeFilename(name) {
  name = String(name);
  name = name.replace(/[^\w\s-]/g, '').trim();
  name = name.replace(/[-\s]+/g, '_');
  return name || 'untitled_chart';
}

// ================================
// TREE BUILDING FUNCTIONS
// ================================

/**
 * Build tree structure from data
 */
function buildTreeFromData(data) {
  const employees = {};
  const allNamesInInput = new Set(data.map(row => String(row.Name || '').trim()).filter(Boolean));

  for (const row of data) {
    const name = String(row.Name || 'Unnamed').trim();
    const role = String(row.Role || 'N/A');
    const reportsTo = row['Reports To'];
    const hierarchy = String(row.hierarchy || 'Other').trim();

    let managerName = null;
    if (reportsTo && String(reportsTo).trim()) {
      managerName = String(reportsTo).trim();
      if (!allNamesInInput.has(managerName)) {
        managerName = null;
      }
    }

    employees[name] = {
      name,
      role,
      reports_to: managerName,
      hierarchy_type: hierarchy,
      children: [],
      level: -1,
      y: 0.0,
      x: 0.0,
      cached_width: 0.0
    };
  }

  const managedEmployees = new Set();
  for (const [name, empData] of Object.entries(employees)) {
    if (empData.reports_to && empData.reports_to in employees) {
      employees[empData.reports_to].children.push(name);
      managedEmployees.add(name);
    }
  }

  let roots = Object.keys(employees).filter(name => !managedEmployees.has(name));
  if (roots.length === 0 && Object.keys(employees).length > 0) {
    roots = [Object.keys(employees)[0]];
  }

  const edges = [];
  for (const [name, empData] of Object.entries(employees)) {
    for (const childName of empData.children) {
      edges.push([name, childName]);
    }
  }

  return { employees, roots, edges };
}

/**
 * Calculate levels and Y positions
 */
function calculateLevelsAndY(employees, roots, boxHeight = CONFIG.BOX_HEIGHT) {
  if (!roots.length || !Object.keys(employees).length) {
    return 0;
  }

  const queue = [];
  const visitedForLeveling = new Set();
  let maxLevel = 0;

  const validRoots = roots.filter(r => r in employees);
  for (const rootName of validRoots) {
    employees[rootName].level = 0;
    queue.push([rootName, 0]);
    visitedForLeveling.add(rootName);
  }

  let head = 0;
  while (head < queue.length) {
    const [currentName, level] = queue[head];
    head++;
    maxLevel = Math.max(maxLevel, level);

    if (!(currentName in employees)) continue;

    for (const childName of employees[currentName].children) {
      if (childName in employees && !visitedForLeveling.has(childName)) {
        employees[childName].level = level + 1;
        queue.push([childName, level + 1]);
        visitedForLeveling.add(childName);
      }
    }
  }

  for (const [name, empData] of Object.entries(employees)) {
    if (empData.level !== -1) {
      empData.y = 1.0 - CONFIG.TOP_PADDING - (empData.level * (boxHeight + CONFIG.VERTICAL_GAP)) - boxHeight / 2;
    }
  }

  return maxLevel;
}

/**
 * Get subtree width
 */
function getSubtreeWidth(nodeName, employees, boxWidth = CONFIG.BOX_WIDTH) {
  const node = employees[nodeName];
  if (node.cached_width > 0) {
    return node.cached_width;
  }

  let width;
  if (!node.children.length) {
    width = boxWidth;
  } else {
    const childrenWidths = node.children.map(child => getSubtreeWidth(child, employees, boxWidth));
    width = childrenWidths.reduce((a, b) => a + b, 0) + Math.max(0, node.children.length - 1) * CONFIG.HORIZONTAL_GAP;
  }

  node.cached_width = Math.max(width, boxWidth);
  return node.cached_width;
}

/**
 * Assign X coordinates recursively
 */
function assignXCoordinatesRecursive(nodeName, currentXSlotStart, employees, boxWidth = CONFIG.BOX_WIDTH) {
  const node = employees[nodeName];
  const children = node.children;
  const totalCachedWidth = node.cached_width;

  if (!children.length) {
    node.x = currentXSlotStart + boxWidth / 2 + CONFIG.CHART_GLOBAL_X_OFFSET;
    return;
  }

  const childrenCollectiveSpanWidth = children.reduce((sum, c) => sum + employees[c].cached_width, 0) +
    Math.max(0, children.length - 1) * CONFIG.HORIZONTAL_GAP;

  const parentXCenter = currentXSlotStart + totalCachedWidth / 2;
  node.x = parentXCenter + CONFIG.CHART_GLOBAL_X_OFFSET;

  const childrenLayoutBlockStartX = parentXCenter - (childrenCollectiveSpanWidth / 2);
  let tempChildStartX = childrenLayoutBlockStartX;

  for (const childName of children) {
    const childSubtreeWidth = employees[childName].cached_width;
    assignXCoordinatesRecursive(childName, tempChildStartX, employees, boxWidth);
    tempChildStartX += childSubtreeWidth + CONFIG.HORIZONTAL_GAP;
  }
}

/**
 * Calculate all X positions
 */
function calculateAllXPositions(employees, roots, boxWidth = CONFIG.BOX_WIDTH) {
  if (!roots.length || !Object.keys(employees).length) {
    return;
  }

  const validRoots = roots.filter(r => r in employees);
  if (!validRoots.length) {
    return;
  }

  for (const rootName of validRoots) {
    getSubtreeWidth(rootName, employees, boxWidth);
  }

  const totalChartSpanNeeded = validRoots.reduce((sum, r) => sum + employees[r].cached_width, 0) +
    Math.max(0, validRoots.length - 1) * CONFIG.HORIZONTAL_GAP;

  let currentOverallXOffset = CONFIG.SIDE_PADDING;
  if (totalChartSpanNeeded < (1.0 - 2 * CONFIG.SIDE_PADDING) && totalChartSpanNeeded > 0) {
    currentOverallXOffset = (1.0 - totalChartSpanNeeded) / 2;
  } else if (totalChartSpanNeeded === 0) {
    currentOverallXOffset = 0.5;
  }

  const sortedValidRoots = validRoots.sort();
  for (const rootName of sortedValidRoots) {
    if (rootName in employees) {
      assignXCoordinatesRecursive(rootName, currentOverallXOffset, employees, boxWidth);
      currentOverallXOffset += employees[rootName].cached_width + CONFIG.HORIZONTAL_GAP;
    }
  }
}

// ================================
// PLOTLY CHART GENERATION
// ================================

/**
 * Generate Plotly org chart
 */
function generateOrgChartPlotly(data, companyName = 'Organization', location = '') {
  const { employees, roots, edges } = buildTreeFromData(data);

  const numEmployees = Object.keys(employees).length;
  const boxWidth = numEmployees > 0 && numEmployees <= CONFIG.SMALL_CHART_THRESHOLD ?
    CONFIG.SMALL_CHART_BOX_WIDTH : CONFIG.BOX_WIDTH;
  const boxHeight = numEmployees > 0 && numEmployees <= CONFIG.SMALL_CHART_THRESHOLD ?
    CONFIG.SMALL_CHART_BOX_HEIGHT : CONFIG.BOX_HEIGHT;

  const titleText = location && String(location).trim() ?
    `${companyName} (${location})` : String(companyName);

  if (!Object.keys(employees).length) {
    return createErrorPlotly(`No Employee Data for ${titleText}`);
  }

  if (!roots.length) {
    return createErrorPlotly(`Error: No Hierarchy Roots for ${titleText}`);
  }

  // Calculate positions
  calculateLevelsAndY(employees, roots, boxHeight);
  calculateAllXPositions(employees, roots, boxWidth);

  const nodePositions = {};
  for (const [name, data] of Object.entries(employees)) {
    if (data.level !== -1 && 'x' in data && 'y' in data) {
      nodePositions[name] = [data.x, data.y];
    }
  }

  if (!Object.keys(nodePositions).length) {
    return createErrorPlotly(`${titleText} - No Visualizable Chart Data`);
  }

  // Calculate chart bounds
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;

  for (const [x, y] of Object.values(nodePositions)) {
    minX = Math.min(minX, x - boxWidth / 2);
    maxX = Math.max(maxX, x + boxWidth / 2);
    minY = Math.min(minY, y - boxHeight / 2);
    maxY = Math.max(maxY, y + boxHeight / 2);
  }

  let xRange = [minX - CONFIG.AXIS_PADDING, maxX + CONFIG.AXIS_PADDING];
  let yRange = [minY - CONFIG.AXIS_PADDING, maxY + CONFIG.AXIS_PADDING];

  // Prevent over-zooming
  let xSpan = xRange[1] - xRange[0];
  let ySpan = yRange[1] - yRange[0];

  if (xSpan < CONFIG.MIN_VIEWPORT_SPAN) {
    const centerX = (xRange[0] + xRange[1]) / 2;
    xRange = [centerX - CONFIG.MIN_VIEWPORT_SPAN / 2, centerX + CONFIG.MIN_VIEWPORT_SPAN / 2];
  }

  if (ySpan < CONFIG.MIN_VIEWPORT_SPAN) {
    const centerY = (yRange[0] + yRange[1]) / 2;
    yRange = [centerY - CONFIG.MIN_VIEWPORT_SPAN / 2, centerY + CONFIG.MIN_VIEWPORT_SPAN / 2];
  }

  // Center chart horizontally
  const centerXChart = (minX + maxX) / 2;
  const centerXViewport = (xRange[0] + xRange[1]) / 2;
  const xShiftAmount = centerXChart - centerXViewport;
  xRange = [xRange[0] + xShiftAmount, xRange[1] + xShiftAmount];

  // Build Plotly traces
  const traces = [];
  const shapes = [];
  const annotations = [];

  // Legend traces
  traces.push({
    x: [null],
    y: [null],
    mode: 'markers',
    marker: { size: 15, color: CONFIG.COLOR_DECISION_MAKER_FILL, symbol: 'square' },
    name: 'Decision Maker &nbsp; &nbsp; &nbsp;',
    showlegend: true,
    hoverinfo: 'none'
  });

  traces.push({
    x: [null],
    y: [null],
    mode: 'markers',
    marker: { size: 15, color: CONFIG.COLOR_INFLUENCER_FILL, symbol: 'square' },
    name: 'Influencer &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;',
    showlegend: true,
    hoverinfo: 'none'
  });

  traces.push({
    x: [null],
    y: [null],
    mode: 'markers',
    marker: { size: 15, color: CONFIG.COLOR_DIRECT_REPORTEE_FILL, symbol: 'square' },
    name: 'Direct Reportee &nbsp; &nbsp; &nbsp;',
    showlegend: true,
    hoverinfo: 'none'
  });

  // Draw connection lines
  const lineXs = [];
  const lineYs = [];

  // Root connections
  const validRootsInChart = roots.filter(r => r in nodePositions);
  if (validRootsInChart.length > 1) {
    const rootPositions = {};
    for (const name of validRootsInChart) {
      const [x, y] = nodePositions[name];
      rootPositions[name] = [x + xShiftAmount, y];
    }

    const rootY = Object.values(rootPositions)[0][1];
    const topLineY = rootY + boxHeight / 2 + (CONFIG.VERTICAL_GAP / 3);
    const rootXCoords = Object.values(rootPositions).map(pos => pos[0]);
    const xMin = Math.min(...rootXCoords);
    const xMax = Math.max(...rootXCoords);

    lineXs.push(xMin, xMax, null);
    lineYs.push(topLineY, topLineY, null);

    for (const [name, [x, y]] of Object.entries(rootPositions)) {
      lineXs.push(x, x, null);
      lineYs.push(topLineY, y + boxHeight / 2, null);
    }
  }

  // Edge connections
  for (const [parentName, childName] of edges) {
    if (parentName in nodePositions && childName in nodePositions) {
      const [x0, y0] = nodePositions[parentName];
      const [x1, y1] = nodePositions[childName];
      const x0Shifted = x0 + xShiftAmount;
      const x1Shifted = x1 + xShiftAmount;
      const yJunction = y0 - boxHeight / 2 - CONFIG.VERTICAL_GAP / 3;

      lineXs.push(x0Shifted, x0Shifted, x1Shifted, x1Shifted, null);
      lineYs.push(y0 - boxHeight / 2, yJunction, yJunction, y1 + boxHeight / 2, null);
    }
  }

  // Add lines trace
  if (lineXs.length > 0) {
    traces.push({
      x: lineXs,
      y: lineYs,
      mode: 'lines',
      line: { color: CONFIG.COLOR_LINES, width: 2 },
      hoverinfo: 'none',
      showlegend: false
    });
  }

  // Add node boxes and text
  for (const [nameKey, [x, y]] of Object.entries(nodePositions)) {
    const xShifted = x + xShiftAmount;
    const empData = employees[nameKey];
    const originalName = empData.name;
    const originalRole = empData.role;

    const wrappedName = wrapText(originalName, CONFIG.MAX_CHARS_PER_LINE, CONFIG.MAX_NAME_LINES);
    const wrappedRole = wrapText(originalRole, CONFIG.MAX_CHARS_PER_LINE, CONFIG.MAX_ROLE_LINES);

    const hierarchyType = empData.hierarchy_type.toLowerCase();
    let nodeFillColor, nodeFontColor;

    if (hierarchyType === 'decision maker') {
      nodeFillColor = CONFIG.COLOR_DECISION_MAKER_FILL;
      nodeFontColor = CONFIG.FONT_COLOR_ON_DARK_BG;
    } else if (hierarchyType === 'influencer') {
      nodeFillColor = CONFIG.COLOR_INFLUENCER_FILL;
      nodeFontColor = CONFIG.FONT_COLOR_ON_DARK_BG;
    } else if (hierarchyType === 'direct reportee') {
      nodeFillColor = CONFIG.COLOR_DIRECT_REPORTEE_FILL;
      nodeFontColor = CONFIG.COLOR_DIRECT_REPORTEE_FONT;
    } else {
      nodeFillColor = CONFIG.COLOR_OTHER_NODE_FILL;
      nodeFontColor = CONFIG.FONT_COLOR_ON_DARK_BG;
    }

    // Add box shape
    const x0 = xShifted - boxWidth / 2;
    const y0 = y - boxHeight / 2;
    const x1 = xShifted + boxWidth / 2;
    const y1 = y + boxHeight / 2;

    shapes.push({
      type: 'rect',
      x0: x0,
      y0: y0,
      x1: x1,
      y1: y1,
      fillcolor: nodeFillColor,
      line: { color: nodeFillColor, width: 0 },
      xref: 'x',
      yref: 'y'
    });

    // Add text annotation using Plotly annotations
    const label = `<b>${wrappedName}</b><br><span style="font-size: 0.85em;">${wrappedRole}</span>`;

    annotations.push({
      x: xShifted,
      y: y,
      text: label,
      showarrow: false,
      font: {
        size: CONFIG.NAME_TEXT_SIZE,
        color: nodeFontColor,
        family: 'Calibri, Arial'
      },
      xref: 'x',
      yref: 'y',
      align: 'center',
      xanchor: 'center',
      yanchor: 'middle'
    });
  }

  // Create layout
  const layout = {
    title: {
      text: titleText,
      x: 0.5,
      y: 0.98,
      xanchor: 'center',
      yanchor: 'top',
      font: { family: 'Calibri, Arial', size: 20, color: CONFIG.FONT_COLOR_ON_LIGHT_BG }
    },
    showlegend: true,
    hovermode: 'closest',
    margin: { l: 20, r: 20, t: 100, b: 20 },
    width: CONFIG.CANVAS_WIDTH,
    height: CONFIG.CANVAS_HEIGHT,
    plot_bgcolor: CONFIG.COLOR_BACKGROUND,
    paper_bgcolor: CONFIG.COLOR_BACKGROUND,
    xaxis: {
      showgrid: false,
      zeroline: false,
      visible: false,
      range: xRange,
      autorange: false
    },
    yaxis: {
      showgrid: false,
      zeroline: false,
      visible: false,
      range: yRange,
      autorange: false
    },
    legend: {
      orientation: 'v',
      yanchor: 'top',
      y: 1.12,
      xanchor: 'right',
      x: 0.98,
      bgcolor: 'rgba(255, 255, 255, 0.75)',
      bordercolor: 'Black',
      borderwidth: 0
    },
    shapes: shapes,
    annotations: annotations
  };

  return { data: traces, layout };
}

/**
 * Create error Plotly chart
 */
function createErrorPlotly(message) {
  return {
    data: [{
      x: [0],
      y: [0],
      mode: 'text',
      text: [message],
      textposition: 'middle center',
      showlegend: false
    }],
    layout: {
      title: message,
      width: 1200,
      height: 200,
      plot_bgcolor: CONFIG.COLOR_BACKGROUND,
      paper_bgcolor: CONFIG.COLOR_BACKGROUND
    }
  };
}

/**
 * Convert HTML chart to PNG image using Puppeteer and capture position data
 */
async function generateOrgChartPNG(data, companyName = 'Organization', location = '', outputPath = '') {
  const htmlContent = generateOrgChartHTML(data, companyName, location);
  
  let browser;
  try {
    browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    
    // Set viewport size
    await page.setViewport({ width: CONFIG.CANVAS_WIDTH, height: CONFIG.CANVAS_HEIGHT });
    
    // Load HTML content
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    // Wait for Plotly to render using delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Take screenshot
    await page.screenshot({ path: outputPath, fullPage: false });
    
    await browser.close();
    return true;
  } catch (error) {
    console.error(`✗ Error generating PNG for ${companyName}: ${error.message}`);
    if (browser) await browser.close();
    return false;
  }
}

/**
 * Generate HTML with Plotly (static, no interactive features)
 */
/**
 * Generate HTML with Plotly (static, no interactive features)
 */
function generateOrgChartHTML(data, companyName = 'Organization', location = '') {
  const plotlyData = generateOrgChartPlotly(data, companyName, location);
  
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${companyName}${location ? ' (' + location + ')' : ''}</title>
  <script src="https://cdn.plot.ly/plotly-2.26.0.min.js"></script>
  <style>
    body {
      font-family: Calibri, Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: white;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      overflow: hidden;
    }
    #chart {
      width: 100%;
      height: 100%;
      background-color: white;
    }
  </style>
</head>
<body>
  <div id="chart"></div>
  <script>
    const data = ${JSON.stringify(plotlyData.data)};
    const layout = ${JSON.stringify(plotlyData.layout)};
    const config = { 
      responsive: false, 
      displayModeBar: false,
      staticPlot: true
    };
    
    if (layout && layout.annotations) {
      Plotly.newPlot('chart', data, layout, config);
    } else {
      document.getElementById('chart').innerHTML = '<p style="text-align: center; color: #999;">Unable to generate chart</p>';
    }
  </script>
</body>
</html>`;

  return html;
}

// ================================
// EXPORT FUNCTIONS FOR API
// ================================

/**
 * Generate org chart HTML for a specific company from Excel data
 */
async function generateOrgChartForCompany(excelFilePath, companyName) {
  try {
    if (!fs.existsSync(excelFilePath)) {
      throw new Error(`Excel file not found: ${excelFilePath}`);
    }

    const workbook = XLSX.readFile(excelFilePath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const allData = XLSX.utils.sheet_to_json(worksheet);

    // Ensure hierarchy column exists
    allData.forEach(row => {
      row.hierarchy = row.hierarchy || 'Other';
    });

    // Filter data for the specific company
    const companyData = allData.filter(row => row['Company Name'] === companyName);

    if (!companyData.length) {
      throw new Error(`No data found for company: ${companyName}`);
    }

    if (!companyData[0]['Name'] || !companyData[0]['Role']) {
      throw new Error(`Company ${companyName} missing 'Name' or 'Role' columns`);
    }

    const companyLocation = companyData[0]['Location'] ? String(companyData[0]['Location']).trim() : '';
    const html = generateOrgChartHTML(companyData, companyName, companyLocation);

    return html;
  } catch (error) {
    console.error(`Error generating org chart for ${companyName}:`, error.message);
    throw error;
  }
}

/**
 * Get list of all companies from Excel file
 */
function getCompaniesFromExcel(excelFilePath) {
  try {
    if (!fs.existsSync(excelFilePath)) {
      throw new Error(`Excel file not found: ${excelFilePath}`);
    }

    const workbook = XLSX.readFile(excelFilePath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet);

    const uniqueCompanies = [...new Set(data.map(row => row['Company Name']).filter(Boolean))];
    return uniqueCompanies;
  } catch (error) {
    console.error('Error getting companies from Excel:', error.message);
    throw error;
  }
}

// ================================
// MAIN EXECUTION
// ================================

async function main() {
  const excelFilePath = 'AI_sample (1).xlsx';
  const OUTPUT_FOLDER = 'org_charts_output_js';

  try {
    // Create output folder
    if (!fs.existsSync(OUTPUT_FOLDER)) {
      fs.mkdirSync(OUTPUT_FOLDER, { recursive: true });
      console.log(`✓ Created directory: ${OUTPUT_FOLDER}`);
    } else {
      // Clean up old PNG and HTML files (keep only mapping and zip)
      const files = fs.readdirSync(OUTPUT_FOLDER);
      for (const file of files) {
        if (file.endsWith('.png') || (file.endsWith('.html') && file !== 'personDetails.csv')) {
          const filePath = path.join(OUTPUT_FOLDER, file);
          fs.unlinkSync(filePath);
          console.log(`✓ Removed old file: ${file}`);
        }
      }
    }

    // Read Excel file
    if (!fs.existsSync(excelFilePath)) {
      console.error(`✗ File not found: ${excelFilePath}`);
      return;
    }

    const workbook = XLSX.readFile(excelFilePath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet);

    console.log(`✓ Loaded data from: ${excelFilePath}`);

    // Handle missing columns
    if (!data[0] || !('Company Name' in data[0])) {
      console.warn('⚠ "Company Name" column not found. Processing as "Overall_Organization".');
      data.forEach(row => row['Company Name'] = 'Overall_Organization');
    }

    if (!data[0] || !('hierarchy' in data[0])) {
      console.warn('⚠ "hierarchy" column not found. Defaulting to "Other".');
      data.forEach(row => row.hierarchy = row.hierarchy || 'Other');
    }

    const hasLocationColumn = data[0] && 'Location' in data[0];
    if (!hasLocationColumn) {
      console.warn('⚠ "Location" column not found. Titles will not include location.');
    }

    // Get unique companies
    const uniqueCompanies = [...new Set(data.map(row => row['Company Name']).filter(Boolean))];

    if (!uniqueCompanies.length) {
      console.log('No valid company names found to process.');
      return;
    }

    console.log(`Found companies: ${uniqueCompanies.join(', ')}`);

    const generatedFiles = [];
    const chartMappingData = [];
    const allPersonDetails = [];

    // Generate charts for each company
    for (const companyName of uniqueCompanies) {
      console.log(`\nGenerating chart for company: ${companyName}...`);

      const companyData = data.filter(row => row['Company Name'] === companyName);

      if (!companyData.length) {
        console.log(`No data for company: ${companyName}. Skipping.`);
        continue;
      }

      if (!companyData[0]['Name'] || !companyData[0]['Role']) {
        console.log(`Company ${companyName} missing 'Name' or 'Role' columns. Skipping.`);
        continue;
      }

      let companyLocation = '';
      if (hasLocationColumn && companyData[0]['Location']) {
        companyLocation = String(companyData[0]['Location']).trim();
      }

      // Create filename - now using .html instead of .png
      const safeCompanyName = sanitizeFilename(companyName);
      let baseFilename = '';

      if (companyLocation) {
        const safeLocation = sanitizeFilename(companyLocation);
        baseFilename = `${safeCompanyName}_${safeLocation}.html`;
      } else {
        baseFilename = `${safeCompanyName}.html`;
      }

      chartMappingData.push({
        'Account Name': companyName,
        'Chart Name': baseFilename
      });

      const outputFilePath = path.join(OUTPUT_FOLDER, baseFilename);
      const companyId = chartMappingData.length;

      // Generate HTML file
      try {
        const htmlContent = generateOrgChartHTML(companyData, companyName, companyLocation);
        fs.writeFileSync(outputFilePath, htmlContent, 'utf-8');
        console.log(`✓ Chart for ${companyName} saved to ${outputFilePath}`);
        generatedFiles.push(outputFilePath);
      } catch (error) {
        console.error(`✗ Error generating HTML for ${companyName}: ${error.message}`);
      }
    }

    // Create personDetails.csv from the Excel data
    if (allPersonDetails.length > 0) {
      console.log('\n📝 Creating personDetails.csv...');
      const csvPath = path.join(OUTPUT_FOLDER, 'personDetails.csv');
      const csvContent = convertToCSV(allPersonDetails);
      fs.writeFileSync(csvPath, csvContent, 'utf-8');
      console.log(`✓ Person details saved to: ${csvPath}`);
      generatedFiles.push(csvPath);
    }

    // Create mapping Excel file
    if (chartMappingData.length > 0) {
      console.log('\n📝 Creating company-to-chart mapping file...');
      const mappingWorkbook = XLSX.utils.book_new();
      const mappingSheet = XLSX.utils.json_to_sheet(chartMappingData);
      XLSX.utils.book_append_sheet(mappingWorkbook, mappingSheet, 'Mapping');

      const mappingExcelPath = path.join(OUTPUT_FOLDER, 'chart_filename_mapping.xlsx');
      XLSX.writeFile(mappingWorkbook, mappingExcelPath);
      console.log(`✓ Mapping file saved to: ${mappingExcelPath}`);
      generatedFiles.push(mappingExcelPath);
    }

    // Create zip file
    if (generatedFiles.length > 0) {
      const zipFilePath = path.join(OUTPUT_FOLDER, 'organization_charts.zip');
      console.log(`\nZipping generated files to: ${zipFilePath}...`);

      const output = fs.createWriteStream(zipFilePath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      archive.pipe(output);

      for (const filePath of generatedFiles) {
        archive.file(filePath, { name: path.basename(filePath) });
      }

      await archive.finalize();

      console.log(`✓ Successfully created zip file.`);
      console.log(`\nFinal zip file location: ${zipFilePath}`);
    } else {
      console.log('\nNo charts were generated, so no zip file was created.');
    }

  } catch (error) {
    console.error(`✗ An error occurred: ${error.message}`);
    console.error(error);
  }
}

/**
 * Generate fake email
 */
function generateFakeEmail(personName) {
  const domains = ['gmail.com', 'company.com', 'outlook.com', 'yahoo.com'];
  const nameParts = personName.toLowerCase().split(' ');
  const domain = domains[Math.floor(Math.random() * domains.length)];
  return `${nameParts.join('.')}@${domain}`;
}

/**
 * Generate fake LinkedIn URL
 */
function generateFakeLinkedIn(personName) {
  const nameParts = personName.toLowerCase().split(' ');
  const randomNum = Math.floor(Math.random() * 9000) + 1000;
  return `https://linkedin.com/in/${nameParts.join('-')}-${randomNum}`;
}

/**
 * Convert array of objects to CSV string
 */
function convertToCSV(data) {
  if (!data || data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvHeaders = headers.join(',');
  
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header];
      // Escape quotes and wrap in quotes if contains comma
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',');
  });
  
  return [csvHeaders, ...csvRows].join('\n');
}

// Run main function
main().catch(console.error);

module.exports = { generateOrgChartHTML, buildTreeFromData, generateOrgChartForCompany, getCompaniesFromExcel };
