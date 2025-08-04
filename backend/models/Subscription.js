const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  serviceName: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    enum: ['USD', 'EUR', 'GBP', 'AED'],
    required: true
  },
  renewalDay: {
    type: Number,
    required: true,
    min: 1,
    max: 31
  },
  nextRenewal: {
    type: Date,
    required: false // Will be set automatically by pre-save middleware
  },
  category: {
    type: String,
    enum: [
      'Entertainment & Media',
      'Software & Productivity', 
      'Health & Fitness',
      'Web Services & Hosting',
      'Gaming',
      'Education & Learning',
      'Food & Delivery',
      'Transportation',
      'Finance & Banking',
      'Communication',
      'News & Magazines',
      'Music & Audio',
      'Video & Streaming',
      'Design & Creative',
      'Business & Professional',
      'Security & Privacy',
      'Storage & Cloud',
      'Shopping & Retail',
      'Utilities & Services',
      'Travel & Tourism',
      'Sports & Recreation',
      'Other'
    ],
    default: 'Other'
  },
  description: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  detectedFromEmail: {
    type: Boolean,
    default: false
  },
  // New fields for enhanced tracking
  paymentHistory: [{
    date: Date,
    amount: Number,
    currency: String,
    emailSubject: String,
    confidence: Number
  }],
  cancellationDate: {
    type: Date,
    default: null
  },
  cancellationReason: {
    type: String,
    default: ''
  },
  lastPaymentDate: {
    type: Date,
    default: null
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  confidenceScore: {
    type: Number,
    default: 0
  },
  hasPaymentHistory: {
    type: Boolean,
    default: false
  },
  hasConsistentRenewalDate: {
    type: Boolean,
    default: false
  },
  paymentCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Calculate next renewal date
subscriptionSchema.methods.calculateNextRenewal = function() {
  const now = new Date();
  const nextRenewal = new Date(now.getFullYear(), now.getMonth(), this.renewalDay);
  
  if (nextRenewal <= now) {
    nextRenewal.setMonth(nextRenewal.getMonth() + 1);
  }
  
  // Handle end of month edge cases
  if (nextRenewal.getDate() !== this.renewalDay) {
    nextRenewal.setDate(0); // Set to last day of previous month
  }
  
  return nextRenewal;
};

// Method to add payment record
subscriptionSchema.methods.addPayment = function(paymentData) {
  this.paymentHistory.push({
    date: paymentData.date || new Date(),
    amount: paymentData.amount,
    currency: paymentData.currency || 'USD',
    emailSubject: paymentData.subject || '',
    confidence: paymentData.confidence || 0
  });
  
  this.lastPaymentDate = paymentData.date || new Date();
  this.paymentCount = this.paymentHistory.length;
  
  // Update recurring status if multiple payments
  if (this.paymentCount > 1) {
    this.isRecurring = true;
  }
};

// Method to cancel subscription
subscriptionSchema.methods.cancelSubscription = function(reason = 'User cancelled') {
  this.isActive = false;
  this.cancellationDate = new Date();
  this.cancellationReason = reason;
};

// Method to check if subscription is likely valid based on pattern analysis
subscriptionSchema.methods.isLikelyValid = function() {
  // High confidence if multiple consistent payments
  if (this.paymentCount > 1 && this.isRecurring) {
    return true;
  }
  
  // Medium confidence if single payment but high confidence score
  if (this.paymentCount === 1 && this.confidenceScore >= 6 && this.hasPaymentHistory) {
    return true;
  }
  
  return false;
};

subscriptionSchema.pre('save', function(next) {
  // Always calculate nextRenewal if it's not set or if renewalDay is modified
  if (!this.nextRenewal || this.isModified('renewalDay') || this.isNew) {
    this.nextRenewal = this.calculateNextRenewal();
  }
  
  // Don't calculate next renewal if cancelled
  if (this.cancellationDate) {
    this.nextRenewal = null;
  }
  
  next();
});

// Index for efficient queries
subscriptionSchema.index({ userId: 1, serviceName: 1 });
subscriptionSchema.index({ userId: 1, isActive: 1 });
subscriptionSchema.index({ nextRenewal: 1, isActive: 1 });

module.exports = mongoose.model('Subscription', subscriptionSchema);