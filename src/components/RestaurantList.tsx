'use client';

import React from 'react';
import { UtensilsCrossed, RefreshCw } from 'lucide-react';
import { Restaurant } from '@/types/restaurant';
import RestaurantCard from './RestaurantCard';

interface RestaurantListProps {
  restaurants: Restaurant[];
  onSelectRestaurant: (restaurant: Restaurant) => void;
  isFavorite?: (id: string) => boolean;
  onToggleFavorite?: (id: string) => void;
  onResetFilters: () => void;
}

export default function RestaurantList({
  restaurants,
  onSelectRestaurant,
  isFavorite,
  onToggleFavorite,
  onResetFilters,
}: RestaurantListProps) {
  if (restaurants.length === 0) {
    return (
      <div className="py-12 px-4 text-center bg-gray-50/70 rounded-2xl border border-dashed border-gray-200">
        <div className="w-12 h-12 mx-auto rounded-full bg-orange-100/60 text-orange-500 flex items-center justify-center mb-3">
          <UtensilsCrossed className="w-6 h-6" />
        </div>
        <h4 className="text-base font-bold text-gray-800">
          조건에 맞는 음식점이 없습니다
        </h4>
        <p className="mt-1 text-xs text-gray-500 max-w-xs mx-auto">
          검색 반경을 넓히거나 다른 업종으로 필터를 변경해 보세요.
        </p>
        <button
          type="button"
          onClick={onResetFilters}
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-xs transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          필터 초기화
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-20">
      {restaurants.map((restaurant) => (
        <RestaurantCard
          key={restaurant.id}
          restaurant={restaurant}
          onSelect={onSelectRestaurant}
          isFavorite={isFavorite?.(restaurant.id)}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
}
