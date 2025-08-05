const express = require('express');
const router = express.Router();
const Team = require('../models/Team');

// Получить всех участников команды
router.get('/', async (req, res) => {
  try {
    const members = await Team.find().sort({ createdAt: -1 });
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении участников команды' });
  }
});

// Получить участников по отделу
router.get('/department/:department', async (req, res) => {
  try {
    const { department } = req.params;
    const members = await Team.find({ department }).sort({ createdAt: -1 });
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении участников команды' });
  }
});

// Получить участников по статусу
router.get('/status/:status', async (req, res) => {
  try {
    const { status } = req.params;
    const members = await Team.find({ status }).sort({ createdAt: -1 });
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении участников команды' });
  }
});

// Создать нового участника
router.post('/', async (req, res) => {
  try {
    const { name, role, email, phone, department, skills, notes, image } = req.body;
    
    if (!name || !role) {
      return res.status(400).json({ error: 'Имя и роль обязательны' });
    }

    const member = new Team({
      name,
      role,
      email,
      phone,
      department: department || 'other',
      skills: skills || [],
      notes,
      image
    });

    const savedMember = await member.save();
    res.status(201).json(savedMember);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при создании участника команды' });
  }
});

// Обновить участника
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    updates.updatedAt = new Date();

    const member = await Team.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!member) {
      return res.status(404).json({ error: 'Участник команды не найден' });
    }

    res.json(member);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при обновлении участника команды' });
  }
});

// Изменить статус участника
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['active', 'inactive', 'former'].includes(status)) {
      return res.status(400).json({ error: 'Неверный статус' });
    }

    const member = await Team.findByIdAndUpdate(
      id,
      { status, updatedAt: new Date() },
      { new: true }
    );

    if (!member) {
      return res.status(404).json({ error: 'Участник команды не найден' });
    }

    res.json(member);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при обновлении статуса' });
  }
});

// Обновить навыки участника
router.patch('/:id/skills', async (req, res) => {
  try {
    const { id } = req.params;
    const { skills } = req.body;
    
    if (!Array.isArray(skills)) {
      return res.status(400).json({ error: 'Навыки должны быть массивом' });
    }

    const member = await Team.findByIdAndUpdate(
      id,
      { skills, updatedAt: new Date() },
      { new: true }
    );

    if (!member) {
      return res.status(404).json({ error: 'Участник команды не найден' });
    }

    res.json(member);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при обновлении навыков' });
  }
});

// Удалить участника
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const member = await Team.findByIdAndDelete(id);

    if (!member) {
      return res.status(404).json({ error: 'Участник команды не найден' });
    }

    res.json({ message: 'Участник команды удален' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при удалении участника команды' });
  }
});

// Получить статистику по команде
router.get('/stats', async (req, res) => {
  try {
    const stats = await Team.aggregate([
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 },
          activeCount: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          }
        }
      }
    ]);

    const formattedStats = {};
    stats.forEach(stat => {
      formattedStats[stat._id] = {
        total: stat.count,
        active: stat.activeCount,
        inactive: stat.count - stat.activeCount
      };
    });

    res.json(formattedStats);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении статистики' });
  }
});

// Поиск участников по навыкам
router.get('/search/skills', async (req, res) => {
  try {
    const { skills } = req.query;
    
    if (!skills) {
      return res.status(400).json({ error: 'Необходимо указать навыки для поиска' });
    }

    const skillArray = skills.split(',').map(skill => skill.trim());
    const members = await Team.find({
      skills: { $in: skillArray }
    }).sort({ createdAt: -1 });

    res.json(members);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при поиске участников' });
  }
});

// Получить всех активных участников
router.get('/active', async (req, res) => {
  try {
    const activeMembers = await Team.find({ status: 'active' }).sort({ createdAt: -1 });
    res.json(activeMembers);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении активных участников' });
  }
});

module.exports = router; 