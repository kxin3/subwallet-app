const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  avatar: {
    type: String,
    default: ''
  },
  gmailAccounts: [{
    email: {
      type: String,
      required: true
    },
    accessToken: {
      type: String,
      required: true
    },
    refreshToken: {
      type: String,
      required: true
    },
    isConnected: {
      type: Boolean,
      default: true
    },
    lastScanDate: {
      type: Date,
      default: null
    },
    connectedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Legacy fields for backward compatibility
  gmailAccessToken: {
    type: String,
    default: ''
  },
  gmailRefreshToken: {
    type: String,
    default: ''
  },
  isGmailConnected: {
    type: Boolean,
    default: false
  },
  preferences: {
    currency: {
      type: String,
      enum: ['USD', 'EUR', 'GBP', 'AED'],
      default: 'USD'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      renewalReminders: {
        type: Boolean,
        default: true
      },
      weeklyReports: {
        type: Boolean,
        default: false
      }
    },
    privacy: {
      shareUsageData: {
        type: Boolean,
        default: false
      },
      marketingEmails: {
        type: Boolean,
        default: false
      }
    },
    display: {
      theme: {
        type: String,
        enum: ['light', 'dark'],
        default: 'light'
      },
      dateFormat: {
        type: String,
        enum: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'],
        default: 'MM/DD/YYYY'
      },
      compactView: {
        type: Boolean,
        default: false
      }
    }
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);