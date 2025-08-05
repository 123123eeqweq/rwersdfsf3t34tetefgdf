const express = require('express');
const router = express.Router();
const Finance = require('../models/Finance');

// Получить финансовые данные
router.get('/', async (req, res) => {
  try {
    let financeData = await Finance.findOne();
    
    if (!financeData) {
      // Создаем начальные данные, если их нет
      financeData = new Finance({
        totalCapital: 0,
        monthlyGoal: 5000,
        monthlyEarned: 0,
        monthlyExpenses: [],
        monthlyIncome: []
      });
      await financeData.save();
    }
    
    res.json(financeData);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении финансовых данных' });
  }
});

// Обновить общий капитал
router.patch('/capital', async (req, res) => {
  try {
    const { totalCapital } = req.body;
    
    if (typeof totalCapital !== 'number') {
      return res.status(400).json({ error: 'Капитал должен быть числом' });
    }

    let financeData = await Finance.findOne();
    if (!financeData) {
      financeData = new Finance();
    }
    
    financeData.totalCapital = totalCapital;
    financeData.updatedAt = new Date();
    await financeData.save();
    
    res.json(financeData);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при обновлении капитала' });
  }
});

// Обновить месячную цель
router.patch('/goal', async (req, res) => {
  try {
    const { monthlyGoal } = req.body;
    
    if (typeof monthlyGoal !== 'number') {
      return res.status(400).json({ error: 'Цель должна быть числом' });
    }

    let financeData = await Finance.findOne();
    if (!financeData) {
      financeData = new Finance();
    }
    
    financeData.monthlyGoal = monthlyGoal;
    financeData.updatedAt = new Date();
    await financeData.save();
    
    res.json(financeData);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при обновлении цели' });
  }
});

// Добавить доход
router.post('/income', async (req, res) => {
  try {
    const { amount, description } = req.body;
    
    if (!amount || !description) {
      return res.status(400).json({ error: 'Сумма и описание обязательны' });
    }

    let financeData = await Finance.findOne();
    if (!financeData) {
      financeData = new Finance();
    }
    
    const income = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      amount: parseFloat(amount),
      description,
      date: new Date()
    };
    
    financeData.monthlyIncome.push(income);
    financeData.totalCapital += income.amount;
    financeData.monthlyEarned += income.amount;
    financeData.updatedAt = new Date();
    await financeData.save();
    
    res.status(201).json(financeData);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при добавлении дохода' });
  }
});

// Добавить расход
router.post('/expense', async (req, res) => {
  try {
    const { amount, description } = req.body;
    
    if (!amount || !description) {
      return res.status(400).json({ error: 'Сумма и описание обязательны' });
    }

    let financeData = await Finance.findOne();
    if (!financeData) {
      financeData = new Finance();
    }
    
    const expense = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      amount: parseFloat(amount),
      description,
      date: new Date()
    };
    
    financeData.monthlyExpenses.push(expense);
    financeData.totalCapital -= expense.amount;
    financeData.updatedAt = new Date();
    await financeData.save();
    
    res.status(201).json(financeData);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при добавлении расхода' });
  }
});

// Удалить доход
router.delete('/income/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    let financeData = await Finance.findOne();
    if (!financeData) {
      return res.status(404).json({ error: 'Финансовые данные не найдены' });
    }
    
    const income = financeData.monthlyIncome.find(i => i.id === id);
    if (!income) {
      return res.status(404).json({ error: 'Доход не найден' });
    }
    
    financeData.monthlyIncome = financeData.monthlyIncome.filter(i => i.id !== id);
    financeData.totalCapital -= income.amount;
    financeData.monthlyEarned -= income.amount;
    financeData.updatedAt = new Date();
    await financeData.save();
    
    res.json(financeData);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при удалении дохода' });
  }
});

// Удалить расход
router.delete('/expense/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    let financeData = await Finance.findOne();
    if (!financeData) {
      return res.status(404).json({ error: 'Финансовые данные не найдены' });
    }
    
    const expense = financeData.monthlyExpenses.find(e => e.id === id);
    if (!expense) {
      return res.status(404).json({ error: 'Расход не найден' });
    }
    
    financeData.monthlyExpenses = financeData.monthlyExpenses.filter(e => e.id !== id);
    financeData.totalCapital += expense.amount;
    financeData.updatedAt = new Date();
    await financeData.save();
    
    res.json(financeData);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при удалении расхода' });
  }
});

// Удалить все доходы
router.delete('/income', async (req, res) => {
  try {
    let financeData = await Finance.findOne();
    if (!financeData) {
      return res.status(404).json({ error: 'Финансовые данные не найдены' });
    }
    
    const totalIncome = financeData.monthlyIncome.reduce((sum, income) => sum + income.amount, 0);
    financeData.monthlyIncome = [];
    financeData.totalCapital -= totalIncome;
    financeData.monthlyEarned -= totalIncome;
    financeData.updatedAt = new Date();
    await financeData.save();
    
    res.json(financeData);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при удалении доходов' });
  }
});

// Удалить все расходы
router.delete('/expense', async (req, res) => {
  try {
    let financeData = await Finance.findOne();
    if (!financeData) {
      return res.status(404).json({ error: 'Финансовые данные не найдены' });
    }
    
    const totalExpenses = financeData.monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    financeData.monthlyExpenses = [];
    financeData.totalCapital += totalExpenses;
    financeData.updatedAt = new Date();
    await financeData.save();
    
    res.json(financeData);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при удалении расходов' });
  }
});

// Получить статистику
router.get('/stats', async (req, res) => {
  try {
    let financeData = await Finance.findOne();
    if (!financeData) {
      return res.json({
        totalIncome: 0,
        totalExpenses: 0,
        goalProgress: 0,
        topIncomeCategories: [],
        topExpenseCategories: []
      });
    }
    
    // Топ категорий доходов
    const incomeCategories = {};
    financeData.monthlyIncome.forEach(income => {
      const category = income.description.toLowerCase();
      incomeCategories[category] = (incomeCategories[category] || 0) + income.amount;
    });
    
    const topIncomeCategories = Object.entries(incomeCategories)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
    
    // Топ категорий расходов
    const expenseCategories = {};
    financeData.monthlyExpenses.forEach(expense => {
      const category = expense.description.toLowerCase();
      expenseCategories[category] = (expenseCategories[category] || 0) + expense.amount;
    });
    
    const topExpenseCategories = Object.entries(expenseCategories)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
    
    const totalIncome = financeData.monthlyIncome.reduce((sum, income) => sum + income.amount, 0);
    const totalExpenses = financeData.monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const goalProgress = financeData.monthlyGoal > 0 ? (financeData.monthlyEarned / financeData.monthlyGoal) * 100 : 0;
    
    res.json({
      totalIncome,
      totalExpenses,
      goalProgress: Math.min(goalProgress, 100),
      topIncomeCategories,
      topExpenseCategories
    });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении статистики' });
  }
});

module.exports = router; 