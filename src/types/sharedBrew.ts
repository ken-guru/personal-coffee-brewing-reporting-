import type { BrewingMethod, GrindCoarseness, WaterSource, GuestRating } from './brewing';

export interface SharedBrewData {
  coffeeProducer: string;
  countryOfOrigin: string;
  coffeeVariety?: string[];
  grindCoarseness: GrindCoarseness;
  grindEquipment: string;
  brewingMethod: BrewingMethod;
  brewingMethodCustom?: string;
  gramsOfCoffee: number;
  millilitersOfWater: number;
  waterSource: WaterSource;
  numberOfPeople: number;
  brewTimeSeconds: number | null; // null means "not applicable" (time is fixed by equipment)
  rating: number;
  comment?: string;
  guestRatings: GuestRating[];
}

export interface SharedBrew {
  shareId: string;
  sharedAt: string; // ISO date
  brew: SharedBrewData;
}
