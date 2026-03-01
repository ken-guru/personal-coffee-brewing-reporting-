import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { BrewingForm } from './BrewingForm';
import { makeEntry } from '../../test/fixtures';

// react-router navigate mock
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

function renderForm(props: Partial<React.ComponentProps<typeof BrewingForm>> = {}) {
  const onSubmit = props.onSubmit ?? vi.fn();
  render(
    <MemoryRouter>
      <BrewingForm onSubmit={onSubmit} {...props} />
    </MemoryRouter>
  );
  return { onSubmit };
}

/** Fill step 1 required fields and advance to step 2. */
function fillStep1AndAdvance() {
  fireEvent.change(screen.getByLabelText(/coffee producer/i), { target: { value: 'Blue Bottle' } });
  fireEvent.change(screen.getByLabelText(/country of origin/i), { target: { value: 'Ethiopia' } });
  fireEvent.click(screen.getByRole('button', { name: /next/i }));
}

/** On step 2, fill grind equipment and advance to step 3. */
function fillStep2AndAdvance() {
  fireEvent.change(screen.getByLabelText(/grind equipment/i), { target: { value: 'Knock Aergrind' } });
  fireEvent.click(screen.getByRole('button', { name: /next/i }));
}

describe('BrewingForm wizard', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  // ── Progress indicator ────────────────────────────────────────────────────

  it('renders all 4 step labels in the progress indicator', () => {
    renderForm();
    const nav = screen.getByRole('navigation', { name: /form progress/i });
    expect(nav).toHaveTextContent('The Coffee');
    expect(nav).toHaveTextContent('Method & Grind');
    expect(nav).toHaveTextContent('The Brew');
    expect(nav).toHaveTextContent('Rate It');
  });

  it('marks step 1 as the current step initially', () => {
    renderForm();
    const stepNav = screen.getByRole('navigation', { name: /form progress/i });
    const currentStep = stepNav.querySelector('[aria-current="step"]');
    expect(currentStep).toBeInTheDocument();
  });

  // ── Step 1: The Coffee ────────────────────────────────────────────────────

  it('shows "The Coffee" heading and producer/origin fields on step 1', () => {
    renderForm();
    expect(screen.getByRole('heading', { name: /the coffee/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/coffee producer/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/country of origin/i)).toBeInTheDocument();
  });

  it('shows "Cancel" button on step 1', () => {
    renderForm();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('calls navigate(-1) when Cancel is clicked on step 1', () => {
    renderForm();
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('shows validation errors when Next is clicked on step 1 without filling fields', async () => {
    renderForm();
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    await waitFor(() => {
      expect(screen.getByText('Coffee producer is required')).toBeInTheDocument();
      expect(screen.getByText('Country of origin is required')).toBeInTheDocument();
    });
  });

  it('does not advance when step 1 fields are empty', async () => {
    renderForm();
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /the coffee/i })).toBeInTheDocument();
    });
  });

  // ── Step 2: Method & Grind ────────────────────────────────────────────────

  it('advances to step 2 when step 1 is valid', async () => {
    renderForm();
    fillStep1AndAdvance();
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /method & grind/i })).toBeInTheDocument();
    });
  });

  it('shows the brewing method button grid on step 2', async () => {
    renderForm();
    fillStep1AndAdvance();
    await waitFor(() => screen.getByRole('group', { name: /brewing method/i }));
    expect(screen.getByRole('button', { name: /pour over/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /french press/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /aeropress$/i })).toBeInTheDocument();
  });

  it('shows the grind coarseness picker on step 2', async () => {
    renderForm();
    fillStep1AndAdvance();
    await waitFor(() => screen.getByRole('group', { name: /grind coarseness/i }));
    expect(screen.getByRole('button', { name: /medium/i })).toBeInTheDocument();
  });

  it('shows the Back button on step 2', async () => {
    renderForm();
    fillStep1AndAdvance();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
    });
  });

  it('returns to step 1 when Back is clicked on step 2', async () => {
    renderForm();
    fillStep1AndAdvance();
    await waitFor(() => screen.getByRole('heading', { name: /method & grind/i }));
    fireEvent.click(screen.getByRole('button', { name: /back/i }));
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /the coffee/i })).toBeInTheDocument();
    });
  });

  it('shows validation error when grind equipment is empty on step 2', async () => {
    renderForm();
    fillStep1AndAdvance();
    await waitFor(() => screen.getByRole('heading', { name: /method & grind/i }));
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    await waitFor(() => {
      expect(screen.getByText('Grind equipment is required')).toBeInTheDocument();
    });
  });

  // ── Step 3: The Brew ──────────────────────────────────────────────────────

  it('advances to step 3 when step 2 is valid', async () => {
    renderForm();
    fillStep1AndAdvance();
    await waitFor(() => screen.getByRole('heading', { name: /method & grind/i }));
    fillStep2AndAdvance();
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /the brew/i })).toBeInTheDocument();
    });
  });

  it('shows water source buttons on step 3', async () => {
    renderForm();
    fillStep1AndAdvance();
    await waitFor(() => screen.getByRole('heading', { name: /method & grind/i }));
    fillStep2AndAdvance();
    await waitFor(() => screen.getByRole('group', { name: /water source/i }));
    expect(screen.getByRole('button', { name: /filtered/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /tap/i })).toBeInTheDocument();
  });

  it('shows the live recipe summary on step 3', async () => {
    renderForm();
    fillStep1AndAdvance();
    await waitFor(() => screen.getByRole('heading', { name: /method & grind/i }));
    fillStep2AndAdvance();
    await waitFor(() => screen.getByRole('heading', { name: /the brew/i }));
    // Default values: Pour Over method, 30g coffee, 500ml water, 03:00
    expect(screen.getByText(/30g coffee · 500ml water/)).toBeInTheDocument();
  });

  // ── Step 4: Rate It ───────────────────────────────────────────────────────

  it('reaches step 4 and shows the star rating on step 4', async () => {
    renderForm();
    fillStep1AndAdvance();
    await waitFor(() => screen.getByRole('heading', { name: /method & grind/i }));
    fillStep2AndAdvance();
    await waitFor(() => screen.getByRole('heading', { name: /the brew/i }));
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /rate it/i })).toBeInTheDocument();
    });
    expect(screen.getByRole('group', { name: /overall rating/i })).toBeInTheDocument();
  });

  it('shows "Log Brew" submit button on the last step', async () => {
    renderForm();
    fillStep1AndAdvance();
    await waitFor(() => screen.getByRole('heading', { name: /method & grind/i }));
    fillStep2AndAdvance();
    await waitFor(() => screen.getByRole('heading', { name: /the brew/i }));
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /log brew/i })).toBeInTheDocument();
    });
  });

  it('shows "Update Brew" when editing an existing entry', async () => {
    const entry = makeEntry();
    renderForm({ entry, onSubmit: vi.fn() });
    // Jump to last step
    fillStep1AndAdvance();
    await waitFor(() => screen.getByRole('heading', { name: /method & grind/i }));
    fillStep2AndAdvance();
    await waitFor(() => screen.getByRole('heading', { name: /the brew/i }));
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /update brew/i })).toBeInTheDocument();
    });
  });

  it('does not show guest ratings section when numberOfPeople is 1 on step 4', async () => {
    renderForm();
    fillStep1AndAdvance();
    await waitFor(() => screen.getByRole('heading', { name: /method & grind/i }));
    fillStep2AndAdvance();
    await waitFor(() => screen.getByRole('heading', { name: /the brew/i }));
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    await waitFor(() => screen.getByRole('heading', { name: /rate it/i }));
    expect(screen.queryByText(/guest ratings/i)).not.toBeInTheDocument();
  });

  // ── Edit mode pre-population ──────────────────────────────────────────────

  it('pre-populates fields when editing an existing entry', () => {
    const entry = makeEntry({ coffeeProducer: 'Stumptown', countryOfOrigin: 'Colombia' });
    renderForm({ entry, onSubmit: vi.fn() });
    expect(screen.getByDisplayValue('Stumptown')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Colombia')).toBeInTheDocument();
  });
});
