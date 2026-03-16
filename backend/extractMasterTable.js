const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Read the Excel file
const excelPath = path.join(__dirname, 'Products_Services_v3 (1).xlsx');
const workbook = XLSX.readFile(excelPath);

console.log('Available sheets:', workbook.SheetNames);

// Extract Master Table
const masterTableSheetName = '📋 Master Table';
if (!workbook.SheetNames.includes(masterTableSheetName)) {
  console.error(`Sheet "${masterTableSheetName}" not found. Available sheets:`, workbook.SheetNames);
  process.exit(1);
}

const masterTableWorksheet = workbook.Sheets[masterTableSheetName];
const rawMasterData = XLSX.utils.sheet_to_json(masterTableWorksheet, { header: 1 });

// Extract data starting from row 2 (row 1 is header)
let masterTableData = [];

for (let i = 2; i < rawMasterData.length; i++) {
  const row = rawMasterData[i];
  if (row[0] && String(row[0]).trim()) {
    masterTableData.push({
      'Products / Services': String(row[0]).trim(),
      'Primary Category (Products/Services Keywords)': String(row[1] || '').trim(),
      'Secondary Category Keywords': String(row[2] || '').trim(),
      'First Detected (Timeline Start)': String(row[3] || '').trim(),
      'Expansion Phase': String(row[4] || '').trim(),
      'Current Stage': row[5] || 0
    });
  }
}

console.log('Extracted master table rows:', masterTableData.length);

// Extract Glossary
const glossarySheetName = '🔑 Glossary';
if (!workbook.SheetNames.includes(glossarySheetName)) {
  console.error(`Sheet "${glossarySheetName}" not found.`);
  process.exit(1);
}

const glossaryWorksheet = workbook.Sheets[glossarySheetName];
const rawGlossaryData = XLSX.utils.sheet_to_json(glossaryWorksheet, { header: 1 });

const glossaryData = {
  columnDefinitions: [],
  lifecycleStages: []
};

// Find where column definitions start
let columnDefStart = -1;
let lifecycleStart = -1;

for (let i = 0; i < rawGlossaryData.length; i++) {
  const row = rawGlossaryData[i];
  if (row[1] && String(row[1]).includes('COLUMN NAME')) {
    columnDefStart = i + 1;
  }
  if (row[0] && String(row[0]).includes('LIFECYCLE STAGES')) {
    lifecycleStart = i + 1;
  }
}

// Extract column definitions
if (columnDefStart > 0 && lifecycleStart > 0) {
  for (let i = columnDefStart; i < lifecycleStart - 2; i++) {
    const row = rawGlossaryData[i];
    if (row[1] && row[2] && row.length > 2) {
      glossaryData.columnDefinitions.push({
        number: row[0],
        columnName: String(row[1]).trim(),
        meaning: String(row[2]).trim()
      });
    }
  }
}

// Extract lifecycle stages
if (lifecycleStart > 0) {
  for (let i = lifecycleStart + 1; i < rawGlossaryData.length; i++) {
    const row = rawGlossaryData[i];
    if (row[0] && row[1] && String(row[0]).trim() && String(row[1]).trim()) {
      glossaryData.lifecycleStages.push({
        stage: String(row[0]).trim(),
        meaning: String(row[1]).trim()
      });
    }
  }
}

// Combine both into one file
const combinedData = {
  masterTable: masterTableData,
  glossary: glossaryData
};

// Save to JSON file
const outputPath = path.join(__dirname, 'keywords-data.json');
fs.writeFileSync(outputPath, JSON.stringify(combinedData, null, 2));
console.log(`Keywords data saved to ${outputPath}`);
console.log(`Master Table: ${masterTableData.length} rows`);
console.log(`Glossary Column Definitions: ${glossaryData.columnDefinitions.length}`);
console.log(`Glossary Lifecycle Stages: ${glossaryData.lifecycleStages.length}`);
