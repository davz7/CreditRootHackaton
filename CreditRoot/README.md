# CreditRoot — Frontend

React + Vite frontend for the MananaSeguro retirement savings platform, built on the Stellar blockchain with Etherfuse StableBond integration.

## Overview

CreditRoot is the web interface for MananaSeguro — a pension/retirement savings product targeting Mexican workers. It connects to the Stellar network via the Freighter wallet and uses Etherfuse StableBonds as the savings instrument.

## Folder Structure

```
src/
├── app/                    # Shell layout and navigation config
├── assets/                 # Static images and SVGs
├── components/
│   ├── common/             # Reusable UI primitives (MetricCard, RateBadge, SectionCard, SectionHeading)
│   └── layout/             # AppHeader and AppFooter
├── data/                   # Static content (retirementContent.js)
├── features/               # Feature modules (each owns its components)
│   ├── access/             # Wallet connect flow (ConnectAccountCard)
│   ├── dashboard/          # Dashboard widgets (AutoloanCard, ContributionHistory, RetirementSnapshot)
│   ├── planner/            # Contribution planner (ContributionPlanner)
│   ├── referrals/          # Referral module (ReferralModule)
│   ├── simulator/          # Carlos simulator (CarlosSimulator)
│   └── withdrawal/         # Withdrawal flow (WithdrawalFlow)
├── hooks/                  # Custom React hooks
│   ├── useEtherfuseRate.js         # Fetches live StableBond yield rate
│   └── useRetirementProjection.js  # Calculates retirement projections
├── lib/                    # Third-party integrations
│   ├── stellar.js          # Stellar SDK helpers
│   └── wallet.js           # Freighter wallet connection utilities
├── screens/                # Full-page views
│   ├── LandingScreen.jsx
│   ├── AuthScreen.jsx
│   ├── HomeScreen.jsx
│   ├── DashboardScreen.jsx
│   ├── PlannerScreen.jsx
│   ├── WithdrawalScreen.jsx
│   └── components/         # Landing-specific sections (stats, testimonials, calculator, CTA)
└── utils/
    ├── formatters.js       # Date and currency formatters
    └── projections.js      # Projection calculation helpers
```

## Local Setup

**Requirements:** Node.js 18+, npm 9+

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev
```

Open `http://localhost:5173` in your browser.

> To test wallet flows, install the [Freighter browser extension](https://www.freighter.app/) and connect to Stellar Testnet.

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

## Key Files

| File | Purpose |
|------|---------|
| `src/main.jsx` | Application entry point |
| `src/App.jsx` | Root component, router setup |
| `src/app/AppShell.jsx` | Main layout wrapper (nav + page content) |
| `src/app/navigation.js` | Route and navigation definitions |
| `src/lib/stellar.js` | Stellar network helpers (send, fetch balance) |
| `src/lib/wallet.js` | Freighter wallet connection logic |
| `src/hooks/useEtherfuseRate.js` | Live yield rate from Etherfuse API |
| `src/hooks/useRetirementProjection.js` | Core retirement math |
| `src/utils/formatters.js` | Currency (MXN/USD) and date formatters |
| `vite.config.js` | Vite build configuration |
