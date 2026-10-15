'use client';

import React from 'react';
import { List, Map as MapIcon, Dices } from 'lucide-react';

export type ViewMode = 'list' | 'map';

interface BottomNavProps {
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
  count: number;
  onOpenRoulette: () => void;
}

export default function BottomNav({
  viewMode,
  onChangeViewMode,
  count,
  onOpenRoulette,
}: BottomNavProps) {
  return (
    <div className="fixed bottom-4 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none">
      <div className="pointer-events-auto bg-gray-900/95 text-white backdrop-blur-md px-2 py-1.5 rounded-full shadow-2xl border border-white/10 flex items-center gap-1.5">
        {/* 목록 버튼 */}
        <button
          type="button"
          onClick={() => onChangeViewMode('list')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-all ${
            viewMode === 'list'
              ? 'bg-orange-500 text-white shadow-xs'
              : 'text-gray-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <List className="w-3.5 h-3.5" />
          <span>목록 ({count})</span>
        </button>

        {/* [차별화 2] 3초 룰렛 버튼 (강조 효과) */}
        <button
          type="button"
          onClick={onOpenRoulette}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-extrabold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white shadow-md shadow-orange-500/30 active:scale-95 transition-all"
        >
          <Dices className="w-4 h-4 animate-bounce" />
          <span>뭐 먹지?</span>
        </button>

        {/* 지도 버튼 */}
        <button
          type="button"
          onClick={() => onChangeViewMode('map')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-all ${
            viewMode === 'map'
              ? 'bg-orange-500 text-white shadow-xs'
              : 'text-gray-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <MapIcon className="w-3.5 h-3.5" />
          <span>지도</span>
        </button>
      </div>
    </div>
  );
}
