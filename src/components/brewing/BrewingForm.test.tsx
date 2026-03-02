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

/** On step 2, select Knock Aergrind and advance to step 3. */
function fillStep2AndAdvance() {
  fireEvent.click(screen.getByRole('button', { name: /knock aergrind/i }));
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

  // ── Variety picker ────────────────────────────────────────────────────────

  it('shows the variety input on step 1', () => {
    renderForm();
    expect(screen.getByLabelText(/coffee variety input/i)).toBeInTheDocument();
  });

  it('adds a variety when Enter is pressed in the variety input', async () => {
    renderForm();
    const varietyInput = screen.getByLabelText(/coffee variety input/i);
    // Use a custom value not in static suggestions to test the Enter path
    fireEvent.change(varietyInput, { target: { value: 'MyVariety' } });
    fireEvent.keyDown(varietyInput, { key: 'Enter' });
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /remove MyVariety/i })).toBeInTheDocument();
    });
  });

  it('adds a variety when a datalist suggestion is selected', async () => {
    renderForm();
    const varietyInput = screen.getByLabelText(/coffee variety input/i);
    // Simulate selecting a suggestion (onChange fires with the full value)
    fireEvent.change(varietyInput, { target: { value: 'Geisha' } });
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /remove Geisha/i })).toBeInTheDocument();
    });
  });

  it('removes a variety when the remove button is clicked', async () => {
    renderForm();
    const varietyInput = screen.getByLabelText(/coffee variety input/i);
    fireEvent.change(varietyInput, { target: { value: 'MyVariety' } });
    fireEvent.keyDown(varietyInput, { key: 'Enter' });
    await waitFor(() => screen.getByRole('button', { name: /remove MyVariety/i }));
    fireEvent.click(screen.getByRole('button', { name: /remove MyVariety/i }));
    expect(screen.queryByRole('button', { name: /remove MyVariety/i })).not.toBeInTheDocument();
  });

  it('allows adding multiple varieties', async () => {
    renderForm();
    const varietyInput = screen.getByLabelText(/coffee variety input/i);
    fireEvent.change(varietyInput, { target: { value: 'SL28' } });
    fireEvent.keyDown(varietyInput, { key: 'Enter' });
    await waitFor(() => screen.getByRole('button', { name: /remove SL28/i }));
    fireEvent.change(varietyInput, { target: { value: 'MyVariety' } });
    fireEvent.keyDown(varietyInput, { key: 'Enter' });
    await waitFor(() => screen.getByRole('button', { name: /remove MyVariety/i }));
    expect(screen.getByRole('button', { name: /remove SL28/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /remove MyVariety/i })).toBeInTheDocument();
  });

  it('pre-populates variety picker when editing an existing entry with varieties', () => {
    const entry = makeEntry({ coffeeVariety: ['SL28', 'SL34'] });
    renderForm({ entry, onSubmit: vi.fn() });
    expect(screen.getByRole('button', { name: /remove SL28/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /remove SL34/i })).toBeInTheDocument();
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

  // ── Brewing method collapsed picker ──────────────────────────────────────

  it('shows only 3 brewing method buttons by default', async () => {
    renderForm();
    fillStep1AndAdvance();
    await waitFor(() => screen.getByRole('group', { name: /brewing method/i }));
    const group = screen.getByRole('group', { name: /brewing method/i });
    const buttons = group.querySelectorAll('button');
    expect(buttons.length).toBe(3);
  });

  it('reveals all method buttons when "Show more" is clicked', async () => {
    renderForm();
    fillStep1AndAdvance();
    await waitFor(() => screen.getByRole('group', { name: /brewing method/i }));
    fireEvent.click(screen.getByRole('button', { name: /show .* more method/i }));
    const group = screen.getByRole('group', { name: /brewing method/i });
    expect(group.querySelectorAll('button').length).toBe(11);
  });

  it('shows "Show fewer methods" after expanding, and collapses on click', async () => {
    renderForm();
    fillStep1AndAdvance();
    await waitFor(() => screen.getByRole('group', { name: /brewing method/i }));
    fireEvent.click(screen.getByRole('button', { name: /show .* more method/i }));
    const collapseBtn = screen.getByRole('button', { name: /show fewer methods/i });
    expect(collapseBtn).toBeInTheDocument();
    fireEvent.click(collapseBtn);
    const group = screen.getByRole('group', { name: /brewing method/i });
    expect(group.querySelectorAll('button').length).toBe(3);
  });

  it('shows custom method input when "Other" brewing method is selected', async () => {
    renderForm();
    fillStep1AndAdvance();
    await waitFor(() => screen.getByRole('group', { name: /brewing method/i }));
    // Expand to reveal Other, then click it
    fireEvent.click(screen.getByRole('button', { name: /show .* more method/i }));
    fireEvent.click(screen.getByRole('button', { name: /^other$/i }));
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/describe your brewing method/i)).toBeInTheDocument();
    });
  });

  it('shows validation error if Other is selected without custom method text', async () => {
    renderForm();
    fillStep1AndAdvance();
    await waitFor(() => screen.getByRole('group', { name: /brewing method/i }));
    fireEvent.click(screen.getByRole('button', { name: /show .* more method/i }));
    fireEvent.click(screen.getByRole('button', { name: /^other$/i }));
    // Also need to click a known grinder to satisfy grindEquipment validation
    fireEvent.click(screen.getByRole('button', { name: /knock aergrind/i }));
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    await waitFor(() => {
      expect(screen.getByText(/please describe your brewing method/i)).toBeInTheDocument();
    });
  });

  // ── Water source collapsed picker ─────────────────────────────────────────

  it('shows only 2 water source buttons by default', async () => {
    renderForm();
    fillStep1AndAdvance();
    await waitFor(() => screen.getByRole('heading', { name: /method & grind/i }));
    fillStep2AndAdvance();
    await waitFor(() => screen.getByRole('group', { name: /water source/i }));
    const group = screen.getByRole('group', { name: /water source/i });
    expect(group.querySelectorAll('button').length).toBe(2);
  });

  it('reveals all water source buttons when "Show more" is clicked', async () => {
    renderForm();
    fillStep1AndAdvance();
    await waitFor(() => screen.getByRole('heading', { name: /method & grind/i }));
    fillStep2AndAdvance();
    await waitFor(() => screen.getByRole('group', { name: /water source/i }));
    fireEvent.click(screen.getByRole('button', { name: /show .* more source/i }));
    const group = screen.getByRole('group', { name: /water source/i });
    expect(group.querySelectorAll('button').length).toBe(6);
  });

  // ── Grind equipment picker ────────────────────────────────────────────────

  it('shows Knock Aergrind and Wilfa Svart as buttons in grind equipment picker', async () => {
    renderForm();
    fillStep1AndAdvance();
    await waitFor(() => screen.getByRole('group', { name: /grind equipment/i }));
    expect(screen.getByRole('button', { name: /knock aergrind/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /wilfa svart/i })).toBeInTheDocument();
  });

  it('shows the Other grinder button in grind equipment picker', async () => {
    renderForm();
    fillStep1AndAdvance();
    await waitFor(() => screen.getByRole('group', { name: /grind equipment/i }));
    expect(screen.getByRole('button', { name: /other grinder/i })).toBeInTheDocument();
  });

  it('reveals custom input when Other grinder button is clicked', async () => {
    renderForm();
    fillStep1AndAdvance();
    await waitFor(() => screen.getByRole('group', { name: /grind equipment/i }));
    fireEvent.click(screen.getByRole('button', { name: /other grinder/i }));
    expect(screen.getByLabelText(/custom grind equipment/i)).toBeInTheDocument();
  });

  // ── Brew time seconds step ────────────────────────────────────────────────

  it('increments seconds by 15 when Increase seconds is clicked', async () => {
    renderForm();
    fillStep1AndAdvance();
    await waitFor(() => screen.getByRole('heading', { name: /method & grind/i }));
    fillStep2AndAdvance();
    await waitFor(() => screen.getByRole('heading', { name: /the brew/i }));
    // Default seconds is 0; increment once
    fireEvent.click(screen.getByRole('button', { name: /increase seconds/i }));
    expect(screen.getByText('15')).toBeInTheDocument();
  });

  // ── Brew time N/A toggle ─────────────────────────────────────────────────

  it('shows "Not applicable" checkbox for brew time on step 3', async () => {
    renderForm();
    fillStep1AndAdvance();
    await waitFor(() => screen.getByRole('heading', { name: /method & grind/i }));
    fillStep2AndAdvance();
    await waitFor(() => screen.getByRole('heading', { name: /the brew/i }));
    expect(screen.getByLabelText(/brew time not applicable/i)).toBeInTheDocument();
  });

  it('hides the time picker when "Not applicable" is checked', async () => {
    renderForm();
    fillStep1AndAdvance();
    await waitFor(() => screen.getByRole('heading', { name: /method & grind/i }));
    fillStep2AndAdvance();
    await waitFor(() => screen.getByRole('heading', { name: /the brew/i }));
    fireEvent.click(screen.getByLabelText(/brew time not applicable/i));
    expect(screen.queryByLabelText(/increase minutes/i)).not.toBeInTheDocument();
  });

  it('shows the time picker when "Not applicable" is unchecked', async () => {
    renderForm();
    fillStep1AndAdvance();
    await waitFor(() => screen.getByRole('heading', { name: /method & grind/i }));
    fillStep2AndAdvance();
    await waitFor(() => screen.getByRole('heading', { name: /the brew/i }));
    // Check then uncheck
    fireEvent.click(screen.getByLabelText(/brew time not applicable/i));
    fireEvent.click(screen.getByLabelText(/brew time not applicable/i));
    expect(screen.getByRole('button', { name: /increase minutes/i })).toBeInTheDocument();
  });

  it('auto-checks "Not applicable" when Siemens Drip method is selected', async () => {
    renderForm();
    fillStep1AndAdvance();
    await waitFor(() => screen.getByRole('group', { name: /brewing method/i }));
    // Expand to find Siemens Drip
    fireEvent.click(screen.getByRole('button', { name: /show .* more method/i }));
    fireEvent.click(screen.getByRole('button', { name: /siemens drip/i }));
    // Select grind equipment to proceed
    fireEvent.click(screen.getByRole('button', { name: /knock aergrind/i }));
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    await waitFor(() => screen.getByRole('heading', { name: /the brew/i }));
    expect(screen.getByLabelText(/brew time not applicable/i)).toBeChecked();
  });

  it('auto-unchecks "Not applicable" when switching away from Siemens Drip', async () => {
    renderForm();
    fillStep1AndAdvance();
    await waitFor(() => screen.getByRole('group', { name: /brewing method/i }));
    // Select Siemens Drip
    fireEvent.click(screen.getByRole('button', { name: /show .* more method/i }));
    fireEvent.click(screen.getByRole('button', { name: /siemens drip/i }));
    // Switch to Pour Over (in default top-3)
    fireEvent.click(screen.getByRole('button', { name: /pour over/i }));
    // Proceed to brew step
    fireEvent.click(screen.getByRole('button', { name: /knock aergrind/i }));
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    await waitFor(() => screen.getByRole('heading', { name: /the brew/i }));
    expect(screen.getByLabelText(/brew time not applicable/i)).not.toBeChecked();
  });

  it('shows N/A in the live recipe summary when brew time is not applicable', async () => {
    renderForm();
    fillStep1AndAdvance();
    await waitFor(() => screen.getByRole('heading', { name: /method & grind/i }));
    fillStep2AndAdvance();
    await waitFor(() => screen.getByRole('heading', { name: /the brew/i }));
    fireEvent.click(screen.getByLabelText(/brew time not applicable/i));
    expect(screen.getByText(/N\/A/)).toBeInTheDocument();
  });

  // ── Maintain ratio checkbox ───────────────────────────────────────────────

  it('shows "Maintain ratio" checkbox on step 3', async () => {
    renderForm();
    fillStep1AndAdvance();
    await waitFor(() => screen.getByRole('heading', { name: /method & grind/i }));
    fillStep2AndAdvance();
    await waitFor(() => screen.getByRole('heading', { name: /the brew/i }));
    expect(screen.getByLabelText(/maintain ratio/i)).toBeInTheDocument();
  });

  it('"Maintain ratio" checkbox is checked by default', async () => {
    renderForm();
    fillStep1AndAdvance();
    await waitFor(() => screen.getByRole('heading', { name: /method & grind/i }));
    fillStep2AndAdvance();
    await waitFor(() => screen.getByRole('heading', { name: /the brew/i }));
    expect(screen.getByLabelText(/maintain ratio/i)).toBeChecked();
  });

  it('adjusting coffee updates water to maintain ratio', async () => {
    renderForm();
    fillStep1AndAdvance();
    await waitFor(() => screen.getByRole('heading', { name: /method & grind/i }));
    fillStep2AndAdvance();
    await waitFor(() => screen.getByRole('heading', { name: /the brew/i }));
    // Default: 30g coffee, 500ml water → ratio ≈ 16.67
    // Increase coffee by 1 → 31g; expected water = ceil(31 * (500/30)) = ceil(516.67) = 517
    fireEvent.click(screen.getByRole('button', { name: /increase coffee amount/i }));
    // live summary should show updated values
    expect(screen.getByText(/31g coffee · 517ml water/)).toBeInTheDocument();
  });

  it('adjusting water updates coffee to maintain ratio', async () => {
    renderForm();
    fillStep1AndAdvance();
    await waitFor(() => screen.getByRole('heading', { name: /method & grind/i }));
    fillStep2AndAdvance();
    await waitFor(() => screen.getByRole('heading', { name: /the brew/i }));
    // Default: 30g coffee, 500ml water → ratio = 16.67
    // Increase water by 10 → 510ml; expected coffee = ceil(510 / (500/30)) = ceil(510/16.67) = ceil(30.6) = 31
    fireEvent.click(screen.getByRole('button', { name: /increase water amount/i }));
    expect(screen.getByText(/31g coffee · 510ml water/)).toBeInTheDocument();
  });

  it('does not maintain ratio when checkbox is unchecked', async () => {
    renderForm();
    fillStep1AndAdvance();
    await waitFor(() => screen.getByRole('heading', { name: /method & grind/i }));
    fillStep2AndAdvance();
    await waitFor(() => screen.getByRole('heading', { name: /the brew/i }));
    // Uncheck maintain ratio
    fireEvent.click(screen.getByLabelText(/maintain ratio/i));
    // Increase coffee → water should stay the same
    fireEvent.click(screen.getByRole('button', { name: /increase coffee amount/i }));
    expect(screen.getByText(/31g coffee · 500ml water/)).toBeInTheDocument();
  });

  // ── Click-to-edit stepper inputs ──────────────────────────────────────────

  it('renders the coffee amount as a clickable button', async () => {
    renderForm();
    fillStep1AndAdvance();
    await waitFor(() => screen.getByRole('heading', { name: /method & grind/i }));
    fillStep2AndAdvance();
    await waitFor(() => screen.getByRole('heading', { name: /the brew/i }));
    // The coffee amount should be a button with "click to edit" affordance
    expect(screen.getByRole('button', { name: /30 g, click to edit/i })).toBeInTheDocument();
  });

  it('shows an editable input when coffee amount button is clicked', async () => {
    renderForm();
    fillStep1AndAdvance();
    await waitFor(() => screen.getByRole('heading', { name: /method & grind/i }));
    fillStep2AndAdvance();
    await waitFor(() => screen.getByRole('heading', { name: /the brew/i }));
    fireEvent.click(screen.getByRole('button', { name: /30 g, click to edit/i }));
    expect(screen.getByLabelText(/edit coffee amount/i)).toBeInTheDocument();
  });
});
