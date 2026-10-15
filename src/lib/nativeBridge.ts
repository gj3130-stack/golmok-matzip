'use client';
// Native-only wiring: Android back button + deep link return (e.g. after login).
import { useEffect, useRef } from 'react';
import { isNative } from '@/lib/platform';

export const APP_SCHEME = 'kr.golmokmatzip.app';

export function useNativeBridge(opts: {
  onBack: () => boolean; // return true if handled (closed a modal etc.)
  onDeepLink?: (url: string) => void;
}) {
  const ref = useRef(opts);
  ref.current = opts;
  useEffect(() => {
    if (!isNative()) return;
    let removers: (() => void)[] = [];
    (async () => {
      const { App } = await import('@capacitor/app');
      const { Browser } = await import('@capacitor/browser');
      const b = await App.addListener('backButton', () => {
        if (ref.current.onBack()) return;
        App.exitApp();
      });
      const d = await App.addListener('appUrlOpen', async ({ url }) => {
        // e.g. kr.golmokmatzip.app://auth-callback?code=...  -> close in-app browser and hand to auth handler
        try { await Browser.close(); } catch {}
        ref.current.onDeepLink?.(url);
      });
      removers = [() => b.remove(), () => d.remove()];
    })();
    return () => removers.forEach((r) => r());
  }, []);
}
