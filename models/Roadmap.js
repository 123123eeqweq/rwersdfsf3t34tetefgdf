const mongoose = require('mongoose');

const roadmapStepSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true
  },
  stepNumber: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true,
    default: 'Новый шаг'
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date,
    default: null
  }
});

const roadmapSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  steps: [roadmapStepSchema],
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
roadmapSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Roadmap', roadmapSchema);
