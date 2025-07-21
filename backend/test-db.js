require('dotenv').config();
const mongoose = require('mongoose');

console.log('Testing database connection...');
console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/subwallet', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Database connected successfully');
  process.exit(0);
})
.catch((error) => {
  console.error('❌ Database connection failed:', error.message);
  process.exit(1);
});

// Timeout after 10 seconds
setTimeout(() => {
  console.log('⏰ Connection timeout');
  process.exit(1);
}, 10000);