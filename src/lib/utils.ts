import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { BrewingMethod, GrindCoarseness, WaterSource } from '../types/brewing';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function formatBrewingMethod(method: BrewingMethod): string {
  const map: Record<BrewingMethod, string> = {
    'pour-over': 'Pour Over',
    'french-press': 'French Press',
    aeropress: 'AeroPress',
    'aeropress-go': 'Aeropress Go',
    kalita: 'Kalita Hand Brewer',
    'siemens-drip': 'Siemens Coffee Brewer',
    espresso: 'Espresso',
    'moka-pot': 'Moka Pot',
    'cold-brew': 'Cold Brew',
    drip: 'Drip',
    other: 'Other',
  };
  return map[method];
}

export function formatGrindCoarseness(coarseness: GrindCoarseness): string {
  const map: Record<GrindCoarseness, string> = {
    'extra-fine': 'Extra Fine',
    fine: 'Fine',
    'medium-fine': 'Medium Fine',
    medium: 'Medium',
    'medium-coarse': 'Medium Coarse',
    coarse: 'Coarse',
    'extra-coarse': 'Extra Coarse',
  };
  return map[coarseness];
}

export function formatWaterSource(source: WaterSource): string {
  const map: Record<WaterSource, string> = {
    tap: 'Tap',
    'filtered-tap': 'Filtered Tap',
    'bottled-still': 'Bottled Still',
    'bottled-sparkling': 'Bottled Sparkling',
    spring: 'Spring',
    other: 'Other',
  };
  return map[source];
}
