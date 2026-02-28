import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockHandleInstall = vi.fn();
const mockHandleDismiss = vi.fn();
let mockIsVisible = false;

vi.mock('../../hooks/useInstallPrompt', () => ({
  useInstallPrompt: () => ({
    isVisible: mockIsVisible,
    handleInstall: mockHandleInstall,
    handleDismiss: mockHandleDismiss,
  }),
}));

import { PWAInstallPrompt } from './PWAInstallPrompt';

describe('PWAInstallPrompt', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsVisible = false;
  });

  it('renders nothing when isVisible is false', () => {
    mockIsVisible = false;
    const { container } = render(<PWAInstallPrompt />);
    expect(container.firstChild).toBeNull();
  });

  it('renders the install banner when isVisible is true', () => {
    mockIsVisible = true;
    render(<PWAInstallPrompt />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Install BrewLog')).toBeInTheDocument();
    expect(screen.getByText(/Add to your home screen/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /install app/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /dismiss install prompt/i })).toBeInTheDocument();
  });

  it('calls handleInstall when Install App button is clicked', () => {
    mockIsVisible = true;
    render(<PWAInstallPrompt />);
    fireEvent.click(screen.getByRole('button', { name: /install app/i }));
    expect(mockHandleInstall).toHaveBeenCalledTimes(1);
  });

  it('calls handleDismiss when dismiss button is clicked', () => {
    mockIsVisible = true;
    render(<PWAInstallPrompt />);
    fireEvent.click(screen.getByRole('button', { name: /dismiss install prompt/i }));
    expect(mockHandleDismiss).toHaveBeenCalledTimes(1);
  });
});
