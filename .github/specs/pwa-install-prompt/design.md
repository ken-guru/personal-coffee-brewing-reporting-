# Design Document

## Overview

The PWA Install Prompt adds a dismissible banner to the BrewLog application that invites users to install the app on their device. It hooks into the browser's native `beforeinstallprompt` event, defers it, and shows a styled notification after a short delay.

This design follows the application's existing architecture:
- Tailwind CSS for styling using the existing CSS variable theming
- Radix UI primitives (Button) from the existing component library
- Custom React hooks for logic isolation
- localStorage for persisting user preferences
- Vitest + React Testing Library for tests

## Architecture

### Component Structure

```
src/App.tsx (existing)
└── PWAInstallPrompt (new) – renders at root level, floats over layout

src/hooks/useInstallPrompt.ts (new)
└── Encapsulates beforeinstallprompt event, visibility state, install/dismiss logic

src/components/ui/PWAInstallPrompt.tsx (new)
└── Presentational banner rendered when hook reports isVisible === true
```

### Data Flow

1. **App Mount**: `useInstallPrompt` registers `beforeinstallprompt` listener
2. **Event fires**: Browser deems the app installable → event captured and deferred
3. **Delay + check**: After a short delay, if `pwa-install-dismissed` is not set in localStorage, `isVisible` becomes `true`
4. **User installs**: `handleInstall` calls `prompt.prompt()`, awaits `userChoice`, hides banner
5. **User dismisses**: `handleDismiss` sets localStorage flag, hides banner
6. **Standalone mode**: If `window.matchMedia('(display-mode: standalone)').matches` is `true`, banner is never shown

## Components and Interfaces

### useInstallPrompt Hook (`src/hooks/useInstallPrompt.ts`)

```typescript
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface UseInstallPromptResult {
  isVisible: boolean;
  handleInstall: () => Promise<void>;
  handleDismiss: () => void;
}

export function useInstallPrompt(): UseInstallPromptResult
```

**State:**
- `deferredPrompt`: stores the captured `BeforeInstallPromptEvent`
- `isVisible`: controls banner visibility

**Logic:**
- Listen for `beforeinstallprompt` on mount, remove listener on unmount
- Skip if running in standalone/PWA mode
- Show banner after `INSTALL_PROMPT_DELAY` ms if not previously dismissed
- `handleInstall`: calls `deferredPrompt.prompt()`, clears prompt, hides banner
- `handleDismiss`: sets `localStorage.setItem('pwa-install-dismissed', 'true')`, hides banner

### PWAInstallPrompt Component (`src/components/ui/PWAInstallPrompt.tsx`)

```tsx
export function PWAInstallPrompt(): React.ReactElement | null
```

Renders `null` when `isVisible` is `false`. Otherwise renders a fixed-position banner at the bottom of the screen using Tailwind classes and the existing `Button` component.

**UI structure:**
```
<div role="alert" aria-label="Install app prompt" className="fixed bottom-4 left-4 right-4 ...">
  <div> {/* icon + text */}
    <Download icon />
    <div>
      <p>Install BrewLog</p>
      <p>Add to your home screen for quick access and offline support.</p>
    </div>
  </div>
  <div> {/* action buttons */}
    <Button variant="default" size="sm" onClick={handleInstall}>Install</Button>
    <Button variant="ghost" size="sm" onClick={handleDismiss} aria-label="Dismiss">✕</Button>
  </div>
</div>
```

### Integration in App (`src/App.tsx`)

`<PWAInstallPrompt />` is added inside the `BrowserRouter` but outside the `Routes`, so it is always rendered regardless of route.

## Testing Strategy

### Hook Tests (`src/hooks/useInstallPrompt.test.ts`)

- Fire `beforeinstallprompt` event and verify `isVisible` becomes `true` after delay
- Verify banner does not show when `pwa-install-dismissed` is set in localStorage
- Verify `handleDismiss` sets localStorage and hides banner
- Verify `handleInstall` calls `prompt.prompt()` and hides banner
- Verify standalone mode check prevents banner

### Component Tests (`src/components/ui/PWAInstallPrompt.test.tsx`)

- Renders `null` when not installable (default state)
- Renders banner when `isVisible` is `true` (mock hook)
- Clicking "Install" calls `handleInstall`
- Clicking dismiss button calls `handleDismiss`

## Implementation Notes

### Constants

```typescript
const INSTALL_PROMPT_DELAY = 3000; // 3 seconds
const DISMISSED_STORAGE_KEY = 'pwa-install-dismissed';
```

### File Changes Required

1. **Create**: `src/hooks/useInstallPrompt.ts`
2. **Create**: `src/components/ui/PWAInstallPrompt.tsx`
3. **Create**: `src/components/ui/PWAInstallPrompt.test.tsx`
4. **Modify**: `src/App.tsx` – import and render `<PWAInstallPrompt />`

### Dependencies

No new dependencies required. Uses existing:
- React (`useState`, `useEffect`)
- Tailwind CSS (styling)
- `Button` component (`src/components/ui/Button.tsx`)
- `cn` utility (`src/lib/utils.ts`)
- `lucide-react` (`Download`, `X` icons)
- `localStorage` (browser API)

### Accessibility

- Banner uses `role="alert"` so screen readers announce it
- Dismiss button has explicit `aria-label`
- Focus management: banner does not steal focus on appear

### Browser Compatibility

- `beforeinstallprompt` is supported in Chromium-based browsers (Chrome, Edge, Samsung Internet)
- On iOS/Safari and Firefox, the event is not fired; the banner simply never appears
- The app remains fully functional without the install prompt

### Security Considerations

- `pwa-install-dismissed` stored in localStorage is non-sensitive
- No user data is transmitted
- The native browser install prompt handles all security for the installation itself
