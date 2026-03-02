# BrewLog – Personal Coffee Brewing Reporter

A Progressive Web App (PWA) for tracking and analysing your personal coffee brewing sessions. Log detailed parameters, share your brews with guests, and discover what works best for your coffee.

## Features

- **Brew Logging**: Log coffee brewing sessions with detailed parameters (grind, method, water, brew time, rating)
- **Smart Defaults**: Coffee and water amounts are pre-filled based on the selected brewing method
- **Equipment Suggestions**: Auto-suggested grind equipment (Knock Aergrind, Wilfa Svart) and brewing methods (Aeropress Go, Kalita Hand Brewer, Siemens Coffee Brewer)
- **Guest Ratings**: Collect feedback from guests on each brewing session
- **Share & Collaborate**: Share specific brews with others for feedback via unique URLs
- **Works Offline**: Installable as a PWA – works offline after the first visit
- **No Account Required**: All data stored locally in the browser for complete privacy
- **Dark Mode**: Theme toggle for comfortable viewing in any lighting condition

## Quick Start

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
npm install
npm run dev
```

The application will be available at `http://localhost:5173`.

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite development server with hot reload |
| `npm run build` | Type-check with TypeScript and build for production |
| `npm run build:analyze` | Build and analyze bundle size |
| `npm run preview` | Preview the production build locally |
| `npm run test` | Run the test suite once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run lint` | Run ESLint to check code quality |

## Project Structure

```
├── api/                           # Vercel API routes (serverless functions)
│   └── brews/
│       ├── [id].ts               # Get/update/delete specific brew
│       ├── share.ts              # Shared brew management
│       └── shared.ts             # Fetch shared brews
├── src/
│   ├── components/               # React components
│   │   ├── brewing/              # Brew-related components
│   │   ├── layout/               # Layout components (Header, Layout)
│   │   └── ui/                   # Reusable UI components (Button, Input, etc.)
│   ├── pages/                    # Page components (Home, Detail, SharedBrew, etc.)
│   ├── hooks/                    # Custom React hooks
│   ├── lib/                      # Utility libraries (storage, utils)
│   ├── types/                    # TypeScript type definitions
│   ├── test/                     # Test setup and fixtures
│   ├── App.tsx                   # Root component
│   └── main.tsx                  # Application entry point
├── public/                       # Static assets
├── vite.config.ts               # Vite configuration
├── tailwind.config.js           # Tailwind CSS configuration
├── vercel.json                  # Vercel deployment configuration
└── package.json                 # Project dependencies and scripts
```

## Tech Stack

- **Frontend Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + Radix UI
- **Forms & Validation**: React Hook Form + Zod
- **Routing**: React Router v7
- **Testing**: Vitest + React Testing Library
- **API**: Vercel Serverless Functions (Node.js)
- **Deployment**: Vercel
- **Analytics**: Vercel Analytics

## Architecture

### Frontend (Client-Side)
- Built with React and TypeScript for type safety
- Uses React Router for client-side navigation
- LocalStorage for persistent data management
- Service Worker for offline capability (PWA)

### Backend (Serverless Functions)
- Vercel serverless functions in the `api/` directory
- Handle brew data operations (CRUD)
- Manage shared brew functionality
- Defined as TypeScript files that export default handlers

### Data Management
- Primary storage: Browser LocalStorage
- API layer for shared brew functionality
- Type-safe with TypeScript and Zod validation

## Development Guide

### Setting Up Your Local Environment

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the dev server: `npm run dev`
4. Open http://localhost:5173 in your browser

### Writing Components

- Place new components in the appropriate folder under `src/components/`
- Use functional components with hooks
- Follow the existing naming conventions
- Include tests alongside components (`.test.tsx` files)

### Adding Tests

- Use Vitest for unit testing
- Use React Testing Library for component testing
- Test files should be colocated with the component: `ComponentName.test.tsx`
- Run tests with `npm run test` or `npm run test:watch`

Example test structure:
```typescript
import { render, screen } from '@testing-library/react'
import { MyComponent } from './MyComponent'

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText(/expected text/i)).toBeInTheDocument()
  })
})
```

### Creating API Routes

API routes are serverless functions in the `api/` directory. Each file automatically becomes an endpoint.

Example API route (`api/brews/example.ts`):
```typescript
import { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method === 'GET') {
    return res.status(200).json({ message: 'Success' })
  }
  res.status(405).end()
}
```

### Code Style

- ESLint is configured for code quality
- Run `npm run lint` to check for issues
- TypeScript provides type safety across the codebase
- Follow existing code patterns and style

## Testing

### Running Tests

```bash
# Run all tests once
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Test Coverage

The project uses Vitest with v8 provider for coverage reporting. HTML reports are generated in the `coverage/` directory.

## Deployment

The project is deployed on Vercel. Configuration is managed through `vercel.json`.

### Automatic Deployments
- Deployments are triggered automatically on pushes to the main branch
- Preview deployments are created for pull requests

### Environment Variables
- Environment configuration is managed in Vercel project settings
- Analytics tracking is enabled via `@vercel/analytics`
- Blob storage integration available via `@vercel/blob`

## Contributing

We welcome contributions! Here's how to get started:

1. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Your Changes**
   - Write clear, descriptive commit messages
   - Add tests for new functionality
   - Ensure your code passes linting: `npm run lint`
   - Update relevant documentation

3. **Test Your Changes**
   ```bash
   npm run test
   npm run build
   ```

4. **Create a Pull Request**
   - Reference any related issues
   - Provide a clear description of your changes
   - Ensure all CI checks pass

### Code Review Process

All pull requests require:
- Passing tests (`npm run test`)
- Passing linting (`npm run lint`)
- Successful build (`npm run build`)

See [CODEOWNERS](./CODEOWNERS) for code review responsibilities.

## Troubleshooting

### Development Server Issues
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf .vite`

### Build Failures
- Check Node version (should be 18+)
- Run type check: `npm run build` (includes `tsc -b`)
- Check for TypeScript errors in the IDE

### Test Failures
- Clear test cache: `npm run test -- --clearCache`
- Run tests in watch mode to debug: `npm run test:watch`

## License

This project is private and owned by ken-guru.