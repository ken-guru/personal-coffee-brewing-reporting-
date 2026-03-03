import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HomePage } from '../pages/HomePage';
import { makeEntry } from '../test/fixtures';
import type { SharedBrew } from '../types/sharedBrew';

function makeSharedBrew(overrides: Partial<SharedBrew> = {}): SharedBrew {
  return {
    shareId: 'shared-1',
    sharedAt: '2024-03-15T10:00:00.000Z',
    brew: {
      coffeeProducer: 'Community Roaster',
      countryOfOrigin: 'Colombia',
      grindCoarseness: 'medium',
      grindEquipment: 'Baratza Encore',
      brewingMethod: 'pour-over',
      gramsOfCoffee: 15,
      millilitersOfWater: 250,
      waterSource: 'filtered-tap',
      numberOfPeople: 1,
      brewTimeSeconds: 180,
      rating: 4,
      guestRatings: [],
    },
    ...overrides,
  };
}

// Default mock: no shared brews
let mockSharedBrews: SharedBrew[] = [];

vi.mock('../hooks/useSharedBrews', () => ({
  useSharedBrews: () => ({ brews: mockSharedBrews, loading: false, error: null }),
}));

function renderHomePage() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <HomePage />
    </MemoryRouter>
  );
}

describe('HomePage', () => {
  beforeEach(() => {
    localStorage.clear();
    mockSharedBrews = [];
  });

  it('shows the "My Brews" heading', () => {
    renderHomePage();
    expect(screen.getByRole('heading', { name: 'My Brews' })).toBeInTheDocument();
  });

  it('shows the empty state when there are no entries', () => {
    renderHomePage();
    expect(screen.getByText('No brews logged yet')).toBeInTheDocument();
    expect(screen.getByText('Start tracking your coffee journey!')).toBeInTheDocument();
  });

  it('shows the Log Brew button in the header', () => {
    renderHomePage();
    expect(screen.getByRole('link', { name: /log brew/i })).toBeInTheDocument();
  });

  it('renders a card for each stored entry', () => {
    const a = makeEntry({ id: 'a', coffeeProducer: 'Roaster A', createdAt: '2024-01-02T00:00:00.000Z' });
    const b = makeEntry({ id: 'b', coffeeProducer: 'Roaster B', createdAt: '2024-01-01T00:00:00.000Z' });
    localStorage.setItem('coffee-brewing-entries', JSON.stringify([a, b]));
    renderHomePage();
    expect(screen.getByText('Roaster A')).toBeInTheDocument();
    expect(screen.getByText('Roaster B')).toBeInTheDocument();
  });

  it('displays the session count when entries exist', () => {
    const entry = makeEntry();
    localStorage.setItem('coffee-brewing-entries', JSON.stringify([entry]));
    renderHomePage();
    expect(screen.getByText(/1 session logged/)).toBeInTheDocument();
  });

  it('displays plural session count for multiple entries', () => {
    const entries = [
      makeEntry({ id: 'a' }),
      makeEntry({ id: 'b' }),
    ];
    localStorage.setItem('coffee-brewing-entries', JSON.stringify(entries));
    renderHomePage();
    expect(screen.getByText(/2 sessions logged/)).toBeInTheDocument();
  });

  it('does not show the empty state when entries exist', () => {
    const entry = makeEntry();
    localStorage.setItem('coffee-brewing-entries', JSON.stringify([entry]));
    renderHomePage();
    expect(screen.queryByText('No brews logged yet')).not.toBeInTheDocument();
  });

  it('shows the average rating when entries exist', () => {
    const entry = makeEntry({ rating: 4 });
    localStorage.setItem('coffee-brewing-entries', JSON.stringify([entry]));
    renderHomePage();
    expect(screen.getByText(/avg 4\.0★/)).toBeInTheDocument();
  });

  it('shows community brew session count and average rating', () => {
    mockSharedBrews = [
      makeSharedBrew({ shareId: 'c1', brew: { ...makeSharedBrew().brew, rating: 4 } }),
      makeSharedBrew({ shareId: 'c2', brew: { ...makeSharedBrew().brew, rating: 2 } }),
    ];
    renderHomePage();
    expect(screen.getByText(/2 sessions logged/)).toBeInTheDocument();
    expect(screen.getByText(/avg 3\.0★/)).toBeInTheDocument();
  });

  it('excludes community brews that duplicate a local entry', () => {
    const entry = makeEntry({ id: 'shared-1', coffeeProducer: 'Local Roaster' });
    localStorage.setItem('coffee-brewing-entries', JSON.stringify([entry]));
    mockSharedBrews = [
      makeSharedBrew({ shareId: 'shared-1', brew: { ...makeSharedBrew().brew, coffeeProducer: 'Local Roaster' } }),
    ];
    renderHomePage();
    // The producer name appears once (in My Brews), not twice
    expect(screen.getAllByText('Local Roaster')).toHaveLength(1);
    // Community section shows no-brews message
    expect(screen.getByText(/No community brews shared yet/)).toBeInTheDocument();
  });

  it('shows "Shared" badge on local brews that have been shared', () => {
    const entry = makeEntry({ id: 'shared-1' });
    localStorage.setItem('coffee-brewing-entries', JSON.stringify([entry]));
    mockSharedBrews = [makeSharedBrew({ shareId: 'shared-1' })];
    renderHomePage();
    expect(screen.getByText('Shared')).toBeInTheDocument();
  });

  it('does not show "Shared" badge on local brews that have not been shared', () => {
    const entry = makeEntry({ id: 'local-only' });
    localStorage.setItem('coffee-brewing-entries', JSON.stringify([entry]));
    mockSharedBrews = [];
    renderHomePage();
    expect(screen.queryByText('Shared')).not.toBeInTheDocument();
  });

  it('shows a duplicate button on each brew card', () => {
    const entry = makeEntry({ id: 'a', coffeeProducer: 'Roaster A' });
    localStorage.setItem('coffee-brewing-entries', JSON.stringify([entry]));
    renderHomePage();
    expect(screen.getByRole('button', { name: /duplicate roaster a brew/i })).toBeInTheDocument();
  });

  it('opens a duplicate confirmation dialog when the duplicate button is clicked', async () => {
    const entry = makeEntry({ id: 'a', coffeeProducer: 'Roaster A' });
    localStorage.setItem('coffee-brewing-entries', JSON.stringify([entry]));
    renderHomePage();
    fireEvent.click(screen.getByRole('button', { name: /duplicate roaster a brew/i }));
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    expect(screen.getByText('Duplicate Brew')).toBeInTheDocument();
  });

  it('closes the duplicate dialog when Cancel is clicked', async () => {
    const entry = makeEntry({ id: 'a', coffeeProducer: 'Roaster A' });
    localStorage.setItem('coffee-brewing-entries', JSON.stringify([entry]));
    renderHomePage();
    fireEvent.click(screen.getByRole('button', { name: /duplicate roaster a brew/i }));
    await waitFor(() => screen.getByRole('dialog'));
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('shows "Rate Today\'s Brews" section for unrated entries created today', () => {
    const today = new Date().toISOString();
    const entry = makeEntry({ id: 'a', coffeeProducer: 'Fresh Roast', rating: 0, createdAt: today, updatedAt: today });
    localStorage.setItem('coffee-brewing-entries', JSON.stringify([entry]));
    renderHomePage();
    expect(screen.getByRole('heading', { name: "Rate Today's Brews" })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /rate fresh roast brew/i })).toBeInTheDocument();
  });

  it('does not show unrated section for entries from previous days', () => {
    const entry = makeEntry({ id: 'a', coffeeProducer: 'Old Roast', rating: 0, createdAt: '2024-01-01T10:00:00.000Z', updatedAt: '2024-01-01T10:00:00.000Z' });
    localStorage.setItem('coffee-brewing-entries', JSON.stringify([entry]));
    renderHomePage();
    expect(screen.queryByRole('heading', { name: "Rate Today's Brews" })).not.toBeInTheDocument();
  });

  it('does not show unrated section when all today\'s brews are rated', () => {
    const today = new Date().toISOString();
    const entry = makeEntry({ id: 'a', coffeeProducer: 'Rated Roast', rating: 4, createdAt: today, updatedAt: today });
    localStorage.setItem('coffee-brewing-entries', JSON.stringify([entry]));
    renderHomePage();
    expect(screen.queryByRole('heading', { name: "Rate Today's Brews" })).not.toBeInTheDocument();
  });

  it('removes brew from unrated section after rating it via the modal', async () => {
    const today = new Date().toISOString();
    const entry = makeEntry({ id: 'a', coffeeProducer: 'Click Roast', rating: 0, createdAt: today, updatedAt: today });
    localStorage.setItem('coffee-brewing-entries', JSON.stringify([entry]));
    renderHomePage();
    fireEvent.click(screen.getByRole('button', { name: /rate click roast brew/i }));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /4 stars/i }));
    fireEvent.click(screen.getByRole('button', { name: /save rating/i }));
    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: "Rate Today's Brews" })).not.toBeInTheDocument();
    });
  });
});
