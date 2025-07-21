// frontend/src/components/Dashboard.js - Enhanced with currency conversion
import React, { useState, useEffect, useCallback } from 'react';
import Header from './Header';
import StatsCards from './StatsCards';
import SubscriptionCard from './SubscriptionCard';
import SubscriptionForm from './SubscriptionForm';
import UpcomingRenewals from './UpcomingRenewals';
import GmailIntegration from './GmailIntegration';
import CurrencySelector from './CurrencySelector';
import { Plus, Search, Filter, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { getSubscriptions, getSubscriptionStats, getUpcomingRenewals } from '../utils/api';
import { convertSubscriptionsCurrency, calculateTotalMonthlyCost, formatCurrency } from '../utils/currency';
import { getAllCategories } from '../utils/categories';

const Dashboard = ({ user, onLogout }) => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [stats, setStats] = useState({
    totalMonthly: '0.00',
    activeCount: 0,
    upcomingRenewals: 0
  });
  const [upcomingRenewals, setUpcomingRenewals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [displayCurrency, setDisplayCurrency] = useState('USD');

  // Simple modal reset function
  const resetModalStates = useCallback(() => {
    console.log('Resetting modal states');
    setShowForm(false);
    setEditingSubscription(null);
  }, []);

  useEffect(() => {
    loadData();
  }, []);


  const loadData = async () => {
    try {
      setLoading(true);
      const [subscriptionsData, statsData, renewalsData] = await Promise.all([
        getSubscriptions(),
        getSubscriptionStats(),
        getUpcomingRenewals()
      ]);

      setSubscriptions(subscriptionsData.subscriptions || []);
      setStats(statsData || { totalMonthly: '0.00', activeCount: 0, upcomingRenewals: 0 });
      setUpcomingRenewals(renewalsData.upcomingRenewals || []);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubscription = () => {
    console.log('Add subscription clicked');
    setEditingSubscription(null);
    setShowForm(true);
  };

  const handleEditSubscription = (subscription) => {
    console.log('Edit subscription clicked for:', subscription.serviceName);
    setEditingSubscription(subscription);
    setShowForm(true);
  };

  // Simple form close handler
  const handleFormClose = useCallback(() => {
    console.log('Form close requested');
    setShowForm(false);
    setEditingSubscription(null);
  }, []);

  // Simple form success handler
  const handleFormSuccess = useCallback(() => {
    console.log('Form success - reloading data');
    setShowForm(false);
    setEditingSubscription(null);
    loadData();
  }, []);

  // Gmail import success handler - ensure no modals open
  const handleGmailImportSuccess = useCallback(() => {
    console.log('Gmail import success - ensuring no modals are open');
    setShowForm(false);
    setEditingSubscription(null);
    loadData();
  }, []);

  const handleExport = () => {
    if (subscriptions.length === 0) {
      toast.error('No subscriptions to export');
      return;
    }

    const csvContent = [
      ['Service Name', 'Amount', 'Currency', 'Next Renewal', 'Category'],
      ...subscriptions.map(sub => [
        sub.serviceName,
        sub.amount,
        sub.currency,
        new Date(sub.nextRenewal).toLocaleDateString(),
        sub.category
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'subscriptions.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Subscriptions exported!');
  };

  // Convert subscriptions to display currency
  const convertedSubscriptions = convertSubscriptionsCurrency(subscriptions, displayCurrency);
  
  // Filter subscriptions
  const filteredSubscriptions = convertedSubscriptions.filter(sub => {
    const matchesSearch = sub.serviceName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || sub.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate stats in display currency
  const totalMonthlyInDisplayCurrency = calculateTotalMonthlyCost(subscriptions, displayCurrency);
  const convertedStats = {
    ...stats,
    totalMonthly: formatCurrency(totalMonthlyInDisplayCurrency, displayCurrency),
    displayCurrency
  };

  const categories = getAllCategories();

  // Handle currency change
  const handleCurrencyChange = (newCurrency) => {
    setDisplayCurrency(newCurrency);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header user={user} onLogout={onLogout} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">Loading your subscriptions...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={onLogout} />
      
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Stats Cards */}
            <div className="mb-8">
              <StatsCards stats={convertedStats} />
            </div>

            {/* Gmail Integration - Use the fixed handler */}
            <div className="mb-8">
              <GmailIntegration user={user} onImportSuccess={handleGmailImportSuccess} />
            </div>

            {/* Action Bar */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
              <div className="flex flex-col gap-4">
                {/* Currency Selector */}
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Your Subscriptions</h3>
                  <CurrencySelector
                    selectedCurrency={displayCurrency}
                    onCurrencyChange={handleCurrencyChange}
                  />
                </div>
                
                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full sm:w-auto">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search subscriptions..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <div className="relative">
                      <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <select
                        className="appearance-none pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white min-w-40"
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                      >
                        {categories.map(category => (
                          <option key={category} value={category}>
                            {category === 'all' ? 'All Categories' : category}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      onClick={handleExport}
                      className="flex items-center justify-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors flex-1 sm:flex-none"
                    >
                      <Download className="h-4 w-4" />
                      Export
                    </button>
                    <button
                      onClick={handleAddSubscription}
                      className="flex items-center justify-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors flex-1 sm:flex-none"
                    >
                      <Plus className="h-4 w-4" />
                      Add Subscription
                    </button>
                  </div>
                </div>
              </div>
            </div>


            {/* Subscriptions Grid - Equal height cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-fr">
              {filteredSubscriptions.length === 0 ? (
                <div className="col-span-full">
                  <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                    <div className="mx-auto h-12 w-12 text-gray-300 mb-4">
                      <svg fill="currentColor" viewBox="0 0 24 24">
                        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-7-7z" />
                        <polyline points="13,2 13,9 20,9" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {searchTerm || filterCategory !== 'all' 
                        ? 'No subscriptions match your filters' 
                        : 'No subscriptions yet'}
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {searchTerm || filterCategory !== 'all'
                        ? 'Try adjusting your search or filters'
                        : 'Add your first subscription to get started!'}
                    </p>
                    {(!searchTerm && filterCategory === 'all') && (
                      <button
                        onClick={handleAddSubscription}
                        className="inline-flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                        Add Your First Subscription
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                filteredSubscriptions.map(subscription => (
                  <SubscriptionCard
                    key={subscription._id}
                    subscription={subscription}
                    onEdit={handleEditSubscription}
                    onDelete={loadData}
                  />
                ))
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-80">
            <UpcomingRenewals renewals={upcomingRenewals} />
          </div>
        </div>
      </div>

      {/* Subscription Form Modal - Only show when explicitly requested */}
      {showForm === true && (
        <SubscriptionForm
          subscription={editingSubscription}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
};

export default Dashboard;