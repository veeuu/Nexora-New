const mongoose = require('mongoose');

const TechnographicsSchema = new mongoose.Schema({
  Category: String,
  Keyword: String,
  'Page URL': String,
  'Previous Date': String,
  'Latest Date': String,
  'Renewal Date': String
}, { _id: false });

const FirmographicsSchema = new mongoose.Schema({
  About: {
    'Company Name': String,
    Domain: String,
    Industry: String,
    'Full Time employees': String,
    NAICS: String,
    linkedinUrl: String
  },
  Location: {
    Address: String,
    City: String,
    State: String,
    Country: String,
    Contact: String
  }
}, { _id: false });

const FinancialDataSchema = new mongoose.Schema({
  Finance: {
    ID: String,
    'Investor Website': String,
    Exchange: String,
    'Date & Time': String,
    'Current Price': String,
    'Market Cap': String,
    'Total Revenue': String,
    'Revenue Growth': String,
    'Profit Growth': String
  },
  Dividend: {
    'Dividend Rate': String,
    'Dividend Yield': String,
    'Date of Last Dividend': String,
    'Five Years Average Dividend Yield': String,
    Currency: String
  }
}, { _id: false });

const NTPSchema = new mongoose.Schema({
  Category: String,
  Technology: String,
  'Purchase Probability (%)': String,
  'Purchase Prediction': String,
  'NTP Analysis': String
}, { _id: false });

const StockPerformanceItemSchema = new mongoose.Schema({
  Date: String,
  Open: String,
  High: String,
  Low: String,
  Close: String,
  Volume: Number,
  Adjclose: String
}, { _id: false });

const StockPerformanceSchema = new mongoose.Schema({
  Daily_Performance: [StockPerformanceItemSchema],
  Weekly_Performance: [StockPerformanceItemSchema],
  Monthly_Performance: [StockPerformanceItemSchema],
  Quarterly_Performance: [StockPerformanceItemSchema],
  Yearly_Performance: [StockPerformanceItemSchema]
}, { _id: false });

const CompanySchema = new mongoose.Schema({
  'Company Name': String,
  Firmographics: FirmographicsSchema,
  Technographics: [TechnographicsSchema],
  NTP: [NTPSchema],
  Financial_Data: FinancialDataSchema,
  Stock_Performance: StockPerformanceSchema
}, { strict: false, collection: 'data' });

CompanySchema.index({ 'Company Name': 1 });
CompanySchema.index({ 'Technographics.Keyword': 1 });

module.exports = mongoose.model('Company', CompanySchema);
