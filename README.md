# FinanceOS — Universal Budget Dashboard

A full-featured, multi-archetype budgeting dashboard built with React + Vite. Deploy to Vercel in under 2 minutes.

## Features
- 8 user archetypes (Individual, Freelancer, SME, Corporation, NGO, Public Sector, Fund, Co-op)
- Live editable inputs — every chart recalculates instantly
- 8 dashboard modules: Overview, Cash Flow, Budget, Goals, Debts, Scenarios, Tax, Reports
- AI Budget Assistant with context-aware responses
- One-click PDF export (multi-page, fully formatted)
- Multi-currency: USD, EUR, GBP, SEK
- Budget health score, FIRE calculator, debt avalanche optimiser, stress testing

## Deploy to Vercel

### Option A — Vercel CLI (fastest)
```bash
npm i -g vercel
cd financeos
npm install
vercel --prod
```

### Option B — GitHub + Vercel Dashboard
1. Push this folder to a GitHub repo
2. Go to https://vercel.com/new
3. Import the repo → Framework: Vite → click Deploy
4. Done — live in ~60 seconds

### Option C — Drag & Drop
1. Run `npm run build` locally
2. Drag the `dist/` folder to https://vercel.com/new

## Local Development
```bash
npm install
npm run dev
# Opens at http://localhost:5173
```

## Project Structure
```
financeos/
├── index.html              # Root HTML
├── vite.config.js          # Vite + chunk splitting
├── vercel.json             # Vercel deploy config
├── src/
│   ├── main.jsx            # Entry point
│   ├── App.jsx             # All pages + root App
│   ├── index.css           # Global dark theme CSS
│   ├── components/
│   │   └── Charts.jsx      # Shared chart components
│   ├── data/
│   │   └── constants.js    # Archetypes, currencies, defaults
│   └── utils/
│       ├── helpers.js      # fmt(), buildCashflow(), healthScore()
│       └── pdfGenerator.js # Full jsPDF report generator
└── public/
    └── favicon.svg
```

## Customisation
- **Brand colours** → `src/index.css` CSS variables under `:root`
- **Add archetype** → `src/data/constants.js` ARCHETYPES array + makeDefaults()
- **Add currency** → `src/data/constants.js` CURRENCIES object
- **Add page** → new component in `src/App.jsx`, add to navItems + page router
