const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
require('dotenv').config();
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
if (process.env.MONGODB_URI) {
  connectDB();
} else {
  console.log('MongoDB connection skipped: MONGODB_URI not specified in environment');
}

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Base route
app.get('/', (req, res) => {
  res.json({ message: 'WhatsMail-Notify API is running...' });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Placeholder route integration
app.use('/api/auth', (req, res) => {
  res.json({ message: 'Auth routes placeholder' });
});

app.use('/api/notifications', (req, res) => {
  res.json({ message: 'Notification routes placeholder' });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
