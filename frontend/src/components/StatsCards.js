// frontend/src/components/StatsCards.js - Enhanced with proper padding and mobile support
import React from 'react';
import { DollarSign, CreditCard, Calendar, TrendingUp } from 'lucide-react';

const StatsCards = ({ stats }) => {
  // Handle currency display properly
  const totalMonthly = typeof stats.totalMonthly === 'string' 
    ? stats.totalMonthly 
    : `$${stats.totalMonthly || '0.00'}`;
  
  // Calculate yearly projection
  const monthlyAmount = typeof stats.totalMonthly === 'string'
    ? parseFloat(stats.totalMonthly.replace(/[^0-9.-]+/g, "")) || 0
    : parseFloat(stats.totalMonthly) || 0;
  
  const yearlyProjection = (monthlyAmount * 12).toFixed(2);
  const displayCurrency = stats.displayCurrency || 'USD';
  
  // Format yearly projection with same currency as monthly
  const yearlyValue = totalMonthly.includes('$') ? `$${yearlyProjection}` :
                     totalMonthly.includes('€') ? `€${yearlyProjection}` :
                     totalMonthly.includes('£') ? `£${yearlyProjection}` :
                     totalMonthly.includes('AED') ? `AED ${yearlyProjection}` :
                     `${displayCurrency} ${yearlyProjection}`;

  const statsData = [
    {
      title: 'Total Monthly Cost',
      value: totalMonthly,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      title: 'Active Subscriptions',
      value: stats.activeCount || 0,
      icon: CreditCard,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Upcoming Renewals',
      value: stats.upcomingRenewals || 0,
      icon: Calendar,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    },
    {
      title: 'Yearly Projection',
      value: yearlyValue,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      {statsData.map((stat, index) => (
        <div 
          key={index} 
          className={`bg-white rounded-lg shadow-sm border ${stat.borderColor} p-4 sm:p-5 lg:p-6 hover:shadow-md transition-shadow min-h-[120px] flex flex-col justify-center`}
        >
          <div className="flex flex-col items-center text-center gap-3">
            <div className={`p-2 sm:p-3 rounded-lg ${stat.bgColor} border ${stat.borderColor} flex-shrink-0`}>
              <stat.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.color}`} />
            </div>
            <div className="flex-1 min-w-0 w-full">
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2 leading-tight">
                {stat.title}
              </p>
              <p 
                className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 leading-tight whitespace-nowrap"
                title={stat.value.toString()}
              >
                {stat.value}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;