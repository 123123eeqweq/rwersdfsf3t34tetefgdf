const express = require('express');
const router = express.Router();
const Roadmap = require('../models/Roadmap');

// Получить роадмап пользователя
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    let roadmap = await Roadmap.findOne({ userId });
    
    // Если роадмапа нет - создаем с дефолтными шагами
    if (!roadmap) {
      const defaultSteps = [
        { stepNumber: 1, id: 1, title: 'Сделать действие А', completed: false },
        { stepNumber: 2, id: 2, title: 'Сделать действие Б', completed: false },
        { stepNumber: 3, id: 3, title: 'Сделать действие В', completed: false },
        { stepNumber: 4, id: 4, title: 'Сделать действие Г', completed: false },
        { stepNumber: 5, id: 5, title: 'Сделать действие Д', completed: false }
      ];
      
      roadmap = new Roadmap({
        userId,
        steps: defaultSteps
      });
      await roadmap.save();
    }
    
    res.json(roadmap);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
});

// Обновить шаг роадмапа
router.put('/:userId/step/:stepId', async (req, res) => {
  try {
    const { userId, stepId } = req.params;
    const { title, completed } = req.body;
    
    const roadmap = await Roadmap.findOne({ userId });
    if (!roadmap) {
      return res.status(404).json({ message: 'Роадмап не найден' });
    }
    
    const step = roadmap.steps.find(s => s.id === parseInt(stepId));
    if (!step) {
      return res.status(404).json({ message: 'Шаг не найден' });
    }
    
    // Обновляем шаг
    if (title !== undefined) step.title = title;
    if (completed !== undefined) {
      step.completed = completed;
      step.completedAt = completed ? new Date() : null;
    }
    
    await roadmap.save();
    res.json(roadmap);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
});

// Создать новый роадмап
router.post('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { steps } = req.body;
    
    // Проверяем, есть ли уже роадмап
    let roadmap = await Roadmap.findOne({ userId });
    
    if (roadmap) {
      // Обновляем существующий
      roadmap.steps = steps;
    } else {
      // Создаем новый
      roadmap = new Roadmap({
        userId,
        steps: steps || [
          { stepNumber: 1, id: 1, title: 'Сделать действие А', completed: false },
          { stepNumber: 2, id: 2, title: 'Сделать действие Б', completed: false },
          { stepNumber: 3, id: 3, title: 'Сделать действие В', completed: false },
          { stepNumber: 4, id: 4, title: 'Сделать действие Г', completed: false },
          { stepNumber: 5, id: 5, title: 'Сделать действие Д', completed: false }
        ]
      });
    }
    
    await roadmap.save();
    res.json(roadmap);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
});

module.exports = router;
