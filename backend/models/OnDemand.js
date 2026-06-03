const mongoose = require('mongoose');

const onDemandSchema = new mongoose.Schema({
  userId: {
    type: String,  // Changed from ObjectId to String to support PostgreSQL user IDs
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['csv_upload', 'company_domain'],
    required: true
  },
  // For CSV uploads
  csvFileName: {
    type: String
  },
  s3Key: {
    type: String
  },
  s3Url: {
    type: String
  },
  fileSize: {
    type: Number
  },
  rowCount: {
    type: Number
  },
  // For company/domain submissions
  companyName: {
    type: String
  },
  domain: {
    type: String
  },
  // Request metadata
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  notes: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp on save
onDemandSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('OnDemand', onDemandSchema);
