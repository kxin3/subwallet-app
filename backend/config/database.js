const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/subwallet';
    console.log('Attempting to connect with URI length:', mongoUri.length);
    console.log('URI starts with:', mongoUri.substring(0, 25) + '...');
    
    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    console.log('MongoDB URI that failed:', process.env.MONGODB_URI ? 'URI provided but invalid' : 'No URI provided');
    console.log('Server will continue without database connection for health checks');
    // Don't exit the process in production to allow health checks to work
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  }
};

module.exports = connectDB;