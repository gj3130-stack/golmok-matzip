'use client';
// Platform helpers: separates web vs native (Capacitor) behaviour.
// No secret keys here. The app only knows the public HTTPS API base URL.
import { Capacitor } from '@capacitor/core';

export const isNative = () => Capacitor.isNativePlatform();

// Web build: same-origin '/api'. App build: NEXT_PUBLIC_API_BASE (e.g. https://golmok-matzip-app.vercel.app)
export const apiUrl = (path: string) => (process.env.NEXT_PUBLIC_API_BASE || '') + path;

export type GeoResult =
  | { ok: true; lat: number; lng: number }
  | { ok: false; reason: 'denied' | 'unavailable' | 'timeout' | 'unsupported' };

export async function getCurrentPosition(): Promise<GeoResult> {
  if (isNative()) {
    const { Geolocation } = await import('@capacitor/geolocation');
    try {
      let perm = await Geolocation.checkPermissions();
      if (perm.location !== 'granted' && perm.coarseLocation !== 'granted') {
        perm = await Geolocation.requestPermissions({ permissions: ['location', 'coarseLocation'] });
      }
      if (perm.location !== 'granted' && perm.coarseLocation !== 'granted') return { ok: false, reason: 'denied' };
      const p = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000 });
      return { ok: true, lat: p.coords.latitude, lng: p.coords.longitude };
    } catch (e) {
      const msg = String((e as Error)?.message || e).toLowerCase();
      if (msg.includes('denied') || msg.includes('permission')) return { ok: false, reason: 'denied' };
      if (msg.includes('timeout')) return { ok: false, reason: 'timeout' };
      return { ok: false, reason: 'unavailable' };
    }
  }
  if (typeof navigator === 'undefined' || !navigator.geolocation) return { ok: false, reason: 'unsupported' };
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ ok: true, lat: p.coords.latitude, lng: p.coords.longitude }),
      (err) =>
        resolve({
          ok: false,
          reason: err.code === err.PERMISSION_DENIED ? 'denied' : err.code === err.TIMEOUT ? 'timeout' : 'unavailable',
        }),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
}

// External links: in the app open in the system browser / map app, never inside the app WebView.
export async function openExternal(url: string) {
  if (isNative()) {
    if (/^(tel:|mailto:|kakaomap:|nmap:|geo:)/.test(url)) {
      window.location.href = url;
      return;
    }
    const { Browser } = await import('@capacitor/browser');
    await Browser.open({ url });
    return;
  }
  if (/^(tel:|mailto:)/.test(url)) window.location.href = url;
  else window.open(url, '_blank', 'noopener,noreferrer');
}

// Directions: Kakao Map web link (opens Kakao Map app if installed, otherwise mobile web).
export function directionsUrl(name: string, lat: number, lng: number) {
  return `https://map.kakao.com/link/to/${encodeURIComponent(name)},${lat},${lng}`;
}
