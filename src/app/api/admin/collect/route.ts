import { NextResponse } from 'next/server';
import { collectArea } from '@/lib/collectKakao';

// 관리자용 수동 수집: POST /api/admin/collect  (헤더 x-admin-secret 필요)
export async function POST(req: Request) {
  const secret = process.env.ADMIN_COLLECT_SECRET;
  if (!secret || req.headers.get('x-admin-secret') !== secret) {
    return NextResponse.json({ success: false, error: 'unauthorized' }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  try {
    const n = await collectArea(Number(body.lat ?? 37.526), Number(body.lng ?? 126.677), Number(body.radius ?? 1500));
    return NextResponse.json({ success: true, upserted: n });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}