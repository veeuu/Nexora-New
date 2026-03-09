const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const archiver = require('archiver');
const puppeteer = require('puppeteer');
const XLSX = require('xlsx');

const CONFIG = {
  BOX_WIDTH: 1.0,
  BOX_HEIGHT: 0.50,
  BOX_CORNER_RADIUS: 0.015,
  HORIZONTAL_GAP: 0.05,
  VERTICAL_GAP: 0.20,
  TOP_PADDING: 0.10,
  SIDE_PADDING: 0.02,
  MAX_CHARS_PER_LINE: 20,
  MAX_NAME_LINES: 1,
  MAX_ROLE_LINES: 1,
  CHART_GLOBAL_X_OFFSET: 0.0,
  SMALL_CHART_THRESHOLD: 10,
  SMALL_CHART_BOX_WIDTH: 0.70,
  SMALL_CHART_BOX_HEIGHT: 0.50,
  MIN_VIEWPORT_SPAN: 0.9,
  AXIS_PADDING: 0.05,

COLOR_DECISION_MAKER_FILL: '#003d7a',
  COLOR_INFLUENCER_FILL: '#0070C0',
  COLOR_DIRECT_REPORTEE_FILL: '#CCECFF',
  COLOR_OTHER_NODE_FILL: '#000000',
  COLOR_LINES: '#355A9C',
  COLOR_BACKGROUND: '#FFFFFF',

FONT_COLOR_ON_LIGHT_BG: '#000000',
  FONT_COLOR_ON_DARK_BG: '#FFFFFF',
  COLOR_DIRECT_REPORTEE_FONT: '#002060',
  NAME_TEXT_SIZE: 14,
  ROLE_TEXT_SIZE: 11,

CANVAS_WIDTH: 900,
  CANVAS_HEIGHT: 500,

MIN_CANVAS_WIDTH: 900,
  MIN_CANVAS_HEIGHT: 500,
  EMPLOYEES_PER_WIDTH_UNIT: 3,
  EMPLOYEES_PER_HEIGHT_UNIT: 2,
  
  // Dynamic sizing tiers (4-tier system)
  TIER_XS_THRESHOLD: 5,      // 1-5 employees
  TIER_XS_WIDTH: 0.25,
  TIER_XS_HEIGHT: 0.15,
  
  TIER_S_THRESHOLD: 8,       // 6-8 employees
  TIER_S_WIDTH: 0.40,
  TIER_S_HEIGHT: 0.25,
  
  TIER_M_THRESHOLD: 12,      // 9-12 employees
  TIER_M_WIDTH: 0.65,
  TIER_M_HEIGHT: 0.35,
  
  TIER_L_WIDTH: 1.0,         // 13+ employees
  TIER_L_HEIGHT: 0.50
};

function readCSVFile(csvFilePath) {
  return new Promise((resolve, reject) => {
    const data = [];

    if (!fs.existsSync(csvFilePath)) {
      reject(new Error(`CSV file not found: ${csvFilePath}`));
      return;
    }

    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => {
        data.push(row);
      })
      .on('end', () => {
        resolve(data);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

function getBoxDimensionsForCompany(companyData) {
  const rowCount = companyData.length;
  
  if (rowCount <= CONFIG.TIER_XS_THRESHOLD) {
    // Tier XS: 1-5 employees
    return {
      boxWidth: CONFIG.TIER_XS_WIDTH,
      boxHeight: CONFIG.TIER_XS_HEIGHT,
      tier: 'XS'
    };
  } else if (rowCount <= CONFIG.TIER_S_THRESHOLD) {
    // Tier S: 6-8 employees
    return {
      boxWidth: CONFIG.TIER_S_WIDTH,
      boxHeight: CONFIG.TIER_S_HEIGHT,
      tier: 'S'
    };
  } else if (rowCount <= CONFIG.TIER_M_THRESHOLD) {
    // Tier M: 9-12 employees
    return {
      boxWidth: CONFIG.TIER_M_WIDTH,
      boxHeight: CONFIG.TIER_M_HEIGHT,
      tier: 'M'
    };
  } else {
    // Tier L: 13+ employees
    return {
      boxWidth: CONFIG.TIER_L_WIDTH,
      boxHeight: CONFIG.TIER_L_HEIGHT,
      tier: 'L'
    };
  }
}

function calculateCanvasDimensions(employees, roots) {
  const employeeCount = Object.keys(employees).length;

let maxDepth = 0;
  const queue = roots.map(r => [r, 0]);
  let head = 0;

  while (head < queue.length) {
    const [nodeName, depth] = queue[head];
    head++;
    maxDepth = Math.max(maxDepth, depth);

    if (nodeName in employees) {
      for (const child of employees[nodeName].children) {
        queue.push([child, depth + 1]);
      }
    }
  }

let maxChildrenAtLevel = 0;
  const levelCounts = {};

  const levelQueue = roots.map(r => [r, 0]);
  let levelHead = 0;

  while (levelHead < levelQueue.length) {
    const [nodeName, level] = levelQueue[levelHead];
    levelHead++;

    levelCounts[level] = (levelCounts[level] || 0) + 1;

    if (nodeName in employees) {
      for (const child of employees[nodeName].children) {
        levelQueue.push([child, level + 1]);
      }
    }
  }

  maxChildrenAtLevel = Math.max(...Object.values(levelCounts));

let width = CONFIG.MIN_CANVAS_WIDTH;
  let height = CONFIG.MIN_CANVAS_HEIGHT;
  let scaleFactor = 1;

if (maxChildrenAtLevel > 5) {
    scaleFactor = Math.max(scaleFactor, maxChildrenAtLevel / 5);
    width = Math.max(CONFIG.MIN_CANVAS_WIDTH, maxChildrenAtLevel * 200);
  }

if (maxDepth > 3) {
    scaleFactor = Math.max(scaleFactor, (maxDepth + 1) / 4);
    height = Math.max(CONFIG.MIN_CANVAS_HEIGHT, (maxDepth + 1) * 150);
  }

  return { width, height, depth: maxDepth, maxChildrenAtLevel, scaleFactor };
}
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
  let isTruncated = false;

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

  // Check if we need to truncate due to maxLines
  if (maxLines !== null && lines.length > maxLines) {
    lines.splice(maxLines);
    isTruncated = true;
  }

  // Ensure each line doesn't exceed maxChars, add ellipsis if truncated
  if (lines.length > 0) {
    const lastLineIndex = lines.length - 1;
    if (lines[lastLineIndex].length > maxChars) {
      lines[lastLineIndex] = lines[lastLineIndex].substring(0, Math.max(1, maxChars - 3)) + '...';
      isTruncated = true;
    } else if (isTruncated) {
      // If truncated due to maxLines, add ellipsis to last line
      if (lines[lastLineIndex].length + 3 <= maxChars) {
        lines[lastLineIndex] += '...';
      } else {
        lines[lastLineIndex] = lines[lastLineIndex].substring(0, Math.max(1, maxChars - 3)) + '...';
      }
    }
  }

  return lines.join('<br>');
}

function createRoundedRectPath(xCenter, yCenter, width, height, radius) {
  const x0 = xCenter - width / 2;
  const y0 = yCenter - height / 2;
  const x1 = xCenter + width / 2;
  const y1 = yCenter + height / 2;

  return `M ${x0 + radius},${y1} L ${x1 - radius},${y1} Q ${x1},${y1} ${x1},${y1 - radius} L ${x1},${y0 + radius} Q ${x1},${y0} ${x1 - radius},${y0} L ${x0 + radius},${y0} Q ${x0},${y0} ${x0},${y0 + radius} L ${x0},${y1 - radius} Q ${x0},${y1} ${x0 + radius},${y1} Z`;
}

function sanitizeFilename(name) {
  name = String(name);
  name = name.replace(/[^\w\s-]/g, '').trim();
  name = name.replace(/[-\s]+/g, '_');
  return name || 'untitled_chart';
}

function buildTreeFromData(data) {
  const employees = {};
  const allNamesInInput = new Set(data.map(row => String(row.Name || '').trim()).filter(Boolean));

  for (const row of data) {
    const name = String(row.Name || 'Unnamed').trim();
    const role = String(row.Role || 'N/A');
    const reportsTo = row['Reports To'];
    const hierarchy = String(row.hierarchy || 'Other').trim();

const uniqueId = row['Unique ID'] || '';
    const companyName = row['Company Name'] || '';
    const linkedin = row['Linkedin'] || '';
    const email = row['email'] || '';
    const category = row['Category'] || 'N/A';

    let managerName = null;
    if (reportsTo && String(reportsTo).trim() && String(reportsTo).trim() !== '-') {
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
      cached_width: 0.0,

      uniqueId,
      companyName,
      linkedin,
      email,
      category
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

function generateOrgChartPlotly(data, companyName = 'Organization', location = '', customBoxWidth = null, customBoxHeight = null) {
  const { employees, roots, edges } = buildTreeFromData(data);

  // Get dynamic box dimensions based on company data size
  const { boxWidth: dynamicBoxWidth, boxHeight: dynamicBoxHeight, isSmall } = getBoxDimensionsForCompany(data);
  
  // Use custom dimensions if provided, otherwise use dynamic
  const boxWidth = customBoxWidth !== null ? customBoxWidth : dynamicBoxWidth;
  const boxHeight = customBoxHeight !== null ? customBoxHeight : dynamicBoxHeight;

const { width: canvasWidth, height: canvasHeight, depth, maxChildrenAtLevel, scaleFactor } = calculateCanvasDimensions(employees, roots);

  const verticalGap = CONFIG.VERTICAL_GAP;
  const horizontalGap = CONFIG.HORIZONTAL_GAP;

const nameTextSize = Math.round(CONFIG.NAME_TEXT_SIZE * scaleFactor);
  const roleTextSize = Math.round(CONFIG.ROLE_TEXT_SIZE * scaleFactor);

  const titleText = String(companyName);

  if (!Object.keys(employees).length) {
    return createErrorPlotly(`No Employee Data for ${titleText}`, canvasWidth, canvasHeight);
  }

  if (!roots.length) {
    return createErrorPlotly(`Error: No Hierarchy Roots for ${titleText}`, canvasWidth, canvasHeight);
  }

calculateLevelsAndY(employees, roots, boxHeight);
  calculateAllXPositions(employees, roots, boxWidth);

  const nodePositions = {};
  for (const [name, data] of Object.entries(employees)) {
    if (data.level !== -1 && 'x' in data && 'y' in data) {
      nodePositions[name] = [data.x, data.y];
    }
  }

  if (!Object.keys(nodePositions).length) {
    return createErrorPlotly(`${titleText} - No Visualizable Chart Data`, canvasWidth, canvasHeight);
  }

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

const centerXChart = (minX + maxX) / 2;
  const centerXViewport = (xRange[0] + xRange[1]) / 2;
  const xShiftAmount = centerXChart - centerXViewport;
  xRange = [xRange[0] + xShiftAmount, xRange[1] + xShiftAmount];

const traces = [];
  const shapes = [];
  const annotations = [];

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

const lineXs = [];
  const lineYs = [];

// Don't draw lines above root nodes - they are independent decision makers
  // const validRootsInChart = roots.filter(r => r in nodePositions);
  // Multiple roots should not have connecting lines above them

for (const [parentName, childName] of edges) {
    if (parentName in nodePositions && childName in nodePositions) {
      const [x0, y0] = nodePositions[parentName];
      const [x1, y1] = nodePositions[childName];
      const x0Shifted = x0 + xShiftAmount;
      const x1Shifted = x1 + xShiftAmount;
      const yJunction = y0 - boxHeight / 2 - verticalGap / 3;

      lineXs.push(x0Shifted, x0Shifted, x1Shifted, x1Shifted, null);
      lineYs.push(y0 - boxHeight / 2, yJunction, yJunction, y1 + boxHeight / 2, null);
    }
  }

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

const x0 = xShifted - boxWidth / 2;
    const y0 = y - boxHeight / 2;
    const x1 = xShifted + boxWidth / 2;
    const y1 = y + boxHeight / 2;

const categories = (empData.category || 'N/A')
      .split(',')
      .map(cat => cat.trim())
      .filter(cat => cat.length > 0);

    shapes.push({
      type: 'rect',
      x0: x0,
      y0: y0,
      x1: x1,
      y1: y1,
      fillcolor: nodeFillColor,
      line: { color: nodeFillColor, width: 0 },
      xref: 'x',
      yref: 'y',
      name: originalName,
      categories: categories
    });

const label = `<b>${wrappedName}</b><br><span style="font-size: 0.85em;">${wrappedRole}</span>`;

    annotations.push({
      x: xShifted,
      y: y,
      text: label,
      showarrow: false,
      font: {
        size: nameTextSize,
        color: nodeFontColor,
        family: 'Calibri, Arial'
      },
      xref: 'x',
      yref: 'y',
      align: 'center',
      xanchor: 'center',
      yanchor: 'middle',
      name: originalName,
      categories: categories
    });
  }

const layout = {
    title: {
      text: titleText,
      x: 0.5,
      y: 0.98,
      xanchor: 'center',
      yanchor: 'top',
      font: { family: 'Calibri, Arial', size: 28, color: CONFIG.FONT_COLOR_ON_LIGHT_BG }
    },
    showlegend: true,
    hovermode: 'closest',
    margin: { l: 20, r: 20, t: 150, b: 5 },
    width: canvasWidth,
    height: canvasHeight,
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

  return { data: traces, layout, canvasWidth, canvasHeight };
}

function createErrorPlotly(message, width = CONFIG.MIN_CANVAS_WIDTH, height = CONFIG.MIN_CANVAS_HEIGHT) {
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
      width: width,
      height: height,
      plot_bgcolor: CONFIG.COLOR_BACKGROUND,
      paper_bgcolor: CONFIG.COLOR_BACKGROUND
    },
    canvasWidth: width,
    canvasHeight: height
  };
}

async function generateOrgChartPNG(data, companyName = 'Organization', location = '', outputPath = '') {
  // Get dynamic box dimensions based on company data size
  const { boxWidth, boxHeight, isSmall } = getBoxDimensionsForCompany(data);
  
  const htmlContent = generateOrgChartHTML(data, companyName, location);
  const plotlyData = generateOrgChartPlotly(data, companyName, location, boxWidth, boxHeight);
  const canvasWidth = plotlyData.canvasWidth || CONFIG.MIN_CANVAS_WIDTH;
  const canvasHeight = plotlyData.canvasHeight || CONFIG.MIN_CANVAS_HEIGHT;

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined
    });
    const page = await browser.newPage();

await page.setViewport({ width: canvasWidth, height: canvasHeight });

await page.setContent(htmlContent, { waitUntil: 'networkidle2' });

await page.waitForFunction(() => {
      const plotDiv = document.querySelector('#chart');
      return plotDiv && plotDiv.data && plotDiv.data.length > 0;
    }, { timeout: 5000 }).catch(() => {
    });

await new Promise(resolve => setTimeout(resolve, 1000));

await page.screenshot({ path: outputPath, fullPage: false });

    await browser.close();

    return true;
  } catch (error) {

    if (browser) await browser.close();
    return false;
  }
}

function generateOrgChartHTML(data, companyName = 'Organization', location = '') {
  // Get dynamic box dimensions based on company data size
  const { boxWidth, boxHeight, isSmall } = getBoxDimensionsForCompany(data);
  
  const plotlyData = generateOrgChartPlotly(data, companyName, location, boxWidth, boxHeight);
  const canvasWidth = plotlyData.canvasWidth || CONFIG.MIN_CANVAS_WIDTH;
  const canvasHeight = plotlyData.canvasHeight || CONFIG.MIN_CANVAS_HEIGHT;

  // Generate favicon URL from company name
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(companyName.toLowerCase())}.com&sz=64`;
  const logoUrl = `https://logo.clearbit.com/${encodeURIComponent(companyName.toLowerCase())}.com`;

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <script src="https://cdn.plot.ly/plotly-2.26.0.min.js"></script>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: Calibri, Arial, sans-serif;
      background-color: white;
      height: 100vh;
      overflow: hidden;
    }

    .container {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .header {
      background: white;
      padding: 15px 30px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      gap: 15px;
      border-bottom: 3px solid #0070C0;
    }

    .company-logo {
      width: 120px;
      height: 40px;
      object-fit: contain;
    }

    .company-logo-fallback {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 18px;
    }

    .header-title {
      flex: 1;
      font-size: 24px;
      color: #2d3748;
      font-weight: 600;
    }

    .chart-wrapper {
      flex: 1;
      overflow: hidden;
      background-color: white;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      position: relative;
    }

    #chart {
      background-color: white;
      transform-origin: center center;
      transition: transform 0.2s ease;
    }

    .highlight-IT rect { stroke: #000000ff !important; stroke-width: 3 !important; }
    .highlight-Generalized rect { stroke: #000000ff !important; stroke-width: 3 !important; }
    .highlight-AI rect { stroke: #000000ff !important; stroke-width: 3 !important; }
    .highlight-Cloud rect { stroke: #000000ff !important; stroke-width: 3 !important; }
  </style>
</head>
<body>
  <div class="container">
    <div class="chart-wrapper">
      <div id="chart"></div>
    </div>
  </div>
  <script>
    // Build employee data map
    const employeeDataMap = {};
    const rawData = ${JSON.stringify(data)};
    rawData.forEach(row => {
      const name = String(row.Name || 'Unnamed').trim();
      employeeDataMap[name] = {
        name: row.Name || '',
        role: row.Role || '',
        email: row.email || '',
        linkedin: row.Linkedin || '',
        reportsTo: row['Reports To'] || '',
        category: row.Category || '',
        hierarchy: row.hierarchy || 'Other',
        uniqueId: row['Unique ID'] || '',
        companyName: row['Company Name'] || ''
      };
    });
    window.employeeDataMap = employeeDataMap;

    const data = ${JSON.stringify(plotlyData.data)};
    const layout = ${JSON.stringify(plotlyData.layout)};
    const config = {
      responsive: false,
      displayModeBar: false,
      staticPlot: true,
      scrollZoom: false
    };

    window.categoriesMap = {};
    if (layout && layout.shapes) {
      layout.shapes.forEach((shape, index) => {
        if (shape.categories && Array.isArray(shape.categories)) {
          window.categoriesMap[index] = shape.categories;
        }
      });
    }

    if (layout && layout.annotations) {
      Plotly.newPlot('chart', data, layout, config);
      
      // Apply intelligent zoom logic after chart is rendered
      setTimeout(() => {
        const chartDiv = document.getElementById('chart');
        const wrapper = document.querySelector('.chart-wrapper');
        
        if (chartDiv && wrapper) {
          // Get the actual dimensions
          const chartRect = chartDiv.getBoundingClientRect();
          const wrapperRect = wrapper.getBoundingClientRect();
          
          const chartWidth = chartRect.width;
          const chartHeight = chartRect.height;
          const wrapperWidth = wrapperRect.width;
          const wrapperHeight = wrapperRect.height;
          
          // Calculate if chart is "large" (exceeds wrapper dimensions)
          const isLargeChart = chartWidth > wrapperWidth || chartHeight > wrapperHeight;
          
          if (isLargeChart) {
            // For large charts, apply 80% zoom and enable scrolling
            chartDiv.style.transform = 'scale(0.8)';
            chartDiv.style.transformOrigin = 'top center';
            wrapper.style.overflow = 'auto';
          } else {
            // For small charts that fit, keep at 100%
            chartDiv.style.transform = 'scale(1.0)';
            wrapper.style.overflow = 'hidden';
          }
        }
      }, 100);
    } else {
      document.getElementById('chart').innerHTML = '<p style="text-align: center; color: #999;">Unable to generate chart</p>';
    }

    // ===== API FUNCTIONS =====
    window.OrgChartAPI = {
      getAllEmployees: function() {
        return window.employeeDataMap;
      },
      
      getEmployee: function(name) {
        return window.employeeDataMap[name] || null;
      },
      
      getEmployeesByRole: function(role) {
        return Object.values(window.employeeDataMap).filter(emp => emp.role.includes(role));
      },
      
      getEmployeesByCategory: function(category) {
        return Object.values(window.employeeDataMap).filter(emp => emp.category.includes(category));
      },
      
      getEmployeesByHierarchy: function(hierarchy) {
        return Object.values(window.employeeDataMap).filter(emp => emp.hierarchy === hierarchy);
      },
      
      getDirectReports: function(managerName) {
        return Object.values(window.employeeDataMap).filter(emp => emp.reportsTo === managerName);
      },
      
      highlightCategory: function(category) {
        const plotDiv = document.querySelector('#chart');
        if (!plotDiv || !plotDiv.layout) return;
        
        const plotLayout = plotDiv.layout;
        if (!plotLayout || !plotLayout.shapes) return;
        
        const updateObj = {};
        plotLayout.shapes.forEach((shape, index) => {
          const shapeCategories = window.categoriesMap[index] || [];
          
          if (category === 'All' || category === '') {
            updateObj[\`shapes[\${index}].line.width\`] = 0;
            updateObj[\`shapes[\${index}].line.color\`] = shape.fillcolor;
          } else if (shapeCategories.includes(category)) {
            updateObj[\`shapes[\${index}].line.width\`] = 3;
            updateObj[\`shapes[\${index}].line.color\`] = '#000000';
          } else {
            updateObj[\`shapes[\${index}].line.width\`] = 0;
            updateObj[\`shapes[\${index}].line.color\`] = shape.fillcolor;
          }
        });
        
        Plotly.relayout(plotDiv, updateObj);
      },
      
      exportAsJSON: function() {
        return JSON.stringify(window.employeeDataMap, null, 2);
      },
      
      exportAsCSV: function() {
        const employees = Object.values(window.employeeDataMap);
        if (employees.length === 0) return '';
        
        const headers = Object.keys(employees[0]);
        const csvHeaders = headers.join(',');
        const csvRows = employees.map(emp => {
          return headers.map(header => {
            const value = emp[header];
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return \`"\${value.replace(/"/g, '""')}"\`;
            }
            return value;
          }).join(',');
        });
        
        return [csvHeaders, ...csvRows].join('\\n');
      },
      
      getStatistics: function() {
        const employees = Object.values(window.employeeDataMap);
        const roles = {};
        const categories = {};
        const hierarchies = {};
        
        employees.forEach(emp => {
          roles[emp.role] = (roles[emp.role] || 0) + 1;
          hierarchies[emp.hierarchy] = (hierarchies[emp.hierarchy] || 0) + 1;
          
          if (emp.category) {
            emp.category.split(',').forEach(cat => {
              const trimmed = cat.trim();
              categories[trimmed] = (categories[trimmed] || 0) + 1;
            });
          }
        });
        
        return {
          totalEmployees: employees.length,
          roles: roles,
          categories: categories,
          hierarchies: hierarchies
        };
      }
    };

    // ===== MESSAGE HANDLER =====
    let currentZoom = 100;
    
    window.addEventListener('message', function(event) {
      if (event.data && event.data.type === 'highlightCategory') {
        window.OrgChartAPI.highlightCategory(event.data.category);
      } else if (event.data && event.data.type === 'setZoom') {
        currentZoom = event.data.zoomLevel;
        const chartDiv = document.getElementById('chart');
        if (chartDiv) {
          chartDiv.style.transform = 'scale(' + (currentZoom / 100) + ')';
        }
      }
    });

    // ===== CUSTOM EVENTS =====
    window.addEventListener('employeeClicked', function(event) {
    });
  </script>
</body>
</html>`;

  return html;
}

async function generateOrgChartForCompany(csvFilePath, companyName) {
  try {
    if (!fs.existsSync(csvFilePath)) {
      throw new Error(`CSV file not found: ${csvFilePath}`);
    }

    const allData = await readCSVFile(csvFilePath);

allData.forEach(row => {
      row.hierarchy = row.hierarchy || 'Other';
    });

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

    throw error;
  }
}

async function getCompaniesFromCSV(csvFilePath) {
  try {
    if (!fs.existsSync(csvFilePath)) {
      throw new Error(`CSV file not found: ${csvFilePath}`);
    }

    const data = await readCSVFile(csvFilePath);
    const uniqueCompanies = [...new Set(data.map(row => row['Company Name']).filter(Boolean))];
    return uniqueCompanies;
  } catch (error) {

    throw error;
  }
}

async function main() {
  const csvFilePath = 'Nexora Buying groups 13_02_2026.csv';
  const OUTPUT_FOLDER = 'org_charts_output_js';

  try {

    if (!fs.existsSync(OUTPUT_FOLDER)) {
      fs.mkdirSync(OUTPUT_FOLDER, { recursive: true });

    } else {

      const existingFiles = fs.readdirSync(OUTPUT_FOLDER);
      const existingHtmlFiles = existingFiles.filter(f => f.endsWith('.html'));
      if (existingHtmlFiles.length > 0) {

      }
    }

if (!fs.existsSync(csvFilePath)) {

      return;
    }

    const data = await readCSVFile(csvFilePath);

if (!data[0] || !('Company Name' in data[0])) {
      data.forEach(row => row['Company Name'] = 'Overall_Organization');
    }

    if (!data[0] || !('hierarchy' in data[0])) {
      data.forEach(row => row.hierarchy = row.hierarchy || 'Other');
    }

    const hasLocationColumn = data[0] && 'Location' in data[0];

const uniqueCompanies = [...new Set(data.map(row => row['Company Name']).filter(Boolean))];

    if (!uniqueCompanies.length) {

      return;
    }

const generatedFiles = [];
    const chartMappingData = [];
    const allPersonDetails = [];

const existingFiles = fs.readdirSync(OUTPUT_FOLDER).filter(f => f.endsWith('.html'));
    const existingCompanies = new Set();

    for (const file of existingFiles) {

      const companyKey = file.replace('.html', '');
      existingCompanies.add(companyKey);
    }

    let newChartsGenerated = 0;
    let chartsSkipped = 0;

for (const companyName of uniqueCompanies) {
      const companyData = data.filter(row => row['Company Name'] === companyName);

      if (!companyData.length) {

        continue;
      }

      if (!companyData[0]['Name'] || !companyData[0]['Role']) {

        continue;
      }

      let companyLocation = '';
      if (hasLocationColumn && companyData[0]['Location']) {
        companyLocation = String(companyData[0]['Location']).trim();
      }

const safeCompanyName = sanitizeFilename(companyName);
      let baseFilename = '';

      if (companyLocation) {
        const safeLocation = sanitizeFilename(companyLocation);
        baseFilename = `${safeCompanyName}_${safeLocation}.html`;
      } else {
        baseFilename = `${safeCompanyName}.html`;
      }

const fileKeyWithoutExtension = baseFilename.replace('.html', '');
      if (existingCompanies.has(fileKeyWithoutExtension)) {

        chartsSkipped++;

chartMappingData.push({
          'Account Name': companyName,
          'Chart Name': baseFilename
        });
        continue;
      }

const outputFilePath = path.join(OUTPUT_FOLDER, baseFilename);

try {
        const htmlContent = generateOrgChartHTML(companyData, companyName, companyLocation);
        fs.writeFileSync(outputFilePath, htmlContent, 'utf-8');

        generatedFiles.push(outputFilePath);
        newChartsGenerated++;
      } catch (error) {

      }

for (const person of companyData) {
        if (person.Name && person.email) {
          allPersonDetails.push({
            'Unique ID': person['Unique ID'] || '',
            'Company Name': person['Company Name'] || '',
            'Name': person.Name || '',
            'Role': person.Role || '',
            'Email': person.email || '',
            'LinkedIn': person.Linkedin || '',
            'Reports To': person['Reports To'] || ''
          });
        }
      }

chartMappingData.push({
        'Account Name': companyName,
        'Chart Name': baseFilename
      });
    }

if (allPersonDetails.length > 0) {

      const csvPath = path.join(OUTPUT_FOLDER, 'personDetails.csv');
      const csvContent = convertToCSV(allPersonDetails);
      fs.writeFileSync(csvPath, csvContent, 'utf-8');

      generatedFiles.push(csvPath);
    }

if (chartMappingData.length > 0) {

      const mappingWorkbook = XLSX.utils.book_new();
      const mappingSheet = XLSX.utils.json_to_sheet(chartMappingData);
      XLSX.utils.book_append_sheet(mappingWorkbook, mappingSheet, 'Mapping');

      const mappingExcelPath = path.join(OUTPUT_FOLDER, 'chart_filename_mapping.xlsx');
      XLSX.writeFile(mappingWorkbook, mappingExcelPath);

      generatedFiles.push(mappingExcelPath);
    }

if (generatedFiles.length > 0) {
      const zipFilePath = path.join(OUTPUT_FOLDER, 'organization_charts.zip');

const output = fs.createWriteStream(zipFilePath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      archive.pipe(output);

      for (const filePath of generatedFiles) {
        archive.file(filePath, { name: path.basename(filePath) });
      }

      await archive.finalize();

} else {

    }

  } catch (error) {

}
}

function convertToCSV(data) {
  if (!data || data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const csvHeaders = headers.join(',');

  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header];

      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',');
  });

  return [csvHeaders, ...csvRows].join('\n');
}

module.exports = { generateOrgChartHTML, buildTreeFromData, generateOrgChartForCompany, getCompaniesFromCSV };

if (require.main === module) {
  main().catch(() => {});
}
