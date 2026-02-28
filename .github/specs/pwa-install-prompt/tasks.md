# Tasks

## Task 1: Create `useInstallPrompt` hook

**File**: `src/hooks/useInstallPrompt.ts`

- [x] Define `BeforeInstallPromptEvent` interface
- [x] Implement `useInstallPrompt` hook with `isVisible`, `handleInstall`, `handleDismiss`
- [x] Listen for `beforeinstallprompt` on mount; remove listener on unmount
- [x] Skip if app is already in standalone mode
- [x] Show banner after `INSTALL_PROMPT_DELAY` ms if `pwa-install-dismissed` is not set
- [x] `handleInstall`: call `prompt.prompt()`, handle errors, clear prompt, hide banner
- [x] `handleDismiss`: set localStorage, hide banner

## Task 2: Create `PWAInstallPrompt` component

**File**: `src/components/ui/PWAInstallPrompt.tsx`

- [x] Use `useInstallPrompt` hook
- [x] Return `null` when `isVisible` is `false`
- [x] Render fixed-position bottom banner with Tailwind classes
- [x] Use existing `Button` component for Install and dismiss actions
- [x] Use `Download` and `X` icons from `lucide-react`
- [x] Add `role="alert"` and `aria-label` for accessibility
- [x] Add `aria-label="Dismiss install prompt"` to dismiss button

## Task 3: Integrate into App

**File**: `src/App.tsx`

- [x] Import `PWAInstallPrompt`
- [x] Render `<PWAInstallPrompt />` inside `BrowserRouter`, outside `Routes`

## Task 4: Write tests

**Files**: `src/components/ui/PWAInstallPrompt.test.tsx`, `src/hooks/useInstallPrompt.test.ts`

- [x] Test: renders nothing by default (no `beforeinstallprompt` fired)
- [x] Test: renders banner after event fires and delay (mock timers)
- [x] Test: clicking Install button calls install handler
- [x] Test: clicking dismiss button calls dismiss handler
- [x] Test: does not show if `pwa-install-dismissed` is in localStorage

## Verification

- [x] Run `npm test` – all 103 tests pass
- [x] Run `npm run build` – build succeeds without TypeScript errors
- [x] Manual smoke test: verify banner appears after delay on Chrome
