# Copilot Instructions

## Accessibility & WCAG Compliance

All new features and UI changes **must** follow WCAG 2.1 AA standards:

- **Semantic HTML**: Use proper elements (`<button>`, `<a>`, `<input>`, headings, landmarks). Never use `<div>` or `<span>` for interactive elements without appropriate ARIA roles.
- **ARIA attributes**: All interactive elements must have accessible names via visible text, `aria-label`, or `aria-labelledby`. Use `aria-pressed` for toggle buttons, `role="checkbox"` with `aria-checked` for custom checkboxes.
- **Dynamic content**: Use `aria-live="polite"` with `aria-atomic="true"` to announce state changes (e.g. selection counts, loading states, mode changes) to screen readers.
- **Keyboard navigation**: All interactive elements must be reachable and operable via keyboard. Ensure visible focus indicators using `focus-visible:ring-2 focus-visible:ring-ring`.
- **Touch targets**: Interactive elements must meet the minimum 44×44px touch target size on mobile.
- **Loading states**: Use `aria-busy="true"` on elements with pending async operations, and `disabled` to prevent duplicate actions.
- **Dialogs**: Use Radix UI Dialog components which provide built-in focus trapping and `role="dialog"`. Always include `DialogTitle` and `DialogDescription`.
- **Color contrast**: Ensure text and UI elements meet minimum contrast ratios (4.5:1 for normal text, 3:1 for large text) using the project's CSS custom properties.
- **Icons**: Decorative icons must have `aria-hidden="true"`. Meaningful icons must have descriptive `aria-label` text.

## Tech Stack

- React 19, TypeScript, Vite, React Router v7
- Tailwind CSS with Radix UI primitives
- Vitest + React Testing Library for tests
- Vercel Functions for API endpoints, Vercel Blob for storage
- `cn()` utility (clsx + tailwind-merge) for conditional class names
