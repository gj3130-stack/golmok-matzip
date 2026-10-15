'use client';

import React from 'react';
import { Search, X, SlidersHorizontal, Award, Sparkles, ShieldCheck } from 'lucide-react';
import { CategoryType, DistanceRadius, ThemeFilterType } from '@/types/restaurant';

const CATEGORIES: CategoryType[] = [
  '전체',
  '한식',
  '중식',
  '일식/회',
  '양식',
  '카페/디저트',
  '분식',
  '기타',
];

const THEME_FILTERS: { label: string; value: ThemeFilterType; icon: React.ReactNode }[] = [
  { label: '전체 보기', value: '전체', icon: null },
  { label: '🏆 10년+ 노포', value: '노포', icon: <Award className="w-3.5 h-3.5 text-amber-500" /> },
  { label: '✨ 신상 오픈', value: '신상', icon: <Sparkles className="w-3.5 h-3.5 text-blue-500" /> },
  { label: '🛡️ 위생/안심', value: '위생안심', icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> },
];

const RADII: { label: string; value: DistanceRadius }[] = [
  { label: '500m', value: 500 },
  { label: '1km', value: 1000 },
  { label: '3km', value: 3000 },
];

interface SearchAndFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: CategoryType;
  onSelectCategory: (cat: CategoryType) => void;
  selectedTheme: ThemeFilterType;
  onSelectTheme: (theme: ThemeFilterType) => void;
  selectedRadius: DistanceRadius;
  onSelectRadius: (radius: DistanceRadius) => void;
  onlyOpenNow: boolean;
  onToggleOnlyOpenNow: () => void;
  totalFilteredCount: number;
}

export default function SearchAndFilter({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  selectedTheme,
  onSelectTheme,
  selectedRadius,
  onSelectRadius,
  onlyOpenNow,
  onToggleOnlyOpenNow,
  totalFilteredCount,
}: SearchAndFilterProps) {
  return (
    <div className="space-y-2.5">
      {/* 검색 입력창 */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="음식점 또는 대표 메뉴 검색 (예: 순대국, 텐동)"
          className="w-full pl-10 pr-9 py-2.5 bg-gray-50 hover:bg-gray-100/80 focus:bg-white border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
            aria-label="검색어 지우기"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 테마 퀵 필터 (노포 / 신상 / 위생안심) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none -mx-4 px-4">
        {THEME_FILTERS.map((theme) => {
          const isSelected = selectedTheme === theme.value;
          return (
            <button
              key={theme.value}
              type="button"
              onClick={() => onSelectTheme(theme.value)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all border ${
                isSelected
                  ? 'bg-gray-900 border-gray-900 text-white shadow-xs scale-[1.02]'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {theme.icon}
              <span>{theme.label}</span>
            </button>
          );
        })}
      </div>

      {/* 반경 선택 칩 & 영업중 토글 스위치 & 필터 결과 카운트 */}
      <div className="flex items-center justify-between text-xs pt-1 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          {/* 반경 칩 */}
          <div className="inline-flex rounded-lg bg-gray-100 p-0.5">
            {RADII.map((r) => {
              const active = selectedRadius === r.value;
              return (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => onSelectRadius(r.value)}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                    active
                      ? 'bg-white text-orange-600 shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {r.label}
                </button>
              );
            })}
          </div>

          {/* [영업중만 보기] 토글 버튼 */}
          <button
            type="button"
            onClick={onToggleOnlyOpenNow}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold border transition-all ${
              onlyOpenNow
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${onlyOpenNow ? 'bg-white' : 'bg-emerald-500'}`} />
            <span>영업중만</span>
          </button>
        </div>

        <div className="text-gray-500 font-medium">
          검색 <span className="text-orange-600 font-bold">{totalFilteredCount}</span>곳
        </div>
      </div>

      {/* 업종 카테고리 가로 스크롤 탭 */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => onSelectCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap shrink-0 transition-colors border ${
                isSelected
                  ? 'bg-orange-500 border-orange-500 text-white shadow-xs'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
}
