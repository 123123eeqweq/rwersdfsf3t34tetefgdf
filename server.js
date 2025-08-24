const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());

// CORS configuration - разрешаем только твой Vercel домен
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['https://fydgfsdgfhgsdhfghrgjhtghfgsfsdfhsgd.vercel.app', 'http://localhost:3000'];

const corsOptions = {
  origin: function (origin, callback) {
    // Разрешаем запросы без origin (например, Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/27app', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Import auth middleware
const authMiddleware = require('./middleware/auth');

// Routes
const authRoutes = require('./routes/auth');
const financeRoutes = require('./routes/finance');
const habitsRoutes = require('./routes/habits');
const ideasRoutes = require('./routes/ideas');
const progress1402Routes = require('./routes/progress1402');
const projectsRoutes = require('./routes/projects');
const sportRoutes = require('./routes/sport');
const tasksRoutes = require('./routes/tasks');
const teamRoutes = require('./routes/team');
const roadmapRoutes = require('./routes/roadmap');

app.use('/api/auth', authRoutes);
app.use('/api/tasks', authMiddleware, tasksRoutes);
app.use('/api/habits', authMiddleware, habitsRoutes);
app.use('/api/finance', authMiddleware, financeRoutes);
app.use('/api/projects', authMiddleware, projectsRoutes);
app.use('/api/sport', authMiddleware, sportRoutes);
app.use('/api/ideas', authMiddleware, ideasRoutes);
app.use('/api/team', authMiddleware, teamRoutes);
app.use('/api/roadmap', roadmapRoutes);
app.use('/api/progress1402', progress1402Routes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: '27app API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 