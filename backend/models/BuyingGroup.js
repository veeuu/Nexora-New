const mongoose = require('mongoose');

// Employee Schema
const EmployeeSchema = new mongoose.Schema({
  uniqueId: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  linkedin: { type: String },
  reportsTo: { type: String },
  hierarchy: { 
    type: String, 
    enum: ['DECISION MAKER', 'INFLUENCER', 'DIRECT REPORTEE', 'OTHER'],
    default: 'OTHER'
  },
  category: { type: String }, // Comma-separated: "AI/ML,Cloud,CRM"
  profileImage: { type: String }
}, { _id: false });

// Buying Group Schema
const BuyingGroupSchema = new mongoose.Schema({
  companyName: { 
    type: String, 
    required: true,
    unique: true,
    index: true
  },
  website: { type: String },
  linkedinProfile: { type: String },
  location: { type: String },
  industry: { type: String },
  employeeCount: { type: String },
  revenue: { type: String },
  
  // Employees array
  employees: [EmployeeSchema],
  
  // Org Chart HTML file info
  orgChart: {
    s3Key: { type: String }, // S3 file path: org_chart_folder/CompanyName_Location.html
    s3Url: { type: String }, // Full S3 URL
    generatedAt: { type: Date },
    fileSize: { type: Number }
  },
  
  // Metadata
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Indexes for better query performance
BuyingGroupSchema.index({ 'employees.category': 1 });
BuyingGroupSchema.index({ 'employees.hierarchy': 1 });
BuyingGroupSchema.index({ location: 1 });

// Virtual for getting all categories
BuyingGroupSchema.virtual('categories').get(function() {
  const categoriesSet = new Set();
  this.employees.forEach(emp => {
    if (emp.category) {
      emp.category.split(',').forEach(cat => {
        categoriesSet.add(cat.trim());
      });
    }
  });
  return Array.from(categoriesSet).sort();
});

// Method to get employees by category
BuyingGroupSchema.methods.getEmployeesByCategory = function(category) {
  return this.employees.filter(emp => 
    emp.category && emp.category.includes(category)
  );
};

// Method to get employees by hierarchy
BuyingGroupSchema.methods.getEmployeesByHierarchy = function(hierarchy) {
  return this.employees.filter(emp => emp.hierarchy === hierarchy);
};

// Static method to get all unique categories
BuyingGroupSchema.statics.getAllCategories = async function() {
  const result = await this.aggregate([
    { $unwind: '$employees' },
    { $project: { category: '$employees.category' } },
    { $match: { category: { $exists: true, $ne: null } } }
  ]);
  
  const categoriesSet = new Set();
  result.forEach(doc => {
    if (doc.category) {
      doc.category.split(',').forEach(cat => {
        categoriesSet.add(cat.trim());
      });
    }
  });
  
  return Array.from(categoriesSet).sort();
};

const BuyingGroup = mongoose.model('BuyingGroup', BuyingGroupSchema);

module.exports = BuyingGroup;
