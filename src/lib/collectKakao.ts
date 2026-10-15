import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

function mapCategory(code: string, name: string) {
  if (code === 'CE7' || /카페|디저트|제과|베이커리|간식|아이스크림|도넛|떡/.test(name)) return '카페/디저트';
  if (/한식/.test(name)) return '한식';
  if (/중식|중국/.test(name)) return '중식';
  if (/일식|회|초밥|돈까스|우동|라멘/.test(name)) return '일식/회';
  if (/양식|이탈리|피자|햄버거|패스트푸드|스테이크/.test(name)) return '양식';
  if (/분식|떡볶이|김밥/.test(name)) return '분식';
  return '기타';
}

async function kakaoCategory(key: string, code: string, x: number, y: number, radius: number) {
  const out: any[] = [];
  for (let page = 1; page <= 3; page++) {
    const url = `https://dapi.kakao.com/v2/local/search/category.json?category_group_code=${code}&x=${x}&y=${y}&radius=${radius}&page=${page}&size=15&sort=distance`;
    const res = await fetch(url, { headers: { Authorization: `KakaoAK ${key}` }, cache: 'no-store' });
    if (!res.ok) throw new Error(`Kakao ${res.status}: ${await res.text()}`);
    const json = await res.json();
    out.push(...json.documents);
    if (json.meta?.is_end) break;
  }
  return out;
}

// 서버 전용: 카카오 로컬에서 (lat,lng) 반경 내 음식점·카페를 모아 (source, source_id) 기준 upsert
export async function collectArea(lat: number, lng: number, radius: number): Promise<number> {
  const kakaoKey = process.env.KAKAO_REST_API_KEY;
  if (!kakaoKey) throw new Error('KAKAO_REST_API_KEY 미설정');
  radius = Math.min(Math.max(radius, 500), 5000);
  const step = radius / 2;
  const dLat = step / 111000, dLng = step / (111000 * Math.cos((lat * Math.PI) / 180));
  const centers: [number, number][] = [];
  for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) centers.push([lng + j * dLng, lat + i * dLat]);

  const byId = new Map<string, any>();
  await Promise.all(centers.flatMap(([x, y]) => ['FD6', 'CE7'].map(async (code) => {
    for (const p of await kakaoCategory(kakaoKey, code, x, y, Math.ceil(step * 1.5))) {
      byId.set(p.id, {
        source: 'kakao_local',
        source_id: String(p.id),
        name: p.place_name,
        road_address: p.road_address_name || null,
        lot_address: p.address_name || null,
        category: mapCategory(p.category_group_code || code, p.category_name || ''),
        category_raw: p.category_name || null,
        tel: p.phone || null,
        lat: Number(p.y),
        lng: Number(p.x),
        place_url: p.place_url || null,
        // 카카오 로컬 API는 영업상태를 제공하지 않으므로 business_status는 저장하지 않음
      });
    }
  })));

  const rows = [...byId.values()];
  const admin = getSupabaseAdmin();
  for (let i = 0; i < rows.length; i += 500) {
    const { error } = await admin.from('restaurants').upsert(rows.slice(i, i + 500), { onConflict: 'source,source_id' });
    if (error) throw new Error(error.message);
  }
  return rows.length;
}