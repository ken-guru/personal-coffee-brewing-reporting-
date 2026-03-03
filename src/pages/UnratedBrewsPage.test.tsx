import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { UnratedBrewsPage } from '../pages/UnratedBrewsPage';
import { makeEntry } from '../test/fixtures';

function renderUnratedBrewsPage() {
  render(
    <MemoryRouter>
      <UnratedBrewsPage />
    </MemoryRouter>
  );
}

describe('UnratedBrewsPage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('shows all-rated message when there are no unrated entries', () => {
    const entry = makeEntry({ id: 'a', rating: 4 });
    localStorage.setItem('coffee-brewing-entries', JSON.stringify([entry]));
    renderUnratedBrewsPage();
    expect(screen.getByText('All brews rated!')).toBeInTheDocument();
  });

  it('lists unrated entries', () => {
    const entry = makeEntry({ id: 'a', coffeeProducer: 'Unrated Roast', rating: 0 });
    localStorage.setItem('coffee-brewing-entries', JSON.stringify([entry]));
    renderUnratedBrewsPage();
    expect(screen.getByRole('button', { name: /rate unrated roast brew/i })).toBeInTheDocument();
  });

  it('removes brew from the list after rating it via the modal', async () => {
    const entry = makeEntry({ id: 'a', coffeeProducer: 'Pending Roast', rating: 0 });
    localStorage.setItem('coffee-brewing-entries', JSON.stringify([entry]));
    renderUnratedBrewsPage();
    fireEvent.click(screen.getByRole('button', { name: /rate pending roast brew/i }));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /4 stars/i }));
    fireEvent.click(screen.getByRole('button', { name: /save rating/i }));
    await waitFor(() => {
      expect(screen.getByText('All brews rated!')).toBeInTheDocument();
    });
    expect(screen.queryByRole('button', { name: /rate pending roast brew/i })).not.toBeInTheDocument();
  });
});
