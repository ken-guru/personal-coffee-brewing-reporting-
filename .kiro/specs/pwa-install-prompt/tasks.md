# Tasks

## Task 1: Create `useInstallPrompt` hook

**File**: `src/hooks/useInstallPrompt.ts`

- [ ] Define `BeforeInstallPromptEvent` interface
- [ ] Implement `useInstallPrompt` hook with `isVisible`, `handleInstall`, `handleDismiss`
- [ ] Listen for `beforeinstallprompt` on mount; remove listener on unmount
- [ ] Skip if app is already in standalone mode
- [ ] Show banner after `INSTALL_PROMPT_DELAY` ms if `pwa-install-dismissed` is not set
- [ ] `handleInstall`: call `prompt.prompt()`, handle errors, clear prompt, hide banner
- [ ] `handleDismiss`: set localStorage, hide banner

## Task 2: Create `PWAInstallPrompt` component

**File**: `src/components/ui/PWAInstallPrompt.tsx`

- [ ] Use `useInstallPrompt` hook
- [ ] Return `null` when `isVisible` is `false`
- [ ] Render fixed-position bottom banner with Tailwind classes
- [ ] Use existing `Button` component for Install and dismiss actions
- [ ] Use `Download` and `X` icons from `lucide-react`
- [ ] Add `role="alert"` and `aria-label` for accessibility
- [ ] Add `aria-label="Dismiss install prompt"` to dismiss button

## Task 3: Integrate into App

**File**: `src/App.tsx`

- [ ] Import `PWAInstallPrompt`
- [ ] Render `<PWAInstallPrompt />` inside `BrowserRouter`, outside `Routes`

## Task 4: Write tests

**File**: `src/components/ui/PWAInstallPrompt.test.tsx`

- [ ] Test: renders nothing by default (no `beforeinstallprompt` fired)
- [ ] Test: renders banner after event fires and delay (mock timers)
- [ ] Test: clicking Install button calls install handler
- [ ] Test: clicking dismiss button calls dismiss handler
- [ ] Test: does not show if `pwa-install-dismissed` is in localStorage

## Verification

- [ ] Run `npm test` – all tests pass
- [ ] Run `npm run build` – build succeeds without TypeScript errors
- [ ] Manual smoke test: verify banner appears after delay on Chrome
