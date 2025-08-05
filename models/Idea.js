const mongoose = require('mongoose');

const ideaSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['business', 'personal', 'creative', 'technical', 'other'],
    default: 'other'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['new', 'in-progress', 'completed', 'archived'],
    default: 'new'
  },
  tags: [{
    type: String,
    trim: true
  }],
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
ideaSchema.index({ category: 1 });
ideaSchema.index({ status: 1 });
ideaSchema.index({ priority: 1 });
ideaSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Idea', ideaSchema); 