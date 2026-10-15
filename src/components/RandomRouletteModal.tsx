'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, Dices, Sparkles, Award, ArrowRight, Utensils, Coffee, Play, Hand } from 'lucide-react';
import { Restaurant } from '@/types/restaurant';
import { formatDistance } from '@/utils/distance';
import { getRestaurantImage } from '@/utils/imageHelper';

interface RandomRouletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurants: Restaurant[];
  onSelectRestaurant: (restaurant: Restaurant) => void;
}

type Mode = 'food' | 'cafe';
type Phase = 'ready' | 'spinning' | 'stopping' | 'done';

export default function RandomRouletteModal({ isOpen, onClose, restaurants, onSelectRestaurant }: RandomRouletteModalProps) {
  const [mode, setMode] = useState<Mode>('food');
  const [phase, setPhase] = useState<Phase>('ready');
  const [index, setIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const indexRef = useRef(0);

  const pool = useMemo(
    () => restaurants.filter((r) => (mode === 'cafe' ? r.category === '카페/디저트' : r.category !== '카페/디저트')),
    [restaurants, mode]
  );

  const clearTimer = () => { if (timerRef.current) clearTimeout(timerRef.current); timerRef.current = null; };

  const step = () => {
    indexRef.current = (indexRef.current + 1 + Math.floor(Math.random() * 3)) % Math.max(pool.length, 1);
    setIndex(indexRef.current);
  };

  // 시작: 멈춤 버튼을 누를 때까지 계속 빠르게 회전
  const start = () => {
    if (pool.length === 0) return;
    clearTimer();
    setPhase('spinning');
    const loop = () => { step(); timerRef.current = setTimeout(loop, 70); };
    loop();
  };

  // 멈춤: 누른 순간부터 점점 느려지다가 정지 (게임처럼)
  const stop = () => {
    if (phase !== 'spinning') return;
    clearTimer();
    setPhase('stopping');
    let delay = 70;
    const slow = () => {
      step();
      delay *= 1.25;
      if (delay > 450) { setPhase('done'); return; }
      timerRef.current = setTimeout(slow, delay);
    };
    slow();
  };

  useEffect(() => {
    if (!isOpen) { clearTimer(); setPhase('ready'); }
    return clearTimer;
  }, [isOpen]);

  useEffect(() => { clearTimer(); setPhase('ready'); indexRef.current = 0; setIndex(0); }, [mode]);

  // 스페이스바로도 시작/멈춤
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return;
      e.preventDefault();
      if (phase === 'spinning') stop();
      else if (phase === 'ready' || phase === 'done') start();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (!isOpen) return null;

  const current = pool[index % Math.max(pool.length, 1)];
  const isMoving = phase === 'spinning' || phase === 'stopping';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden border border-orange-200" role="dialog" aria-modal="true" aria-labelledby="roulette-title">
        <div className={`px-5 py-4 text-white flex items-center justify-between bg-gradient-to-r ${mode === 'food' ? 'from-orange-500 to-amber-500' : 'from-pink-500 to-rose-400'}`}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Dices className={`w-4 h-4 ${isMoving ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <h2 id="roulette-title" className="text-base font-bold tracking-tight">오늘 뭐 먹지? 룰렛 게임</h2>
              <p className="text-[11px] text-white/80">돌리고, 원하는 순간에 멈춤!</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10" aria-label="닫기"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 text-center">
          {/* 음식 / 디저트·카페 분리 탭 */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-gray-100 rounded-xl mb-4">
            {([['food', '🍚 음식', Utensils], ['cafe', '☕ 디저트·카페', Coffee]] as const).map(([m, label]) => {
              const count = restaurants.filter((r) => (m === 'cafe' ? r.category === '카페/디저트' : r.category !== '카페/디저트')).length;
              return (
                <button key={m} type="button" disabled={isMoving} onClick={() => setMode(m)}
                  className={`py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-60 ${mode === m ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>
                  {label} <span className="text-[10px] text-gray-400">({count})</span>
                </button>
              );
            })}
          </div>

          {pool.length === 0 ? (
            <div className="py-8 text-gray-500">
              <Utensils className="w-10 h-10 mx-auto text-gray-300 mb-2" />
              <p className="text-sm font-semibold">반경 내에 {mode === 'food' ? '음식점' : '카페·디저트'}이 없습니다.</p>
              <p className="text-xs text-gray-400 mt-1">검색 반경을 넓혀서 다시 시도해주세요.</p>
            </div>
          ) : (
            <div>
              <div className="mb-3 text-xs font-bold">
                {phase === 'ready' && <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full">후보 {pool.length}곳 대기 중</span>}
                {phase === 'spinning' && <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full animate-pulse">빙글빙글~ 지금 멈춰!</span>}
                {phase === 'stopping' && <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full">두근두근...</span>}
                {phase === 'done' && <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full inline-flex items-center gap-1"><Sparkles className="w-3.5 h-3.5" />당첨! 🎉</span>}
              </div>

              {current && (
                <div className={`bg-gray-50 border rounded-2xl overflow-hidden p-3 transition-all ${phase === 'done' ? 'border-orange-500 ring-2 ring-orange-200 shadow-md scale-100' : 'border-gray-200 scale-95'}`}>
                  <div className="relative w-full h-36 rounded-xl overflow-hidden bg-gray-200 mb-3">
                    <img src={getRestaurantImage(current.id, current.category, current.imageUrl)} alt={current.name} className={`w-full h-full object-cover ${isMoving ? 'blur-[1px]' : ''}`} />
                    <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{current.category}</div>
                    <div className="absolute bottom-2 right-2 bg-orange-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-md">{formatDistance(current.distanceMeters)}</div>
                  </div>
                  <h3 className="text-lg font-extrabold text-gray-900 truncate">{current.name}</h3>
                  {phase === 'done' && current.yearsInBusiness && (
                    <div className="mt-1 flex items-center justify-center gap-1 text-xs text-amber-700 font-semibold"><Award className="w-3.5 h-3.5" /><span>{current.yearsInBusiness}년차</span></div>
                  )}
                  <div className="mt-2 text-xs text-gray-600 bg-white p-2 rounded-lg border border-gray-100 truncate">
                    <span className="font-semibold text-gray-800">대표 메뉴:</span> {current.sampleMenu.join(', ')}
                  </div>
                </div>
              )}

              <div className="mt-5 space-y-2">
                {phase === 'spinning' ? (
                  <button type="button" onClick={stop} className="w-full py-4 bg-red-500 hover:bg-red-600 active:scale-95 text-white rounded-2xl font-extrabold text-base flex items-center justify-center gap-2 shadow-lg shadow-red-500/30 animate-pulse transition-transform">
                    <Hand className="w-5 h-5" /> 멈춰! (Space)
                  </button>
                ) : (
                  <button type="button" onClick={start} disabled={phase === 'stopping'} className={`w-full py-4 text-white rounded-2xl font-extrabold text-base flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform disabled:opacity-50 ${mode === 'food' ? 'bg-orange-500 hover:bg-orange-600' : 'bg-pink-500 hover:bg-pink-600'}`}>
                    <Play className="w-5 h-5" /> {phase === 'done' ? '다시 돌리기' : '룰렛 돌리기!'}
                  </button>
                )}
                {phase === 'done' && current && (
                  <button type="button" onClick={() => { onSelectRestaurant(current); onClose(); }} className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5">
                    <span>여기 결정! 상세보기</span><ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}