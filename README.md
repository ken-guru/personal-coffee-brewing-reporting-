# BrewLog – Personal Coffee Brewing Reporter

A Progressive Web App (PWA) for tracking and analysing your personal coffee brewing sessions.

## Features

- Log coffee brewing sessions with detailed parameters (grind, method, water, brew time, rating)
- Auto-suggested grind equipment (Knock Aergrind, Wilfa Svart)
- Auto-suggested brewing methods including Aeropress Go, Kalita Hand Brewer and Siemens Coffee Brewer
- Smart defaults: coffee and water amounts pre-filled based on the selected brewing method
- Guest rating support per session
- Installable as a PWA – works offline after the first visit
- Data stored locally in the browser (no account required)

## Getting Started

```bash
npm install
npm run dev
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build locally |
| `npm test` | Run the test suite |
| `npm run lint` | Run ESLint |

## Tech Stack

- React 19 + TypeScript
- Vite (build tooling)
- Tailwind CSS + Radix UI
- React Hook Form + Zod
- React Router
- Vitest + React Testing Library