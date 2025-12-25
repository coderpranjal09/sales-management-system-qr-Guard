const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const orderRoutes = require('./routes/orders');

const app = express();

/* ===========================
   Database Connection (Safe)
=========================== */
connectDB();

/* ===========================
   CORS Configuration
=========================== */
const allowedOrigins = [
  'http://localhost:5173',
  'https://qrguardsales.netlify.app'
].filter(Boolean);


app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

/* ===========================
   Security & Parsers
=========================== */
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/* ===========================
   Logger
=========================== */
app.use(morgan('dev'));

/* ===========================
   API Routes
=========================== */
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);

/* ===========================
   Health Check
=========================== */
app.get('/health', (req, res) => {
  const mongoose = require('mongoose');
  const statusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  res.json({
    success: true,
    status: 'OK',
    database: statusMap[mongoose.connection.readyState] || 'unknown',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

/* ===========================
   API Info
=========================== */
app.get('/api', (req, res) => {
  res.json({
    name: 'QR Guard Technologies API',
    version: '1.0.0',
    description: 'Salesman & Order Management Portal',
    company: 'CYSTAS DEVSOFT PRIVATE LIMITED'
  });
});

/* ===========================
   404 for API
=========================== */
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'API endpoint not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

/* ===========================
   Global Error Handler
=========================== */
app.use((err, req, res, next) => {
  console.error('Error:', err.message);

  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      error: 'CORS Error',
      message: 'Cross-origin request blocked'
    });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: err.message
    });
  }

  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      error: 'Duplicate Entry',
      message: 'Record already exists'
    });
  }

  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: 'Something went wrong'
  });
});

/* ===========================
   EXPORT (Vercel needs this)
=========================== */
module.exports = app;
