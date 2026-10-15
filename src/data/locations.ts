import { RegionLocation } from '@/types/restaurant';

export const DEFAULT_LOCATION: RegionLocation = {
  id: 'incheon-seogu-cheongna',
  city: '인천광역시',
  district: '서구',
  neighborhood: '청라동 (커넬웨이)',
  lat: 37.5385,
  lng: 126.6548,
};

export const SAMPLE_REGIONS: RegionLocation[] = [
  // 인천광역시 서구
  {
    id: 'incheon-seogu-cheongna',
    city: '인천광역시',
    district: '서구',
    neighborhood: '청라동 (커넬웨이/호수공원)',
    lat: 37.5385,
    lng: 126.6548,
  },
  {
    id: 'incheon-seogu-gajeong',
    city: '인천광역시',
    district: '서구',
    neighborhood: '가정동 (루원시티)',
    lat: 37.5255,
    lng: 126.6765,
  },
  {
    id: 'incheon-seogu-simgok',
    city: '인천광역시',
    district: '서구',
    neighborhood: '심곡동/연희동 (서구청)',
    lat: 37.5452,
    lng: 126.6762,
  },
  {
    id: 'incheon-seogu-geomam',
    city: '인천광역시',
    district: '서구',
    neighborhood: '검암동 (검암역/아라뱃길)',
    lat: 37.5684,
    lng: 126.6745,
  },
  {
    id: 'incheon-seogu-dangha',
    city: '인천광역시',
    district: '서구',
    neighborhood: '당하동/원당동 (검단신도시)',
    lat: 37.5935,
    lng: 126.6720,
  },
  // 서울특별시 마포구
  {
    id: 'mapo-seogyo',
    city: '서울특별시',
    district: '마포구',
    neighborhood: '서교동 (홍대입구)',
    lat: 37.5558,
    lng: 126.9239,
  },
  {
    id: 'mapo-yeonnam',
    city: '서울특별시',
    district: '마포구',
    neighborhood: '연남동 (연트럴파크)',
    lat: 37.5620,
    lng: 126.9248,
  },
  {
    id: 'mapo-mangwon',
    city: '서울특별시',
    district: '마포구',
    neighborhood: '망원동 (망원시장)',
    lat: 37.5562,
    lng: 126.9102,
  },
  {
    id: 'mapo-hapjeong',
    city: '서울특별시',
    district: '마포구',
    neighborhood: '합정동 (카페거리)',
    lat: 37.5496,
    lng: 126.9138,
  },
];
