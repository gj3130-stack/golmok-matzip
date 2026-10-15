'use client';

import React, { useEffect, useState } from 'react';
import { MapPin, Phone, ChevronRight, Utensils, Award, Sparkles, Clock } from 'lucide-react';
import { Restaurant } from '@/types/restaurant';
import { formatDistance } from '@/utils/distance';
import { getRestaurantImage } from '@/utils/imageHelper';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onSelect: (restaurant: Restaurant) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
}

export default function RestaurantCard({
  restaurant,
  onSelect,
  isFavorite = false,
  onToggleFavorite,
}: RestaurantCardProps) {
  const [imageError, setImageError] = useState(false);
  const fallbackUrl = getRestaurantImage(restaurant.id, restaurant.category, restaurant.imageUrl);
  const slides = restaurant.gallery && restaurant.gallery.length > 1 ? restaurant.gallery : [{ url: fallbackUrl, credit: restaurant.imageCredit || '' }];
  const [slide, setSlide] = useState(0);
  useEffect(() => {
    if (slides.length < 2) return;
    const t = setInterval(() => setSlide((i) => (i + 1) % slides.length), 2500);
    return () => clearInterval(t);
  }, [slides.length]);

  const isOldStore = (restaurant.yearsInBusiness ?? 0) >= 10;
  const isNewStore = (restaurant.openYear ?? 0) >= 2024;
  const statusInfo = restaurant.statusInfo;

  return (
    <div
      onClick={() => onSelect(restaurant)}
      className="group bg-white border border-gray-200/90 rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:border-orange-300 transition-all cursor-pointer active:scale-[0.99]"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onSelect(restaurant);
        }
      }}
    >
      {/* 상단 음식점 대표 사진 배너 */}
      <div className="relative w-full h-36 bg-gray-100 overflow-hidden">
        {onToggleFavorite && (
          <button
            type="button"
            aria-label={isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(restaurant.id); }}
            onKeyDown={(e) => e.stopPropagation()}
            className="absolute top-2 right-2 z-20 w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center text-lg text-rose-500"
          >
            {isFavorite ? '♥' : '♡'}
          </button>
        )}
        {!imageError ? (
          <>
            {slides.map((s, i) => (
              <img
                key={s.url + i}
                src={s.url}
                alt={restaurant.name}
                onError={() => setImageError(true)}
                className={'absolute inset-0 w-full h-full object-cover transition-opacity duration-700 group-hover:scale-105 ' + (i === slide ? 'opacity-100' : 'opacity-0')}
                loading="lazy"
              />
            ))}
            {slides.length > 1 && (
              <div className="absolute bottom-1.5 right-2 flex gap-1 z-10">
                {slides.map((_, i) => (
                  <span key={i} className={'w-1.5 h-1.5 rounded-full ' + (i === slide ? 'bg-white' : 'bg-white/50')} />
                ))}
              </div>
            )}
            {restaurant.imageIsExample && (
              <span className="absolute top-2.5 right-2.5 z-10 text-[10px] font-bold text-white bg-black/50 px-1.5 py-0.5 rounded">예시 사진</span>
            )}
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-orange-50 text-orange-400">
            <Utensils className="w-8 h-8 mb-1" />
            <span className="text-xs font-medium">{restaurant.category}</span>
          </div>
        )}

        {slides[slide]?.credit && !imageError && (
          <span className="absolute bottom-1 left-2 z-10 text-[9px] text-white/80 bg-black/30 px-1 rounded">{slides[slide]?.credit}</span>
        )}

        {/* 좌상단 뱃지들 (업종 + 노포/신상) */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap max-w-[70%]">
          <span className="text-xs font-bold text-gray-800 bg-white/95 backdrop-blur-xs px-2.5 py-0.5 rounded-full shadow-xs">
            {restaurant.category}
          </span>

          {isOldStore && (
            <span className="flex items-center gap-0.5 text-[10px] font-extrabold text-amber-900 bg-amber-400/95 backdrop-blur-xs px-2 py-0.5 rounded-full shadow-xs">
              <Award className="w-3 h-3 text-amber-900" />
              {restaurant.yearsInBusiness}년차 노포
            </span>
          )}

          {isNewStore && (
            <span className="flex items-center gap-0.5 text-[10px] font-extrabold text-white bg-blue-600/90 backdrop-blur-xs px-2 py-0.5 rounded-full shadow-xs">
              <Sparkles className="w-3 h-3 text-white" />
              신상
            </span>
          )}
        </div>

        {/* 우상단 실시간 영업 상태 뱃지 (영업중 / 브레이크타임 / 영업종료) */}
        {statusInfo && (
          <div className="absolute top-2.5 right-2.5">
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full shadow-md backdrop-blur-xs ${
                statusInfo.status === 'OPEN'
                  ? 'bg-emerald-600/90 text-white ring-1 ring-emerald-300'
                  : statusInfo.status === 'BREAK'
                  ? 'bg-amber-500/90 text-white ring-1 ring-amber-300'
                  : 'bg-gray-800/80 text-gray-200'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  statusInfo.status === 'OPEN'
                    ? 'bg-emerald-300 animate-ping'
                    : statusInfo.status === 'BREAK'
                    ? 'bg-amber-200 animate-pulse'
                    : 'bg-gray-400'
                }`}
              />
              {statusInfo.label}
            </span>
          </div>
        )}

        {/* 우하단 직선거리 뱃지 */}
        <div className="absolute bottom-2.5 right-2.5">
          <span className="text-xs font-bold text-white bg-black/75 backdrop-blur-xs px-2.5 py-1 rounded-lg shadow-xs">
            {formatDistance(restaurant.distanceMeters)}
          </span>
        </div>
      </div>

      {/* 카드 본문 내용 */}
      <div className="p-3.5 space-y-2.5">
        <div>
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-base font-bold text-gray-900 group-hover:text-orange-600 transition-colors truncate">
              {restaurant.name}
            </h3>
            {restaurant.openYear && (
              <span className="text-[10px] text-gray-400 font-medium shrink-0">
                {restaurant.openYear}년 개업
              </span>
            )}
          </div>

          <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="truncate">{restaurant.roadAddress}</span>
          </div>
        </div>

        {/* 영업시간 및 브레이크타임 안내 바 */}
        <div className="flex items-center gap-1.5 text-xs">
          <div
            className={`flex items-center gap-1 px-2 py-0.5 rounded-md font-medium text-[11px] ${
              statusInfo?.status === 'OPEN'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60'
                : statusInfo?.status === 'BREAK'
                ? 'bg-amber-50 text-amber-800 border border-amber-200/60'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            <Clock className="w-3 h-3 shrink-0" />
            <span>{statusInfo?.subText || '영업시간 확인'}</span>
          </div>

          {restaurant.schedule?.breakStart && (
            <span className="text-[10px] text-gray-400 truncate">
              (브레이크 {restaurant.schedule.breakStart}~{restaurant.schedule.breakEnd})
            </span>
          )}
        </div>

        {/* 공공 인증 태그들 (안심식당, 착한가격 등) */}
        {restaurant.publicTags && restaurant.publicTags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {restaurant.publicTags.map((tag, idx) => (
              <span
                key={idx}
                className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-md"
              >
                ✓ {tag}
              </span>
            ))}
          </div>
        )}

        {/* 대표 메뉴 태그 */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {restaurant.sampleMenu.map((menu, idx) => (
            <span
              key={idx}
              className="text-[11px] text-gray-600 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-md"
            >
              {menu}
            </span>
          ))}
        </div>

        {/* 하단 전화번호 & 상세보기 */}
        <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
          <div className="flex items-center gap-2 truncate">
            <span className="flex items-center gap-1 text-gray-500 shrink-0">
              <Phone className="w-3 h-3 text-gray-400" />
              {restaurant.tel}
            </span>
          </div>

          <span className="flex items-center text-xs font-semibold text-orange-600 shrink-0 ml-2">
            상세보기
            <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </span>
        </div>
      </div>
    </div>
  );
}
