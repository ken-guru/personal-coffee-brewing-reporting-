import { useState, useCallback } from 'react';
import { BrewingEntry } from '../types/brewing';
import { getEntries, saveEntry, updateEntry, deleteEntry, deleteEntries } from '../lib/storage';

const byNewest = (a: BrewingEntry, b: BrewingEntry) =>
  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

export function useBrewingEntries() {
  const [entries, setEntries] = useState<BrewingEntry[]>(() =>
    getEntries().sort(byNewest)
  );

  const refresh = useCallback(() => {
    setEntries(getEntries().sort(byNewest));
  }, []);

  const addEntry = useCallback((entry: BrewingEntry) => {
    saveEntry(entry);
    refresh();
  }, [refresh]);

  const editEntry = useCallback((entry: BrewingEntry) => {
    updateEntry(entry);
    refresh();
  }, [refresh]);

  const removeEntry = useCallback((id: string) => {
    deleteEntry(id);
    refresh();
  }, [refresh]);

  const removeEntries = useCallback((ids: string[]) => {
    deleteEntries(ids);
    refresh();
  }, [refresh]);

  return { entries, addEntry, editEntry, removeEntry, removeEntries };
}
