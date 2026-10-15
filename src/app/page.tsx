'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { AlertCircle, MapPin, X } from 'lucide-react';
import Header from '@/components/Header';
import SampleNoticeBanner from '@/components/SampleNoticeBanner';
import SearchAndFilter from '@/components/SearchAndFilter';
import RestaurantList from '@/components/RestaurantList';
import MapView from '@/components/MapView';
import BottomNav, { ViewMode } from '@/components/BottomNav';
import LocationModal from '@/components/LocationModal';
import RestaurantDetailModal from '@/components/RestaurantDetailModal';
import RandomRouletteModal from '@/components/RandomRouletteModal';
import { SAMPLE_RESTAURANTS } from '@/data/sampleRestaurants';
import { DEFAULT_LOCATION } from '@/data/locations';
import { CategoryType, DistanceRadius, RegionLocation, Restaurant, ThemeFilterType } from '@/types/restaurant';
import { calculateDistance } from '@/utils/distance';

export default function Home() {
  // 데이터 및 소스 상태
  const [restaurantsList, setRestaurantsList] = useState<Restaurant[]>(SAMPLE_RESTAURANTS);
  const [dataSource, setDataSource] = useState<'supabase' | 'local_dataset'>('local_dataset');
  const [isLoadingData, setIsLoadingData] = useState(false);

  // 위치 상태 (주의: 사용자의 위치 정보는 프론트엔드 상태로만 관리되며, 서버나 DB에 일체 저장되지 않습니다)
  const [currentLocation, setCurrentLocation] = useState<RegionLocation>(DEFAULT_LOCATION);
  const [isUsingGPS, setIsUsingGPS] = useState(false);
  const [isLoadingGPS, setIsLoadingGPS] = useState(false);
  const [permissionDeniedReason, setPermissionDeniedReason] = useState<string | null>(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // 검색 및 필터 상태
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('전체');
  const [selectedTheme, setSelectedTheme] = useState<ThemeFilterType>('전체');
  const [selectedRadius, setSelectedRadius] = useState<DistanceRadius>(1000); // 1km 기본
  const [onlyOpenNow, setOnlyOpenNow] = useState(false); // 영업중만 보기 토글

  // 뷰 모드 및 모달 상태
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [isRouletteOpen, setIsRouletteOpen] = useState(false);

  // Step 6: radius / category / name search are done in Supabase (PostGIS). Map and list share this result.
  const [debouncedQuery, setDebouncedQuery] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery.trim()), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const fetchRestaurants = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const params = new URLSearchParams({
        lat: String(currentLocation.lat),
        lng: String(currentLocation.lng),
        radius: String(selectedRadius),
        limit: '200',
      });
      if (selectedCategory !== '전체') params.set('category', selectedCategory);
      if (debouncedQuery) params.set('q', debouncedQuery);
      const res = await fetch('/api/restaurants?' + params.toString());
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) {
          setRestaurantsList(json.data);
          setDataSource(json.source || 'local_dataset');
        }
      }
    } catch (e) {
      console.warn('API Fetch fallback to default dataset:', e);
    } finally {
      setIsLoadingData(false);
    }
  }, [currentLocation.lat, currentLocation.lng, selectedRadius, selectedCategory, debouncedQuery]);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);


  // 브라우저 위치 권한 요청 및 '내 주변 찾기' 핸들러
  const handleRequestGPS = useCallback(() => {
    // 1. 브라우저 지원 여부 확인
    if (!navigator.geolocation) {
      const msg = '사용 중인 브라우저가 위치 정보(Geolocation)를 지원하지 않습니다. 아래에서 원하시는 동네를 직접 선택해 주세요.';
      setPermissionDeniedReason(msg);
      setIsLocationModalOpen(true);
      return;
    }

    setIsLoadingGPS(true);
    setPermissionDeniedReason(null);

    // 2. 권한 요청 및 위치 획득
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        // 사용자 현재 위치는 DB에 전송하지 않고 오직 클라이언트 상태로만 유지
        setCurrentLocation({
          id: 'gps-current',
          city: '현재 위치',
          district: 'GPS 탐색',
          neighborhood: '내 주변',
          lat: latitude,
          lng: longitude,
        });
        setIsUsingGPS(true);
        setIsLoadingGPS(false);
        setPermissionDeniedReason(null);
      },
      (error) => {
        setIsLoadingGPS(false);
        setIsUsingGPS(false);

        let errorMsg = '위치 정보를 가져올 수 없습니다.';
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = '브라우저 위치 권한이 거부되었습니다. 아래 목록에서 원하시는 동네를 직접 선택해 주세요.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMsg = '현재 디바이스의 위치 정보를 확인할 수 없습니다. 지역을 직접 선택해 주세요.';
        } else if (error.code === error.TIMEOUT) {
          errorMsg = '위치 확인 응답 시간이 초과되었습니다. 다시 시도하거나 직접 동네를 선택해 주세요.';
        }

        setPermissionDeniedReason(errorMsg);
        setIsLocationModalOpen(true);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  // 수동 지역 선택 시 핸들러
  const handleSelectLocation = useCallback((region: RegionLocation) => {
    setCurrentLocation(region);
    setIsUsingGPS(false);
    setPermissionDeniedReason(null);
  }, []);

  // 필터 초기화
  const handleResetFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategory('전체');
    setSelectedTheme('전체');
    setSelectedRadius(3000);
    setOnlyOpenNow(false);
  }, []);

  // Server already filtered by radius/category/name and sorted by straight-line distance.
  // Only client-side theme / open-now filters remain (sample fallback is filtered locally too).
  const filteredRestaurants = useMemo(() => {
    const isSample = dataSource !== 'supabase';
    const rows = restaurantsList.map((item) =>
      item.distanceMeters != null && !isSample
        ? item
        : { ...item, distanceMeters: calculateDistance(currentLocation.lat, currentLocation.lng, item.lat, item.lng) }
    );
    if (isSample) rows.sort((a, b) => (a.distanceMeters ?? 0) - (b.distanceMeters ?? 0));
    return rows.filter((item) => {
      if (isSample) {
        if ((item.distanceMeters ?? 0) > selectedRadius) return false;
        if (selectedCategory !== '전체' && item.category !== selectedCategory) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.trim().toLowerCase();
          if (!item.name.toLowerCase().includes(q) && !item.category.toLowerCase().includes(q) && !item.sampleMenu.some((m) => m.toLowerCase().includes(q))) return false;
        }
      }
      if (selectedTheme === '노포' && (item.yearsInBusiness ?? 0) < 10) return false;
      if (selectedTheme === '신상' && (item.openYear ?? 0) < 2024) return false;
      if (selectedTheme === '위생안심') {
        const ok = item.publicTags?.some((t) => t.includes('안심') || t.includes('위생') || t.includes('착한가격'));
        if (!ok) return false;
      }
      if (onlyOpenNow && item.statusInfo?.status !== 'OPEN') return false;
      return true;
    });
  }, [restaurantsList, dataSource, currentLocation, selectedRadius, selectedTheme, onlyOpenNow, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-100/70 sm:py-6 flex justify-center text-gray-900">
      {/* 모바일 우선 메인 프레임 */}
      <main className="w-full max-w-md bg-white min-h-screen sm:min-h-[92vh] sm:rounded-3xl shadow-xl flex flex-col relative border border-gray-200/60 overflow-x-hidden">
        {/* 상단 연동 상태 배너 */}
        <SampleNoticeBanner dataSource={dataSource} />

        {/* 상단 헤더 (내 주변 찾기 버튼 포함) */}
        <Header
          currentLocation={currentLocation}
          isUsingGPS={isUsingGPS}
          isLoadingGPS={isLoadingGPS}
          onOpenLocationModal={() => setIsLocationModalOpen(true)}
          onRequestGPS={handleRequestGPS}
        />

        {/* 위치 권한 거부/미사용 시 상단 안내 배너 */}
        {permissionDeniedReason && (
          <div className="mx-4 mt-3 p-3 rounded-xl bg-orange-50 border border-orange-200 text-xs text-orange-900 flex items-start justify-between gap-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-orange-800">위치 권한 미허용 안내</p>
                <p className="text-[11px] text-orange-700 mt-0.5">{permissionDeniedReason}</p>
                <button
                  type="button"
                  onClick={() => setIsLocationModalOpen(true)}
                  className="mt-1.5 inline-flex items-center gap-1 font-bold text-blue-700 underline text-[11px]"
                >
                  <MapPin className="w-3 h-3" />
                  원하는 동네 직접 선택하기
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setPermissionDeniedReason(null)}
              className="text-orange-400 hover:text-orange-600 p-0.5"
              aria-label="안내 닫기"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 본문 영역 */}
        <div className="flex-1 p-4 space-y-3.5">
          {/* 검색 및 필터 바 (반경 500m/1km/3km, 테마 칩, 영업중 토글) */}
          <SearchAndFilter
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            selectedTheme={selectedTheme}
            onSelectTheme={setSelectedTheme}
            selectedRadius={selectedRadius}
            onSelectRadius={setSelectedRadius}
            onlyOpenNow={onlyOpenNow}
            onToggleOnlyOpenNow={() => setOnlyOpenNow(!onlyOpenNow)}
            totalFilteredCount={filteredRestaurants.length}
          />

          {/* 목록 뷰 vs 지도 뷰 */}
          {viewMode === 'list' ? (
            <div className="flex flex-col gap-3">
              <MapView
                compact
                currentLocation={currentLocation}
                restaurants={filteredRestaurants}
                selectedRadius={selectedRadius}
                onSelectRestaurant={setSelectedRestaurant}
              />
              <RestaurantList
                restaurants={filteredRestaurants}
                onSelectRestaurant={setSelectedRestaurant}
                onResetFilters={handleResetFilters}
              />
            </div>
          ) : (
            <MapView
              currentLocation={currentLocation}
              restaurants={filteredRestaurants}
              selectedRadius={selectedRadius}
              onSelectRestaurant={setSelectedRestaurant}
            />
          )}
        </div>

        {/* 하단 플로팅 네비게이션 (목록 / 뭐 먹지? 룰렛 / 지도) */}
        <BottomNav
          viewMode={viewMode}
          onChangeViewMode={setViewMode}
          count={filteredRestaurants.length}
          onOpenRoulette={() => setIsRouletteOpen(true)}
        />

        {/* 오늘 뭐 먹지? 3초 룰렛 모달 */}
        <RandomRouletteModal
          isOpen={isRouletteOpen}
          onClose={() => setIsRouletteOpen(false)}
          restaurants={filteredRestaurants}
          onSelectRestaurant={setSelectedRestaurant}
        />

        {/* 위치 선택 모달 (권한 거부 또는 수동 변경) */}
        <LocationModal
          isOpen={isLocationModalOpen}
          onClose={() => setIsLocationModalOpen(false)}
          currentLocation={currentLocation}
          onSelectLocation={handleSelectLocation}
          permissionDeniedReason={permissionDeniedReason}
        />

        {/* 상세 보기 모달 */}
        <RestaurantDetailModal
          restaurant={selectedRestaurant}
          onClose={() => setSelectedRestaurant(null)}
        />
      </main>
    </div>
  );
}
