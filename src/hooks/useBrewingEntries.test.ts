import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBrewingEntries } from '../hooks/useBrewingEntries';
import { makeEntry } from '../test/fixtures';

describe('useBrewingEntries', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts with an empty list when localStorage is empty', () => {
    const { result } = renderHook(() => useBrewingEntries());
    expect(result.current.entries).toEqual([]);
  });

  it('loads pre-existing entries from localStorage on mount', () => {
    const entry = makeEntry();
    localStorage.setItem('coffee-brewing-entries', JSON.stringify([entry]));
    const { result } = renderHook(() => useBrewingEntries());
    expect(result.current.entries).toHaveLength(1);
    expect(result.current.entries[0].id).toBe('entry-1');
  });

  it('addEntry saves and reflects the new entry', () => {
    const { result } = renderHook(() => useBrewingEntries());
    const entry = makeEntry();
    act(() => {
      result.current.addEntry(entry);
    });
    expect(result.current.entries).toHaveLength(1);
    expect(result.current.entries[0].id).toBe('entry-1');
  });

  it('addEntry sorts entries newest-first', () => {
    const older = makeEntry({ id: 'old', createdAt: '2024-01-01T00:00:00.000Z' });
    const newer = makeEntry({ id: 'new', createdAt: '2024-01-02T00:00:00.000Z' });
    const { result } = renderHook(() => useBrewingEntries());
    act(() => {
      result.current.addEntry(older);
      result.current.addEntry(newer);
    });
    expect(result.current.entries[0].id).toBe('new');
    expect(result.current.entries[1].id).toBe('old');
  });

  it('editEntry updates the entry in state', () => {
    const { result } = renderHook(() => useBrewingEntries());
    const entry = makeEntry();
    act(() => {
      result.current.addEntry(entry);
    });
    act(() => {
      result.current.editEntry({ ...entry, coffeeProducer: 'Updated' });
    });
    expect(result.current.entries[0].coffeeProducer).toBe('Updated');
  });

  it('removeEntry removes the entry from state', () => {
    const { result } = renderHook(() => useBrewingEntries());
    const entry = makeEntry();
    act(() => {
      result.current.addEntry(entry);
    });
    act(() => {
      result.current.removeEntry(entry.id);
    });
    expect(result.current.entries).toEqual([]);
  });
});
