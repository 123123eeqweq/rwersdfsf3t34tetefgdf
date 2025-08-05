const express = require('express');
const router = express.Router();

// Простая проверка пароля (в реальном проекте лучше использовать хеширование)
const correctPassword = process.env.APP_PASSWORD || '1221';

// Эндпоинт для проверки пароля
router.post('/login', async (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Пароль обязателен' 
      });
    }

    if (password === correctPassword) {
      res.json({ 
        success: true, 
        message: 'Авторизация успешна' 
      });
    } else {
      res.status(401).json({ 
        success: false, 
        error: 'Неверный пароль' 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Ошибка сервера' 
    });
  }
});

module.exports = router; 