import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { SharedBrewPage } from '../pages/SharedBrewPage';

function renderSharedBrewPage(id: string) {
  return render(
    <MemoryRouter initialEntries={[`/shared/${id}`]}>
      <Routes>
        <Route path="/shared/:id" element={<SharedBrewPage />} />
        <Route path="/" element={<div>Home Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

const mockSharedBrew = {
  shareId: 'abc-123',
  sharedAt: '2024-03-15T10:00:00.000Z',
  brew: {
    coffeeProducer: 'Test Roaster',
    countryOfOrigin: 'Kenya',
    grindCoarseness: 'medium' as const,
    grindEquipment: 'Baratza',
    brewingMethod: 'pour-over' as const,
    gramsOfCoffee: 15,
    millilitersOfWater: 250,
    waterSource: 'filtered-tap' as const,
    numberOfPeople: 1,
    brewTimeSeconds: 180,
    rating: 4,
    guestRatings: [],
  },
};

function mockHeaders(contentType = 'application/json') {
  return { get: (name: string) => name.toLowerCase() === 'content-type' ? contentType : null };
}

describe('SharedBrewPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows a loading state initially', () => {
    vi.mocked(globalThis.fetch).mockReturnValue(new Promise(() => {}));
    renderSharedBrewPage('abc-123');
    expect(screen.getByText('Loading brew…')).toBeInTheDocument();
  });

  it('renders the shared brew details after loading', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: mockHeaders(),
      json: () => Promise.resolve(mockSharedBrew),
      clone: function () { return this; },
    } as unknown as Response);

    renderSharedBrewPage('abc-123');

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Test Roaster' })).toBeInTheDocument();
    });
    expect(screen.getByText('Kenya')).toBeInTheDocument();
    expect(screen.getByText('Pour Over')).toBeInTheDocument();
  });

  it('shows an error message when the brew is not found', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: false,
      status: 404,
      headers: mockHeaders(),
      json: () => Promise.resolve({ error: 'Brew not found' }),
      clone: function () { return this; },
    } as unknown as Response);

    renderSharedBrewPage('nonexistent');

    await waitFor(() => {
      expect(screen.getByText('This shared brew was not found.')).toBeInTheDocument();
    });
  });

  it('shows a "Back to home" link on error', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: false,
      status: 404,
      headers: mockHeaders(),
      json: () => Promise.resolve({}),
      clone: function () { return this; },
    } as unknown as Response);

    renderSharedBrewPage('nonexistent');

    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'Back to home' })).toBeInTheDocument();
    });
  });

  it('shows a "Shared Brew" label above the brew details', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: mockHeaders(),
      json: () => Promise.resolve(mockSharedBrew),
      clone: function () { return this; },
    } as unknown as Response);

    renderSharedBrewPage('abc-123');

    await waitFor(() => {
      expect(screen.getByText('Shared Brew')).toBeInTheDocument();
    });
  });

  it('navigates to home on the back button', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: mockHeaders(),
      json: () => Promise.resolve(mockSharedBrew),
      clone: function () { return this; },
    } as unknown as Response);

    renderSharedBrewPage('abc-123');

    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'Back to home' })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('link', { name: 'Back to home' }));
    await waitFor(() => {
      expect(screen.getByText('Home Page')).toBeInTheDocument();
    });
  });

  it('shows an error when the API returns non-JSON (e.g. HTML from auth redirect)', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: mockHeaders('text/html'),
      json: () => Promise.reject(new Error('not json')),
      clone: function () { return this; },
    } as unknown as Response);

    renderSharedBrewPage('abc-123');

    await waitFor(() => {
      expect(screen.getByText(/unexpected response/i)).toBeInTheDocument();
    });
  });

  it('shows auth error when API returns 401 with non-JSON content', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: false,
      status: 401,
      redirected: false,
      headers: mockHeaders('text/html'),
      json: () => Promise.reject(new Error('not json')),
      clone: function () { return this; },
    } as unknown as Response);

    renderSharedBrewPage('abc-123');

    await waitFor(() => {
      expect(screen.getByText(/authentication required/i)).toBeInTheDocument();
    });
  });

  it('shows auth error when fetch was redirected to an auth page (e.g. Vercel SSO)', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      redirected: true,
      headers: mockHeaders('text/html'),
      json: () => Promise.reject(new Error('not json')),
      clone: function () { return this; },
    } as unknown as Response);

    renderSharedBrewPage('abc-123');

    await waitFor(() => {
      expect(screen.getByText(/authentication required/i)).toBeInTheDocument();
    });
  });
});
