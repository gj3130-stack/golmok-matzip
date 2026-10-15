'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Info, ExternalLink, Compass, AlertCircle, RefreshCw } from 'lucide-react';
import { Restaurant, RegionLocation, DistanceRadius } from '@/types/restaurant';
import { formatDistance } from '@/utils/distance';
import { getRestaurantImage } from '@/utils/imageHelper';

interface MapViewProps {
  currentLocation: RegionLocation;
  restaurants: Restaurant[];
  selectedRadius: DistanceRadius;
  onSelectRestaurant: (restaurant: Restaurant) => void;
  compact?: boolean;
}

export default function MapView({
  currentLocation,
  restaurants,
  selectedRadius,
  onSelectRestaurant,
  compact = false,
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const circleRef = useRef<any>(null);
  const centerMarkerRef = useRef<any>(null);

  const [activeRestaurant, setActiveRestaurant] = useState<Restaurant | null>(null);
  const [isKakaoLoaded, setIsKakaoLoaded] = useState(false);
  const [kakaoError, setKakaoError] = useState<string | null>(null);

  const kakaoAppKey = process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY || '012ae8b5c31352dc2d4e14a3814d5e83';

  // 카카오 지도 SDK 스크립트 동적 로드
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (window.kakao && window.kakao.maps) {
      setIsKakaoLoaded(true);
      return;
    }

    const scriptId = 'kakao-map-sdk';
    const existingScript = document.getElementById(scriptId);

    if (existingScript) {
      existingScript.addEventListener('load', () => setIsKakaoLoaded(true));
      return;
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoAppKey}&autoload=false&libraries=services,clusterer`;
    script.async = true;

    script.onload = () => {
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(() => {
          setIsKakaoLoaded(true);
        });
      }
    };

    script.onerror = () => {
      setKakaoError(
        '카카오 지도 스크립트 로드에 실패했습니다. Kakao Developers 콘솔의 [플랫폼 > Web]에 현재 도메인(예: http://localhost:3000)이 등록되어 있는지 확인해주세요.'
      );
    };

    document.head.appendChild(script);
  }, [kakaoAppKey]);

  // 카카오 지도 초기화 및 마커 렌더링
  useEffect(() => {
    if (!isKakaoLoaded || !mapContainerRef.current || !window.kakao?.maps) return;

    const kakao = window.kakao;

    // 1. 지도 인스턴스 생성 또는 중심 이동
    const centerLatLng = new kakao.maps.LatLng(currentLocation.lat, currentLocation.lng);

    if (!mapInstanceRef.current) {
      const options = {
        center: centerLatLng,
        level: selectedRadius <= 500 ? 3 : selectedRadius <= 1000 ? 4 : 5,
      };
      mapInstanceRef.current = new kakao.maps.Map(mapContainerRef.current, options);
    } else {
      mapInstanceRef.current.setCenter(centerLatLng);
      const level = selectedRadius <= 500 ? 3 : selectedRadius <= 1000 ? 4 : 5;
      mapInstanceRef.current.setLevel(level);
    }

    const map = mapInstanceRef.current;

    // 2. 중심 내 위치 커스텀 오버레이 업데이트
    if (centerMarkerRef.current) {
      centerMarkerRef.current.setMap(null);
    }
    
    // 파란색 펄스 내 위치 커스텀 오버레이
    const overlayContent = document.createElement('div');
    overlayContent.className = 'relative flex flex-col items-center pointer-events-none -translate-x-1/2 -translate-y-1/2';
    overlayContent.innerHTML = `
      <div class="relative flex items-center justify-center">
        <span class="absolute w-8 h-8 rounded-full bg-blue-500/30 animate-ping"></span>
        <span class="relative w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-lg"></span>
      </div>
      <div class="mt-1 px-2 py-0.5 bg-blue-900/90 text-white text-[10px] font-bold rounded-full shadow-md whitespace-nowrap border border-blue-400">
        📍 내 위치 (${currentLocation.neighborhood})
      </div>
    `;

    const centerOverlay = new kakao.maps.CustomOverlay({
      position: centerLatLng,
      content: overlayContent,
      yAnchor: 0.5,
      zIndex: 25,
    });
    centerOverlay.setMap(map);
    centerMarkerRef.current = centerOverlay;

    // 3. 반경 원 그리기
    if (circleRef.current) {
      circleRef.current.setMap(null);
    }
    const circle = new kakao.maps.Circle({
      center: centerLatLng,
      radius: selectedRadius,
      strokeWeight: 2,
      strokeColor: '#f97316',
      strokeOpacity: 0.8,
      strokeStyle: 'dashed',
      fillColor: '#fb923c',
      fillOpacity: 0.12,
    });
    circle.setMap(map);
    circleRef.current = circle;

    // 4. 음식점 마커들 갱신
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    restaurants.forEach((restaurant) => {
      const markerPosition = new kakao.maps.LatLng(restaurant.lat, restaurant.lng);
      const marker = new kakao.maps.Marker({
        position: markerPosition,
        map: map,
        title: restaurant.name,
      });

      kakao.maps.event.addListener(marker, 'click', () => {
        setActiveRestaurant(restaurant);
      });

      markersRef.current.push(marker);
    });
  }, [isKakaoLoaded, currentLocation, restaurants, selectedRadius]);

  // fallback 시각화용 상대 좌표 계산 (카카오 로드 대기 또는 에러 시)
  const maxRangeMeters = Math.max(selectedRadius, 1000);
  const latSpan = (maxRangeMeters * 1.3) / 111000;
  const lngSpan = (maxRangeMeters * 1.3) / 88800;

  return (
    <div className={(compact ? "relative w-full h-72 sm:h-80 " : "relative w-full h-[calc(100vh-250px)] min-h-[480px] ") + "bg-slate-100 rounded-2xl overflow-hidden border border-gray-200 shadow-inner flex flex-col"}>
      {/* 상단 연동 상태 바 */}
      <div className="z-10 bg-white/95 backdrop-blur-xs px-3 py-2 border-b border-gray-200 flex items-center justify-between text-xs text-gray-700">
        <div className="flex items-center gap-1.5 font-medium truncate">
          <div className={`w-2 h-2 rounded-full ${isKakaoLoaded ? 'bg-green-500' : 'bg-amber-400 animate-pulse'}`} />
          <span className="truncate">
            {isKakaoLoaded
              ? `카카오 지도 연동 활성화 (${restaurants.length}개 매장 표시)`
              : '카카오 지도 SDK 로딩 중...'}
          </span>
        </div>
        <span className="text-[10px] bg-orange-50 text-orange-700 border border-orange-200 px-2 py-0.5 rounded-full font-bold shrink-0">
          반경 {selectedRadius < 1000 ? `${selectedRadius}m` : `${selectedRadius / 1000}km`}
        </span>
      </div>

      {/* 카카오 지도 뷰포트 컨테이너 */}
      <div
        ref={mapContainerRef}
        id="kakao-map-container"
        className="relative flex-1 w-full h-full bg-[#f4f3ef] overflow-hidden"
      >
        {/* 카카오 SDK 미로드 또는 에러 시 표시되는 인터랙티브 폴백 맵 */}
        {!isKakaoLoaded && (
          <div className="absolute inset-0 z-0">
            {/* 격자 배경 */}
            <div 
              className="absolute inset-0 opacity-40 pointer-events-none"
              style={{
                backgroundImage: `radial-gradient(#cbd5e1 1.5px, transparent 1.5px), linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)`,
                backgroundSize: '24px 24px, 72px 72px, 72px 72px'
              }}
            />

            {/* 반경 가이드 동심원 */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-64 rounded-full border border-orange-400/40 bg-orange-400/5 animate-pulse" />
              <div className="absolute w-44 h-44 rounded-full border border-dashed border-gray-300" />
            </div>

            {/* 중심 위치 */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center pointer-events-none">
              <div className="w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-md" />
              <span className="mt-1 text-[10px] font-bold text-blue-900 bg-white/95 px-2 py-0.5 rounded-full shadow-xs border border-blue-200">
                기준: {currentLocation.neighborhood}
              </span>
            </div>

            {/* 음식점 핀들 */}
            {restaurants.map((item) => {
              const dLat = item.lat - currentLocation.lat;
              const dLng = item.lng - currentLocation.lng;
              const leftPct = 50 + (dLng / lngSpan) * 40;
              const topPct = 50 - (dLat / latSpan) * 40;
              const clampedLeft = Math.max(8, Math.min(92, leftPct));
              const clampedTop = Math.max(10, Math.min(88, topPct));
              const isSelected = activeRestaurant?.id === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveRestaurant(isSelected ? null : item)}
                  style={{ left: `${clampedLeft}%`, top: `${clampedTop}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-full z-15 transition-all transform hover:scale-115 active:scale-95 focus:outline-hidden ${
                    isSelected ? 'z-30 scale-120' : ''
                  }`}
                  title={`${item.name} (${item.category})`}
                >
                  <div
                    className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full shadow-md text-[10px] font-semibold border ${
                      isSelected
                        ? 'bg-orange-600 border-white text-white ring-2 ring-orange-300'
                        : 'bg-white border-orange-200 text-gray-800 hover:border-orange-400'
                    }`}
                  >
                    <MapPin className={`w-3 h-3 ${isSelected ? 'text-white' : 'text-orange-500'}`} />
                    <span className="max-w-[70px] truncate">{item.name}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* 에러 안내 오버레이 (도메인 미등록 등) */}
        {kakaoError && (
          <div className="absolute top-3 left-3 right-3 z-30 p-3 bg-amber-50/95 border border-amber-300 rounded-xl text-xs text-amber-900 shadow-md">
            <div className="flex items-center gap-1.5 font-bold text-amber-800">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>카카오 개발자 플랫폼 도메인 설정 안내</span>
            </div>
            <p className="mt-1 text-[11px] text-amber-700 leading-relaxed">
              카카오 지도 API 키는 정상 등록되었으며, 실제 지도 타일을 로드하려면 Kakao Developers 콘솔의 <strong>[내 애플리케이션 &gt; 앱 설정 &gt; 플랫폼 &gt; Web]</strong>에 <code>현재 사이트 주소</code>를 등록해 주시면 바로 작동합니다.
            </p>
          </div>
        )}
      </div>

      {/* 선택된 음식점의 플로팅 카드 */}
      {activeRestaurant ? (
        <div className="absolute bottom-3 left-3 right-3 z-30 bg-white rounded-2xl p-3 shadow-xl border border-gray-200 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center gap-3">
            {/* 좌측 썸네일 */}
            <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-100">
              <img
                src={getRestaurantImage(activeRestaurant.id, activeRestaurant.category, activeRestaurant.imageUrl)}
                alt={activeRestaurant.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>

            {/* 정보 영역 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-sm font-bold text-gray-900 truncate">
                    {activeRestaurant.name}
                  </span>
                  {activeRestaurant.statusInfo && (
                    <span
                      className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-sm shrink-0 ${
                        activeRestaurant.statusInfo.status === 'OPEN'
                          ? 'bg-emerald-100 text-emerald-800'
                          : activeRestaurant.statusInfo.status === 'BREAK'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {activeRestaurant.statusInfo.label}
                    </span>
                  )}
                  <span className="text-[10px] text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded-sm shrink-0">
                    {activeRestaurant.category}
                  </span>
                </div>
                <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md shrink-0">
                  {formatDistance(activeRestaurant.distanceMeters)}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 truncate mt-0.5">
                {activeRestaurant.roadAddress}
              </p>
              <div className="text-[10px] text-gray-400 mt-0.5 truncate">
                대표: {activeRestaurant.sampleMenu.join(', ')}
              </div>
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between">
            <span className="text-[11px] text-gray-400">
              {activeRestaurant.tel}
            </span>
            <button
              type="button"
              onClick={() => onSelectRestaurant(activeRestaurant)}
              className="px-3.5 py-1 bg-orange-500 text-white rounded-lg text-xs font-semibold hover:bg-orange-600 active:bg-orange-700 transition-colors shrink-0"
            >
              상세보기
            </button>
          </div>
        </div>
      ) : (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 bg-black/70 backdrop-blur-xs text-white text-[11px] px-3.5 py-1.5 rounded-full pointer-events-none whitespace-nowrap shadow-md">
          지도의 마커를 클릭하면 매장 정보 확인 및 상세 화면으로 이동할 수 있습니다
        </div>
      )}
    </div>
  );
}
