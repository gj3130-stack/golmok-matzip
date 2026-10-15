export type CategoryType = 
  | '전체'
  | '한식'
  | '중식'
  | '일식/회'
  | '양식'
  | '카페/디저트'
  | '분식'
  | '기타';

export type ThemeFilterType = '전체' | '노포' | '신상' | '위생안심';

export type BusinessStatus = 'OPEN' | 'BREAK' | 'CLOSED';

export interface BusinessHoursSchedule {
  open: string;        // "11:00"
  close: string;       // "21:30"
  breakStart?: string; // "15:00"
  breakEnd?: string;   // "17:00"
  lastOrder?: string;  // "21:00"
  closedDays?: string[]; // ["월요일"]
}

export interface BusinessStatusInfo {
  status: BusinessStatus;
  label: string;       // "영업중" | "브레이크타임" | "영업종료"
  subText: string;     // "21:30에 영업종료" | "17:00에 영업시작" | "내일 11:00에 영업시작"
  badgeColor: 'green' | 'orange' | 'gray';
}

export type DistanceRadius = 500 | 1000 | 3000;

export interface Restaurant {
  gallery?: { url: string; credit: string }[];
  imageIsExample?: boolean;
  distanceType?: string;
  id: string;
  name: string;
  category: Exclude<CategoryType, '전체'>;
  roadAddress: string;
  lotAddress: string;
  tel: string;
  lat: number;
  lng: number;
  sampleMenu: string[];
  imageUrl?: string;
  imageCredit?: string;       // 사진 출처 (Unsplash 등)          // 음식점 대표 이미지 URL
  openYear?: number;          // 개업 년도 (인허가 일자 기반, 예: 2008)
  yearsInBusiness?: number;   // 운영 연차 (예: 18년차)
  publicTags?: string[];      // 공공 인증 태그 (예: ['18년 노포', '안심식당'])
  schedule?: BusinessHoursSchedule; // 영업시간 및 브레이크타임 스케줄
  statusInfo?: BusinessStatusInfo;  // 실시간 계산된 영업 상태
  // 샘플/실제 데이터 구분 플래그
  isSample?: boolean;
  ratingInfo: string;         // 평점 안내
  businessHoursInfo: string;  // 영업시간 안내
  reviewCountInfo: string;    // 리뷰 수집 안내
  distanceMeters?: number;    // 현재 위치 기준 계산된 거리 (미터)
}

export interface RegionLocation {
  id: string;
  city: string;
  district: string;
  neighborhood: string;
  lat: number;
  lng: number;
}
