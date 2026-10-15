import { Restaurant } from '@/types/restaurant';
import { getImageByKeywords } from '@/utils/imageHelper';
import { calculateBusinessStatus, getDefaultScheduleForRestaurant } from '@/utils/businessHours';

export interface RestaurantRow {
  id: string; source: string; source_id: string; name: string;
  road_address: string | null; lot_address: string | null;
  category: string; category_raw: string | null; tel: string | null;
  lat: number; lng: number; place_url: string | null;
  business_status: string | null; updated_at: string;
}

export function rowToRestaurant(row: RestaurantRow): Restaurant {
  const sub = (row.category_raw || '').split('>').map((s) => s.trim()).slice(1).filter(Boolean);
  const schedule = getDefaultScheduleForRestaurant(row.id, row.category);
  return {
    id: row.id,
    name: row.name,
    category: row.category as Restaurant['category'],
    roadAddress: row.road_address || row.lot_address || '',
    lotAddress: row.lot_address || '',
    tel: row.tel || '',
    lat: Number(row.lat),
    lng: Number(row.lng),
    sampleMenu: sub.length ? [sub.join(' · ')] : ['메뉴 정보 미제공'],
    imageUrl: getImageByKeywords(row.id, row.category, (row.category_raw || "") + " " + row.name),
    publicTags: [row.source === 'kakao_local' ? '카카오 장소 데이터' : row.source],
    isSample: false,
    // 영업상태는 출처가 준 값만 표시 (임의 계산하지 않음)
    statusInfo: row.business_status
      ? { status: 'OPEN', label: row.business_status, subText: `출처 제공 · ${row.updated_at.slice(0, 10)} 갱신`, badgeColor: 'gray' }
      : undefined,
    schedule: undefined,
    ratingInfo: '출처 미제공',
    businessHoursInfo: '영업시간 출처 미제공',
    reviewCountInfo: row.place_url || '출처 미제공',
  };
  void schedule; void calculateBusinessStatus;
}