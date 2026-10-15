'use client';

import React from 'react';
import { MapPin, Navigation, ChevronDown, UtensilsCrossed, Compass } from 'lucide-react';
import { RegionLocation } from '@/types/restaurant';

interface HeaderProps {
  currentLocation: RegionLocation;
  isUsingGPS: boolean;
  onOpenLocationModal: () => void;
  onRequestGPS: () => void;
  isLoadingGPS: boolean;
}

export default function Header({
  currentLocation,
  isUsingGPS,
  onOpenLocationModal,
  onRequestGPS,
  isLoadingGPS,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-xs">
      <div className="max-w-md mx-auto px-4 py-3">
        {/* 상단 타이틀 & 내 주변 찾기 버튼 */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-xs">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-bold text-base text-gray-900 tracking-tight">
                  골목맛집
                </h1>
                <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-sm">
                  LIVE
                </span>
              </div>
              <p className="text-[11px] text-gray-500">
                우리 동네 공공데이터 맛집 탐색
              </p>
            </div>
          </div>

          {/* 내 주변 찾기 GPS 버튼 */}
          <button
            type="button"
            onClick={onRequestGPS}
            disabled={isLoadingGPS}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all active:scale-95 shadow-xs ${
              isUsingGPS
                ? 'bg-blue-600 border-blue-600 text-white shadow-blue-500/20'
                : 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700'
            }`}
            title="현재 내 위치 기준 음식점 찾기"
          >
            <Navigation
              className={`w-3.5 h-3.5 ${
                isLoadingGPS ? 'animate-spin text-blue-500' : isUsingGPS ? 'text-white' : 'text-blue-600'
              }`}
            />
            <span>
              {isLoadingGPS ? '위치 확인 중...' : isUsingGPS ? '내 주변 찾는 중' : '내 주변 찾기'}
            </span>
          </button>
        </div>

        {/* 현재 기준 위치 바 */}
        <div className="mt-2.5 flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100">
          <button
            type="button"
            onClick={onOpenLocationModal}
            className="flex items-center gap-1.5 text-left text-xs font-semibold text-gray-800 hover:text-blue-600 transition-colors flex-1 min-w-0 pr-2"
          >
            <MapPin className={`w-3.5 h-3.5 shrink-0 ${isUsingGPS ? 'text-blue-600 animate-bounce' : 'text-orange-500'}`} />
            <span className="truncate">
              {isUsingGPS
                ? `현재 내 위치 (GPS 탐색 중: ${currentLocation.neighborhood})`
                : `${currentLocation.city} ${currentLocation.district} ${currentLocation.neighborhood}`}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          </button>

          <button
            type="button"
            onClick={onOpenLocationModal}
            className="text-[11px] text-blue-600 font-semibold hover:underline shrink-0 pl-2 border-l border-gray-200"
          >
            지역 직접 선택
          </button>
        </div>
      </div>
    </header>
  );
}
