const mongoose = require('mongoose');

const sportSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    trim: true
  },
  duration: {
    type: Number,
    required: true
  },
  calories: {
    type: Number,
    default: 0
  },
  distance: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    trim: true
  },
  date: {
    type: Date,
    default: Date.now
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
sportSchema.index({ type: 1 });
sportSchema.index({ date: -1 });

module.exports = mongoose.model('Sport', sportSchema); 