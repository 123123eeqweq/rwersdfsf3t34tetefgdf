const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  department: {
    type: String,
    enum: ['development', 'design', 'marketing', 'sales', 'management', 'other'],
    default: 'other'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'former'],
    default: 'active'
  },
  skills: [{
    type: String,
    trim: true
  }],
  notes: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Индексы для оптимизации запросов
teamSchema.index({ department: 1 });
teamSchema.index({ status: 1 });
teamSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Team', teamSchema); 