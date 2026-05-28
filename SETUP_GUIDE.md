# Setup Instructions for Sporty Fitness Dashboard UI

## Prerequisites
- Node.js and npm (or pnpm) installed on your system
- A terminal/command prompt

## Quick Setup

### Option 1: Using the Setup Script (Windows)
Simply double-click `setup.bat` in the project folder. It will automatically:
1. Install all dependencies
2. Show you the next steps

### Option 2: Manual Setup

1. **Install Dependencies**
   ```bash
   pnpm install
   ```
   Or if using npm:
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   pnpm dev
   ```
   Or if using npm:
   ```bash
   npm run dev
   ```

3. **Open in Browser**
   The development server will start at `http://localhost:5174`

## Building for Production

To create a production build:
```bash
pnpm build
```

## Project Structure

- `src/app/App.tsx` - Main application component
- `src/app/pages/` - Page components (Onboarding, Dashboard, etc.)
- `src/app/components/` - Reusable UI components
- `src/app/context/` - React context for state management
- `src/styles/` - CSS and styling files

## Available Routes

- `/` - Onboarding page
- `/dashboard` - Main dashboard
- `/realtime` - Real-time dashboard
- `/sensors` - Sensor canvas page

## Troubleshooting

If you encounter any issues:

1. **Dependencies not installing?**
   - Delete `node_modules` folder and `pnpm-lock.yaml` (or `package-lock.json`)
   - Run install again: `pnpm install`

2. **Port 5173 already in use?**
   - Vite will automatically use the next available port
   - Check your terminal output for the actual URL

3. **TypeScript errors?**
   - These usually resolve after the dev server starts
   - Make sure you have the latest version of your IDE's TypeScript plugin
