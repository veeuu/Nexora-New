const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Read the Excel file
const excelPath = path.join(__dirname, 'Products_Services_v3 (1).xlsx');
const workbook = XLSX.readFile(excelPath);

console.log('Available sheets:', workbook.SheetNames);

// Get the "Glossary" sheet
const sheetName = '🔑 Glossary';
if (!workbook.SheetNames.includes(sheetName)) {
  console.error(`Sheet "${sheetName}" not found. Available sheets:`, workbook.SheetNames);
  process.exit(1);
}

const worksheet = workbook.Sheets[sheetName];

// Read raw data to skip the title row
const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

console.log('First 5 rows:', rawData.slice(0, 5));

// Extract glossary data
const glossaryData = {
  columnDefinitions: [],
  lifecycleStages: []
};

// Find where column definitions start (row with "COLUMN NAME")
let columnDefStart = -1;
let lifecycleStart = -1;

for (let i = 0; i < rawData.length; i++) {
  const row = rawData[i];
  if (row[1] && String(row[1]).includes('COLUMN NAME')) {
    columnDefStart = i + 1;
  }
  if (row[0] && String(row[0]).includes('LIFECYCLE STAGES')) {
    lifecycleStart = i + 1;
  }
}

console.log('Column definitions start at:', columnDefStart);
console.log('Lifecycle stages start at:', lifecycleStart);

// Extract column definitions
if (columnDefStart > 0 && lifecycleStart > 0) {
  for (let i = columnDefStart; i < lifecycleStart - 2; i++) {
    const row = rawData[i];
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
  for (let i = lifecycleStart + 1; i < rawData.length; i++) {
    const row = rawData[i];
    if (row[0] && row[1] && String(row[0]).trim() && String(row[1]).trim()) {
      glossaryData.lifecycleStages.push({
        stage: String(row[0]).trim(),
        meaning: String(row[1]).trim()
      });
    }
  }
}

console.log('Glossary data:', JSON.stringify(glossaryData, null, 2));

// Save to JSON file
const outputPath = path.join(__dirname, 'glossary.json');
fs.writeFileSync(outputPath, JSON.stringify(glossaryData, null, 2));
console.log(`Glossary data saved to ${outputPath}`);
