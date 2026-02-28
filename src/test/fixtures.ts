import type { BrewingEntry } from '../types/brewing';

export function makeEntry(overrides: Partial<BrewingEntry> = {}): BrewingEntry {
  return {
    id: 'entry-1',
    createdAt: '2024-03-15T10:00:00.000Z',
    updatedAt: '2024-03-15T10:00:00.000Z',
    coffeeProducer: 'Blue Bottle',
    countryOfOrigin: 'Ethiopia',
    grindCoarseness: 'medium',
    grindEquipment: 'Baratza Encore',
    brewingMethod: 'pour-over',
    gramsOfCoffee: 15,
    millilitersOfWater: 250,
    waterSource: 'filtered-tap',
    numberOfPeople: 1,
    brewTimeSeconds: 180,
    rating: 4,
    comment: 'Bright and fruity',
    guestRatings: [],
    ...overrides,
  };
}
