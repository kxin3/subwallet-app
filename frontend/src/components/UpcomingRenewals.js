// frontend/src/components/UpcomingRenewals.js
import React from 'react';
import { Calendar, Clock, AlertTriangle } from 'lucide-react';
import { formatDate } from '../utils/helpers';

const UpcomingRenewals = ({ renewals }) => {
  const getUrgencyIcon = (urgency) => {
    switch (urgency) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Calendar className="h-4 w-4 text-green-500" />;
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'critical':
        return 'border-l-red-500 bg-red-50';
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50';
      default:
        return 'border-l-green-500 bg-green-50';
    }
  };

  const getDaysText = (days) => {
    if (days < 0) return 'Overdue';
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    return `${days} days`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center mb-4">
        <Calendar className="h-5 w-5 text-blue-600 mr-2" />
        <h2 className="text-lg font-semibold text-gray-900">Upcoming Renewals</h2>
      </div>

      {renewals.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No upcoming renewals</p>
        </div>
      ) : (
        <div className="space-y-3">
          {renewals.map((renewal) => (
            <div
              key={renewal._id}
              className={`border-l-4 p-3 rounded-r-md ${getUrgencyColor(renewal.urgency)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {getUrgencyIcon(renewal.urgency)}
                    <h3 className="font-medium text-gray-900 text-sm">
                      {renewal.serviceName}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    {renewal.currency} {renewal.amount}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(renewal.nextRenewal)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-medium text-gray-900">
                    {getDaysText(renewal.daysUntilRenewal)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {renewals.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Showing next 5 renewals
          </p>
        </div>
      )}
    </div>
  );
};

export default UpcomingRenewals;