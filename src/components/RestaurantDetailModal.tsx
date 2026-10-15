'use client';

import React, { useState } from 'react';
import { openExternal, directionsUrl } from '@/lib/platform';
import { X, MapPin, Phone, Copy, Check, AlertTriangle, ExternalLink, Utensils, Award, Sparkles, Calendar, Clock } from 'lucide-react';
import { Restaurant } from '@/types/restaurant';
import { formatDistance } from '@/utils/distance';
import { getRestaurantImage } from '@/utils/imageHelper';

interface RestaurantDetailModalProps {
  restaurant: Restaurant | null;
  onClose: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
}

export default function RestaurantDetailModal({
  restaurant,
  onClose,
  isFavorite = false,
  onToggleFavorite,
}: RestaurantDetailModalProps) {
  const [copied, setCopied] = useState(false);
  const [imageError, setImageError] = useState(false);

  if (!restaurant) return null;

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(restaurant.roadAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const kakaoMapSearchUrl =
    restaurant.lat && restaurant.lng
      ? directionsUrl(restaurant.name, restaurant.lat, restaurant.lng)
      : `https://map.kakao.com/link/search/${encodeURIComponent(restaurant.name)}`;

  const imageUrl = getRestaurantImage(restaurant.id, restaurant.category, restaurant.imageUrl);
  const isOldStore = (restaurant.yearsInBusiness ?? 0) >= 10;
  const isNewStore = (restaurant.openYear ?? 0) >= 2024;
  const statusInfo = restaurant.statusInfo;
  const schedule = restaurant.schedule;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div 
        className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-title"
      >
        {/* 상단 와이드 음식점 대표 사진 & 닫기 버튼 */}
        <div className="relative w-full h-48 bg-gray-900 shrink-0">
          {!imageError ? (
            <img
              src={imageUrl}
              alt={restaurant.name}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-orange-50 text-orange-400">
              <Utensils className="w-12 h-12 mb-1" />
              <span className="text-sm font-semibold">{restaurant.category}</span>
            </div>
          )}

          {/* 그라데이션 오버레이 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

          {/* 좌상단 뱃지들 */}
          <div className="absolute top-4 left-4 flex items-center gap-1.5 flex-wrap max-w-[80%]">
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/95 text-gray-900 shadow-md">
              {restaurant.category}
            </span>

            {isOldStore && (
              <span className="flex items-center gap-1 text-xs font-extrabold px-2.5 py-1 rounded-full bg-amber-400 text-amber-950 shadow-md">
                <Award className="w-3.5 h-3.5" />
                {restaurant.yearsInBusiness}년차 노포
              </span>
            )}

            {isNewStore && (
              <span className="flex items-center gap-1 text-xs font-extrabold px-2.5 py-1 rounded-full bg-blue-600 text-white shadow-md">
                <Sparkles className="w-3.5 h-3.5" />
                신상 오픈
              </span>
            )}
          </div>

          {/* 우상단 닫기 버튼 */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors shadow-md backdrop-blur-xs"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>

          {/* 사진 하단 우측 거리 뱃지 */}
          <div className="absolute bottom-3 right-4">
            <span className="text-xs font-bold text-white bg-orange-600/90 backdrop-blur-xs px-2.5 py-1 rounded-lg shadow-sm">
              약 {formatDistance(restaurant.distanceMeters)} 거리
            </span>
          </div>
        </div>

        {/* 본문 스크롤 영역 */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* 상호명 & 개업연도 팩트 바 */}
          <div>
            <div className="flex items-start justify-between gap-3">
              <h2 id="detail-title" className="text-xl font-bold text-gray-900 leading-tight">
                {restaurant.name}
              </h2>
            </div>
            
            {/* 공공 인허가 팩트 배너 */}
            <div className="mt-2 flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700">
              <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
              <div>
                <strong>개업일자:</strong> {restaurant.openYear}년 (운영 {restaurant.yearsInBusiness}년차)
                {restaurant.publicTags && restaurant.publicTags.length > 0 && (
                  <span className="ml-1.5 text-emerald-700 font-semibold">
                    • {restaurant.publicTags.join(', ')}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* [핵심] 영업 시간 & 브레이크 타임 상세 카드 */}
          <div className="p-3.5 bg-orange-50/50 border border-orange-200/80 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-orange-600" />
                영업 시간 & 브레이크 타임
              </span>

              {statusInfo && (
                <span
                  className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                    statusInfo.status === 'OPEN'
                      ? 'bg-emerald-600 text-white'
                      : statusInfo.status === 'BREAK'
                      ? 'bg-amber-500 text-white'
                      : 'bg-gray-700 text-gray-100'
                  }`}
                >
                  {statusInfo.label}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 text-xs text-gray-700">
              <div className="bg-white p-2.5 rounded-xl border border-orange-100">
                <div className="text-[10px] text-gray-400 font-semibold">정규 영업시간</div>
                <div className="font-bold text-gray-900 mt-0.5">
                  {schedule ? `${schedule.open} ~ ${schedule.close}` : '매장 문의'}
                </div>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-orange-100">
                <div className="text-[10px] text-gray-400 font-semibold">브레이크 타임</div>
                <div className="font-bold text-amber-700 mt-0.5">
                  {schedule?.breakStart ? `${schedule.breakStart} ~ ${schedule.breakEnd}` : '없음 (상시영업)'}
                </div>
              </div>
            </div>

            {schedule?.lastOrder && (
              <div className="text-[11px] text-gray-500 px-1">
                • <strong>라스트 오더:</strong> {schedule.lastOrder}
              </div>
            )}
          </div>

          {/* 공공데이터 안내 배너 */}
          <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-amber-800">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>방문 전 확인 안내</span>
            </div>
            <p className="text-[11px] text-amber-700 leading-relaxed">
              • 매장 사정에 따라 임시 휴무 또는 브레이크타임이 변동될 수 있으니 유선 확인을 권장합니다.
            </p>
          </div>

          {/* 주소 정보 */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-gray-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-orange-500" />
                주소 정보
              </span>
              <button
                type="button"
                onClick={handleCopyAddress}
                className="text-[11px] text-gray-500 hover:text-gray-800 flex items-center gap-1 font-normal underline"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-green-600" />
                    <span className="text-green-600 font-semibold">복사됨</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>주소 복사</span>
                  </>
                )}
              </button>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 space-y-1 text-xs">
              <div className="text-gray-900 font-medium">
                <span className="text-[10px] text-gray-400 font-normal mr-1.5">[도로명]</span>
                {restaurant.roadAddress}
              </div>
              <div className="text-gray-600">
                <span className="text-[10px] text-gray-400 font-normal mr-1.5">[지번]</span>
                {restaurant.lotAddress}
              </div>
            </div>
          </div>

          {/* 전화번호 */}
          <div className="space-y-1.5">
            <div className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-orange-500" />
              전화번호
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs">
              <span className="font-semibold text-gray-800">{restaurant.tel}</span>
              <a
                href={`tel:${restaurant.tel}`}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors shadow-xs"
              >
                <Phone className="w-3 h-3 text-green-600" />
                전화 걸기
              </a>
            </div>
          </div>

          {/* 대표 메뉴 */}
          <div className="space-y-1.5">
            <div className="text-xs font-bold text-gray-700">
              대표 메뉴
            </div>
            <div className="flex flex-wrap gap-1.5">
              {restaurant.sampleMenu.map((item, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-orange-50 text-orange-800 text-xs font-medium border border-orange-100"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 하단 액션 버튼 */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center gap-2.5">
          <a
            href={kakaoMapSearchUrl}
            onClick={(e) => { e.preventDefault(); openExternal(kakaoMapSearchUrl); }}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-3 bg-yellow-400 hover:bg-yellow-500 active:bg-yellow-600 text-gray-900 rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 shadow-xs transition-colors"
          >
            <span>카카오맵에서 길찾기</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          {onToggleFavorite && (
            <button
              type="button"
              onClick={() => onToggleFavorite(restaurant.id)}
              aria-label="즐겨찾기"
              className="px-4 py-3 rounded-xl border border-rose-200 bg-white text-rose-500 font-bold text-sm"
            >
              {isFavorite ? '♥' : '♡'}
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-3 bg-white border border-gray-200 rounded-xl font-medium text-sm text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
