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

## Repository Settings

### Automatically delete head branches after merge

GitHub has a built-in setting to delete the source branch automatically whenever a pull request is merged. To enable it:

1. Go to the repository on GitHub.
2. Click **Settings** (top navigation tab).
3. Scroll down to the **Pull Requests** section.
4. Tick **Automatically delete head branches**.

Once enabled, GitHub will delete the PR's head branch immediately after it is merged, with no workflow required.

## Tech Stack

- React 19 + TypeScript
- Vite (build tooling)
- Tailwind CSS + Radix UI
- React Hook Form + Zod
- React Router
- Vitest + React Testing Library