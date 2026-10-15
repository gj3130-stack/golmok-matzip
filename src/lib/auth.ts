'use client';
// Login-ready session handling (no login UI in v1).
// - Web: Supabase stores the session in localStorage and returns to the site URL.
// - App: OAuth opens in the system browser, returns via deep link kr.golmokmatzip.app://auth-callback,
//   then exchangeCodeForSession() stores the session (persistSession) so it survives app restarts.
import { supabase } from '@/lib/supabase';
import { isNative, openExternal } from '@/lib/platform';
import { APP_SCHEME } from '@/lib/nativeBridge';

export const AUTH_REDIRECT_NATIVE = `${APP_SCHEME}://auth-callback`;

export async function signInWithProvider(provider: 'kakao' | 'google') {
  const redirectTo = isNative() ? AUTH_REDIRECT_NATIVE : window.location.origin;
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo, skipBrowserRedirect: isNative() },
  });
  if (error) throw error;
  if (isNative() && data?.url) await openExternal(data.url);
}

export async function handleAuthDeepLink(url: string) {
  if (!url.startsWith(AUTH_REDIRECT_NATIVE)) return false;
  const code = new URL(url.replace(`${APP_SCHEME}://`, 'https://x/')).searchParams.get('code');
  if (code) await supabase.auth.exchangeCodeForSession(code);
  return true;
}
