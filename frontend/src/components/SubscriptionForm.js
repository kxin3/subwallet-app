// frontend/src/components/SubscriptionForm.js - Clean and simple modal
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { createSubscription, updateSubscription } from '../utils/api';
import { getFormCategories } from '../utils/categories';

const SubscriptionForm = ({ subscription, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    serviceName: '',
    amount: '',
    currency: 'USD',
    renewalDay: 1,
    category: 'Other',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Handle ESC key
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [onClose]);

  // Initialize form data
  useEffect(() => {
    if (subscription) {
      setFormData({
        serviceName: subscription.serviceName || '',
        amount: subscription.amount || '',
        currency: subscription.currency || 'USD',
        renewalDay: subscription.renewalDay || 1,
        category: subscription.category || 'Other',
        description: subscription.description || ''
      });
    }
  }, [subscription]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.serviceName.trim()) {
      newErrors.serviceName = 'Service name is required';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!formData.renewalDay || formData.renewalDay < 1 || formData.renewalDay > 31) {
      newErrors.renewalDay = 'Renewal day must be between 1 and 31';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);

    try {
      const data = {
        serviceName: formData.serviceName.trim(),
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        renewalDay: parseInt(formData.renewalDay),
        category: formData.category,
        description: formData.description.trim()
      };

      if (subscription) {
        await updateSubscription(subscription._id, data);
        toast.success('Subscription updated successfully!');
      } else {
        await createSubscription(data);
        toast.success('Subscription added successfully!');
      }

      // Close and trigger success
      onSuccess();

    } catch (error) {
      console.error('Subscription error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save subscription';
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  const categories = getFormCategories();
  const currencies = ['USD', 'EUR', 'GBP', 'AED'];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className="relative w-full max-w-md transform overflow-hidden rounded-lg bg-white shadow-xl transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {subscription ? 'Edit Subscription' : 'Add New Subscription'}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>

          {/* Form Content */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            <form id="subscription-form" onSubmit={handleSubmit} className="space-y-4">
              {/* Service Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Name *
                </label>
                <input
                  type="text"
                  name="serviceName"
                  required
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.serviceName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Netflix, Spotify"
                  value={formData.serviceName}
                  onChange={handleChange}
                />
                {errors.serviceName && (
                  <p className="text-red-600 text-sm mt-1">{errors.serviceName}</p>
                )}
              </div>

              {/* Amount and Currency */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount *
                  </label>
                  <input
                    type="number"
                    name="amount"
                    required
                    min="0"
                    step="0.01"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.amount ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="9.99"
                    value={formData.amount}
                    onChange={handleChange}
                  />
                  {errors.amount && (
                    <p className="text-red-600 text-sm mt-1">{errors.amount}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Currency
                  </label>
                  <select
                    name="currency"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.currency}
                    onChange={handleChange}
                  >
                    {currencies.map(currency => (
                      <option key={currency} value={currency}>
                        {currency}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Renewal Day */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Renewal Day (1-31) *
                </label>
                <input
                  type="number"
                  name="renewalDay"
                  required
                  min="1"
                  max="31"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.renewalDay ? 'border-red-500' : 'border-gray-300'
                  }`}
                  value={formData.renewalDay}
                  onChange={handleChange}
                />
                {errors.renewalDay && (
                  <p className="text-red-600 text-sm mt-1">{errors.renewalDay}</p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  name="category"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.category}
                  onChange={handleChange}
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  name="description"
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Additional notes..."
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="subscription-form"
              disabled={loading}
              className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {subscription ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                subscription ? 'Update' : 'Add'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionForm;