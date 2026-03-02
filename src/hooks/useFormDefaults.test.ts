import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useFormDefaults, getMostPopular, getTopN } from '../hooks/useFormDefaults';
import { makeEntry } from '../test/fixtures';
import type { SharedBrew } from '../types/sharedBrew';

const mockUseSharedBrews = vi.fn(() => ({ brews: [] as SharedBrew[], loading: false, error: null }));

vi.mock('./useSharedBrews', () => ({
  useSharedBrews: () => mockUseSharedBrews(),
}));

describe('getMostPopular', () => {
  it('returns undefined for an empty array', () => {
    expect(getMostPopular([])).toBeUndefined();
  });

  it('returns the only element for a single-element array', () => {
    expect(getMostPopular(['pour-over'])).toBe('pour-over');
  });

  it('returns the most frequently occurring value', () => {
    expect(getMostPopular(['a', 'b', 'a', 'c', 'a', 'b'])).toBe('a');
  });

  it('filters out undefined and null values', () => {
    expect(getMostPopular([undefined, null, 'v'])).toBe('v');
  });

  it('filters out empty strings', () => {
    expect(getMostPopular(['', '', 'x'])).toBe('x');
  });

  it('works with numbers', () => {
    expect(getMostPopular([30, 14, 30, 30, 14])).toBe(30);
  });
});

describe('getTopN', () => {
  const OPTIONS = ['a', 'b', 'c', 'd'] as const;

  it('returns the first N options in original order when all have equal frequency', () => {
    expect(getTopN([], [...OPTIONS], 2)).toEqual(['a', 'b']);
  });

  it('returns the N most frequent values', () => {
    const values = ['c', 'c', 'b', 'c', 'a', 'b'];
    expect(getTopN(values, [...OPTIONS], 2)).toEqual(['c', 'b']);
  });

  it('returns all options when N >= options.length', () => {
    expect(getTopN(['a', 'b'], [...OPTIONS], 10)).toEqual([...OPTIONS]);
  });

  it('preserves original order for ties', () => {
    // a and b have the same count; 'a' appears first in OPTIONS so it stays first
    const values = ['a', 'b'];
    const result = getTopN(values, [...OPTIONS], 2);
    expect(result).toEqual(['a', 'b']);
  });
});

describe('useFormDefaults', () => {
  beforeEach(() => {
    localStorage.clear();
    mockUseSharedBrews.mockReturnValue({ brews: [], loading: false, error: null });
  });

  it('returns static seed suggestions when storage is empty', async () => {
    const { result } = renderHook(() => useFormDefaults());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.suggestions.coffeeProducers).toContain('Tim Wendelboe');
    expect(result.current.suggestions.countriesOfOrigin).toContain('Ethiopia');
    expect(result.current.suggestions.countriesOfOrigin).toContain('Kenya');
    expect(result.current.suggestions.countriesOfOrigin).toContain('Honduras');
    expect(result.current.suggestions.coffeeVarieties).toContain('Pacamara');
    expect(result.current.suggestions.coffeeVarieties).toContain('74112');
    expect(result.current.suggestions.coffeeVarieties).toContain('Heirloom cultivars');
    expect(result.current.suggestions.coffeeVarieties).toContain('Ruiru 11');
    expect(result.current.suggestions.coffeeVarieties).toContain('Batian');
    expect(result.current.suggestions.grindEquipments).toContain('Knock Aergrind');
    expect(result.current.suggestions.grindEquipments).toContain('Wilfa Svart');
  });

  it('returns static fallback defaults when storage is empty and no shared brews', async () => {
    const { result } = renderHook(() => useFormDefaults());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const { defaults } = result.current;
    expect(defaults.coffeeProducer).toBe('');
    expect(defaults.countryOfOrigin).toBe('');
    expect(defaults.coffeeVariety).toEqual([]);
    expect(defaults.grindCoarseness).toBe('medium');
    expect(defaults.grindEquipment).toBe('');
    expect(defaults.brewingMethod).toBe('pour-over');
    expect(defaults.gramsOfCoffee).toBe(30);
    expect(defaults.millilitersOfWater).toBe(500);
    expect(defaults.waterSource).toBe('filtered-tap');
    expect(defaults.numberOfPeople).toBe(1);
    expect(defaults.brewMinutes).toBe(3);
    expect(defaults.brewSeconds).toBe(0);
  });

  it('uses the latest localStorage entry for defaults', async () => {
    const older = makeEntry({
      id: 'old',
      createdAt: '2024-01-01T00:00:00.000Z',
      coffeeProducer: 'Old Roaster',
      countryOfOrigin: 'Brazil',
      grindCoarseness: 'coarse',
      brewingMethod: 'french-press',
      gramsOfCoffee: 20,
      millilitersOfWater: 300,
      waterSource: 'tap',
      numberOfPeople: 2,
      brewTimeSeconds: 240,
    });
    const newer = makeEntry({
      id: 'new',
      createdAt: '2024-06-01T00:00:00.000Z',
      coffeeProducer: 'New Roaster',
      countryOfOrigin: 'Kenya',
      coffeeVariety: ['SL28'],
      grindCoarseness: 'fine',
      grindEquipment: 'Hario',
      brewingMethod: 'aeropress',
      gramsOfCoffee: 14,
      millilitersOfWater: 200,
      waterSource: 'bottled-still',
      numberOfPeople: 1,
      brewTimeSeconds: 90,
    });
    localStorage.setItem('coffee-brewing-entries', JSON.stringify([older, newer]));

    const { result } = renderHook(() => useFormDefaults());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const { defaults } = result.current;
    expect(defaults.coffeeProducer).toBe('New Roaster');
    expect(defaults.countryOfOrigin).toBe('Kenya');
    expect(defaults.coffeeVariety).toEqual(['SL28']);
    expect(defaults.grindCoarseness).toBe('fine');
    expect(defaults.grindEquipment).toBe('Hario');
    expect(defaults.brewingMethod).toBe('aeropress');
    expect(defaults.gramsOfCoffee).toBe(14);
    expect(defaults.millilitersOfWater).toBe(200);
    expect(defaults.waterSource).toBe('bottled-still');
    expect(defaults.numberOfPeople).toBe(1);
    expect(defaults.brewMinutes).toBe(1);
    expect(defaults.brewSeconds).toBe(30);
  });

  it('includes localStorage values in suggestions', async () => {
    const entry = makeEntry({
      coffeeProducer: 'Local Roaster',
      countryOfOrigin: 'Peru',
      coffeeVariety: ['Bourbon'],
      grindEquipment: 'MyGrinder',
    });
    localStorage.setItem('coffee-brewing-entries', JSON.stringify([entry]));

    const { result } = renderHook(() => useFormDefaults());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.suggestions.coffeeProducers).toContain('Local Roaster');
    expect(result.current.suggestions.countriesOfOrigin).toContain('Peru');
    expect(result.current.suggestions.coffeeVarieties).toContain('Bourbon');
    expect(result.current.suggestions.grindEquipments).toContain('MyGrinder');
  });

  it('deduplicates suggestions', async () => {
    const e1 = makeEntry({ id: '1', coffeeProducer: 'Same Roaster' });
    const e2 = makeEntry({ id: '2', coffeeProducer: 'Same Roaster' });
    localStorage.setItem('coffee-brewing-entries', JSON.stringify([e1, e2]));

    const { result } = renderHook(() => useFormDefaults());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const count = result.current.suggestions.coffeeProducers.filter(
      (v) => v === 'Same Roaster',
    ).length;
    expect(count).toBe(1);
  });

  it('reports hasLocalData correctly', async () => {
    const { result: emptyResult } = renderHook(() => useFormDefaults());
    expect(emptyResult.current.hasLocalData).toBe(false);

    localStorage.setItem('coffee-brewing-entries', JSON.stringify([makeEntry()]));
    const { result: filledResult } = renderHook(() => useFormDefaults());
    expect(filledResult.current.hasLocalData).toBe(true);
  });

  it('uses most popular shared brew value when localStorage is empty', async () => {
    const sharedBrews: SharedBrew[] = [
      {
        shareId: 's1',
        sharedAt: '2024-01-01T00:00:00.000Z',
        brew: {
          coffeeProducer: 'Shared Roaster',
          countryOfOrigin: 'Colombia',
          grindCoarseness: 'fine',
          grindEquipment: 'SharedGrinder',
          brewingMethod: 'aeropress',
          gramsOfCoffee: 14,
          millilitersOfWater: 200,
          waterSource: 'bottled-still',
          numberOfPeople: 1,
          brewTimeSeconds: 90,
          rating: 4,
          guestRatings: [],
        },
      },
      {
        shareId: 's2',
        sharedAt: '2024-01-02T00:00:00.000Z',
        brew: {
          coffeeProducer: 'Shared Roaster',
          countryOfOrigin: 'Colombia',
          grindCoarseness: 'fine',
          grindEquipment: 'SharedGrinder',
          brewingMethod: 'aeropress',
          gramsOfCoffee: 14,
          millilitersOfWater: 200,
          waterSource: 'bottled-still',
          numberOfPeople: 1,
          brewTimeSeconds: 90,
          rating: 5,
          guestRatings: [],
        },
      },
    ];
    mockUseSharedBrews.mockReturnValue({ brews: sharedBrews, loading: false, error: null });

    const { result } = renderHook(() => useFormDefaults());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const { defaults } = result.current;
    expect(defaults.coffeeProducer).toBe('Shared Roaster');
    expect(defaults.countryOfOrigin).toBe('Colombia');
    expect(defaults.grindCoarseness).toBe('fine');
    expect(defaults.grindEquipment).toBe('SharedGrinder');
    expect(defaults.brewingMethod).toBe('aeropress');
    expect(defaults.gramsOfCoffee).toBe(14);
    expect(defaults.millilitersOfWater).toBe(200);
  });

  it('includes shared brew values in suggestions', async () => {
    const sharedBrews: SharedBrew[] = [
      {
        shareId: 's1',
        sharedAt: '2024-01-01T00:00:00.000Z',
        brew: {
          coffeeProducer: 'Remote Roaster',
          countryOfOrigin: 'Rwanda',
          coffeeVariety: ['Bourbon'],
          grindCoarseness: 'medium',
          grindEquipment: 'RemoteGrinder',
          brewingMethod: 'pour-over',
          gramsOfCoffee: 30,
          millilitersOfWater: 500,
          waterSource: 'filtered-tap',
          numberOfPeople: 1,
          brewTimeSeconds: 180,
          rating: 4,
          guestRatings: [],
        },
      },
    ];
    mockUseSharedBrews.mockReturnValue({ brews: sharedBrews, loading: false, error: null });

    const { result } = renderHook(() => useFormDefaults());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.suggestions.coffeeProducers).toContain('Remote Roaster');
    expect(result.current.suggestions.countriesOfOrigin).toContain('Rwanda');
    expect(result.current.suggestions.coffeeVarieties).toContain('Bourbon');
    expect(result.current.suggestions.grindEquipments).toContain('RemoteGrinder');
  });

  it('prioritizes localStorage over shared brews for defaults', async () => {
    const localEntry = makeEntry({
      coffeeProducer: 'Local Producer',
      countryOfOrigin: 'Ethiopia',
    });
    localStorage.setItem('coffee-brewing-entries', JSON.stringify([localEntry]));

    const sharedBrews: SharedBrew[] = [
      {
        shareId: 's1',
        sharedAt: '2024-01-01T00:00:00.000Z',
        brew: {
          coffeeProducer: 'Shared Producer',
          countryOfOrigin: 'Colombia',
          grindCoarseness: 'coarse',
          grindEquipment: 'SharedGrinder',
          brewingMethod: 'french-press',
          gramsOfCoffee: 25,
          millilitersOfWater: 400,
          waterSource: 'tap',
          numberOfPeople: 2,
          brewTimeSeconds: 240,
          rating: 3,
          guestRatings: [],
        },
      },
    ];
    mockUseSharedBrews.mockReturnValue({ brews: sharedBrews, loading: false, error: null });

    const { result } = renderHook(() => useFormDefaults());
    await waitFor(() => expect(result.current.loading).toBe(false));

    // Local storage entry takes priority
    expect(result.current.defaults.coffeeProducer).toBe('Local Producer');
    expect(result.current.defaults.countryOfOrigin).toBe('Ethiopia');
  });
});
