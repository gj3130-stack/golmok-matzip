import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { collectArea } from '@/lib/collectKakao';
import { SAMPLE_RESTAURANTS } from '@/data/sampleRestaurants';
import { INCHEON_RESTAURANTS } from '@/data/incheonRestaurants';
import { rowToRestaurant, RestaurantRow } from '@/utils/restaurantRow';
import { loadPhotoPools, pickPhoto, pickPhotos } from '@/lib/unsplash';

type NearRow = RestaurantRow & { distance_m: number };

async function withPhotos(rows: NearRow[]) {
  const text = (r: RestaurantRow) => (r.category_raw || '') + ' ' + r.name;
  const pools = await loadPhotoPools(rows.map(text));
  return rows.map((r) => {
    const base = { ...rowToRestaurant(r), distanceMeters: Math.round(r.distance_m), distanceType: 'straight-line' };
    const ph = pickPhoto(pools, r.id, text(r));
    const gallery = pickPhotos(pools, r.id, text(r), 4);
    return ph ? { ...base, imageUrl: ph.url, imageCredit: ph.credit, gallery, imageIsExample: true } : base;
  });
}

const ALLOWED_RADII = [500, 1000, 3000];
const STALE_MS = 24 * 60 * 60 * 1000;
const MAX_LIMIT = 300;

async function nearby(lat: number, lng: number, radius: number, category: string | null, q: string | null, limit: number) {
  return supabase.rpc('nearby_restaurants', {
    p_lat: lat, p_lng: lng, p_radius_m: radius,
    p_category: category, p_query: q, p_limit: limit,
  });
}

// GET /api/restaurants?lat=&lng=&radius=500|1000|3000&category=&q=&limit=
// Distance = straight-line meters computed in PostGIS (ST_Distance on geography), sorted ascending.
export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const lat = Number(sp.get('lat') ?? 37.526);
  const lng = Number(sp.get('lng') ?? 126.677);
  const r = Number(sp.get('radius') ?? 1000);
  const radius = ALLOWED_RADII.includes(r) ? r : 1000;
  const category = sp.get('category') || null;
  const q = (sp.get('q') || '').trim().slice(0, 50) || null;
  const limit = Math.min(Math.max(Number(sp.get('limit') ?? 200), 1), MAX_LIMIT);

  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return NextResponse.json({ success: false, error: 'invalid coordinates' }, { status: 400 });
  }

  let { data, error } = await nearby(lat, lng, radius, category, q, limit);

  // auto-collect when the area is empty or stale (checked on the unfiltered 3km area)
  if (!error && !category && !q) {
    const area = await nearby(lat, lng, 3000, null, null, 30);
    const rows = (area.data || []) as NearRow[];
    const newest = rows.reduce((m, x) => Math.max(m, Date.parse(x.updated_at || '0')), 0);
    if ((rows.length < 30 || Date.now() - newest > STALE_MS) && process.env.KAKAO_REST_API_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        getSupabaseAdmin();
        await collectArea(lat, lng, 3000);
        ({ data, error } = await nearby(lat, lng, radius, category, q, limit));
      } catch (e) {
        console.warn('collect failed:', e);
      }
    }
  }

  if (!error && data) {
    return NextResponse.json({
      success: true, source: 'supabase', radius, distance: 'straight-line meters',
      count: data.length, limit, data: await withPhotos(data as NearRow[]),
    });
  }

  const fallback = [...SAMPLE_RESTAURANTS, ...INCHEON_RESTAURANTS].map((x) => ({ ...x, isSample: true }));
  return NextResponse.json({ success: false, source: 'local_dataset', error: error?.message, count: fallback.length, data: fallback });
}
