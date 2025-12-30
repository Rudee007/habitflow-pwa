// src/services/googleSheetsService.js

const CLIENT_ID = "808627965582-4gqvfgq1j4fu2ucju0dubltkmrthbeuq.apps.googleusercontent.com";
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.readonly';
const DISCOVERY_DOCS = [
  'https://sheets.googleapis.com/$discovery/rest?version=v4',
  'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
];

const SPREADSHEET_NAME = 'My Habit Tracker';

class GoogleSheetsService {
  constructor() {
    this.gapiInited = false;
    this.gisInited = false;
    this.tokenClient = null;
    this.spreadsheetId = null;
    this.autoSyncInterval = null;
  }

  gapiLoaded() {
    window.gapi.load('client', async () => {
      await window.gapi.client.init({
        discoveryDocs: DISCOVERY_DOCS,
      });
      this.gapiInited = true;
      console.log('✅ GAPI initialized');
      
      // Restore saved token on page load
      this.restoreToken();
    });
  }

  gisLoaded() {
    this.tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: '',
    });
    this.gisInited = true;
    console.log('✅ GIS initialized');
  }

  // NEW: Save token to localStorage
  saveToken(token) {
    localStorage.setItem('googleAuthToken', JSON.stringify(token));
    console.log('💾 Token saved');
  }

  // NEW: Restore token from localStorage
  restoreToken() {
    const savedToken = localStorage.getItem('googleAuthToken');
    if (savedToken && this.gapiInited) {
      try {
        const token = JSON.parse(savedToken);
        window.gapi.client.setToken(token);
        console.log('✅ Session restored from saved token');
        
        // Start auto-sync when session is restored
        this.startAutoSync();
      } catch (error) {
        console.log('⚠️ Failed to restore token:', error);
        localStorage.removeItem('googleAuthToken');
      }
    }
  }

  isAuthenticated() {
    return window.gapi?.client?.getToken() !== null;
  }

  async authenticate() {
    return new Promise((resolve, reject) => {
      if (!this.gapiInited || !this.gisInited) {
        reject(new Error('Google API not initialized. Please refresh the page.'));
        return;
      }

      this.tokenClient.callback = async (response) => {
        if (response.error !== undefined) {
          reject(response);
          return;
        }
        
        // Save token to localStorage for persistent login
        const token = window.gapi.client.getToken();
        this.saveToken(token);
        
        console.log('✅ User authenticated');
        
        // Start auto-sync after successful login
        this.startAutoSync();
        
        resolve(response);
      };

      const token = window.gapi.client.getToken();
      if (token === null) {
        this.tokenClient.requestAccessToken({ prompt: 'consent' });
      } else {
        this.tokenClient.requestAccessToken({ prompt: '' });
      }
    });
  }

  signOut() {
    const token = window.gapi.client.getToken();
    if (token !== null) {
      window.google.accounts.oauth2.revoke(token.access_token);
      window.gapi.client.setToken('');
      localStorage.removeItem('googleAuthToken');
      
      // Stop auto-sync
      this.stopAutoSync();
      
      console.log('✅ User signed out');
    }
  }

  // NEW: Auto-sync at 10 PM every day
  startAutoSync() {
    // Clear any existing interval
    this.stopAutoSync();
    
    console.log('🔄 Auto-sync enabled (10 PM daily)');
    
    // Check every minute if it's 10 PM
    this.autoSyncInterval = setInterval(() => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      
      // Trigger at 10:00 PM (22:00)
      if (hours === 22 && minutes === 7) {
        console.log('🌙 10 PM - Auto-syncing...');
        this.performAutoSync();
      }
    }, 60000); // Check every minute
    
    // Also check immediately if it's already 10 PM
    const now = new Date();
    if (now.getHours() === 22 && now.getMinutes() === 7) {
      this.performAutoSync();
    }
  }

  stopAutoSync() {
    if (this.autoSyncInterval) {
      clearInterval(this.autoSyncInterval);
      this.autoSyncInterval = null;
      console.log('⏸️ Auto-sync disabled');
    }
  }

  async performAutoSync() {
    try {
      if (!this.isAuthenticated()) {
        console.log('⚠️ Not authenticated, skipping auto-sync');
        return;
      }

      console.log('📤 Auto-sync: Uploading data...');
      
      // Get data from your store (you'll need to pass this)
      const data = this.getLocalData();
      
      await this.syncToSheets(data);
      
      console.log('✅ Auto-sync complete!');
      
      // Optional: Show a subtle notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Habit Tracker', {
          body: '✅ Data auto-synced to Google Sheets',
          icon: '/icon.png'
        });
      }
    } catch (error) {
      console.error('❌ Auto-sync failed:', error);
    }
  }

  // NEW: Helper to get local data
  getLocalData() {
    try {
      const habits = JSON.parse(localStorage.getItem('habits') || '[]');
      const completions = JSON.parse(localStorage.getItem('completions') || '{}');
      const sleepData = JSON.parse(localStorage.getItem('sleepData') || '{}');
      
      return { habits, completions, sleepData };
    } catch (error) {
      console.error('Error reading local data:', error);
      return { habits: [], completions: {}, sleepData: {} };
    }
  }

  async findExistingSpreadsheet() {
    try {
      console.log('🔍 Searching for "My Habit Tracker" spreadsheet...');
      
      const response = await window.gapi.client.drive.files.list({
        q: `name = '${SPREADSHEET_NAME}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`,
        orderBy: 'createdTime asc',
        pageSize: 1,
        fields: 'files(id, name, createdTime)',
      });

      const files = response.result.files || [];
      
      if (files.length > 0) {
        const file = files[0];
        console.log(`✅ Found existing spreadsheet: "${file.name}"`);
        return file.id;
      }
      
      console.log('📝 No existing spreadsheet found');
      return null;
    } catch (error) {
      console.log('⚠️ Drive API not accessible, will skip search');
      return null;
    }
  }

  async getOrCreateSpreadsheet() {
    const savedId = localStorage.getItem('habitTrackerSpreadsheetId');
    
    if (savedId) {
      try {
        console.log('🔍 Checking saved spreadsheet ID:', savedId);
        await window.gapi.client.sheets.spreadsheets.get({
          spreadsheetId: savedId,
        });
        
        this.spreadsheetId = savedId;
        console.log('✅ Using saved spreadsheet');
        return savedId;
      } catch (error) {
        console.log('⚠️ Saved spreadsheet not accessible');
        localStorage.removeItem('habitTrackerSpreadsheetId');
      }
    }

    const foundId = await this.findExistingSpreadsheet();
    
    if (foundId) {
      this.spreadsheetId = foundId;
      localStorage.setItem('habitTrackerSpreadsheetId', foundId);
      console.log('✅ Using existing spreadsheet from Drive');
      return foundId;
    }

    console.log('📝 Creating new spreadsheet...');
    const response = await window.gapi.client.sheets.spreadsheets.create({
      properties: {
        title: SPREADSHEET_NAME,
      },
      sheets: [
        { properties: { title: 'Habits' } },
        { properties: { title: 'Completions' } },
        { properties: { title: 'SleepData' } },
      ],
    });

    this.spreadsheetId = response.result.spreadsheetId;
    localStorage.setItem('habitTrackerSpreadsheetId', this.spreadsheetId);
    
    await this.initializeSheets();
    
    console.log('✅ Created new spreadsheet:', this.spreadsheetId);
    return this.spreadsheetId;
  }

  async initializeSheets() {
    console.log('📋 Setting up sheet headers...');
    
    try {
      await window.gapi.client.sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: this.spreadsheetId,
        resource: {
          data: [
            {
              range: 'Habits!A1:F1',
              values: [['ID', 'Name', 'Icon', 'Category', 'Color', 'Created At']],
            },
            {
              range: 'Completions!A1:C1',
              values: [['Habit ID', 'Date', 'Completed']],
            },
            {
              range: 'SleepData!A1:B1',
              values: [['Date', 'Time']],
            },
          ],
          valueInputOption: 'RAW',
        },
      });
      
      console.log('✅ Headers added');
    } catch (error) {
      console.error('❌ Error adding headers:', error);
    }
  }

  async syncToSheets(data) {
    if (!this.spreadsheetId) {
      await this.getOrCreateSpreadsheet();
    }

    console.log('📤 Uploading data to Google Sheets...');

    const habitsData = (data.habits || []).map(h => [
      h.id || '',
      h.name || '',
      h.icon || '✅',
      h.category || 'Custom',
      h.color || 'exercise',
      h.createdAt || new Date().toISOString(),
    ]);

    const completionsData = [];
    Object.entries(data.completions || {}).forEach(([habitId, dates]) => {
      Object.entries(dates).forEach(([dateKey, completed]) => {
        completionsData.push([habitId, dateKey, completed ? 'TRUE' : 'FALSE']);
      });
    });

    const sleepData = [];
    Object.entries(data.sleepData || {}).forEach(([dateKey, sleep]) => {
      sleepData.push([dateKey, sleep.time || '']);
    });

    console.log('✅ Data prepared:', {
      habits: habitsData.length,
      completions: completionsData.length,
      sleep: sleepData.length,
    });

    await window.gapi.client.sheets.spreadsheets.values.batchClear({
      spreadsheetId: this.spreadsheetId,
      resource: {
        ranges: ['Habits!A2:F', 'Completions!A2:C', 'SleepData!A2:B'],
      },
    });

    await window.gapi.client.sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: this.spreadsheetId,
      resource: {
        data: [
          {
            range: 'Habits!A2',
            values: habitsData.length > 0 ? habitsData : [['', '', '', '', '', '']],
          },
          {
            range: 'Completions!A2',
            values: completionsData.length > 0 ? completionsData : [['', '', '']],
          },
          {
            range: 'SleepData!A2',
            values: sleepData.length > 0 ? sleepData : [['', '']],
          },
        ],
        valueInputOption: 'RAW',
      },
    });

    // Update last sync time
    localStorage.setItem('lastSync', new Date().toISOString());

    console.log('✅ Upload complete!');

    return {
      success: true,
      timestamp: new Date().toISOString(),
      url: `https://docs.google.com/spreadsheets/d/${this.spreadsheetId}`,
      stats: {
        habits: habitsData.length,
        completions: completionsData.length,
        sleep: sleepData.length,
      },
    };
  }

  async fetchFromSheets() {
    if (!this.spreadsheetId) {
      await this.getOrCreateSpreadsheet();
    }

    console.log('📥 Downloading data from Google Sheets...');

    const response = await window.gapi.client.sheets.spreadsheets.values.batchGet({
      spreadsheetId: this.spreadsheetId,
      ranges: ['Habits!A2:F', 'Completions!A2:C', 'SleepData!A2:B'],
    });

    const [habitsRange, completionsRange, sleepRange] = response.result.valueRanges;

    const habits = (habitsRange.values || [])
      .filter(row => row[0])
      .map(row => ({
        id: row[0],
        name: row[1] || '',
        icon: row[2] || '⭐',
        category: row[3] || 'Custom',
        color: row[4] || 'exercise',
        createdAt: row[5] || new Date().toISOString(),
      }));

    const completions = {};
    (completionsRange.values || [])
      .filter(row => row[0] && row[1])
      .forEach(row => {
        const habitId = row[0];
        const date = row[1];
        const completed = row[2] === 'TRUE' || row[2] === true || row[2] === 'true';
        
        if (!completions[habitId]) {
          completions[habitId] = {};
        }
        completions[habitId][date] = completed;
      });

    const sleepData = {};
    (sleepRange.values || [])
      .filter(row => row[0])
      .forEach(row => {
        const date = row[0];
        const time = row[1] || '';
        sleepData[date] = { time };
      });

    console.log('✅ Download complete:', {
      habits: habits.length,
      completions: Object.keys(completions).length,
      sleep: Object.keys(sleepData).length,
    });

    return { habits, completions, sleepData };
  }

  getSpreadsheetUrl() {
    return this.spreadsheetId 
      ? `https://docs.google.com/spreadsheets/d/${this.spreadsheetId}`
      : null;
  }
}

export default new GoogleSheetsService();
