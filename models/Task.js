const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true
  },
  period: {
    type: String,
    enum: ['today', 'week', 'month'],
    required: true
  },
  category: {
    type: String,
    enum: ['work', 'personal', 'sport', 'household', null],
    default: null
  },
  completed: {
    type: Boolean,
    default: false
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
taskSchema.index({ period: 1, completed: 1 });
taskSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Task', taskSchema); 