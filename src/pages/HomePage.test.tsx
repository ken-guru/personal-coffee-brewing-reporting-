import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HomePage } from '../pages/HomePage';
import { makeEntry } from '../test/fixtures';

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
});
