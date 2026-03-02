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

  // Provide a working localStorage mock. Some versions of jsdom expose the
  // Storage interface but getItem/setItem/etc. are not callable in the test
  // runner. Replacing it with a simple in-memory implementation avoids the
  // "localStorage.X is not a function" errors.
  const store: Record<string, string> = {};
  const localStorageMock: Storage = {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = String(value); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach((k) => delete store[k]); },
    key: (index: number) => Object.keys(store)[index] ?? null,
    get length() { return Object.keys(store).length; },
  };
  Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true });

  // Default fetch mock: returns a failed response to prevent real network calls in tests.
  // Individual tests can override this mock as needed.
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok: false,
    status: 503,
    json: () => Promise.resolve({}),
    clone: function () { return this; },
  });
}
