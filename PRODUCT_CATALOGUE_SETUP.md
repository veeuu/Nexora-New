# Product Catalogue Setup Guide

## Overview
A new "Product Catalogue" page has been added to the Martech section of the dashboard. This page displays product information in a data table with filtering and search capabilities.

## Files Created/Modified

### Frontend
- **nexora/src/components/martech/ProductCatalogue.jsx** - New component for displaying product catalogue data
- **nexora/src/components/Dashboard.jsx** - Updated to include Product Catalogue in the menu

### Backend
- **backend/routes/api.js** - Added `/api/product-catalogue` endpoint
- **backend/config/productCatalogueData.js** - Product catalogue data
- **backend/seedProductCatalogue.js** - Script to seed data into MongoDB

## Setup Instructions

### 1. Seed the Database
Run the seed script to populate the product catalogue collection in MongoDB:

```bash
cd backend
node seedProductCatalogue.js
```

This will:
- Connect to your MongoDB database
- Clear any existing product_catalogue collection
- Insert all 28 product records

### 2. Start the Backend Server
```bash
cd backend
npm start
```

### 3. Start the Frontend
```bash
cd nexora
npm run dev
```

## Features

### Table Columns
- **Product Name** - Name of the product
- **Category** - Main category (e.g., IT INFRASTRUCTURE, OFFICE, DEVELOPMENT)
- **Sub Category** - Subcategory classification
- **Description** - Detailed product description (clickable to view full text in modal)

### Functionality
- **Search** - Search across all fields in real-time
- **Filters** - Filter by Product Name, Category, or Sub Category
- **Download CSV** - Export filtered data as CSV file
- **Modal View** - Click on description to view full text in a modal
- **Highlighting** - Search results are highlighted in yellow
- **Tooltips** - Hover over cells to see full content

## Data Structure

Each product record contains:
```javascript
{
  "Product Name": "string",
  "Category": "string",
  "Sub Category": "string",
  "Description": "string"
}
```

## API Endpoint

**GET /api/product-catalogue**

Returns an array of product objects with the following fields:
- `prodName` - Product name
- `category` - Category
- `subCategory` - Sub category
- `description` - Product description

## Navigation

The Product Catalogue is accessible from:
1. Dashboard → Martech view
2. Menu → Product Catalogue option
3. Chatbot navigation (if configured)

## Customization

To add more products, edit `backend/config/productCatalogueData.js` and re-run the seed script.
