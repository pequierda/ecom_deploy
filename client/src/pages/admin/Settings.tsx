// pages/admin/Settings.tsx
import React, { useState } from 'react';
import { Settings, Save, Shield, DollarSign, Bell, FileText, Users, Mail, Globe, Database, Lock } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [hasChanges, setHasChanges] = useState(false);

  const [settings, setSettings] = useState({
    general: {
      platformName: 'WeddingPH',
      platformDescription: 'Premier wedding planning platform in the Philippines',
      adminEmail: 'admin@weddingph.com',
      supportEmail: 'support@weddingph.com',
      contactPhone: '+63 2 8123 4567',
      address: '123 Business District, Makati City, Metro Manila',
      timezone: 'Asia/Manila',
      currency: 'PHP',
      language: 'en'
    },
    fees: {
      platformCommission: 5.0,
      paymentProcessingFee: 2.5,
      withdrawalFee: 50,
      refundProcessingFee: 100,
      premiumListingFee: 500,
      verificationFee: 1000
    },
    permits: {
      businessPermitRequired: true,
      birRegistrationRequired: true,
      mayorPermitRequired: true,
      validIdRequired: true,
      businessPlanRequired: false,
      permitExpiryWarningDays: 30,
      autoSuspendExpiredPermits: true,
      gracePerioAfterExpiry: 7
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      permitExpiryAlerts: true,
      paymentAlerts: true,
      disputeAlerts: true,
      newRegistrationAlerts: true,
      reviewAlerts: false,
      maintenanceAlerts: true
    },
    security: {
      passwordMinLength: 8,
      requireSpecialChars: true,
      sessionTimeout: 60,
      maxLoginAttempts: 5,
      lockoutDuration: 30,
      twoFactorRequired: false,
      ipWhitelistEnabled: false,
      auditLogging: true
    }
  });

  const handleSettingChange = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    // Handle save logic here
    console.log('Saving settings:', settings);
    setHasChanges(false);
  };

  const tabs = [
    { id: 'general', label: 'General Settings', icon: Settings },
    { id: 'fees', label: 'Fees & Commission', icon: DollarSign },
    { id: 'permits', label: 'Permit Requirements', icon: FileText },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield }
  ];

  return (
    <DashboardLayout 
      title="System Settings"
      subtitle="Configure platform settings and policies"
    >
      {/* Save Bar */}
      {hasChanges && (
        <div className="fixed top-16 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
          <div className="flex items-center space-x-3">
            <p className="text-sm text-gray-600">You have unsaved changes</p>
            <button
              onClick={handleSave}
              className="inline-flex items-center px-3 py-1 border border-transparent rounded text-sm font-medium text-white bg-pink-600 hover:bg-pink-700"
            >
              <Save className="w-4 h-4 mr-1" />
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-pink-500 text-pink-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* General Settings */}
      {activeTab === 'general' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">General Platform Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Platform Name</label>
              <input
                type="text"
                value={settings.general.platformName}
                onChange={(e) => handleSettingChange('general', 'platformName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Admin Email</label>
              <input
                type="email"
                value={settings.general.adminEmail}
                onChange={(e) => handleSettingChange('general', 'adminEmail', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Support Email</label>
              <input
                type="email"
                value={settings.general.supportEmail}
                onChange={(e) => handleSettingChange('general', 'supportEmail', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
              <input
                type="tel"
                value={settings.general.contactPhone}
                onChange={(e) => handleSettingChange('general', 'contactPhone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Platform Description</label>
              <textarea
                value={settings.general.platformDescription}
                onChange={(e) => handleSettingChange('general', 'platformDescription', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Address</label>
              <textarea
                value={settings.general.address}
                onChange={(e) => handleSettingChange('general', 'address', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
              <select
                value={settings.general.timezone}
                onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="Asia/Manila">Asia/Manila (GMT+8)</option>
                <option value="UTC">UTC (GMT+0)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
              <select
                value={settings.general.currency}
                onChange={(e) => handleSettingChange('general', 'currency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="PHP">Philippine Peso (PHP)</option>
                <option value="USD">US Dollar (USD)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Fees & Commission */}
      {activeTab === 'fees' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Platform Fees & Commission</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Platform Commission (%)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={settings.fees.platformCommission}
                onChange={(e) => handleSettingChange('fees', 'platformCommission', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Commission taken from each booking</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Processing Fee (%)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={settings.fees.paymentProcessingFee}
                onChange={(e) => handleSettingChange('fees', 'paymentProcessingFee', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Fee for processing payments</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Withdrawal Fee (₱)</label>
              <input
                type="number"
                min="0"
                value={settings.fees.withdrawalFee}
                onChange={(e) => handleSettingChange('fees', 'withdrawalFee', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Fixed fee for fund withdrawals</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Refund Processing Fee (₱)</label>
              <input
                type="number"
                min="0"
                value={settings.fees.refundProcessingFee}
                onChange={(e) => handleSettingChange('fees', 'refundProcessingFee', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Fee for processing refunds</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Premium Listing Fee (₱)</label>
              <input
                type="number"
                min="0"
                value={settings.fees.premiumListingFee}
                onChange={(e) => handleSettingChange('fees', 'premiumListingFee', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Monthly fee for premium listing</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Verification Fee (₱)</label>
              <input
                type="number"
                min="0"
                value={settings.fees.verificationFee}
                onChange={(e) => handleSettingChange('fees', 'verificationFee', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">One-time verification fee</p>
            </div>
          </div>
        </div>
      )}

      {/* Permit Requirements */}
      {activeTab === 'permits' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Business Permit Requirements</h3>
          
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Required Documents</h4>
              <div className="space-y-3">
                {[
                  { key: 'businessPermitRequired', label: 'Business Permit' },
                  { key: 'birRegistrationRequired', label: 'BIR Registration' },
                  { key: 'mayorPermitRequired', label: "Mayor's Permit" },
                  { key: 'validIdRequired', label: 'Valid Government ID' },
                  { key: 'businessPlanRequired', label: 'Business Plan' }
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">{item.label}</label>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.permits[item.key as keyof typeof settings.permits] as boolean}
                        onChange={(e) => handleSettingChange('permits', item.key, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Permit Expiry Warning (Days)</label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={settings.permits.permitExpiryWarningDays}
                  onChange={(e) => handleSettingChange('permits', 'permitExpiryWarningDays', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Days before expiry to send warning</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Grace Period After Expiry (Days)</label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={settings.permits.gracePerioAfterExpiry}
                  onChange={(e) => handleSettingChange('permits', 'gracePerioAfterExpiry', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Grace period before suspension</p>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Auto-suspend Expired Permits</label>
                  <p className="text-xs text-gray-500">Automatically suspend planners with expired permits</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.permits.autoSuspendExpiredPermits}
                    onChange={(e) => handleSettingChange('permits', 'autoSuspendExpiredPermits', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">System Notifications</h3>
          
          <div className="space-y-6">
            {[
              { key: 'emailNotifications', label: 'Email Notifications', description: 'Send notifications via email' },
              { key: 'smsNotifications', label: 'SMS Notifications', description: 'Send notifications via SMS' },
              { key: 'permitExpiryAlerts', label: 'Permit Expiry Alerts', description: 'Alert when permits are expiring' },
              { key: 'paymentAlerts', label: 'Payment Alerts', description: 'Alert on payment issues' },
              { key: 'disputeAlerts', label: 'Dispute Alerts', description: 'Alert when disputes are filed' },
              { key: 'newRegistrationAlerts', label: 'New Registration Alerts', description: 'Alert on new planner registrations' },
              { key: 'reviewAlerts', label: 'Review Alerts', description: 'Alert on new reviews' },
              { key: 'maintenanceAlerts', label: 'Maintenance Alerts', description: 'Alert during system maintenance' }
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">{item.label}</label>
                  <p className="text-xs text-gray-500">{item.description}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications[item.key as keyof typeof settings.notifications] as boolean}
                    onChange={(e) => handleSettingChange('notifications', item.key, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Security */}
      {activeTab === 'security' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Security Settings</h3>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Password Length</label>
                <input
                  type="number"
                  min="6"
                  max="50"
                  value={settings.security.passwordMinLength}
                  onChange={(e) => handleSettingChange('security', 'passwordMinLength', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (Minutes)</label>
                <input
                  type="number"
                  min="5"
                  max="480"
                  value={settings.security.sessionTimeout}
                  onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Login Attempts</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={settings.security.maxLoginAttempts}
                  onChange={(e) => handleSettingChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Lockout Duration (Minutes)</label>
                <input
                  type="number"
                  min="1"
                  max="1440"
                  value={settings.security.lockoutDuration}
                  onChange={(e) => handleSettingChange('security', 'lockoutDuration', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              {[
                { key: 'requireSpecialChars', label: 'Require Special Characters', description: 'Passwords must contain special characters' },
                { key: 'twoFactorRequired', label: 'Require Two-Factor Authentication', description: 'Mandatory 2FA for all admin accounts' },
                { key: 'ipWhitelistEnabled', label: 'IP Whitelist', description: 'Restrict admin access to specific IP addresses' },
                { key: 'auditLogging', label: 'Audit Logging', description: 'Log all administrative actions' }
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">{item.label}</label>
                    <p className="text-xs text-gray-500">{item.description}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.security[item.key as keyof typeof settings.security] as boolean}
                      onChange={(e) => handleSettingChange('security', item.key, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSave}
          disabled={!hasChanges}
          className={`inline-flex items-center px-6 py-3 border border-transparent rounded-md text-sm font-medium text-white transition-colors ${
            hasChanges 
              ? 'bg-pink-600 hover:bg-pink-700' 
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          <Save className="w-4 h-4 mr-2" />
          Save All Settings
        </button>
      </div>
    </DashboardLayout>
  );
};

export default AdminSettings;