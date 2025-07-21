import { format, differenceInDays } from 'date-fns';

export const formatDate = (date) => {
  return format(new Date(date), 'MMM dd, yyyy');
};

export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const getDaysUntilRenewal = (renewalDate) => {
  return differenceInDays(new Date(renewalDate), new Date());
};

export const getUrgencyLevel = (daysUntilRenewal) => {
  if (daysUntilRenewal < 0) return 'overdue';
  if (daysUntilRenewal <= 3) return 'critical';
  if (daysUntilRenewal <= 7) return 'warning';
  return 'normal';
};

export const generateInitials = (name) => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 6;
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const calculateNextRenewal = (renewalDay) => {
  const now = new Date();
  const nextRenewal = new Date(now.getFullYear(), now.getMonth(), renewalDay);
  
  if (nextRenewal <= now) {
    nextRenewal.setMonth(nextRenewal.getMonth() + 1);
  }
  
  if (nextRenewal.getDate() !== renewalDay) {
    nextRenewal.setDate(0);
  }
  
  return nextRenewal;
};

export const formatRelativeTime = (date) => {
  const now = new Date();
  const targetDate = new Date(date);
  const diffInMs = targetDate - now;
  const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays < 0) {
    return `${Math.abs(diffInDays)} days ago`;
  } else if (diffInDays === 0) {
    return 'Today';
  } else if (diffInDays === 1) {
    return 'Tomorrow';
  } else {
    return `In ${diffInDays} days`;
  }
};