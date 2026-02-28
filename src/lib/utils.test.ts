import { describe, it, expect } from 'vitest';
import {
  formatTime,
  formatBrewingMethod,
  formatGrindCoarseness,
  formatWaterSource,
  cn,
} from '../lib/utils';

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('a', 'b')).toBe('a b');
  });

  it('handles conditional classes', () => {
    expect(cn('a', false && 'b', 'c')).toBe('a c');
  });

  it('deduplicates tailwind conflicting classes', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
  });
});

describe('formatTime', () => {
  it('formats whole minutes with zero seconds', () => {
    expect(formatTime(180)).toBe('3:00');
  });

  it('pads seconds with leading zero', () => {
    expect(formatTime(65)).toBe('1:05');
  });

  it('handles zero', () => {
    expect(formatTime(0)).toBe('0:00');
  });

  it('handles seconds only', () => {
    expect(formatTime(45)).toBe('0:45');
  });
});

describe('formatBrewingMethod', () => {
  it('formats pour-over', () => expect(formatBrewingMethod('pour-over')).toBe('Pour Over'));
  it('formats french-press', () => expect(formatBrewingMethod('french-press')).toBe('French Press'));
  it('formats aeropress', () => expect(formatBrewingMethod('aeropress')).toBe('AeroPress'));
  it('formats espresso', () => expect(formatBrewingMethod('espresso')).toBe('Espresso'));
  it('formats moka-pot', () => expect(formatBrewingMethod('moka-pot')).toBe('Moka Pot'));
  it('formats cold-brew', () => expect(formatBrewingMethod('cold-brew')).toBe('Cold Brew'));
  it('formats drip', () => expect(formatBrewingMethod('drip')).toBe('Drip'));
  it('formats other', () => expect(formatBrewingMethod('other')).toBe('Other'));
});

describe('formatGrindCoarseness', () => {
  it('formats extra-fine', () => expect(formatGrindCoarseness('extra-fine')).toBe('Extra Fine'));
  it('formats fine', () => expect(formatGrindCoarseness('fine')).toBe('Fine'));
  it('formats medium-fine', () => expect(formatGrindCoarseness('medium-fine')).toBe('Medium Fine'));
  it('formats medium', () => expect(formatGrindCoarseness('medium')).toBe('Medium'));
  it('formats medium-coarse', () => expect(formatGrindCoarseness('medium-coarse')).toBe('Medium Coarse'));
  it('formats coarse', () => expect(formatGrindCoarseness('coarse')).toBe('Coarse'));
  it('formats extra-coarse', () => expect(formatGrindCoarseness('extra-coarse')).toBe('Extra Coarse'));
});

describe('formatWaterSource', () => {
  it('formats tap', () => expect(formatWaterSource('tap')).toBe('Tap'));
  it('formats filtered-tap', () => expect(formatWaterSource('filtered-tap')).toBe('Filtered Tap'));
  it('formats bottled-still', () => expect(formatWaterSource('bottled-still')).toBe('Bottled Still'));
  it('formats bottled-sparkling', () => expect(formatWaterSource('bottled-sparkling')).toBe('Bottled Sparkling'));
  it('formats spring', () => expect(formatWaterSource('spring')).toBe('Spring'));
  it('formats other', () => expect(formatWaterSource('other')).toBe('Other'));
});
