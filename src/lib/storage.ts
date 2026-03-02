import { BrewingEntry } from '../types/brewing';

// WARNING: All data stored here is held in plaintext localStorage and is
// accessible to any script running on this page (including browser extensions
// and any XSS payload). Do NOT store personally-identifiable information (PII)
// or sensitive data in these entries. The current schema only holds non-sensitive
// coffee-brewing metadata, which is acceptable. If the data model ever expands
// to include PII, consider encrypting the payload before storing it here.
const STORAGE_KEY = 'coffee-brewing-entries';

/** Normalizes entries from older formats (e.g. coffeeVariety as a plain string). */
function normalizeEntry(raw: Record<string, unknown>): BrewingEntry {
  const entry = raw as unknown as BrewingEntry;
  if (typeof raw.coffeeVariety === 'string') {
    return {
      ...entry,
      coffeeVariety: raw.coffeeVariety ? [raw.coffeeVariety] : undefined,
    };
  }
  return entry;
}

export function getEntries(): BrewingEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Record<string, unknown>[];
    return parsed.map(normalizeEntry);
  } catch {
    return [];
  }
}

export function saveEntry(entry: BrewingEntry): void {
  const entries = getEntries();
  entries.push(entry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function updateEntry(updated: BrewingEntry): void {
  const entries = getEntries();
  const idx = entries.findIndex((e) => e.id === updated.id);
  if (idx !== -1) {
    entries[idx] = updated;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }
}

export function deleteEntry(id: string): void {
  const entries = getEntries().filter((e) => e.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}
