const mongoose = require('mongoose');

const progress1402Schema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  completedDays: [{
    type: String, // Дата в формате "Mon Dec 23 2024"
    required: true
  }],
  targetDate: {
    type: Date,
    default: new Date('2026-02-14T00:00:00')
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

// Обновляем updatedAt при каждом изменении
progress1402Schema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Progress1402', progress1402Schema);
