const express = require('express');
const Subscription = require('../models/Subscription');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all subscriptions for user
router.get('/', auth, async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ 
      userId: req.user._id,
      isActive: true 
    }).sort({ nextRenewal: 1 });

    res.json({ subscriptions });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch subscriptions' });
  }
});

// Get subscription statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ 
      userId: req.user._id,
      isActive: true 
    });

    const totalMonthly = subscriptions.reduce((sum, sub) => {
      // Convert to user's preferred currency (simplified)
      return sum + sub.amount;
    }, 0);

    const activeCount = subscriptions.length;
    
    // Get upcoming renewals (next 30 days)
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    const upcomingRenewals = subscriptions.filter(sub => 
      sub.nextRenewal <= thirtyDaysFromNow
    ).length;

    res.json({
      totalMonthly: totalMonthly.toFixed(2),
      activeCount,
      upcomingRenewals
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch statistics' });
  }
});

// Get upcoming renewals
router.get('/upcoming', auth, async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ 
      userId: req.user._id,
      isActive: true 
    }).sort({ nextRenewal: 1 }).limit(5);

    const upcomingRenewals = subscriptions.map(sub => {
      const now = new Date();
      const daysUntilRenewal = Math.ceil((sub.nextRenewal - now) / (1000 * 60 * 60 * 24));
      
      let urgency = 'normal';
      if (daysUntilRenewal <= 3) urgency = 'critical';
      else if (daysUntilRenewal <= 7) urgency = 'warning';

      return {
        ...sub.toObject(),
        daysUntilRenewal,
        urgency
      };
    });

    res.json({ upcomingRenewals });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch upcoming renewals' });
  }
});

// Create new subscription
router.post('/', auth, async (req, res) => {
  try {
    const { serviceName, amount, currency, renewalDay, category, description } = req.body;

    console.log('Creating subscription for user:', req.user._id);
    console.log('Subscription data:', { serviceName, amount, currency, renewalDay, category, description });

    // Validate required fields
    if (!serviceName || !amount || !currency || !renewalDay) {
      return res.status(400).json({ 
        message: 'Missing required fields: serviceName, amount, currency, renewalDay' 
      });
    }

    const subscription = new Subscription({
      userId: req.user._id,
      serviceName,
      amount: parseFloat(amount),
      currency,
      renewalDay: parseInt(renewalDay),
      category: category || 'Other',
      description: description || ''
    });

    await subscription.save();
    console.log('Subscription created successfully:', subscription._id);
    res.status(201).json({ subscription });
  } catch (error) {
    console.error('Subscription creation error:', error);
    res.status(500).json({ message: 'Failed to create subscription', error: error.message });
  }
});

// Update subscription
router.put('/:id', auth, async (req, res) => {
  try {
    const { serviceName, amount, currency, renewalDay, category, description } = req.body;

    const subscription = await Subscription.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { serviceName, amount, currency, renewalDay, category, description },
      { new: true }
    );

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    res.json({ subscription });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update subscription' });
  }
});

// Delete subscription
router.delete('/:id', auth, async (req, res) => {
  try {
    const subscription = await Subscription.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isActive: false },
      { new: true }
    );

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    res.json({ message: 'Subscription deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete subscription' });
  }
});

module.exports = router;