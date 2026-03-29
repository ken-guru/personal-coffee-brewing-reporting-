import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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

  it('does not show brew time when brew time is null', () => {
    renderCard({ brewTimeSeconds: null });
    expect(screen.queryByText('N/A')).not.toBeInTheDocument();
  });

  it('displays coffee and water amounts with water source and ratio', () => {
    renderCard({ gramsOfCoffee: 15, millilitersOfWater: 250, waterSource: 'filtered-tap' });
    // ratio = 250/15 = 16.7
    expect(screen.getByText(/15g · 250ml \(Filtered Tap\) · 1:16\.7/)).toBeInTheDocument();
  });

  it('displays the grind equipment', () => {
    renderCard({ grindEquipment: 'Baratza Encore' });
    expect(screen.getByText('Baratza Encore')).toBeInTheDocument();
  });

  it('shows "Shared" badge when isShared is true', () => {
    const entry = makeEntry();
    render(
      <MemoryRouter>
        <BrewingCard entry={entry} isShared />
      </MemoryRouter>
    );
    expect(screen.getByText('Shared')).toBeInTheDocument();
  });

  it('does not show "Shared" badge when isShared is false', () => {
    renderCard();
    expect(screen.queryByText('Shared')).not.toBeInTheDocument();
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

  it('does not show a duplicate button when onDuplicate is not provided', () => {
    renderCard();
    expect(screen.queryByRole('button', { name: /duplicate/i })).not.toBeInTheDocument();
  });

  it('shows a duplicate button when onDuplicate is provided', () => {
    const entry = makeEntry({ id: 'abc-123' });
    render(
      <MemoryRouter>
        <BrewingCard entry={entry} onDuplicate={() => {}} />
      </MemoryRouter>
    );
    expect(screen.getByRole('button', { name: /duplicate blue bottle brew/i })).toBeInTheDocument();
  });

  it('calls onDuplicate when the duplicate button is clicked', () => {
    const onDuplicate = vi.fn();
    const entry = makeEntry({ id: 'abc-123' });
    render(
      <MemoryRouter>
        <BrewingCard entry={entry} onDuplicate={onDuplicate} />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole('button', { name: /duplicate/i }));
    expect(onDuplicate).toHaveBeenCalledOnce();
  });

  it('shows a checkbox when in selection mode', () => {
    const entry = makeEntry();
    render(
      <MemoryRouter>
        <BrewingCard entry={entry} selectionMode selected={false} onToggleSelect={() => {}} />
      </MemoryRouter>
    );
    expect(screen.getByRole('button', { name: /select blue bottle brew/i })).toBeInTheDocument();
  });

  it('renders a select button instead of a link in selection mode', () => {
    const entry = makeEntry();
    render(
      <MemoryRouter>
        <BrewingCard entry={entry} selectionMode selected={false} onToggleSelect={() => {}} />
      </MemoryRouter>
    );
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /select blue bottle brew/i })).toBeInTheDocument();
  });

  it('calls onToggleSelect when clicked in selection mode', () => {
    const onToggleSelect = vi.fn();
    const entry = makeEntry({ id: 'sel-1' });
    render(
      <MemoryRouter>
        <BrewingCard entry={entry} selectionMode selected={false} onToggleSelect={onToggleSelect} />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole('button', { name: /select blue bottle brew/i }));
    expect(onToggleSelect).toHaveBeenCalledWith('sel-1');
  });

  it('shows deselect label when selected', () => {
    const entry = makeEntry();
    render(
      <MemoryRouter>
        <BrewingCard entry={entry} selectionMode selected onToggleSelect={() => {}} />
      </MemoryRouter>
    );
    expect(screen.getByRole('button', { name: /deselect blue bottle brew/i })).toBeInTheDocument();
  });

  it('does not show duplicate button when in selection mode', () => {
    const entry = makeEntry();
    render(
      <MemoryRouter>
        <BrewingCard entry={entry} selectionMode selected={false} onToggleSelect={() => {}} onDuplicate={() => {}} />
      </MemoryRouter>
    );
    expect(screen.queryByRole('button', { name: /duplicate/i })).not.toBeInTheDocument();
  });
});
