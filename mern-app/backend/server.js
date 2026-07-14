const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serverless MongoDB Connection Cache
let isConnected;
const connectToDatabase = async () => {
  if (isConnected) return Promise.resolve();
  const db = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/chess7knight');
  isConnected = db.connections[0].readyState;
};

// Database Middleware
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (err) {
    console.error('Database connection error:', err);
    res.status(500).json({ msg: 'Database connection failed' });
  }
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/matches', require('./routes/matches'));

// Basic route
app.get('/api', (req, res) => {
  res.send('Chess7Knight API is running');
});

// Vercel requires exporting the app instead of just listening to a port
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
