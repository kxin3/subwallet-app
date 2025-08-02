const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');
const subscriptionRoutes = require('./routes/subscriptions');
const gmailRoutes = require('./routes/gmail');

const app = express();

console.log('🚀 Starting SubWallet server...');
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('Port:', process.env.PORT || 5000);

// Connect to MongoDB
console.log('Connecting to database...');
console.log('MongoDB URI provided:', process.env.MONGODB_URI ? 'Yes' : 'No');
connectDB().then(() => {
  console.log('Database connection established');
}).catch(err => {
  console.error('Database connection failed:', err);
  console.log('Server will continue without database connection');
});

// Security middleware
console.log('Setting up middleware...');
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting - more permissive for development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // increased limit for development
  skip: (req) => req.ip === '127.0.0.1' || req.ip === '::1' // skip rate limiting for localhost
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Debug middleware - log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (req.path.includes('/gmail/accounts/') && req.path.includes('/scan')) {
    console.log('🔍 SCAN REQUEST DETECTED:', {
      method: req.method,
      path: req.path,
      params: req.params,
      headers: req.headers.authorization ? 'Bearer token present' : 'No auth token'
    });
  }
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/gmail', gmailRoutes);

// Health check endpoints
app.get('/health', (req, res) => {
  console.log('✅ Health check accessed at /health');
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/api/health', (req, res) => {
  console.log('✅ Health check accessed at /api/health');
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve static files from React build
app.use(express.static(path.join(__dirname, 'public')));

// Catch-all handler: send back React's index.html file for any non-API routes
app.get('*', (req, res) => {
  // Skip API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ message: 'API route not found' });
  }
  
  console.log('🌐 Serving React app for route:', req.path);
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});


const PORT = process.env.PORT || 5000;
console.log(`Attempting to start server on port ${PORT}...`);

const server = app.listen(PORT, () => {
  console.log(`✅ Server successfully running on port ${PORT}`);
  console.log(`🌐 API available at http://localhost:${PORT}`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});

server.on('error', (err) => {
  console.error('❌ Server failed to start:', err);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});