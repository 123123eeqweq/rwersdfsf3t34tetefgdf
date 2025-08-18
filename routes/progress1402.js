const express = require('express');
const router = express.Router();
const Progress1402 = require('../models/Progress1402');

// Получить прогресс пользователя
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    let progress = await Progress1402.findOne({ userId });
    
    if (!progress) {
      // Создаем новый прогресс для пользователя
      progress = new Progress1402({
        userId,
        completedDays: [],
        targetDate: new Date('2026-02-14T00:00:00')
      });
      await progress.save();
    }
    
    res.json({
      success: true,
      data: progress
    });
  } catch (error) {
    console.error('Ошибка при получении прогресса:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при получении прогресса'
    });
  }
});

// Добавить завершенный день
router.post('/:userId/complete-day', async (req, res) => {
  try {
    const { userId } = req.params;
    const { dateString } = req.body;
    
    if (!dateString) {
      return res.status(400).json({
        success: false,
        message: 'Дата обязательна'
      });
    }
    
    let progress = await Progress1402.findOne({ userId });
    
    if (!progress) {
      progress = new Progress1402({
        userId,
        completedDays: [dateString],
        targetDate: new Date('2026-02-14T00:00:00')
      });
    } else {
      // Проверяем, не добавлен ли уже этот день
      if (!progress.completedDays.includes(dateString)) {
        progress.completedDays.push(dateString);
      }
    }
    
    await progress.save();
    
    res.json({
      success: true,
      data: progress,
      message: 'День успешно отмечен как завершенный'
    });
  } catch (error) {
    console.error('Ошибка при добавлении завершенного дня:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при добавлении дня'
    });
  }
});

// Убрать завершенный день
router.delete('/:userId/complete-day', async (req, res) => {
  try {
    const { userId } = req.params;
    const { dateString } = req.body;
    
    if (!dateString) {
      return res.status(400).json({
        success: false,
        message: 'Дата обязательна'
      });
    }
    
    const progress = await Progress1402.findOne({ userId });
    
    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Прогресс не найден'
      });
    }
    
    progress.completedDays = progress.completedDays.filter(date => date !== dateString);
    await progress.save();
    
    res.json({
      success: true,
      data: progress,
      message: 'День успешно убран из завершенных'
    });
  } catch (error) {
    console.error('Ошибка при удалении завершенного дня:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при удалении дня'
    });
  }
});

// Сбросить весь прогресс
router.delete('/:userId/reset', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const progress = await Progress1402.findOne({ userId });
    
    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Прогресс не найден'
      });
    }
    
    progress.completedDays = [];
    await progress.save();
    
    res.json({
      success: true,
      data: progress,
      message: 'Прогресс успешно сброшен'
    });
  } catch (error) {
    console.error('Ошибка при сбросе прогресса:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при сбросе прогресса'
    });
  }
});

module.exports = router;
