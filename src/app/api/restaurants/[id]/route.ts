import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { rowToRestaurant, RestaurantRow } from '@/utils/restaurantRow';
import { loadPhotoPools, pickPhoto } from '@/lib/unsplash';

async function withPhotos(rows: RestaurantRow[]) {
  const text = (r: RestaurantRow) => (r.category_raw || '') + ' ' + r.name;
  const pools = await loadPhotoPools(rows.map(text));
  return rows.map((r) => {
    const base = rowToRestaurant(r);
    const ph = pickPhoto(pools, r.id, text(r));
    return ph ? { ...base, imageUrl: ph.url, imageCredit: ph.credit } : base;
  });
}

// 상세 조회: DB에서 id 하나를 읽는다.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data, error } = await supabase.from('restaurants').select('*').eq('id', id).maybeSingle();
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ success: false, error: 'not found' }, { status: 404 });
  return NextResponse.json({ success: true, data: (await withPhotos([data as RestaurantRow]))[0] });
}