// src/components/SettingsView.jsx
import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Upload, 
  Trash2, 
  Cloud, 
  Info, 
  Moon, 
  Bell, 
  ExternalLink, 
  CheckCircle, 
  XCircle,
  LogOut
} from 'lucide-react';
import useHabitStore from '../store/habitStore';
import storageService from '../services/storageService';
import googleSheetsService from '../services/googleSheetsService';

function SettingsView() {
  const [quota, setQuota] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [spreadsheetUrl, setSpreadsheetUrl] = useState(null);
  
  const { 
    exportData, 
    importData, 
    lastSync, 
    clearAll,
    syncToGoogleSheets,
    fetchFromGoogleSheets,
    isSyncing
  } = useHabitStore();

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(googleSheetsService.isAuthenticated());
      setSpreadsheetUrl(googleSheetsService.getSpreadsheetUrl());
    };
    
    checkAuth();
    
    // Re-check every 2 seconds (in case user authenticates in another tab)
    const interval = setInterval(checkAuth, 2000);
    return () => clearInterval(interval);
  }, []);

  const checkStorage = async () => {
    const storageQuota = await storageService.checkQuota();
    setQuota(storageQuota);
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        await importData(file);
        alert('✅ Data imported successfully!');
      } catch (error) {
        alert('❌ Error importing data: ' + error.message);
      }
    }
  };

  const handleClearAll = () => {
    const ok = window.confirm(
      'This will permanently delete all habit and sleep data on this device. Are you sure?'
    );
    if (!ok) return;

    clearAll();
    alert('🧹 All local data cleared.');
  };

  // ========================================
  // GOOGLE SHEETS HANDLERS
  // ========================================

  const handleGoogleAuth = async () => {
    try {
      await googleSheetsService.authenticate();
      setIsAuthenticated(true);
      
      // Get or create spreadsheet
      await googleSheetsService.getOrCreateSpreadsheet();
      setSpreadsheetUrl(googleSheetsService.getSpreadsheetUrl());
      
      alert('✅ Connected to Google Sheets!');
    } catch (error) {
      console.error('Authentication error:', error);
      alert('❌ Authentication failed. Please try again.');
    }
  };

  const handleSync = async () => {
    try {
      const result = await syncToGoogleSheets();
      setSpreadsheetUrl(result.url);
      alert('✅ Data uploaded to Google Sheets successfully!');
    } catch (error) {
      console.error('Sync error:', error);
      alert('❌ Upload failed: ' + error.message);
    }
  };

  const handleFetch = async () => {
    try {
      await fetchFromGoogleSheets();
      alert('✅ Data downloaded from Google Sheets!');
    } catch (error) {
      console.error('Fetch error:', error);
      alert('❌ Download failed: ' + error.message);
    }
  };

  const handleSignOut = () => {
    googleSheetsService.signOut();
    setIsAuthenticated(false);
    setSpreadsheetUrl(null);
    alert('✅ Signed out from Google Sheets');
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gray-800 flex items-center justify-center">
          <Info size={24} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-gray-400 text-sm">Manage your data</p>
        </div>
      </div>

      {/* Google Sheets Sync */}
      <div className="bg-gray-900 rounded-3xl p-6 border border-gray-800">
        <div className="flex items-center gap-3 mb-4">
          <Cloud size={20} className="text-accent-cyan" />
          <h3 className="text-white font-semibold">Google Sheets Sync</h3>
          {isAuthenticated && (
            <CheckCircle size={16} className="text-green-500 ml-auto" />
          )}
        </div>
        
        <div className="space-y-3">
          {/* Last Sync Status */}
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Last sync</span>
            <span className="text-white text-sm">
              {lastSync ? new Date(lastSync).toLocaleString('en-IN', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }) : 'Never'}
            </span>
          </div>
          
          {/* Not Authenticated - Show Connect Button */}
          {!isAuthenticated ? (
            <>
              <button 
                onClick={handleGoogleAuth}
                className="w-full py-3 bg-accent-cyan text-black font-semibold rounded-2xl active:scale-95 transition-transform hover:bg-accent-cyan/90"
              >
                🔐 Connect Google Account
              </button>
              <p className="text-xs text-gray-500 text-center">
                Sign in to sync your data with Google Sheets
              </p>
            </>
          ) : (
            /* Authenticated - Show Sync Controls */
            <>
              {/* Upload & Download Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={handleSync}
                  disabled={isSyncing}
                  className="py-3 bg-accent-cyan text-black font-semibold rounded-2xl active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent-cyan/90"
                >
                  {isSyncing ? '⏳ Syncing...' : '📤 Upload'}
                </button>
                
                <button 
                  onClick={handleFetch}
                  disabled={isSyncing}
                  className="py-3 bg-accent-green text-black font-semibold rounded-2xl active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent-green/90"
                >
                  {isSyncing ? '⏳ Loading...' : '📥 Download'}
                </button>
              </div>

              {/* View Spreadsheet Link */}
              {spreadsheetUrl && (
                <a
                  href={spreadsheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-2xl transition-colors"
                >
                  <ExternalLink size={18} />
                  View Spreadsheet
                </a>
              )}

              {/* Sign Out Button */}
              <button 
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 py-2 text-gray-400 hover:text-white text-sm transition-colors"
              >
                <LogOut size={16} />
                Sign out from Google
              </button>

              {/* Help Text */}
              <div className="bg-gray-800 rounded-xl p-3 mt-2">
                <p className="text-xs text-gray-400 leading-relaxed">
                  💡 <strong className="text-white">Upload</strong> sends your local data to Google Sheets. 
                  <strong className="text-white"> Download</strong> replaces local data with sheet data.
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-gray-900 rounded-3xl p-6 border border-gray-800">
        <div className="flex items-center gap-3 mb-4">
          <Download size={20} className="text-accent-green" />
          <h3 className="text-white font-semibold">Local Backup</h3>
        </div>
        
        <div className="space-y-3">
          {/* Export */}
          <button 
            onClick={exportData}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-2xl transition-colors active:scale-95"
          >
            <Download size={18} />
            Export Data (JSON)
          </button>

          {/* Import */}
          <label className="w-full flex items-center justify-center gap-2 py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-2xl transition-colors active:scale-95 cursor-pointer">
            <Upload size={18} />
            Import Data
            <input 
              type="file" 
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>

          {/* Storage Info */}
          <button
            onClick={checkStorage}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-2xl transition-colors active:scale-95"
          >
            <Info size={18} />
            Check Storage Usage
          </button>

          {quota && (
            <div className="mt-3 p-4 bg-gray-800 rounded-2xl">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Storage used</span>
                <span className="text-white font-medium">{quota.percentUsed}%</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-accent-cyan to-accent-green"
                  style={{ width: `${quota.percentUsed}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {(quota.usage / 1024).toFixed(2)} KB of {(quota.quota / 1024 / 1024).toFixed(0)} MB
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-gray-900 rounded-3xl p-6 border border-gray-800">
        <div className="flex items-center gap-3 mb-4">
          <Moon size={20} className="text-accent-purple" />
          <h3 className="text-white font-semibold">Preferences</h3>
        </div>
        
        <div className="space-y-4">
          {/* Dark Mode (always on) */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Moon size={18} className="text-gray-400" />
              <span className="text-white">Dark Mode</span>
            </div>
            <div className="text-accent-green text-sm font-medium">Always On</div>
          </div>

          {/* Notifications */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell size={18} className="text-gray-400" />
              <span className="text-white">Notifications</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-green"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-gray-900 rounded-3xl p-6 border border-accent-red/50">
        <div className="flex items-center gap-3 mb-4">
          <Trash2 size={20} className="text-accent-red" />
          <h3 className="text-white font-semibold">Danger Zone</h3>
        </div>
        
        <button 
          onClick={handleClearAll} 
          className="w-full py-3 bg-accent-red/20 hover:bg-accent-red/30 text-accent-red font-semibold rounded-2xl transition-colors active:scale-95"
        >
          Clear All Data
        </button>
        <p className="text-xs text-gray-500 text-center mt-2">
          This action cannot be undone
        </p>
      </div>

      {/* App Info */}
      <div className="text-center text-gray-500 text-sm space-y-1">
        <p>Habit Tracker v1.0.0</p>
        <p>Built with ❤️ for personal growth</p>
        <p className="text-xs">Powered by LocalStorage + Google Sheets API</p>
      </div>
    </div>
  );
}

export default SettingsView;
