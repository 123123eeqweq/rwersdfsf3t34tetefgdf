const express = require('express');
const router = express.Router();
const Idea = require('../models/Idea');

// Получить все идеи
router.get('/', async (req, res) => {
  try {
    const ideas = await Idea.find().sort({ createdAt: -1 });
    res.json(ideas);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении идей' });
  }
});

// Получить идеи по категории
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const ideas = await Idea.find({ category }).sort({ createdAt: -1 });
    res.json(ideas);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении идей' });
  }
});

// Получить идеи по статусу
router.get('/status/:status', async (req, res) => {
  try {
    const { status } = req.params;
    const ideas = await Idea.find({ status }).sort({ createdAt: -1 });
    res.json(ideas);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении идей' });
  }
});

// Создать новую идею
router.post('/', async (req, res) => {
  try {
    const { title, description, category, priority, tags } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Название идеи обязательно' });
    }

    const idea = new Idea({
      title,
      description,
      category: category || 'other',
      priority: priority || 'medium',
      tags: tags || []
    });

    const savedIdea = await idea.save();
    res.status(201).json(savedIdea);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при создании идеи' });
  }
});

// Обновить идею
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    updates.updatedAt = new Date();

    const idea = await Idea.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!idea) {
      return res.status(404).json({ error: 'Идея не найдена' });
    }

    res.json(idea);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при обновлении идеи' });
  }
});

// Изменить статус идеи
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['new', 'in-progress', 'completed', 'archived'].includes(status)) {
      return res.status(400).json({ error: 'Неверный статус' });
    }

    const idea = await Idea.findByIdAndUpdate(
      id,
      { status, updatedAt: new Date() },
      { new: true }
    );

    if (!idea) {
      return res.status(404).json({ error: 'Идея не найдена' });
    }

    res.json(idea);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при обновлении статуса' });
  }
});

// Изменить приоритет идеи
router.patch('/:id/priority', async (req, res) => {
  try {
    const { id } = req.params;
    const { priority } = req.body;
    
    if (!['low', 'medium', 'high'].includes(priority)) {
      return res.status(400).json({ error: 'Неверный приоритет' });
    }

    const idea = await Idea.findByIdAndUpdate(
      id,
      { priority, updatedAt: new Date() },
      { new: true }
    );

    if (!idea) {
      return res.status(404).json({ error: 'Идея не найдена' });
    }

    res.json(idea);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при обновлении приоритета' });
  }
});

// Добавить теги к идее
router.patch('/:id/tags', async (req, res) => {
  try {
    const { id } = req.params;
    const { tags } = req.body;
    
    if (!Array.isArray(tags)) {
      return res.status(400).json({ error: 'Теги должны быть массивом' });
    }

    const idea = await Idea.findByIdAndUpdate(
      id,
      { tags, updatedAt: new Date() },
      { new: true }
    );

    if (!idea) {
      return res.status(404).json({ error: 'Идея не найдена' });
    }

    res.json(idea);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при обновлении тегов' });
  }
});

// Удалить идею
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const idea = await Idea.findByIdAndDelete(id);

    if (!idea) {
      return res.status(404).json({ error: 'Идея не найдена' });
    }

    res.json({ message: 'Идея удалена' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при удалении идеи' });
  }
});

// Получить статистику по идеям
router.get('/stats', async (req, res) => {
  try {
    const stats = await Idea.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const formattedStats = {};
    stats.forEach(stat => {
      formattedStats[stat._id] = {
        count: stat.count
      };
    });

    res.json(formattedStats);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении статистики' });
  }
});

// Поиск идей по тегам
router.get('/search/tags', async (req, res) => {
  try {
    const { tags } = req.query;
    
    if (!tags) {
      return res.status(400).json({ error: 'Необходимо указать теги для поиска' });
    }

    const tagArray = tags.split(',').map(tag => tag.trim());
    const ideas = await Idea.find({
      tags: { $in: tagArray }
    }).sort({ createdAt: -1 });

    res.json(ideas);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при поиске идей' });
  }
});

module.exports = router; 