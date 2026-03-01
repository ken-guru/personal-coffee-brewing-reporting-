export interface GuestRating {
  id: string;
  rating: number; // 1-5
  comment?: string;
}

export type GrindCoarseness =
  | 'extra-fine'
  | 'fine'
  | 'medium-fine'
  | 'medium'
  | 'medium-coarse'
  | 'coarse'
  | 'extra-coarse';

export type BrewingMethod =
  | 'pour-over'
  | 'french-press'
  | 'aeropress'
  | 'aeropress-go'
  | 'kalita'
  | 'siemens-drip'
  | 'espresso'
  | 'moka-pot'
  | 'cold-brew'
  | 'drip'
  | 'other';

export type WaterSource =
  | 'tap'
  | 'filtered-tap'
  | 'bottled-still'
  | 'bottled-sparkling'
  | 'spring'
  | 'other';

export interface BrewingEntry {
  id: string;
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
  coffeeProducer: string;
  countryOfOrigin: string;
  coffeeVariety?: string;
  grindCoarseness: GrindCoarseness;
  grindEquipment: string;
  brewingMethod: BrewingMethod;
  gramsOfCoffee: number;
  millilitersOfWater: number;
  waterSource: WaterSource;
  numberOfPeople: number;
  brewTimeSeconds: number;
  rating: number; // 1-5
  comment?: string;
  guestRatings: GuestRating[];
}
