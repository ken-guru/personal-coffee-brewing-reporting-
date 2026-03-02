import { useMemo } from 'react';
import { getEntries } from '../lib/storage';
import { useSharedBrews } from './useSharedBrews';
import type { BrewingMethod, GrindCoarseness, WaterSource } from '../types/brewing';

// Seed suggestions sourced from known coffee supplier packages (Tim Wendelboe, timwendelboe.no)
const STATIC_COFFEE_PRODUCERS = ['Tim Wendelboe'];

const STATIC_COUNTRIES_OF_ORIGIN = [
  'Ethiopia', 'Kenya', 'Honduras', 'El Salvador', 'Colombia', 'Brazil',
  'Guatemala', 'Peru', 'Rwanda', 'Burundi', 'Yemen',
];

const STATIC_COFFEE_VARIETIES = [
  // From supplier packages
  'Pacamara', 'Heirloom cultivars', '74112', 'SL28', 'SL34', 'Ruiru 11', 'Batian',
  // Common varieties
  'Geisha', 'Catuaí', 'Red Catuaí', 'Yellow Catuaí', 'Bourbon', 'Typica', 'Caturra',
  'Ethiopian Heirloom', 'Wush Wush', 'Maragogipe', 'Mundo Novo',
];

const STATIC_GRIND_EQUIPMENTS = ['Knock Aergrind', 'Wilfa Svart'];

/** Returns the most frequently occurring value in an array, or undefined if empty. */
export function getMostPopular<T>(values: (T | undefined | null)[]): T | undefined {
  const filtered = values.filter((v): v is T => v !== undefined && v !== null && String(v) !== '');
  if (filtered.length === 0) return undefined;
  const counts = new Map<string, number>();
  for (const v of filtered) {
    const key = JSON.stringify(v);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const topKey = [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
  return filtered.find((v) => JSON.stringify(v) === topKey);
}

function unique(arr: string[]): string[] {
  return [...new Set(arr.filter((s) => s.trim().length > 0))];
}

export interface FormSuggestions {
  coffeeProducers: string[];
  countriesOfOrigin: string[];
  coffeeVarieties: string[];
  grindEquipments: string[];
}

export interface FormDefaults {
  coffeeProducer: string;
  countryOfOrigin: string;
  coffeeVariety: string;
  grindCoarseness: GrindCoarseness;
  grindEquipment: string;
  brewingMethod: BrewingMethod;
  gramsOfCoffee: number;
  millilitersOfWater: number;
  waterSource: WaterSource;
  numberOfPeople: number;
  brewMinutes: number;
  brewSeconds: number;
}

/**
 * Computes autocomplete suggestions and smart default values for the brew form.
 *
 * Priority for defaults:
 * 1. Most recent entry in localStorage
 * 2. Most popular value across shared brews
 * 3. Static fallback constants
 */
export function useFormDefaults() {
  // Read localStorage once on mount; sort newest-first for priority lookup
  const localEntries = useMemo(
    () =>
      getEntries().sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [],
  );

  const { brews: sharedBrews, loading } = useSharedBrews();

  const latestLocal = localEntries[0];
  const hasLocalData = localEntries.length > 0;

  const suggestions = useMemo<FormSuggestions>(() => {
    const sharedData = sharedBrews.map((s) => s.brew);
    return {
      coffeeProducers: unique([
        ...localEntries.map((e) => e.coffeeProducer),
        ...sharedData.map((b) => b.coffeeProducer),
        ...STATIC_COFFEE_PRODUCERS,
      ]),
      countriesOfOrigin: unique([
        ...localEntries.map((e) => e.countryOfOrigin),
        ...sharedData.map((b) => b.countryOfOrigin),
        ...STATIC_COUNTRIES_OF_ORIGIN,
      ]),
      coffeeVarieties: unique([
        ...localEntries.map((e) => e.coffeeVariety ?? ''),
        ...sharedData.map((b) => b.coffeeVariety ?? ''),
        ...STATIC_COFFEE_VARIETIES,
      ]),
      grindEquipments: unique([
        ...localEntries.map((e) => e.grindEquipment),
        ...sharedData.map((b) => b.grindEquipment),
        ...STATIC_GRIND_EQUIPMENTS,
      ]),
    };
  }, [localEntries, sharedBrews]);

  const defaults = useMemo<FormDefaults>(() => {
    const sharedData = sharedBrews.map((s) => s.brew);
    const brewTime =
      latestLocal?.brewTimeSeconds ??
      getMostPopular(sharedData.map((b) => b.brewTimeSeconds));
    return {
      coffeeProducer:
        latestLocal?.coffeeProducer ??
        getMostPopular(sharedData.map((b) => b.coffeeProducer)) ??
        '',
      countryOfOrigin:
        latestLocal?.countryOfOrigin ??
        getMostPopular(sharedData.map((b) => b.countryOfOrigin)) ??
        '',
      coffeeVariety:
        latestLocal?.coffeeVariety ??
        getMostPopular(sharedData.map((b) => b.coffeeVariety)) ??
        '',
      grindCoarseness:
        latestLocal?.grindCoarseness ??
        getMostPopular(sharedData.map((b) => b.grindCoarseness)) ??
        'medium',
      grindEquipment:
        latestLocal?.grindEquipment ??
        getMostPopular(sharedData.map((b) => b.grindEquipment)) ??
        '',
      brewingMethod:
        latestLocal?.brewingMethod ??
        getMostPopular(sharedData.map((b) => b.brewingMethod)) ??
        'pour-over',
      gramsOfCoffee:
        latestLocal?.gramsOfCoffee ??
        getMostPopular(sharedData.map((b) => b.gramsOfCoffee)) ??
        30,
      millilitersOfWater:
        latestLocal?.millilitersOfWater ??
        getMostPopular(sharedData.map((b) => b.millilitersOfWater)) ??
        500,
      waterSource:
        latestLocal?.waterSource ??
        getMostPopular(sharedData.map((b) => b.waterSource)) ??
        'filtered-tap',
      numberOfPeople:
        latestLocal?.numberOfPeople ??
        getMostPopular(sharedData.map((b) => b.numberOfPeople)) ??
        1,
      brewMinutes: brewTime !== undefined ? Math.floor(brewTime / 60) : 3,
      brewSeconds: brewTime !== undefined ? brewTime % 60 : 0,
    };
  }, [latestLocal, sharedBrews]);

  return { suggestions, defaults, loading, hasLocalData };
}
