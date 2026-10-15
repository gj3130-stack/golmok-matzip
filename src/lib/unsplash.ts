// 서버 전용: Unsplash 검색 API로 세부 업종별 사진 풀을 받아 메모리에 캐시 (6시간)
type Photo = { url: string; credit: string };
const GROUPS: [RegExp, string][] = [
  // 구체적인 메뉴를 먼저 검사 (돈까스·우동 가게가 '면'으로 잡히지 않도록)
  [/돈까스|돈가스|카츠/, 'tonkatsu pork cutlet'],
  [/초밥|스시|회|참치|이자카야/, 'sushi'],
  [/치킨|닭강정/, 'korean fried chicken'],
  [/햄버거|버거/, 'hamburger'],
  [/피자/, 'pizza'],
  [/떡볶이|분식|튀김/, 'tteokbokki'],
  [/김밥/, 'kimbap'],
  [/짜장|짬뽕|중식|중국/, 'jajangmyeon'],
  [/마라|양꼬치/, 'malatang'],
  [/쌀국수|베트남/, 'pho'],
  [/커리|카레|인도/, 'curry'],
  [/고기|갈비|삼겹|육류|구이/, 'korean bbq'],
  [/곱창|막창/, 'gopchang'],
  [/족발|보쌈/, 'bossam'],
  [/냉면/, 'naengmyeon'],
  [/칼국수|국수|우동|라멘|면/, 'kalguksu noodle soup'],
  [/해장국|국밥|순대|감자탕|곰탕|설렁탕|탕|찌개/, 'korean hot soup stew'],
  [/파스타|이탈리|양식|스테이크/, 'pasta'],
  [/베이커리|제과|빵|베이글|도넛/, 'bakery bread'],
  [/디저트|케이크|아이스크림|와플/, 'dessert cake'],
  [/카페|커피/, 'latte coffee cup'],
  [/술집|호프|포차|주점/, 'korean pub food'],
  [/한식|백반|비빔/, 'korean food bibimbap'],
];const FALLBACK = 'restaurant food';
const cache = new Map<string, { at: number; photos: Photo[] }>();

async function search(query: string): Promise<Photo[]> {
  const hit = cache.get(query);
  if (hit && Date.now() - hit.at < 6 * 3600 * 1000) return hit.photos;
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) return [];
  try {
    const res = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=30&orientation=landscape&content_filter=high`,
      { headers: { Authorization: `Client-ID ${key}`, 'Accept-Version': 'v1' } });
    if (!res.ok) { console.warn('Unsplash', res.status, await res.text()); return hit?.photos ?? []; }
    const json = await res.json();
    const photos: Photo[] = (json.results || []).map((p: any) => ({
      url: `${p.urls.raw}&auto=format&fit=crop&w=600&q=75`,
      credit: `Photo by ${p.user?.name ?? 'Unsplash'} on Unsplash`,
    }));
    cache.set(query, { at: Date.now(), photos });
    return photos;
  } catch (e) { console.warn('Unsplash error', e); return hit?.photos ?? []; }
}

export function queryFor(text: string) {
  return GROUPS.find(([re]) => re.test(text))?.[1] ?? FALLBACK;
}

function hash(s: string) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); }

// 목록에 필요한 그룹만 조회해 { 그룹: 사진[] } 반환
export async function loadPhotoPools(texts: string[]) {
  const queries = [...new Set(texts.map(queryFor))];
  const entries = await Promise.all(queries.map(async (q) => [q, await search(q)] as const));
  return new Map(entries);
}

export function pickPhoto(pools: Map<string, Photo[]>, id: string, text: string): Photo | undefined {
  const pool = pools.get(queryFor(text));
  return pool && pool.length ? pool[hash(id) % pool.length] : undefined;
}
export function pickPhotos(pools: Map<string, Photo[]>, id: string, text: string, n: number): Photo[] {
  const list = pools.get(queryFor(text)) || [];
  if (!list.length) return [];
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  const out: Photo[] = [];
  for (let k = 0; k < Math.min(n, list.length); k++) out.push(list[(h + k * 7) % list.length]);
  return out;
}
