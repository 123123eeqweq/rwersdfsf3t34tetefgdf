const express = require('express');
const router = express.Router();
const Project = require('../models/Project');

// Получить все проекты
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении проектов' });
  }
});

// Получить проекты по статусу
router.get('/status/:status', async (req, res) => {
  try {
    const { status } = req.params;
    const projects = await Project.find({ status }).sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении проектов' });
  }
});

// Создать новый проект
router.post('/', async (req, res) => {
  try {
    const { name, description, priority, startDate, endDate } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Название проекта обязательно' });
    }

    const project = new Project({
      name,
      description,
      priority: priority || 'medium',
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : null
    });

    const savedProject = await project.save();
    res.status(201).json(savedProject);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при создании проекта' });
  }
});

// Обновить проект
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    if (updates.startDate) {
      updates.startDate = new Date(updates.startDate);
    }
    if (updates.endDate) {
      updates.endDate = new Date(updates.endDate);
    }
    
    updates.updatedAt = new Date();

    const project = await Project.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({ error: 'Проект не найден' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при обновлении проекта' });
  }
});

// Обновить прогресс проекта
router.patch('/:id/progress', async (req, res) => {
  try {
    const { id } = req.params;
    const { progress } = req.body;
    
    if (typeof progress !== 'number' || progress < 0 || progress > 100) {
      return res.status(400).json({ error: 'Прогресс должен быть числом от 0 до 100' });
    }

    const project = await Project.findByIdAndUpdate(
      id,
      { progress, updatedAt: new Date() },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({ error: 'Проект не найден' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при обновлении прогресса' });
  }
});

// Изменить статус проекта
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['active', 'completed', 'paused'].includes(status)) {
      return res.status(400).json({ error: 'Неверный статус' });
    }

    const project = await Project.findByIdAndUpdate(
      id,
      { status, updatedAt: new Date() },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({ error: 'Проект не найден' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при обновлении статуса' });
  }
});

// Удалить проект
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findByIdAndDelete(id);

    if (!project) {
      return res.status(404).json({ error: 'Проект не найден' });
    }

    res.json({ message: 'Проект удален' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при удалении проекта' });
  }
});

// Получить статистику по проектам
router.get('/stats', async (req, res) => {
  try {
    const stats = await Project.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgProgress: { $avg: '$progress' }
        }
      }
    ]);

    const formattedStats = {};
    stats.forEach(stat => {
      formattedStats[stat._id] = {
        count: stat.count,
        avgProgress: Math.round(stat.avgProgress || 0)
      };
    });

    res.json(formattedStats);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении статистики' });
  }
});

module.exports = router; 