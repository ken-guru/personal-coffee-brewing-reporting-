import { useState, useCallback } from 'react';
import { BrewingEntry } from '../types/brewing';
import { getEntries, saveEntry, updateEntry, deleteEntry } from '../lib/storage';

export function useBrewingEntries() {
  const [entries, setEntries] = useState<BrewingEntry[]>(() =>
    getEntries().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  );

  const addEntry = useCallback((entry: BrewingEntry) => {
    saveEntry(entry);
    setEntries(getEntries().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  }, []);

  const editEntry = useCallback((entry: BrewingEntry) => {
    updateEntry(entry);
    setEntries(getEntries().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  }, []);

  const removeEntry = useCallback((id: string) => {
    deleteEntry(id);
    setEntries(getEntries().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  }, []);

  return { entries, addEntry, editEntry, removeEntry };
}
