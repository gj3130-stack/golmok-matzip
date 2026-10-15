import { createClient } from '@supabase/supabase-js';

// 서버 전용 클라이언트. service_role 키는 NEXT_PUBLIC_ 접두사가 없어 브라우저 번들에 포함되지 않는다.
export function getSupabaseAdmin() {
  if (typeof window !== 'undefined') throw new Error('supabaseAdmin은 서버에서만 사용할 수 있습니다.');
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('SUPABASE_SERVICE_ROLE_KEY 또는 NEXT_PUBLIC_SUPABASE_URL이 설정되지 않았습니다.');
  return createClient(url, key, { auth: { persistSession: false } });
}