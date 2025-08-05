const mongoose = require('mongoose');

const sportSettingsSchema = new mongoose.Schema({
  monthlyGoal: {
    type: Number,
    default: 15,
    min: 1,
    max: 100
  },
  weightData: {
    currentWeight: {
      type: Number,
      default: 70,
      min: 30,
      max: 300
    },
    targetWeight: {
      type: Number,
      default: 65,
      min: 30,
      max: 300
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SportSettings', sportSettingsSchema); 