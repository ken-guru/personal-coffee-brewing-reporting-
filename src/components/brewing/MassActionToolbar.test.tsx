import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MassActionToolbar } from './MassActionToolbar';

describe('MassActionToolbar', () => {
  const defaultProps = {
    selectedCount: 3,
    sharing: false,
    onShare: vi.fn(),
    onCancel: vi.fn(),
  };

  it('renders the selected count', () => {
    render(<MassActionToolbar {...defaultProps} />);
    expect(screen.getByText('3 brews selected')).toBeInTheDocument();
  });

  it('shows singular form for single selection', () => {
    render(<MassActionToolbar {...defaultProps} selectedCount={1} />);
    expect(screen.getByText('1 brew selected')).toBeInTheDocument();
  });

  it('renders the share button', () => {
    render(<MassActionToolbar {...defaultProps} />);
    expect(screen.getByRole('button', { name: /share to community/i })).toBeInTheDocument();
  });

  it('calls onShare when the share button is clicked', () => {
    const onShare = vi.fn();
    render(<MassActionToolbar {...defaultProps} onShare={onShare} />);
    fireEvent.click(screen.getByRole('button', { name: /share to community/i }));
    expect(onShare).toHaveBeenCalledOnce();
  });

  it('disables the share button when sharing is in progress', () => {
    render(<MassActionToolbar {...defaultProps} sharing />);
    expect(screen.getByRole('button', { name: /sharing/i })).toBeDisabled();
  });

  it('shows sharing text when sharing is in progress', () => {
    render(<MassActionToolbar {...defaultProps} sharing />);
    expect(screen.getByText('Sharing…')).toBeInTheDocument();
  });

  it('calls onCancel when the cancel button is clicked', () => {
    const onCancel = vi.fn();
    render(<MassActionToolbar {...defaultProps} onCancel={onCancel} />);
    fireEvent.click(screen.getByRole('button', { name: /exit selection mode/i }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('has the toolbar role', () => {
    render(<MassActionToolbar {...defaultProps} />);
    expect(screen.getByRole('toolbar')).toBeInTheDocument();
  });
});
