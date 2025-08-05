const mongoose = require('mongoose');

const financeSchema = new mongoose.Schema({
  totalCapital: {
    type: Number,
    default: 0
  },
  monthlyGoal: {
    type: Number,
    default: 5000
  },
  monthlyEarned: {
    type: Number,
    default: 0
  },
  monthlyExpenses: [{
    id: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  monthlyIncome: [{
    id: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    date: {
      type: Date,
      default: Date.now
    }
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
financeSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Finance', financeSchema); 