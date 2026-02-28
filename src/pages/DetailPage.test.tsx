import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { DetailPage } from '../pages/DetailPage';
import { makeEntry } from '../test/fixtures';

function renderDetailPage(id: string) {
  return render(
    <MemoryRouter initialEntries={[`/brew/${id}`]}>
      <Routes>
        <Route path="/brew/:id" element={<DetailPage />} />
        <Route path="/" element={<div>Home Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('DetailPage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('shows "Brew not found" when the id does not match any entry', () => {
    renderDetailPage('nonexistent');
    expect(screen.getByText('Brew not found.')).toBeInTheDocument();
  });

  it('shows a "Back to list" link when brew is not found', () => {
    renderDetailPage('nonexistent');
    expect(screen.getByRole('link', { name: 'Back to list' })).toBeInTheDocument();
  });

  it('renders the entry details when the id matches', () => {
    const entry = makeEntry({ id: 'entry-abc' });
    localStorage.setItem('coffee-brewing-entries', JSON.stringify([entry]));
    renderDetailPage('entry-abc');
    expect(screen.getByRole('heading', { name: 'Blue Bottle' })).toBeInTheDocument();
    expect(screen.getByText('Ethiopia')).toBeInTheDocument();
  });

  it('shows the brew method badge', () => {
    const entry = makeEntry({ id: 'entry-abc', brewingMethod: 'french-press' });
    localStorage.setItem('coffee-brewing-entries', JSON.stringify([entry]));
    renderDetailPage('entry-abc');
    expect(screen.getByText('French Press')).toBeInTheDocument();
  });

  it('renders the Edit button linking to the edit page', () => {
    const entry = makeEntry({ id: 'entry-abc' });
    localStorage.setItem('coffee-brewing-entries', JSON.stringify([entry]));
    renderDetailPage('entry-abc');
    const editLink = screen.getByRole('link', { name: /edit/i });
    expect(editLink).toHaveAttribute('href', '/brew/entry-abc/edit');
  });

  it('shows the Delete button', () => {
    const entry = makeEntry({ id: 'entry-abc' });
    localStorage.setItem('coffee-brewing-entries', JSON.stringify([entry]));
    renderDetailPage('entry-abc');
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
  });

  it('opens the delete confirmation dialog when Delete is clicked', async () => {
    const entry = makeEntry({ id: 'entry-abc' });
    localStorage.setItem('coffee-brewing-entries', JSON.stringify([entry]));
    renderDetailPage('entry-abc');
    fireEvent.click(screen.getByRole('button', { name: /delete/i }));
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    expect(screen.getByText('Delete Brew')).toBeInTheDocument();
  });

  it('navigates to home after confirming deletion', async () => {
    const entry = makeEntry({ id: 'entry-abc' });
    localStorage.setItem('coffee-brewing-entries', JSON.stringify([entry]));
    renderDetailPage('entry-abc');
    fireEvent.click(screen.getByRole('button', { name: /delete/i }));
    await waitFor(() => screen.getByRole('dialog'));
    // Click the destructive "Delete" button inside the dialog
    const dialogDeleteBtn = screen.getAllByRole('button', { name: /delete/i }).find(
      (btn) => btn.closest('[role="dialog"]')
    );
    fireEvent.click(dialogDeleteBtn!);
    await waitFor(() => {
      expect(screen.getByText('Home Page')).toBeInTheDocument();
    });
  });

  it('shows the comment when the entry has one', () => {
    const entry = makeEntry({ id: 'entry-abc', comment: 'Lovely cup' });
    localStorage.setItem('coffee-brewing-entries', JSON.stringify([entry]));
    renderDetailPage('entry-abc');
    expect(screen.getByText(/"Lovely cup"/)).toBeInTheDocument();
  });

  it('shows guest ratings when present', () => {
    const entry = makeEntry({
      id: 'entry-abc',
      guestRatings: [{ id: 'g1', rating: 5, comment: 'Amazing!' }],
    });
    localStorage.setItem('coffee-brewing-entries', JSON.stringify([entry]));
    renderDetailPage('entry-abc');
    expect(screen.getByText('Guest Ratings (1)')).toBeInTheDocument();
    expect(screen.getByText('"Amazing!"')).toBeInTheDocument();
  });
});
