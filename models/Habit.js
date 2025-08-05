const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  quitDate: {
    type: Date,
    required: true
  },
  quitTime: {
    type: String,
    default: '00:00'
  },
  type: {
    type: String,
    enum: ['bad', 'good'],
    required: true
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
habitSchema.index({ type: 1 });
habitSchema.index({ quitDate: 1 });

module.exports = mongoose.model('Habit', habitSchema); 