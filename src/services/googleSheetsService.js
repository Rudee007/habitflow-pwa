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

  // Save token to localStorage
  saveToken(token) {
    localStorage.setItem('googleAuthToken', JSON.stringify(token));
    console.log('💾 Token saved');
  }

  // Restore token from localStorage
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

  // Auto-sync at 10 PM every day
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
      
      // Get data from your store
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

  // UPDATED: Helper to get local data (Includes Market/Economy)
  getLocalData() {
    try {
      // Existing Data
      const habits = JSON.parse(localStorage.getItem('habits') || '[]');
      const completions = JSON.parse(localStorage.getItem('completions') || '{}');
      const sleepData = JSON.parse(localStorage.getItem('sleepData') || '{}');
      
      // NEW: Market Data (Matches marketStorageService keys)
      const economy = JSON.parse(localStorage.getItem('market_economy_v1') || '{"points":0,"inventory":[],"streak":0}');
      const shopItems = JSON.parse(localStorage.getItem('market_shop_config_v1') || '[]');
      
      return { 
        habits, 
        completions, 
        sleepData,
        market: {
          economy,
          shopItems
        }
      };
    } catch (error) {
      console.error('Error reading local data:', error);
      return { habits: [], completions: {}, sleepData: {}, market: {} };
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
      
      // IMPORTANT: Existing users might need new tabs added.
      // We'll handle this in initializeSheets implicitly or you might need to manually delete old sheet.
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
        // NEW SHEETS
        { properties: { title: 'Economy' } },   // Points, Streak, Rank
        { properties: { title: 'Inventory' } }, // Won Items
        { properties: { title: 'ShopItems' } }  // Store Config
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
    
    // Note: If you are using an OLD spreadsheet, this might fail if the tabs don't exist.
    // Recommended: Delete your old "My Habit Tracker" sheet from Drive so it regenerates with new tabs.
    try {
      // 1. Ensure sheets exist (Simple check via addSheet is complex, assuming tabs exist for now)
      // If you are upgrading, manually add tabs 'Economy', 'Inventory', 'ShopItems' to your Google Sheet
      
      await window.gapi.client.sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: this.spreadsheetId,
        resource: {
          data: [
            // Existing Headers
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
            // NEW Headers
            {
              range: 'Economy!A1:B1',
              values: [['Key', 'Value']], // e.g. Points | 500
            },
            {
              range: 'Inventory!A1:E1',
              values: [['Ticket ID', 'Item Name', 'Won At', 'Is Used', 'Item ID']],
            },
            {
              range: 'ShopItems!A1:E1',
              values: [['Item ID', 'Name', 'Desire Level', 'Type', 'Cost']],
            },
          ],
          valueInputOption: 'RAW',
        },
      });
      
      console.log('✅ Headers added');
    } catch (error) {
      console.error('❌ Error adding headers (Make sure new Tabs exist):', error);
    }
  }

  async syncToSheets(data) {
    if (!this.spreadsheetId) {
      await this.getOrCreateSpreadsheet();
    }

    console.log('📤 Uploading data to Google Sheets...');

    // --- 1. PREPARE EXISTING DATA ---
    const habitsData = (data.habits || []).map(h => [
      h.id || '', h.name || '', h.icon || '✅', h.category || 'Custom', h.color || 'exercise', h.createdAt || new Date().toISOString(),
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

    // --- 2. PREPARE NEW MARKET DATA ---
    const market = data.market || {};
    const economy = market.economy || { points: 0, streak: 0, inventory: [] };
    const shopItems = market.shopItems || [];

    // Economy Sheet (Key-Value pairs)
    const economyData = [
        ['Points', economy.points || 0],
        ['Streak', economy.streak || 0],
        ['Rank', economy.rank || 'Apprentice'],
        ['LastReset', economy.lastReset || '']
    ];

    // Inventory Sheet
    const inventoryData = (economy.inventory || []).map(ticket => [
        ticket.id || '',
        ticket.name || 'Unknown',
        ticket.wonAt || new Date().toISOString(),
        ticket.isUsed ? 'TRUE' : 'FALSE',
        ticket.itemId || ''
    ]);

    // ShopItems Sheet
    const shopData = shopItems.map(item => [
        item.id || '',
        item.name || '',
        item.desireLevel || 1,
        item.type || 'consumable',
        item.cost || 0 // If we implement buying directly later
    ]);

    console.log('✅ Data prepared:', {
      habits: habitsData.length,
      market_inventory: inventoryData.length
    });

    // --- 3. CLEAR OLD DATA ---
    await window.gapi.client.sheets.spreadsheets.values.batchClear({
      spreadsheetId: this.spreadsheetId,
      resource: {
        ranges: [
            'Habits!A2:F', 
            'Completions!A2:C', 
            'SleepData!A2:B',
            // NEW RANGES
            'Economy!A2:B',
            'Inventory!A2:E',
            'ShopItems!A2:E'
        ],
      },
    });

    // --- 4. UPLOAD NEW DATA ---
    await window.gapi.client.sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: this.spreadsheetId,
      resource: {
        data: [
          // Existing
          { range: 'Habits!A2', values: habitsData.length > 0 ? habitsData : [['', '', '', '', '', '']] },
          { range: 'Completions!A2', values: completionsData.length > 0 ? completionsData : [['', '', '']] },
          { range: 'SleepData!A2', values: sleepData.length > 0 ? sleepData : [['', '']] },
          // New
          { range: 'Economy!A2', values: economyData },
          { range: 'Inventory!A2', values: inventoryData.length > 0 ? inventoryData : [['', '', '', '', '']] },
          { range: 'ShopItems!A2', values: shopData.length > 0 ? shopData : [['', '', '', '', '']] }
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
    };
  }

  async fetchFromSheets() {
    if (!this.spreadsheetId) {
      await this.getOrCreateSpreadsheet();
    }

    console.log('📥 Downloading data from Google Sheets...');

    // Request all ranges including the new ones
    const response = await window.gapi.client.sheets.spreadsheets.values.batchGet({
      spreadsheetId: this.spreadsheetId,
      ranges: [
        'Habits!A2:F', 
        'Completions!A2:C', 
        'SleepData!A2:B',
        // New Ranges
        'Economy!A2:B',
        'Inventory!A2:E',
        'ShopItems!A2:E'
      ],
    });

    const [habitsRange, completionsRange, sleepRange, economyRange, inventoryRange, shopItemsRange] = response.result.valueRanges;

    // --- PARSE EXISTING DATA ---
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
    (completionsRange.values || []).forEach(row => {
        if (!row[0] || !row[1]) return;
        const habitId = row[0];
        if (!completions[habitId]) completions[habitId] = {};
        completions[habitId][row[1]] = (row[2] === 'TRUE' || row[2] === true);
    });

    const sleepData = {};
    (sleepRange.values || []).forEach(row => {
        if(row[0]) sleepData[row[0]] = { time: row[1] || '' };
    });

    // --- PARSE NEW MARKET DATA ---
    
    // 1. Economy (Key-Value)
    const economyObj = { points: 0, streak: 0, rank: 'Apprentice', inventory: [] };
    (economyRange.values || []).forEach(row => {
        if (row[0] === 'Points') economyObj.points = Number(row[1]);
        if (row[0] === 'Streak') economyObj.streak = Number(row[1]);
        if (row[0] === 'Rank') economyObj.rank = row[1];
    });

    // 2. Inventory
    const inventory = (inventoryRange.values || [])
        .filter(row => row[0])
        .map(row => ({
            id: row[0],
            name: row[1],
            wonAt: row[2],
            isUsed: row[3] === 'TRUE',
            itemId: row[4]
        }));
    economyObj.inventory = inventory;

    // 3. Shop Items
    const shopItems = (shopItemsRange.values || [])
        .filter(row => row[0])
        .map(row => ({
            id: row[0],
            name: row[1],
            desireLevel: Number(row[2]),
            type: row[3],
            cost: Number(row[4])
        }));

    console.log('✅ Download complete with Market Data');

    return { 
        habits, 
        completions, 
        sleepData, 
        market: { economy: economyObj, shopItems } 
    };
  }

  getSpreadsheetUrl() {
    return this.spreadsheetId 
      ? `https://docs.google.com/spreadsheets/d/${this.spreadsheetId}`
      : null;
  }
}

export default new GoogleSheetsService();