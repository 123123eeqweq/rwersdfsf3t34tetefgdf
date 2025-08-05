const express = require('express');
const router = express.Router();
const Habit = require('../models/Habit');

// Get all habits
router.get('/', async (req, res) => {
  try {
    const habits = await Habit.find().sort({ createdAt: -1 });
    res.json(habits);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении привычек' });
  }
});

// Get habits by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const habits = await Habit.find({ category }).sort({ createdAt: -1 });
    res.json(habits);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении привычек по категории' });
  }
});

// Create a new habit
router.post('/', async (req, res) => {
  try {
    const { name, quitDate, quitTime, type } = req.body;
    
    if (!name || !quitDate || !type) {
      return res.status(400).json({ error: 'Имя, дата отказа и тип обязательны' });
    }

    const habit = new Habit({
      name,
      quitDate: new Date(quitDate),
      quitTime: quitTime || '00:00',
      type
    });

    const savedHabit = await habit.save();
    res.status(201).json(savedHabit);
  } catch (error) {
    res.status(400).json({ error: 'Ошибка при создании привычки' });
  }
});

// Update a habit
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, quitDate, quitTime, type } = req.body;
    
    const updatedHabit = await Habit.findByIdAndUpdate(
      id,
      { 
        name, 
        quitDate: quitDate ? new Date(quitDate) : undefined,
        quitTime, 
        type,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!updatedHabit) {
      return res.status(404).json({ error: 'Привычка не найдена' });
    }

    res.json(updatedHabit);
  } catch (error) {
    res.status(400).json({ error: 'Ошибка при обновлении привычки' });
  }
});



// Delete a habit
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedHabit = await Habit.findByIdAndDelete(id);
    
    if (!deletedHabit) {
      return res.status(404).json({ error: 'Привычка не найдена' });
    }

    res.json({ message: 'Привычка удалена' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при удалении привычки' });
  }
});

// Delete all habits
router.delete('/', async (req, res) => {
  try {
    await Habit.deleteMany({});
    res.json({ message: 'Все привычки удалены' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при удалении всех привычек' });
  }
});

// Get habit statistics
router.get('/stats', async (req, res) => {
  try {
    const totalHabits = await Habit.countDocuments();
    const badHabits = await Habit.countDocuments({ type: 'bad' });
    const goodHabits = await Habit.countDocuments({ type: 'good' });
    
    const typeStats = await Habit.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      total: totalHabits,
      bad: badHabits,
      good: goodHabits,
      typeStats
    });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении статистики' });
  }
});



module.exports = router; 