const express = require('express');
const router = express.Router();
const Sport = require('../models/Sport');
const SportSettings = require('../models/SportSettings');

// Получить все тренировки
router.get('/', async (req, res) => {
  try {
    const workouts = await Sport.find().sort({ date: -1 });
    res.json(workouts);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении тренировок' });
  }
});

// Получить тренировки по типу
router.get('/type/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const workouts = await Sport.find({ type }).sort({ date: -1 });
    res.json(workouts);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении тренировок' });
  }
});

// Создать новую тренировку
router.post('/', async (req, res) => {
  try {
    const { type, duration, calories, distance, notes, date } = req.body;
    
    if (!type || !duration) {
      return res.status(400).json({ error: 'Тип и продолжительность обязательны' });
    }

    const workout = new Sport({
      type,
      duration: parseFloat(duration),
      calories: calories ? parseFloat(calories) : 0,
      distance: distance ? parseFloat(distance) : 0,
      notes,
      date: date ? new Date(date) : new Date()
    });

    const savedWorkout = await workout.save();
    res.status(201).json(savedWorkout);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при создании тренировки' });
  }
});

// Получить настройки спорта
router.get('/settings', async (req, res) => {
  try {
    let settings = await SportSettings.findOne();
    
    if (!settings) {
      // Создаем настройки по умолчанию
      settings = new SportSettings();
      await settings.save();
    }
    
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении настроек спорта' });
  }
});

// Обновить настройки спорта
router.put('/settings', async (req, res) => {
  try {
    const { monthlyGoal, weightData } = req.body;
    
    let settings = await SportSettings.findOne();
    
    if (!settings) {
      settings = new SportSettings();
    }
    
    // Обновляем все поля, которые пришли в запросе
    if (monthlyGoal !== undefined) {
      settings.monthlyGoal = monthlyGoal;
    }
    
    if (weightData) {
      if (weightData.currentWeight !== undefined) {
        settings.weightData.currentWeight = weightData.currentWeight;
      }
      if (weightData.targetWeight !== undefined) {
        settings.weightData.targetWeight = weightData.targetWeight;
      }
    }
    
    const savedSettings = await settings.save();
    
    res.json(savedSettings);
  } catch (error) {
    res.status(500).json({ 
      error: 'Ошибка при обновлении настроек спорта',
      details: error.message 
    });
  }
});

// Обновить тренировку
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    if (updates.date) {
      updates.date = new Date(updates.date);
    }
    if (updates.duration) {
      updates.duration = parseFloat(updates.duration);
    }
    if (updates.calories) {
      updates.calories = parseFloat(updates.calories);
    }
    if (updates.distance) {
      updates.distance = parseFloat(updates.distance);
    }
    
    updates.updatedAt = new Date();

    const workout = await Sport.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!workout) {
      return res.status(404).json({ error: 'Тренировка не найдена' });
    }

    res.json(workout);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при обновлении тренировки' });
  }
});

// Удалить тренировку
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const workout = await Sport.findByIdAndDelete(id);

    if (!workout) {
      return res.status(404).json({ error: 'Тренировка не найдена' });
    }

    res.json({ message: 'Тренировка удалена' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при удалении тренировки' });
  }
});

// Получить статистику по тренировкам
router.get('/stats', async (req, res) => {
  try {
    const stats = await Sport.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalDuration: { $sum: '$duration' },
          totalCalories: { $sum: '$calories' },
          totalDistance: { $sum: '$distance' },
          avgDuration: { $avg: '$duration' },
          avgCalories: { $avg: '$calories' }
        }
      }
    ]);

    const formattedStats = {};
    stats.forEach(stat => {
      formattedStats[stat._id] = {
        count: stat.count,
        totalDuration: Math.round(stat.totalDuration || 0),
        totalCalories: Math.round(stat.totalCalories || 0),
        totalDistance: Math.round(stat.totalDistance || 0),
        avgDuration: Math.round(stat.avgDuration || 0),
        avgCalories: Math.round(stat.avgCalories || 0)
      };
    });

    res.json(formattedStats);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении статистики' });
  }
});

// Получить общую статистику
router.get('/overall-stats', async (req, res) => {
  try {
    const overallStats = await Sport.aggregate([
      {
        $group: {
          _id: null,
          totalWorkouts: { $sum: 1 },
          totalDuration: { $sum: '$duration' },
          totalCalories: { $sum: '$calories' },
          totalDistance: { $sum: '$distance' },
          avgDuration: { $avg: '$duration' },
          avgCalories: { $avg: '$calories' }
        }
      }
    ]);

    if (overallStats.length === 0) {
      return res.json({
        totalWorkouts: 0,
        totalDuration: 0,
        totalCalories: 0,
        totalDistance: 0,
        avgDuration: 0,
        avgCalories: 0
      });
    }

    const stats = overallStats[0];
    res.json({
      totalWorkouts: stats.totalWorkouts,
      totalDuration: Math.round(stats.totalDuration || 0),
      totalCalories: Math.round(stats.totalCalories || 0),
      totalDistance: Math.round(stats.totalDistance || 0),
      avgDuration: Math.round(stats.avgDuration || 0),
      avgCalories: Math.round(stats.avgCalories || 0)
    });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении общей статистики' });
  }
});

module.exports = router; 