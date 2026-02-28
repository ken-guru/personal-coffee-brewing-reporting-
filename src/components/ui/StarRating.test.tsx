import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StarRating } from './StarRating';

describe('StarRating', () => {
  describe('read-only mode', () => {
    it('renders 5 star icons', () => {
      const { container } = render(<StarRating value={3} readOnly />);
      // lucide renders SVG elements; verify the wrapper has 5 direct SVG children
      const stars = container.querySelectorAll('svg');
      expect(stars).toHaveLength(5);
    });

    it('applies accessible label to the wrapper', () => {
      render(<StarRating value={4} readOnly label="My rating" />);
      expect(screen.getByLabelText('My rating: 4 out of 5 stars')).toBeInTheDocument();
    });
  });

  describe('interactive mode', () => {
    it('renders 5 star buttons', () => {
      render(<StarRating value={0} onChange={() => {}} />);
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(5);
    });

    it('each button has an accessible label', () => {
      render(<StarRating value={0} onChange={() => {}} />);
      expect(screen.getByRole('button', { name: '1 star' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '2 stars' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '5 stars' })).toBeInTheDocument();
    });

    it('calls onChange when a star button is clicked', () => {
      const onChange = vi.fn();
      render(<StarRating value={0} onChange={onChange} />);
      fireEvent.click(screen.getByRole('button', { name: '3 stars' }));
      expect(onChange).toHaveBeenCalledWith(3);
    });

    it('marks the active star button as pressed', () => {
      render(<StarRating value={2} onChange={() => {}} />);
      expect(screen.getByRole('button', { name: '2 stars' })).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByRole('button', { name: '3 stars' })).toHaveAttribute('aria-pressed', 'false');
    });

    it('calls onChange with star-1 when ArrowLeft is pressed on star 2', () => {
      const onChange = vi.fn();
      render(<StarRating value={2} onChange={onChange} />);
      fireEvent.keyDown(screen.getByRole('button', { name: '2 stars' }), { key: 'ArrowLeft' });
      expect(onChange).toHaveBeenCalledWith(1);
    });

    it('calls onChange with star+1 when ArrowRight is pressed', () => {
      const onChange = vi.fn();
      render(<StarRating value={2} onChange={onChange} />);
      fireEvent.keyDown(screen.getByRole('button', { name: '2 stars' }), { key: 'ArrowRight' });
      expect(onChange).toHaveBeenCalledWith(3);
    });

    it('does not call onChange on ArrowLeft at star 1', () => {
      const onChange = vi.fn();
      render(<StarRating value={1} onChange={onChange} />);
      fireEvent.keyDown(screen.getByRole('button', { name: '1 star' }), { key: 'ArrowLeft' });
      expect(onChange).not.toHaveBeenCalled();
    });

    it('does not call onChange on ArrowRight at star 5', () => {
      const onChange = vi.fn();
      render(<StarRating value={5} onChange={onChange} />);
      fireEvent.keyDown(screen.getByRole('button', { name: '5 stars' }), { key: 'ArrowRight' });
      expect(onChange).not.toHaveBeenCalled();
    });

    it('calls onChange when Enter is pressed', () => {
      const onChange = vi.fn();
      render(<StarRating value={0} onChange={onChange} />);
      fireEvent.keyDown(screen.getByRole('button', { name: '4 stars' }), { key: 'Enter' });
      expect(onChange).toHaveBeenCalledWith(4);
    });
  });
});
