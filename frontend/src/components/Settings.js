import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Bell, 
  DollarSign, 
  Globe, 
  Shield, 
  Trash2, 
  Save,
  Eye,
  EyeOff,
  Mail,
  Smartphone,
  Calendar,
  Download,
  Upload,
  AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { updateUserSettings, getUserSettings, deleteAccount } from '../utils/api';
import { getAvailableCurrencies } from '../utils/currency';
import Header from './Header';

const Settings = ({ user, onUserUpdate, onLogout }) => {
  const [settings, setSettings] = useState({
    currency: 'USD',
    notifications: {
      email: true,
      push: true,
      renewalReminders: true,
      weeklyReports: false
    },
    privacy: {
      shareUsageData: false,
      marketingEmails: false
    },
    display: {
      theme: 'light',
      dateFormat: 'MM/DD/YYYY',
      compactView: false
    }
  });
  const [loading, setLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const userSettings = await getUserSettings();
      setSettings(prev => ({
        ...prev,
        ...userSettings
      }));
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const handleSettingChange = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const handleDirectSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      await updateUserSettings(settings);
      toast.success('Settings saved successfully!');
      onUserUpdate?.({ ...user, preferences: settings });
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = () => {
    const data = {
      user: {
        name: user.name,
        email: user.email,
        id: user.id
      },
      settings: settings,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subwallet-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Data exported successfully!');
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
      toast.error('Please type "DELETE" to confirm account deletion');
      return;
    }

    setLoading(true);
    try {
      await deleteAccount();
      toast.success('Account deleted successfully');
      onLogout();
    } catch (error) {
      console.error('Failed to delete account:', error);
      toast.error('Failed to delete account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const SettingsSection = ({ title, icon: Icon, children }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center mb-4">
        <Icon className="h-5 w-5 text-blue-600 mr-3" />
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );

  const ToggleSwitch = ({ enabled, onChange, label, description }) => (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        {description && (
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          enabled ? 'bg-blue-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            enabled ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={onLogout} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account preferences and security settings</p>
        </div>

        <div className="space-y-6">
          {/* Currency & Display Settings */}
          <SettingsSection title="Currency & Display" icon={DollarSign}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Currency
                </label>
                <select
                  value={settings.currency}
                  onChange={(e) => handleDirectSettingChange('currency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {getAvailableCurrencies().map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.code} - {currency.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Format
                </label>
                <select
                  value={settings.display?.dateFormat || 'MM/DD/YYYY'}
                  onChange={(e) => handleSettingChange('display', 'dateFormat', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
            </div>
            <ToggleSwitch
              enabled={settings.display?.compactView || false}
              onChange={(value) => handleSettingChange('display', 'compactView', value)}
              label="Compact View"
              description="Show more subscriptions in a smaller space"
            />
          </SettingsSection>

          {/* Notification Settings */}
          <SettingsSection title="Notifications" icon={Bell}>
            <ToggleSwitch
              enabled={settings.notifications?.email || false}
              onChange={(value) => handleSettingChange('notifications', 'email', value)}
              label="Email Notifications"
              description="Receive notifications via email"
            />
            <ToggleSwitch
              enabled={settings.notifications?.push || false}
              onChange={(value) => handleSettingChange('notifications', 'push', value)}
              label="Push Notifications"
              description="Receive push notifications in your browser"
            />
            <ToggleSwitch
              enabled={settings.notifications?.renewalReminders || false}
              onChange={(value) => handleSettingChange('notifications', 'renewalReminders', value)}
              label="Renewal Reminders"
              description="Get notified before subscriptions renew"
            />
            <ToggleSwitch
              enabled={settings.notifications?.weeklyReports || false}
              onChange={(value) => handleSettingChange('notifications', 'weeklyReports', value)}
              label="Weekly Reports"
              description="Receive weekly spending summaries"
            />
          </SettingsSection>

          {/* Privacy Settings */}
          <SettingsSection title="Privacy & Security" icon={Shield}>
            <ToggleSwitch
              enabled={settings.privacy?.shareUsageData || false}
              onChange={(value) => handleSettingChange('privacy', 'shareUsageData', value)}
              label="Share Usage Data"
              description="Help improve the app by sharing anonymous usage data"
            />
            <ToggleSwitch
              enabled={settings.privacy?.marketingEmails || false}
              onChange={(value) => handleSettingChange('privacy', 'marketingEmails', value)}
              label="Marketing Emails"
              description="Receive emails about new features and updates"
            />
          </SettingsSection>

          {/* Data Management */}
          <SettingsSection title="Data Management" icon={Download}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={handleExportData}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                Export Data
              </button>
              <button
                onClick={() => document.getElementById('import-input').click()}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                <Upload className="h-4 w-4" />
                Import Data
              </button>
            </div>
            <input
              id="import-input"
              type="file"
              accept=".json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  toast.info('Data import functionality coming soon!');
                }
              }}
            />
          </SettingsSection>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSaveSettings}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-3" />
              <h3 className="text-lg font-semibold text-red-900">Danger Zone</h3>
            </div>
            <p className="text-red-700 mb-4">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Delete Account Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Delete Account</h3>
            </div>
            <p className="text-gray-600 mb-4">
              This action cannot be undone. All your data will be permanently deleted.
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Type <strong>DELETE</strong> to confirm:
            </p>
            <input
              type="text"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent mb-4"
              placeholder="Type DELETE to confirm"
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteDialog(false);
                  setDeleteConfirmation('');
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={loading || deleteConfirmation !== 'DELETE'}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;