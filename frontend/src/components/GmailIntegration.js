// frontend/src/components/GmailIntegration.js - Updated to use Multiple Email Manager
import React, { useState } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { importSubscriptions } from '../utils/api';
import MultipleEmailManager from './MultipleEmailManager';

const GmailIntegration = ({ user, onImportSuccess }) => {
  const [importing, setImporting] = useState(false);
  const [detectedSubscriptions, setDetectedSubscriptions] = useState([]);
  const [showDetected, setShowDetected] = useState(false);

  console.log('GmailIntegration: Rendering new multi-account version');

  const handleImportSuccess = (results) => {
    if (results.detectedSubscriptions && results.detectedSubscriptions.length > 0) {
      setDetectedSubscriptions(results.detectedSubscriptions);
      setShowDetected(true);
    } else {
      // No subscriptions to import, just refresh the dashboard
      onImportSuccess();
    }
  };

  const handleImportSelected = async (subscriptionsToImport) => {
    try {
      setImporting(true);
      console.log('Importing', subscriptionsToImport.length, 'subscriptions...');
      
      const response = await importSubscriptions({ subscriptions: subscriptionsToImport });
      console.log('Import response:', response);
      
      // Close the modal first
      setShowDetected(false);
      setDetectedSubscriptions([]);
      
      // Show success message
      toast.success(response.message || 'Subscriptions imported successfully!');
      
      // Refresh the dashboard data
      onImportSuccess();
      
    } catch (error) {
      console.error('Import error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to import subscriptions';
      toast.error(errorMessage);
    } finally {
      setImporting(false);
    }
  };

  const handleCloseModal = () => {
    setShowDetected(false);
    setDetectedSubscriptions([]);
  };

  return (
    <>
      <MultipleEmailManager onImportSuccess={handleImportSuccess} />
      
      {showDetected && detectedSubscriptions.length > 0 && (
        <DetectedSubscriptionsModal
          subscriptions={detectedSubscriptions}
          onImport={handleImportSelected}
          onClose={handleCloseModal}
          importing={importing}
        />
      )}
    </>
  );
};

const DetectedSubscriptionsModal = ({ subscriptions, onImport, onClose, importing }) => {
  const [selectedSubscriptions, setSelectedSubscriptions] = useState(
    subscriptions.map((_, index) => index)
  );

  const toggleSubscription = (index) => {
    setSelectedSubscriptions(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const toggleAll = () => {
    if (selectedSubscriptions.length === subscriptions.length) {
      setSelectedSubscriptions([]);
    } else {
      setSelectedSubscriptions(subscriptions.map((_, index) => index));
    }
  };

  const handleImport = async () => {
    const toImport = selectedSubscriptions.map(index => subscriptions[index]);
    await onImport(toImport);
  };

  // Prevent clicks on the modal content from closing the modal
  const handleModalContentClick = (e) => {
    e.stopPropagation();
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-hidden shadow-xl"
          onClick={handleModalContentClick}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Detected Subscriptions ({subscriptions.length})
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              disabled={importing}
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[calc(90vh-160px)] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-600">
                Select the subscriptions you want to import:
              </p>
              <button
                onClick={toggleAll}
                className="text-sm text-blue-600 hover:text-blue-500"
                disabled={importing}
              >
                {selectedSubscriptions.length === subscriptions.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div className="space-y-3 mb-6">
              {subscriptions.map((subscription, index) => (
                <div
                  key={index}
                  className={`flex items-center p-3 border rounded-md cursor-pointer transition-colors ${
                    selectedSubscriptions.includes(index) 
                      ? 'bg-blue-50 border-blue-200' 
                      : 'hover:bg-gray-50 border-gray-200'
                  } ${importing ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => !importing && toggleSubscription(index)}
                >
                  <input
                    type="checkbox"
                    checked={selectedSubscriptions.includes(index)}
                    onChange={() => toggleSubscription(index)}
                    className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled={importing}
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{subscription.serviceName}</div>
                    <div className="text-sm text-gray-600">
                      {subscription.currency} {subscription.amount} • {subscription.category}
                    </div>
                    {subscription.description && (
                      <div className="text-xs text-gray-500 mt-1 truncate">
                        {subscription.description}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              disabled={importing}
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={selectedSubscriptions.length === 0 || importing}
              className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {importing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Importing...
                </>
              ) : (
                `Import ${selectedSubscriptions.length} Subscription${selectedSubscriptions.length !== 1 ? 's' : ''}`
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default GmailIntegration;