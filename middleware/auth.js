const authMiddleware = (req, res, next) => {
  // Получаем пароль из заголовка или тела запроса
  const authPassword = req.headers['x-api-key'] || req.body.password || req.query.password;
  
  if (!authPassword) {
    return res.status(401).json({ 
      success: false, 
      error: 'Требуется аутентификация' 
    });
  }

  const correctPassword = process.env.APP_PASSWORD || '1221';
  
  if (authPassword !== correctPassword) {
    return res.status(401).json({ 
      success: false, 
      error: 'Неверный пароль' 
    });
  }

  next();
};

module.exports = authMiddleware; 