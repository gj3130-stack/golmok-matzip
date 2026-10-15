'use client';
// Favorites v1: stored on the device (Capacitor Preferences in the app, localStorage on web).
// When login is added, sync this list to a Supabase "favorites" table (RLS: user_id = auth.uid()).
import { useCallback, useEffect, useState } from 'react';
import { isNative } from '@/lib/platform';

const KEY = 'golmok:favorites';

async function load(): Promise<string[]> {
  try {
    if (isNative()) {
      const { Preferences } = await import('@capacitor/preferences');
      const { value } = await Preferences.get({ key: KEY });
      return value ? JSON.parse(value) : [];
    }
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

async function save(ids: string[]) {
  const v = JSON.stringify(ids);
  if (isNative()) {
    const { Preferences } = await import('@capacitor/preferences');
    await Preferences.set({ key: KEY, value: v });
  } else localStorage.setItem(KEY, v);
}

export function useFavorites() {
  const [ids, setIds] = useState<string[]>([]);
  useEffect(() => {
    load().then(setIds);
  }, []);
  const toggle = useCallback((id: string) => {
    setIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      save(next);
      return next;
    });
  }, []);
  return { favoriteIds: ids, isFavorite: (id: string) => ids.includes(id), toggleFavorite: toggle };
}
