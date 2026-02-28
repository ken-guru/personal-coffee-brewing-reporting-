import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { BrewingCard } from './BrewingCard';
import { makeEntry } from '../../test/fixtures';

function renderCard(overrides = {}) {
  const entry = makeEntry(overrides);
  render(
    <MemoryRouter>
      <BrewingCard entry={entry} />
    </MemoryRouter>
  );
  return entry;
}

describe('BrewingCard', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('displays the coffee producer name', () => {
    renderCard();
    expect(screen.getByText('Blue Bottle')).toBeInTheDocument();
  });

  it('displays the country of origin', () => {
    renderCard();
    expect(screen.getByText('Ethiopia')).toBeInTheDocument();
  });

  it('displays the brewing method label', () => {
    renderCard();
    expect(screen.getByText('Pour Over')).toBeInTheDocument();
  });

  it('displays the formatted brew time', () => {
    renderCard({ brewTimeSeconds: 185 });
    expect(screen.getByText('3:05')).toBeInTheDocument();
  });

  it('displays coffee and water amounts with ratio', () => {
    renderCard({ gramsOfCoffee: 15, millilitersOfWater: 250 });
    // ratio = 250/15 = 16.7
    expect(screen.getByText(/15g · 250ml · 1:16\.7/)).toBeInTheDocument();
  });

  it('shows guest rating count when guests are present', () => {
    renderCard({
      guestRatings: [
        { id: 'g1', rating: 5 },
        { id: 'g2', rating: 3 },
      ],
    });
    expect(screen.getByText('2 guest ratings')).toBeInTheDocument();
  });

  it('does not show guest rating count when none present', () => {
    renderCard({ guestRatings: [] });
    expect(screen.queryByText(/guest rating/)).not.toBeInTheDocument();
  });

  it('renders a link to the brew detail page', () => {
    const entry = makeEntry({ id: 'abc-123' });
    render(
      <MemoryRouter>
        <BrewingCard entry={entry} />
      </MemoryRouter>
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/brew/abc-123');
  });

  it('truncates comment text', () => {
    renderCard({ comment: 'Bright and fruity' });
    expect(screen.getByText(/"Bright and fruity"/)).toBeInTheDocument();
  });

  it('shows plural "people" label when multiple people served', () => {
    renderCard({ numberOfPeople: 3 });
    expect(screen.getByText('3 people')).toBeInTheDocument();
  });

  it('does not show people count for single person', () => {
    renderCard({ numberOfPeople: 1 });
    expect(screen.queryByText(/people/)).not.toBeInTheDocument();
  });
});
