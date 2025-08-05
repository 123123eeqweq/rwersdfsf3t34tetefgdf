const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

// Получить все задачи
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении задач' });
  }
});

// Получить задачи по периоду
router.get('/period/:period', async (req, res) => {
  try {
    const { period } = req.params;
    const tasks = await Task.find({ period }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении задач' });
  }
});

// Создать новую задачу
router.post('/', async (req, res) => {
  try {
    const { text, period, category } = req.body;
    
    if (!text || !period) {
      return res.status(400).json({ error: 'Текст и период обязательны' });
    }

    const task = new Task({
      text,
      period,
      category: category || null
    });

    const savedTask = await task.save();
    res.status(201).json(savedTask);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при создании задачи' });
  }
});

// Обновить задачу
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    updates.updatedAt = new Date();

    const task = await Task.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ error: 'Задача не найдена' });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при обновлении задачи' });
  }
});

// Переключить статус выполнения задачи
router.patch('/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ error: 'Задача не найдена' });
    }

    task.completed = !task.completed;
    task.updatedAt = new Date();
    const updatedTask = await task.save();

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при обновлении задачи' });
  }
});

// Обновить категорию задачи
router.patch('/:id/category', async (req, res) => {
  try {
    const { id } = req.params;
    const { category } = req.body;

    const task = await Task.findByIdAndUpdate(
      id,
      { category, updatedAt: new Date() },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ error: 'Задача не найдена' });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при обновлении категории' });
  }
});

// Переместить задачу в другой период
router.patch('/:id/move', async (req, res) => {
  try {
    const { id } = req.params;
    const { period } = req.body;

    if (!period) {
      return res.status(400).json({ error: 'Период обязателен' });
    }

    const task = await Task.findByIdAndUpdate(
      id,
      { period, updatedAt: new Date() },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ error: 'Задача не найдена' });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при перемещении задачи' });
  }
});

// Удалить задачу
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findByIdAndDelete(id);

    if (!task) {
      return res.status(404).json({ error: 'Задача не найдена' });
    }

    res.json({ message: 'Задача удалена' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при удалении задачи' });
  }
});

// Удалить все задачи за сегодня
router.delete('/period/today', async (req, res) => {
  try {
    const result = await Task.deleteMany({ period: 'today' });
    res.json({ message: `Удалено ${result.deletedCount} задач` });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при удалении задач' });
  }
});

// Получить статистику по задачам
router.get('/stats', async (req, res) => {
  try {
    const stats = await Task.aggregate([
      {
        $group: {
          _id: '$period',
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: ['$completed', 1, 0] }
          }
        }
      }
    ]);

    const formattedStats = {};
    stats.forEach(stat => {
      formattedStats[stat._id] = {
        total: stat.total,
        completed: stat.completed,
        percentage: stat.total > 0 ? Math.round((stat.completed / stat.total) * 100) : 0
      };
    });

    res.json(formattedStats);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении статистики' });
  }
});

module.exports = router; 