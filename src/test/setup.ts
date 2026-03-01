import '@testing-library/jest-dom';
import { vi } from 'vitest';

// jsdom does not implement window.matchMedia; provide a minimal stub.
// Guard is needed because API tests run in a Node.js environment where window is undefined.
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // Default fetch mock: returns a failed response to prevent real network calls in tests.
  // Individual tests can override this mock as needed.
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok: false,
    status: 503,
    json: () => Promise.resolve({}),
    clone: function () { return this; },
  });
}
