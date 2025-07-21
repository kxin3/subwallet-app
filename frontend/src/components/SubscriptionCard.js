// frontend/src/components/SubscriptionCard.js - Enhanced subscription card with currency conversion
import React, { useState } from 'react';
import { Edit2, Trash2, Calendar, DollarSign, Bot, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { deleteSubscription } from '../utils/api';
import { formatCurrency } from '../utils/currency';

const SubscriptionCard = ({ subscription, onEdit, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${subscription.serviceName}?`)) {
      try {
        setIsDeleting(true);
        await deleteSubscription(subscription._id);
        toast.success(`${subscription.serviceName} deleted`);
        onDelete(); // Refresh the list
      } catch (error) {
        console.error('Delete error:', error);
        toast.error('Failed to delete subscription');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const formatNextRenewal = (date) => {
    const renewalDate = new Date(date);
    const today = new Date();
    const diffTime = renewalDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 0) return 'Overdue';
    if (diffDays <= 7) return `In ${diffDays} days`;
    return renewalDate.toLocaleDateString();
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Entertainment & Media': 'bg-purple-100 text-purple-800',
      'Music & Audio': 'bg-pink-100 text-pink-800',
      'Software & Productivity': 'bg-blue-100 text-blue-800',
      'Design & Creative': 'bg-indigo-100 text-indigo-800',
      'Web Services & Hosting': 'bg-yellow-100 text-yellow-800',
      'Health & Fitness': 'bg-green-100 text-green-800',
      'Gaming': 'bg-red-100 text-red-800',
      'Education & Learning': 'bg-teal-100 text-teal-800',
      'Food & Delivery': 'bg-orange-100 text-orange-800',
      'Transportation': 'bg-cyan-100 text-cyan-800',
      'Finance & Banking': 'bg-emerald-100 text-emerald-800',
      'Communication': 'bg-violet-100 text-violet-800',
      'News & Magazines': 'bg-amber-100 text-amber-800',
      'Video & Streaming': 'bg-fuchsia-100 text-fuchsia-800',
      'Business & Professional': 'bg-slate-100 text-slate-800',
      'Security & Privacy': 'bg-rose-100 text-rose-800',
      'Storage & Cloud': 'bg-sky-100 text-sky-800',
      'Shopping & Retail': 'bg-lime-100 text-lime-800',
      'Utilities & Services': 'bg-neutral-100 text-neutral-800',
      'Travel & Tourism': 'bg-stone-100 text-stone-800',
      'Sports & Recreation': 'bg-zinc-100 text-zinc-800',
      'Other': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors['Other'];
  };

  const getRenewalUrgency = (date) => {
    const renewalDate = new Date(date);
    const today = new Date();
    const diffTime = renewalDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'text-red-600';
    if (diffDays <= 3) return 'text-orange-600';
    if (diffDays <= 7) return 'text-yellow-600';
    return 'text-green-600';
  };

  // Use display currency if available, otherwise original currency
  const displayAmount = subscription.displayAmount || subscription.amount;
  const displayCurrency = subscription.displayCurrency || subscription.currency;
  const isConverted = subscription.displayCurrency && subscription.displayCurrency !== subscription.currency;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start justify-between p-6 pb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate" title={subscription.serviceName}>
            {subscription.serviceName}
          </h3>
          <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(subscription.category)}`}>
            {subscription.category}
          </span>
        </div>
        <div className="flex items-center gap-1 ml-4 flex-shrink-0">
          <button
            onClick={() => onEdit(subscription)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            title="Edit subscription"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
            title="Delete subscription"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 flex-1 flex flex-col">
        {/* Amount */}
        <div className="flex items-center mb-4">
          <DollarSign className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-gray-900">
                {formatCurrency(displayAmount, displayCurrency)}
              </span>
              <span className="text-sm text-gray-500">/month</span>
            </div>
            {isConverted && (
              <div className="text-xs text-gray-500 mt-1">
                Originally {formatCurrency(subscription.amount, subscription.currency)}
              </div>
            )}
          </div>
        </div>

        {/* Next Renewal */}
        <div className="flex items-center mb-4">
          <Calendar className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="text-sm text-gray-600">Next renewal: </span>
            <span className={`text-sm font-medium ${getRenewalUrgency(subscription.nextRenewal)}`}>
              {formatNextRenewal(subscription.nextRenewal)}
            </span>
          </div>
        </div>

        {/* Description */}
        {subscription.description && (
          <div className="text-sm text-gray-600 bg-gray-50 rounded-md p-3 mb-4">
            {subscription.description}
          </div>
        )}

        {/* Spacer to push detection info to bottom */}
        <div className="flex-1"></div>
      </div>

      {/* Detection info at bottom with proper padding */}
      {subscription.detectedFromEmail && (
        <div className="px-6 pb-6 pt-2">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Mail className="h-3 w-3 text-blue-600 flex-shrink-0" />
                <span className="text-xs text-blue-700 font-medium">
                  Auto-detected from email
                </span>
              </div>
            </div>
            {subscription.confidenceScore && (
              <div className="flex items-center gap-2 mt-2">
                <Bot className="h-3 w-3 text-blue-600 flex-shrink-0" />
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-xs text-blue-600">AI Confidence:</span>
                  <div className="flex items-center gap-1">
                    <div className="flex-1 bg-blue-200 rounded-full h-1.5 min-w-0 max-w-16">
                      <div 
                        className="bg-blue-600 h-1.5 rounded-full transition-all"
                        style={{ width: `${Math.round(subscription.confidenceScore * 10)}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-medium text-blue-700 whitespace-nowrap">
                      {Math.round(subscription.confidenceScore * 10)}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionCard;