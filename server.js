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
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', authMiddleware, require('./routes/tasks'));
app.use('/api/habits', authMiddleware, require('./routes/habits'));
app.use('/api/finance', authMiddleware, require('./routes/finance'));
app.use('/api/projects', authMiddleware, require('./routes/projects'));
app.use('/api/sport', authMiddleware, require('./routes/sport'));
app.use('/api/ideas', authMiddleware, require('./routes/ideas'));
app.use('/api/team', authMiddleware, require('./routes/team'));
app.use('/api/progress1402', require('./routes/progress1402'));

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