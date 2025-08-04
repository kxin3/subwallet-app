import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Plus, 
  Trash2, 
  Scan, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  RefreshCw,
  Users
} from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  getGmailAccounts, 
  getGmailAuthUrl, 
  connectGmailAccount, 
  disconnectGmailAccount, 
  scanGmailAccount,
  scanAllGmailAccounts
} from '../utils/api';

const MultipleEmailManager = ({ onImportSuccess }) => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanningAccountId, setScanningAccountId] = useState(null);
  const [scanningAll, setScanningAll] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(null);
  const [maxAccounts, setMaxAccounts] = useState(3);
  const [canAddMore, setCanAddMore] = useState(true);
  const [scanProgress, setScanProgress] = useState({ current: 0, total: 0, stage: '' });
  const [abortController, setAbortController] = useState(null);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const data = await getGmailAccounts();
      setAccounts(data.accounts || []);
      setMaxAccounts(data.maxAccounts || 3);
      setCanAddMore(data.canAddMore || false);
    } catch (error) {
      console.error('Failed to load Gmail accounts:', error);
      toast.error('Failed to load Gmail accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleConnectAccount = async () => {
    try {
      if (!canAddMore) {
        toast.error('Maximum of 3 Gmail accounts allowed');
        return;
      }

      console.log('Starting Gmail connection process...');
      const data = await getGmailAuthUrl();
      console.log('Auth URL received, opening window...');
      
      // Redirect to Google OAuth (simpler approach)
      window.location.href = data.authUrl;

    } catch (error) {
      console.error('Failed to start Gmail auth:', error);
      toast.error('Failed to start Gmail authentication');
    }
  };

  const handleDisconnectAccount = async (accountId) => {
    try {
      console.log('Disconnecting Gmail account:', accountId);
      await disconnectGmailAccount(accountId);
      console.log('Account disconnected successfully');
      toast.success('Gmail account disconnected successfully');
      setShowDeleteDialog(null);
      
      // Add a small delay to ensure backend has processed the disconnect
      setTimeout(() => {
        loadAccounts();
      }, 500);
    } catch (error) {
      console.error('Failed to disconnect Gmail account:', error);
      console.error('Error details:', error.response?.data);
      toast.error('Failed to disconnect Gmail account');
      setShowDeleteDialog(null);
    }
  };

  const stopScan = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setScanningAccountId(null);
      setScanningAll(false);
      setScanProgress({ current: 0, total: 0, stage: '' });
      toast.info('Scan stopped');
    }
  };

  const handleScanAccount = async (accountId, accountEmail) => {
    const controller = new AbortController();
    setAbortController(controller);
    
    try {
      console.log('Frontend: Starting scan for account:', accountId, accountEmail);
      setScanningAccountId(accountId);
      setScanProgress({ current: 1, total: 3, stage: 'Analyzing emails...' });
      
      const results = await scanGmailAccount(accountId, controller.signal);
      
      console.log('Frontend: Scan results:', results);
      setScanProgress({ current: 3, total: 3, stage: 'Complete!' });
      
      if (results.detectedSubscriptions.length > 0) {
        toast.success(`Found ${results.detectedSubscriptions.length} subscription(s) in ${accountEmail}`);
        onImportSuccess?.(results);
      } else {
        toast.info(`No new subscriptions found in ${accountEmail}`);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        return; // Scan was cancelled
      }
      
      console.error('Failed to scan Gmail account:', error);
      console.error('Error details:', error.response?.data);
      const errorMessage = error.response?.data?.message || 'Failed to scan Gmail account';
      toast.error(errorMessage);
      
      // If auth error, reload accounts to update connection status
      if (error.response?.status === 401) {
        loadAccounts();
      }
    } finally {
      setScanningAccountId(null);
      setAbortController(null);
      setScanProgress({ current: 0, total: 0, stage: '' });
    }
  };

  const handleScanAllAccounts = async () => {
    const controller = new AbortController();
    setAbortController(controller);
    
    try {
      setScanningAll(true);
      const connectedAccounts = accounts.filter(acc => acc.isConnected);
      setScanProgress({ current: 0, total: connectedAccounts.length, stage: 'Starting scan...' });
      
      const results = await scanAllGmailAccounts(controller.signal);
      
      setScanProgress({ current: connectedAccounts.length, total: connectedAccounts.length, stage: 'Complete!' });
      
      if (results.detectedSubscriptions.length > 0) {
        toast.success(`Found ${results.detectedSubscriptions.length} subscription(s) across all accounts`);
        onImportSuccess?.(results);
      } else {
        toast.info('No new subscriptions found in any connected accounts');
      }
      
      // Update last scan dates
      loadAccounts();
    } catch (error) {
      if (error.name === 'AbortError') {
        return; // Scan was cancelled
      }
      
      console.error('Failed to scan all Gmail accounts:', error);
      const errorMessage = error.response?.data?.message || 'Failed to scan Gmail accounts';
      toast.error(errorMessage);
      
      // Reload accounts to update connection status
      loadAccounts();
    } finally {
      setScanningAll(false);
      setAbortController(null);
      setScanProgress({ current: 0, total: 0, stage: '' });
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (isConnected) => {
    if (isConnected) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else {
      return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusText = (isConnected) => {
    return isConnected ? 'Connected' : 'Disconnected';
  };

  const getStatusBadgeClass = (isConnected) => {
    return isConnected 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center h-32">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
            <p className="text-gray-600">Loading Gmail accounts...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-sm border border-blue-400 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Users className="h-6 w-6 text-blue-600 mr-3" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">📧 Multiple Gmail Accounts ({accounts.length}/{maxAccounts})</h3>
            <p className="text-sm text-gray-600">Connect and manage up to {maxAccounts} Gmail accounts for subscription scanning</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {accounts.length > 0 && (
            <button
              onClick={handleScanAllAccounts}
              disabled={scanningAll || accounts.filter(acc => acc.isConnected).length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {scanningAll ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Scan className="h-4 w-4" />
              )}
              Scan All
            </button>
          )}
          <button
            onClick={handleConnectAccount}
            disabled={!canAddMore}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            title={!canAddMore ? `Maximum of ${maxAccounts} accounts allowed` : 'Connect Gmail account'}
          >
            <Plus className="h-4 w-4" />
            Connect Gmail
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      {(scanningAccountId || scanningAll) && scanProgress.total > 0 && (
        <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
              <span className="text-sm font-medium text-gray-700">{scanProgress.stage}</span>
            </div>
            <button
              onClick={stopScan}
              className="flex items-center gap-1 px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
            >
              <XCircle className="h-4 w-4" />
              Stop Scan
            </button>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(scanProgress.current / scanProgress.total) * 100}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Progress: {scanProgress.current}/{scanProgress.total}</span>
            <span>{Math.round((scanProgress.current / scanProgress.total) * 100)}%</span>
          </div>
        </div>
      )}

      {accounts.length === 0 ? (
        <div className="text-center py-8">
          <Mail className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Gmail accounts connected</h4>
          <p className="text-gray-500 mb-4">
            Connect your Gmail accounts to automatically scan for subscription emails
          </p>
          <button
            onClick={handleConnectAccount}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Connect Your First Gmail Account
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(account.isConnected)}
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">{account.email}</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(account.isConnected)}`}>
                      {getStatusText(account.isConnected)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Connected: {formatDate(account.connectedAt)}</span>
                    </div>
                    {account.lastScanDate && (
                      <div className="flex items-center space-x-1">
                        <Scan className="h-4 w-4" />
                        <span>Last scan: {formatDate(account.lastScanDate)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {account.isConnected ? (
                  <button
                    onClick={() => handleScanAccount(account.id, account.email)}
                    disabled={scanningAccountId === account.id}
                    className="flex items-center gap-1 px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors disabled:opacity-50"
                  >
                    {scanningAccountId === account.id ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Scan className="h-4 w-4" />
                    )}
                    Scan
                  </button>
                ) : (
                  <div className="flex items-center gap-1 px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded-md">
                    <AlertCircle className="h-4 w-4" />
                    Reconnect Required
                  </div>
                )}
                
                <button
                  onClick={() => setShowDeleteDialog(account.id)}
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {accounts.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5 mr-2" />
            <div className="text-sm text-blue-700">
              <p className="font-medium">Tips for better results:</p>
              <ul className="mt-1 list-disc list-inside space-y-1">
                <li>Each account can be scanned individually or all together</li>
                <li>Scanning looks for subscription emails from the past year</li>
                <li>If an account shows "Reconnect Required", remove and re-add it</li>
                <li>You can connect up to {maxAccounts} Gmail accounts</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center mb-4">
              <AlertCircle className="h-6 w-6 text-red-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Remove Gmail Account</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Are you sure you want to remove this Gmail account? You can always reconnect it later.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteDialog(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDisconnectAccount(showDeleteDialog)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Remove Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultipleEmailManager;