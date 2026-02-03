# Real-Time Org Chart Generation Setup

## Overview
The buying group component now generates org charts dynamically from Excel data instead of using static images. When you select a company from the dropdown, the system generates an interactive HTML org chart in real-time.

## Changes Made

### 1. Backend - `org_chart.js`
- Added `generateOrgChartForCompany()` function to generate HTML for a specific company
- Added `getCompaniesFromExcel()` function to retrieve list of all companies from the Excel file
- Exported these functions for use in API routes

### 2. Backend - `routes/api.js`
- Added `/api/org-chart/companies` endpoint - returns list of all companies
- Added `/api/org-chart/:companyName` endpoint - generates and returns org chart HTML for selected company
- Imported org chart generation functions

### 3. Frontend - `BuyingGroup.jsx`
- Removed all static image imports
- Replaced with dynamic company list fetched from backend
- Added real-time org chart generation on company selection
- Uses iframe to display generated HTML charts
- Added loading and error states

## How It Works

1. **Component Mount**: Fetches list of companies from `/api/org-chart/companies`
2. **Company Selection**: When user selects a company, calls `/api/org-chart/:companyName`
3. **Chart Generation**: Backend reads Excel file, filters data for selected company, generates Plotly chart HTML
4. **Display**: Frontend displays HTML in iframe with same styling as before

## Data Flow
```
Excel File (AI_sample (1).xlsx)
    ↓
Backend reads and filters by company
    ↓
Generates Plotly org chart HTML
    ↓
Frontend displays in iframe
```

## Requirements
- Backend must have access to `AI_sample (1).xlsx` in the backend folder
- Excel file must have columns: `Company Name`, `Name`, `Role`, `Reports To`, `hierarchy`, `Location`
- Backend server running on `http://localhost:5000`

## Testing
1. Start backend server: `npm start` (in backend folder)
2. Start frontend: `npm run dev` (in frontend folder)
3. Navigate to Buying Group component
4. Select a company from dropdown
5. Org chart should generate and display in real-time

## Notes
- Charts are generated on-demand (no pre-generation needed)
- Supports all hierarchy types: Decision Maker, Influencer, Direct Reportee, Other
- Responsive design maintains same container size as before
- personDetails.csv integration is on hold as requested
