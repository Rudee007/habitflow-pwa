# 🎯 Habit Tracker - Offline-First PWA

> Track your daily habits offline, sync with Google Sheets, and build better routines. No backend required.

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://habit-tracker-eight-xi.vercel.app/)
[![PWA](https://img.shields.io/badge/PWA-enabled-blue)](https://web.dev/progressive-web-apps/)
[![React](https://img.shields.io/badge/React-18-61dafb)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646cff)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

**[🚀 Try Live Demo](https://habit-tracker-eight-xi.vercel.app/)** • **[📖 Documentation](#-quick-start)** • **[🐛 Report Bug](https://github.com/yourusername/habit-tracker/issues)**

---

## 🌟 Why This Project Stands Out

Most habit trackers require:
- ❌ Backend server (Node.js, Django, etc.)
- ❌ Database (MongoDB, PostgreSQL, etc.)
- ❌ Constant internet connection
- ❌ Monthly hosting costs ($20-50)

**This project eliminates all of that.**

Instead:
- ✅ **Works 100% offline** with IndexedDB
- ✅ **Zero backend** - pure client-side React
- ✅ **Google Sheets as database** - serverless sync
- ✅ **Installable PWA** - works like native app
- ✅ **$0 hosting cost** - deploy to Vercel/Netlify free tier

---

## ✨ Features

### Core Functionality
- 📝 **Create & manage habits** with custom names and categories
- ✅ **Quick completion tracking** with one-tap interface
- 📅 **Calendar visualization** showing your progress over time
- 🔥 **Streak tracking** to maintain consistency
- 🏷️ **Habit categories** (Health, Productivity, Personal, etc.)
- 🌍 **Multi-language support** (English, Hindi, Marathi)

### Technical Excellence
- ⚡ **Lightning fast** - Sub-second load times with service worker caching
- 📱 **True PWA** - Install on desktop, Android, and iOS
- 🔄 **Smart background sync** - Auto-syncs when connection returns
- 💾 **Offline-first architecture** - Full functionality without internet
- 🔐 **Privacy-focused** - Data stays in your Google Sheet, no third-party servers
- 🎨 **Responsive design** - Works perfectly on all screen sizes
- ♿ **Accessible** - Keyboard navigation and screen reader support

---

## 🎥 Live Demo

**Try it now:** [https://habit-tracker-eight-xi.vercel.app/](https://habit-tracker-eight-xi.vercel.app/)

### Install as an App

**Desktop (Chrome/Edge/Brave):**
1. Click the install icon (⊕) in address bar
2. Click "Install"
3. Launch from desktop/start menu

**Android:**
1. Open in Chrome browser
2. Tap menu (⋮) → "Add to Home screen"
3. Tap "Install"
4. Access from home screen like any app

**iOS (Safari only):**
1. Tap Share button (⬆️)
2. Tap "Add to Home Screen"
3. App appears on home screen

---

## 🏗️ Architecture

### The Stack

Frontend: React 18 + Vite
Styling: Tailwind CSS
State: Zustand
Local Storage: IndexedDB
Cloud Sync: Google Sheets API
PWA: Workbox + Service Workers
Icons: Lucide React
Deployment: Vercel

text

**The Flow:**

1. **User creates habit** → Saved instantly to IndexedDB
2. **App works offline** → All data available locally
3. **Connection returns** → Service worker syncs to Google Sheets
4. **Multi-device sync** → Changes propagate across devices
5. **No server needed** → Everything runs in the browser

---

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **Google account** (for cloud sync)

### Installation

Clone the repository
git clone https://github.com/yourusername/habit-tracker.git
cd habit-tracker

Install dependencies
npm install

Start development server
npm run dev

text

Visit `http://localhost:5173` - the app opens automatically! 🎉

---

## 🔐 Google Sheets Setup

Enable cloud sync with your own Google Sheet:

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "New Project"
3. Name: "Habit Tracker" → Create
4. Wait ~30 seconds for creation

### Step 2: Enable Required APIs

1. In search bar, type "Google Sheets API"
2. Click "Enable"
3. Search "Google Drive API"
4. Click "Enable"

### Step 3: Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click "Create Credentials" → "OAuth client ID"
3. If prompted, configure consent screen:
   - User Type: **External**
   - App name: **My Habit Tracker**
   - User support email: Your email
   - Developer email: Your email
   - Save and continue through all steps
4. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: **Habit Tracker Web Client**
   - Authorized JavaScript origins:
     ```
     http://localhost:5173
     https://habit-tracker-eight-xi.vercel.app
     ```
   - Click "Create"
5. **Copy your Client ID** (looks like: `xxxxx.apps.googleusercontent.com`)

### Step 4: Add Credentials to Project

Create `src/config/googleConfig.js`:

export const GOOGLE_CONFIG = {
clientId: 'YOUR_CLIENT_ID_HERE.apps.googleusercontent.com',
apiKey: 'YOUR_API_KEY_HERE', // Optional
discoveryDocs: [
'https://sheets.googleapis.com/$discovery/rest?version=v4',
'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
],
scopes: [
'https://www.googleapis.com/auth/spreadsheets',
'https://www.googleapis.com/auth/drive.file'
].join(' ')
};

text

### Step 5: First Run

1. Start the app: `npm run dev`
2. Click "Connect Google Sheets" button
3. Sign in with Google
4. Grant permissions
5. App automatically creates "Habit Tracker Data" sheet
6. Start tracking! ✅

**Your data now syncs to your own Google Sheet** that you fully control.

---

## 📦 Build & Deploy

### Build Production Version

npm run build

text

Creates optimized production build in `dist/` folder.

### Deploy to Vercel (Recommended)

Install Vercel CLI
npm install -g vercel

Login (first time)
vercel login

Deploy to production
vercel --prod

text

**Or use GitHub integration:**
1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Click "Deploy"
5. Done! ✅

### Alternative: Deploy to Netlify

Build first
npm run build

Option 1: Drag & drop
Go to https://app.netlify.com/drop
Drag 'dist' folder
Option 2: CLI
npm install -g netlify-cli
netlify deploy --prod --dir=dist

text

---

## 🛠️ Development

### Project Structure

habit-tracker/
├── public/ # Static assets
│ ├── icon-192.png # PWA icon (192x192)
│ ├── icon-512.png # PWA icon (512x512)
│ └── apple-touch-icon.png # iOS icon (180x180)
│
├── src/
│ ├── components/ # React components
│ │ ├── HabitList.jsx # Main habit list
│ │ ├── HabitCard.jsx # Individual habit card
│ │ ├── Calendar.jsx # Calendar visualization
│ │ ├── Settings.jsx # Settings panel
│ │ ├── InstallPrompt.jsx # Custom install UI
│ │ └── InstallButton.jsx # Floating install button
│ │
│ ├── store/ # State management
│ │ └── habitStore.js # Zustand store
│ │
│ ├── utils/ # Helper functions
│ │ ├── googleSheets.js # Sheets API integration
│ │ ├── indexedDB.js # Local storage utilities
│ │ ├── syncManager.js # Sync orchestration
│ │ └── dateHelpers.js # Date utilities
│ │
│ ├── config/ # Configuration
│ │ └── googleConfig.js # Google API credentials
│ │
│ ├── hooks/ # Custom React hooks
│ │ └── useHabits.js # Habit management hook
│ │
│ ├── App.jsx # Main app component
│ ├── main.jsx # Entry point
│ └── index.css # Global styles
│
├── vite.config.js # Vite + PWA configuration
├── tailwind.config.js # Tailwind CSS config
├── postcss.config.js # PostCSS config
├── eslint.config.js # ESLint rules
├── package.json # Dependencies
└── README.md # This file

text

### Available Scripts

Development
npm run dev # Start dev server (localhost:5173)
npm run build # Build for production
npm run preview # Preview production build locally

Code Quality
npm run lint # Run ESLint

text

### Key Files Explained

**`vite.config.js`**
- Vite configuration
- PWA plugin setup
- Service worker configuration
- Workbox caching strategies

**`src/store/habitStore.js`**
- Zustand state management
- Habit CRUD operations
- Sync state tracking

**`src/utils/googleSheets.js`**
- Google Sheets API wrapper
- Authentication handling
- Data sync logic


---

## 🎨 Customization

### Change App Name & Theme

Edit `vite.config.js`:

manifest: {
name: 'Your App Name',
short_name: 'YourApp',
description: 'Your description',
theme_color: '#your-color',
background_color: '#your-color',
}

text

### Replace App Icons

1. Create icons:
   - `icon-192.png` (192x192px)
   - `icon-512.png` (512x512px)
   - `apple-touch-icon.png` (180x180px)

2. Use [PWA Asset Generator](https://www.pwabuilder.com/imageGenerator) for all sizes

3. Replace files in `public/` folder

### Modify Colors

Edit `tailwind.config.js`:

theme: {
extend: {
colors: {
primary: {
50: '#your-color',
100: '#your-color',
// ... add more shades
}
}
}
}

text

### Add App Screenshots

1. Create `public/screenshots/` folder
2. Add images:
   - Mobile: 640x1136px
   - Desktop: 1280x720px
3. Update `vite.config.js` manifest with screenshot paths

---

## 🧪 Testing

### Test Offline Functionality

Build and preview
npm run build
npm run preview

text

Then in browser:
1. Open DevTools (F12)
2. Go to **Network** tab
3. Check **Offline** checkbox
4. Refresh page
5. App should still work! ✅

### Test PWA Installation

**Desktop:**
1. Open in Chrome/Edge
2. Look for install icon (⊕) in address bar
3. Should appear within 3-5 seconds
4. Click to install

**Mobile:**
1. Open DevTools
2. Toggle device toolbar
3. Test on simulated mobile device
4. Check for install prompt

### Test Service Worker

DevTools → Application → Service Workers:
- Should show "activated and is running"
- Check "Update on reload" for development
- Click "Unregister" to test fresh registration

### Test Google Sheets Sync

1. Create a habit
2. Check browser console for sync logs
3. Open Google Drive
4. Find "Habit Tracker Data" sheet
5. Verify habit appears in sheet

---

## 🐛 Troubleshooting

### Service Worker Not Updating

**Problem:** Changes not appearing after redeployment

**Solution:**
// In browser console:
navigator.serviceWorker.getRegistrations()
.then(regs => regs.forEach(reg => reg.unregister()))
.then(() => location.reload());

text

Or manually:
- DevTools → Application → Service Workers
- Click "Unregister"
- Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

### Install Prompt Not Showing

**Desktop:**
- Wait 3-5 seconds after page load
- Interact with page (click, scroll)
- Check DevTools → Application → Manifest for errors

**Mobile:**
- Must be HTTPS (localhost OK for testing)
- Check manifest is valid
- Android: Automatic prompt may be delayed
- **Always available:** Menu (⋮) → "Add to Home screen"

### Google Sheets Sync Failing

**Check these:**

1. **Credentials correct?**
   - Verify Client ID in `googleConfig.js`
   - Check Cloud Console authorized origins

2. **APIs enabled?**
   - Google Sheets API ✅
   - Google Drive API ✅

3. **Permissions granted?**
   - Sign out and sign in again
   - Grant all permissions when prompted

4. **Sheet exists?**
   - App creates sheet on first sync
   - Check Google Drive for "Habit Tracker Data"

**Debug in console:**
// Check if signed in
console.log(gapi.auth2.getAuthInstance().isSignedIn.get());

// Check permissions
console.log(gapi.auth2.getAuthInstance().currentUser.get().getGrantedScopes());

text

### Build Errors

**Vite 7 + Rolldown issue:**

If you see `manualChunks is not a function`:

// vite.config.js
build: {
outDir: 'dist',
sourcemap: false,
// REMOVE manualChunks - Rolldown handles automatically
chunkSizeWarningLimit: 1000
}

text

**Module not found:**
Clear and reinstall
rm -rf node_modules package-lock.json
npm install

text

---

## 📚 Tech Stack Deep Dive

### Why These Technologies?

**React 18**
- Component-based architecture
- Virtual DOM for performance
- Huge ecosystem
- Industry standard

**Vite**
- 10-100x faster than Webpack
- Instant hot module replacement
- Optimized production builds
- Native ESM support

**Zustand**
- 100x simpler than Redux
- No boilerplate
- TypeScript-friendly
- 1KB bundle size

**Tailwind CSS**
- Utility-first approach
- No custom CSS needed
- Consistent design system
- Tiny production bundle

**Workbox**
- Google's PWA toolkit
- Smart caching strategies
- Background sync
- Offline support

**IndexedDB**
- Browser database
- Large storage capacity (50MB+)
- Async API
- Structured data

**Google Sheets API**
- Free serverless backend
- Familiar spreadsheet interface
- No database setup
- Built-in backup

---

## 📊 Performance

### Lighthouse Scores

Performance: 95-100
PWA: 100
Accessibility: 90-95
Best Practices: 100
SEO: 100

text

### Load Times

First Load: < 2 seconds
Cached Load: < 0.5 seconds
Offline Load: Instant
Time to Interactive: < 1 second

text

### Bundle Sizes

JavaScript: ~150KB (gzipped)
CSS: ~10KB (gzipped)
Total: ~160KB

text

---

## 🔒 Privacy & Security

### Your Data, Your Control

- ✅ **No analytics** - Zero tracking scripts
- ✅ **No ads** - Completely ad-free
- ✅ **No third-party servers** - Data stays local + your Google Sheet
- ✅ **Open source** - All code visible
- ✅ **Self-hosted** - Deploy anywhere you want

### Google Sheets Access

- App only accesses sheets it creates
- You own the data completely
- Revoke access anytime in [Google Account Settings](https://myaccount.google.com/permissions)
- Data never sent to any third party

### Local Storage

- IndexedDB stores data locally in your browser
- Cleared when you clear browser data
- Never accessible to other websites

---

## 🎯 Use Cases

This project is perfect for:

### Personal Use
- Track daily habits
- Build better routines
- Monitor consistency
- Visualize progress

### Learning
- Study modern React patterns
- Learn PWA development
- Understand service workers
- Practice state management
- Explore Google APIs

### Portfolio
- Showcase PWA skills
- Demonstrate offline-first architecture
- Show serverless integration
- Prove production-ready code

### Base for Your Project
- Fork and customize
- Add your own features
- Change UI/UX
- Integrate different APIs

---

## 🙏 Acknowledgments

Built with these amazing open-source projects:

- [React](https://react.dev/) - UI library
- [Vite](https://vitejs.dev/) - Build tool
- [Workbox](https://developers.google.com/web/tools/workbox) - PWA toolkit
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Zustand](https://github.com/pmndrs/zustand) - State management
- [Lucide](https://lucide.dev/) - Icon library
- [Google Sheets API](https://developers.google.com/sheets/api) - Cloud sync
- [Vite PWA Plugin](https://vite-pwa-org.netlify.app/) - PWA integration

Special thanks to the open-source community! 💙

---

## 📬 Connect

**Demo:** [Live App](https://habit-tracker-eight-xi.vercel.app/)  

---

## ⭐ Support

If you find this project useful:

- ⭐ **Star this repository**
- 🍴 **Fork and customize**
- 📢 **Share with others**
- 💬 **Open issues/PRs**
- 🐦 **Tweet about it**

---


<p align="center">
  <a href="https://habit-tracker-eight-xi.vercel.app/">View Demo</a> •
</p>

---

**Last Updated:** December 30, 2025  
**Version:** 1.0.0  
**Status:** ✅ Production Ready