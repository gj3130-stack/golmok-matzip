import { CategoryType } from '@/types/restaurant';

// 업종별 기본 대표 음식 이미지 (고화질 CDN 이미지)
export const CATEGORY_DEFAULT_IMAGES: Record<string, string> = {
  '한식': 'https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=600&q=80', // 국밥/찌개
  '일식/회': 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=600&q=80', // 초밥/돈카츠
  '중식': 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&q=80', // 딤섬/중화요리
  '양식': 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80', // 파스타/피자
  '카페/디저트': 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80', // 카페/커피
  '분식': 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=600&q=80', // 분식/떡볶이
  '기타': 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=600&q=80', // 커리/아시안
};

// 개별 식당 메뉴 특화 사진 맵
export const RESTAURANT_IMAGES: Record<string, string> = {
  'rest-1': 'https://images.unsplash.com/photo-1547928576-a4a33237cbc3?auto=format&fit=crop&w=600&q=80', // 순대국밥
  'rest-2': 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=600&q=80', // 돈카츠
  'rest-3': 'https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=600&q=80', // 짜장면/탕수육
  'rest-4': 'https://images.unsplash.com/photo-1621996346565-e3d5d628129e?auto=format&fit=crop&w=600&q=80', // 파스타
  'rest-5': 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80', // 핸드드립 커피
  'rest-6': 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=600&q=80', // 떡볶이
  'rest-7': 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=600&q=80', // 칼국수/면
  'rest-8': 'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=600&q=80', // 텐동/튀김덮밥
  'rest-9': 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80', // 딤섬
  'rest-10': 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?auto=format&fit=crop&w=600&q=80', // 베이글
  'rest-11': 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80', // 숯불갈비/고기
  'rest-12': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80', // 수제버거
  'rest-13': 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&w=600&q=80', // 튀김 분식
  'rest-14': 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80', // 이자카야 사시미
  'rest-15': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80', // 마라탕
  'rest-16': 'https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=600&q=80', // 가정식 백반
  'rest-17': 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80', // 에스프레소
  'rest-18': 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=600&q=80', // 멕시칸 타코
  'rest-19': 'https://images.unsplash.com/photo-1553187657-19597cf43f32?auto=format&fit=crop&w=600&q=80', // 김밥
  'rest-20': 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=600&q=80', // 커리
};

export function getRestaurantImage(id: string, category: string, customUrl?: string): string {
  if (customUrl && customUrl.trim().length > 0) {
    return customUrl;
  }
  return RESTAURANT_IMAGES[id] || CATEGORY_DEFAULT_IMAGES[category] || CATEGORY_DEFAULT_IMAGES['한식'];
}

// 실제 가게 사진은 카카오 API가 제공하지 않으므로, 세부 업종 키워드로 어울리는 '예시 이미지'를 고른다.
const U = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=600&q=80`;
const KEYWORD_IMAGES: [RegExp, string[]][] = [
  [/국밥|순대|해장국|감자탕|곰탕|설렁탕/, [U('photo-1547928576-a4a33237cbc3'), U('photo-1590301157890-4810ed352733')]],
  [/칼국수|국수|냉면|우동|라멘|면/, [U('photo-1612927601601-6638404737ce'), U('photo-1569718212165-3a8278d5f624')]],
  [/고기|갈비|삼겹|육류|곱창|족발|보쌈|구이/, [U('photo-1544025162-d76694265947')]],
  [/돈까스|돈가스|카츠/, [U('photo-1569058242253-92a9c755a0ec')]],
  [/초밥|회|일식|이자카야|참치/, [U('photo-1579871494447-9811cf80d66c'), U('photo-1534422298391-e4f8c172dddb'), U('photo-1553621042-f6e147245754')]],
  [/중식|중국|짜장|짬뽕|마라|양꼬치/, [U('photo-1525755662778-989d0524087e'), U('photo-1585032226651-759b368d7246'), U('photo-1563245372-f21724e3856d'), U('photo-1569718212165-3a8278d5f624')]],
  [/햄버거|버거/, [U('photo-1568901346375-23c9450c58cd')]],
  [/파스타|이탈리|피자|양식|레스토랑/, [U('photo-1621996346565-e3d5d628129e'), U('photo-1551183053-bf91a1d81141')]],
  [/멕시칸|타코/, [U('photo-1565299585323-38d6b0865b47')]],
  [/인도|커리|카레|아시아|베트남|태국/, [U('photo-1589302168068-964664d93dc0')]],
  [/분식|떡볶이|튀김/, [U('photo-1625813506062-0aeb1d7a094b'), U('photo-1606787366850-de6330128bfc')]],
  [/김밥/, [U('photo-1553187657-19597cf43f32')]],
  [/베이커리|제과|빵|베이글|도넛/, [U('photo-1586985289688-ca3cf47d3e6e')]],
  [/카페|커피|디저트|아이스크림|차/, [U('photo-1501339847302-ac426a4a7cbb'), U('photo-1495474472287-4d71bcdd2085'), U('photo-1514432324607-a09d9b4aefdd')]],
];

function hash(s: string) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); }

export function getImageByKeywords(id: string, category: string, text: string): string {
  const matched = KEYWORD_IMAGES.filter(([re]) => re.test(text)).flatMap(([, urls]) => urls);
  const pool = matched.length ? matched : Object.values(CATEGORY_DEFAULT_IMAGES);
  return pool[hash(id) % pool.length] || CATEGORY_DEFAULT_IMAGES[category];
}