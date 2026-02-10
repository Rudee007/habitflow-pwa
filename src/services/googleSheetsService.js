// src/services/googleSheetsService.js

const CLIENT_ID = "808627965582-4gqvfgq1j4fu2ucju0dubltkmrthbeuq.apps.googleusercontent.com";
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file';
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

  // ==========================================
  // 1. INITIALIZATION & AUTH
  // ==========================================

  gapiLoaded() {
    if (!window.gapi) return;
    window.gapi.load('client', async () => {
      await window.gapi.client.init({
        discoveryDocs: DISCOVERY_DOCS,
      });
      this.gapiInited = true;
      console.log('✅ GAPI initialized');
      this.restoreToken();
    });
  }

  gisLoaded() {
    if (!window.google) return;
    this.tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: '', // Callback defined at request time
    });
    this.gisInited = true;
    console.log('✅ GIS initialized');
  }

  saveToken(token) {
    localStorage.setItem('googleAuthToken', JSON.stringify(token));
  }

  restoreToken() {
    const savedToken = localStorage.getItem('googleAuthToken');
    if (savedToken && this.gapiInited) {
      try {
        const token = JSON.parse(savedToken);
        window.gapi.client.setToken(token);
        console.log('✅ Session restored');
        this.startAutoSync();
      } catch (error) {
        console.warn('⚠️ Token invalid, clearing:', error);
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
        reject(new Error('Google API not ready. Refresh page.'));
        return;
      }

      this.tokenClient.callback = (response) => {
        if (response.error) {
          reject(response);
          return;
        }
        this.saveToken(window.gapi.client.getToken());
        console.log('✅ Authenticated successfully');
        this.startAutoSync();
        resolve(response);
      };

      if (window.gapi.client.getToken() === null) {
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
      this.stopAutoSync();
      console.log('✅ Signed out');
    }
  }

  // ==========================================
  // 2. SPREADSHEET MANAGEMENT
  // ==========================================

  async findExistingSpreadsheet() {
    try {
      const response = await window.gapi.client.drive.files.list({
        q: `name = '${SPREADSHEET_NAME}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`,
        fields: 'files(id, name)',
        pageSize: 1,
      });
      const files = response.result.files;
      return files && files.length > 0 ? files[0].id : null;
    } catch (error) {
      console.error('Error finding spreadsheet:', error);
      return null;
    }
  }

  async getOrCreateSpreadsheet() {
    // 1. Try Local Storage ID
    let id = localStorage.getItem('habitTrackerSpreadsheetId');
    if (id) {
        try {
            await window.gapi.client.sheets.spreadsheets.get({ spreadsheetId: id });
            this.spreadsheetId = id;
            // Always ensure tabs exist, even for saved IDs
            await this.ensureTabsExist(id);
            return id;
        } catch (e) {
            console.warn("Saved ID invalid, searching Drive...");
            localStorage.removeItem('habitTrackerSpreadsheetId');
        }
    }

    // 2. Search Drive
    id = await this.findExistingSpreadsheet();
    if (id) {
        this.spreadsheetId = id;
        localStorage.setItem('habitTrackerSpreadsheetId', id);
        await this.ensureTabsExist(id);
        return id;
    }

    // 3. Create New
    return this.createNewSpreadsheet();
  }

  async createNewSpreadsheet() {
    console.log('📝 Creating new spreadsheet...');
    const response = await window.gapi.client.sheets.spreadsheets.create({
      properties: { title: SPREADSHEET_NAME },
      sheets: [
        { properties: { title: 'Habits' } },
        { properties: { title: 'Completions' } },
        { properties: { title: 'SleepData' } },
        { properties: { title: 'Economy' } },
        { properties: { title: 'Inventory' } },
        { properties: { title: 'ShopItems' } }
      ],
    });

    this.spreadsheetId = response.result.spreadsheetId;
    localStorage.setItem('habitTrackerSpreadsheetId', this.spreadsheetId);
    
    // Write Headers immediately
    await this.writeHeaders(this.spreadsheetId);
    return this.spreadsheetId;
  }

  // CRITICAL FIX: Ensures tabs exist to prevent 400 Errors
  async ensureTabsExist(spreadsheetId) {
    try {
        const meta = await window.gapi.client.sheets.spreadsheets.get({ spreadsheetId });
        const existingTitles = meta.result.sheets.map(s => s.properties.title);
        
        const requiredTabs = ['Habits', 'Completions', 'SleepData', 'Economy', 'Inventory', 'ShopItems'];
        const missingTabs = requiredTabs.filter(tab => !existingTitles.includes(tab));

        if (missingTabs.length > 0) {
            console.log(`🛠️ Adding missing tabs: ${missingTabs.join(', ')}`);
            const requests = missingTabs.map(title => ({
                addSheet: { properties: { title } }
            }));
            
            await window.gapi.client.sheets.spreadsheets.batchUpdate({
                spreadsheetId,
                resource: { requests }
            });
            
            // Re-write headers for new tabs
            await this.writeHeaders(spreadsheetId);
        }
    } catch (error) {
        console.error("Error ensuring tabs exist:", error);
    }
  }

  async writeHeaders(spreadsheetId) {
      const headerData = [
          { range: 'Habits!A1:F1', values: [['ID', 'Name', 'Icon', 'Category', 'Color', 'Created At']] },
          { range: 'Completions!A1:C1', values: [['Habit ID', 'Date', 'Completed']] },
          { range: 'SleepData!A1:B1', values: [['Date', 'Time']] },
          { range: 'Economy!A1:B1', values: [['Key', 'Value']] },
          { range: 'Inventory!A1:E1', values: [['Ticket ID', 'Item Name', 'Won At', 'Is Used', 'Item ID']] },
          { range: 'ShopItems!A1:E1', values: [['Item ID', 'Name', 'Desire Level', 'Type', 'Cost']] }
      ];

      try {
          await window.gapi.client.sheets.spreadsheets.values.batchUpdate({
              spreadsheetId,
              resource: { data: headerData, valueInputOption: 'RAW' }
          });
      } catch (e) {
          console.error("Header write failed:", e);
      }
  }

  // ==========================================
  // 3. SYNC (UPLOAD)
  // ==========================================

  async syncToSheets(data) {
    if (!this.spreadsheetId) await this.getOrCreateSpreadsheet();

    // -- 1. Prepare Data --
    const habits = (data.habits || []).map(h => [
        h.id, h.name, h.icon, h.category, h.color, h.createdAt
    ]);

    const completions = [];
    Object.entries(data.completions || {}).forEach(([hId, dates]) => {
        Object.entries(dates).forEach(([date, val]) => {
            completions.push([hId, date, val ? 'TRUE' : 'FALSE']);
        });
    });

    const sleep = Object.entries(data.sleepData || {}).map(([date, val]) => [date, val.time]);

    // Market Data
    const market = data.market || {};
    const economy = market.economy || {};
    const ecoRows = [
        ['Points', economy.points || 0],
        ['Streak', economy.streak || 0],
        ['Rank', economy.rank || 'Apprentice']
    ];

    const inventory = (economy.inventory || []).map(i => [
        i.id, i.name, i.wonAt, i.isUsed ? 'TRUE' : 'FALSE', i.itemId
    ]);

    const shop = (market.shopItems || []).map(i => [
        i.id, i.name, i.desireLevel, i.type, i.cost
    ]);

    // -- 2. Clear & Update --
    try {
        // Clear old data first to avoid ghosts
        await window.gapi.client.sheets.spreadsheets.values.batchClear({
            spreadsheetId: this.spreadsheetId,
            resource: {
                ranges: [
                    'Habits!A2:F', 'Completions!A2:C', 'SleepData!A2:B',
                    'Economy!A2:B', 'Inventory!A2:E', 'ShopItems!A2:E'
                ]
            }
        });

        // Write new data
        await window.gapi.client.sheets.spreadsheets.values.batchUpdate({
            spreadsheetId: this.spreadsheetId,
            resource: {
                data: [
                    { range: 'Habits!A2', values: habits.length ? habits : [['']] },
                    { range: 'Completions!A2', values: completions.length ? completions : [['']] },
                    { range: 'SleepData!A2', values: sleep.length ? sleep : [['']] },
                    { range: 'Economy!A2', values: ecoRows },
                    { range: 'Inventory!A2', values: inventory.length ? inventory : [['']] },
                    { range: 'ShopItems!A2', values: shop.length ? shop : [['']] }
                ],
                valueInputOption: 'RAW'
            }
        });

        const timestamp = new Date().toISOString();
        return { success: true, timestamp, url: this.getSpreadsheetUrl() };
    } catch (error) {
        console.error("Sync Failed:", error);
        throw error;
    }
  }

  // ==========================================
  // 4. FETCH (DOWNLOAD)
  // ==========================================

  async fetchFromSheets() {
    if (!this.spreadsheetId) await this.getOrCreateSpreadsheet();

    const ranges = [
        'Habits!A2:F', 'Completions!A2:C', 'SleepData!A2:B',
        'Economy!A2:B', 'Inventory!A2:E', 'ShopItems!A2:E'
    ];

    try {
        const response = await window.gapi.client.sheets.spreadsheets.values.batchGet({
            spreadsheetId: this.spreadsheetId,
            ranges
        });

        const results = response.result.valueRanges;
        
        // Safe Access Helper
        const getVals = (idx) => (results[idx] && results[idx].values) ? results[idx].values : [];

        // -- Parse Habits --
        const habits = getVals(0).map(r => ({
            id: r[0], name: r[1], icon: r[2], category: r[3], color: r[4], createdAt: r[5]
        }));

        // -- Parse Completions --
        const completions = {};
        getVals(1).forEach(r => {
            if (!completions[r[0]]) completions[r[0]] = {};
            completions[r[0]][r[1]] = r[2] === 'TRUE';
        });

        // -- Parse Sleep --
        const sleepData = {};
        getVals(2).forEach(r => {
            sleepData[r[0]] = { time: r[1] };
        });

        // -- Parse Market --
        const economy = { points: 0, streak: 0, rank: 'Apprentice', inventory: [] };
        getVals(3).forEach(r => {
            if (r[0] === 'Points') economy.points = Number(r[1]);
            if (r[0] === 'Streak') economy.streak = Number(r[1]);
            if (r[0] === 'Rank') economy.rank = r[1];
        });

        economy.inventory = getVals(4).map(r => ({
            id: r[0], name: r[1], wonAt: r[2], isUsed: r[3] === 'TRUE', itemId: r[4]
        }));

        const shopItems = getVals(5).map(r => ({
            id: r[0], name: r[1], desireLevel: Number(r[2]), type: r[3], cost: Number(r[4])
        }));

        return { 
            habits, completions, sleepData, 
            market: { economy, shopItems } 
        };

    } catch (error) {
        console.error("Fetch Failed:", error);
        throw error;
    }
  }

  // ==========================================
  // 5. UTILS & AUTO-SYNC
  // ==========================================

  startAutoSync() {
    this.stopAutoSync();
    // Sync every 5 minutes (300000 ms) automatically
    this.autoSyncInterval = setInterval(() => {
        if (this.isAuthenticated()) {
            console.log("🔄 Auto-sync triggered...");
            // Trigger an event or call store method via callback if configured
        }
    }, 300000);
  }

  stopAutoSync() {
    if (this.autoSyncInterval) clearInterval(this.autoSyncInterval);
  }

  getSpreadsheetUrl() {
    return this.spreadsheetId ? `https://docs.google.com/spreadsheets/d/${this.spreadsheetId}` : null;
  }
}

export default new GoogleSheetsService();