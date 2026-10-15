'use client';

import React from 'react';
import { X, MapPin, Check } from 'lucide-react';
import { RegionLocation } from '@/types/restaurant';
import { SAMPLE_REGIONS } from '@/data/locations';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: RegionLocation;
  onSelectLocation: (region: RegionLocation) => void;
  permissionDeniedReason?: string | null;
}

export default function LocationModal({
  isOpen,
  onClose,
  currentLocation,
  onSelectLocation,
  permissionDeniedReason,
}: LocationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4">
      <div 
        className="w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden animate-in slide-in-from-bottom duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="location-modal-title"
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h2 id="location-modal-title" className="text-base font-bold text-gray-900">
                지역 직접 선택
              </h2>
              <p className="text-xs text-gray-500">
                원하는 동네를 선택하면 해당 기준 위치로 변경됩니다.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 권한 안내 (거부된 경우) */}
        {permissionDeniedReason && (
          <div className="mx-5 mt-4 p-3 rounded-lg bg-orange-50 border border-orange-200 text-xs text-orange-800">
            <span className="font-semibold">위치 확인 불가 안내:</span> {permissionDeniedReason}
            <div className="mt-1 text-[11px] text-orange-600">
              브라우저 위치 권한을 허용하지 않으셔도 아래 목록에서 동네를 선택해 서비스를 이용하실 수 있습니다.
            </div>
          </div>
        )}

        {/* 지역 목록 */}
        <div className="p-4 max-h-80 overflow-y-auto space-y-2">
          {SAMPLE_REGIONS.map((region) => {
            const isSelected = region.id === currentLocation.id;
            return (
              <button
                key={region.id}
                type="button"
                onClick={() => {
                  onSelectLocation(region);
                  onClose();
                }}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/50 text-blue-900'
                    : 'border-gray-100 bg-gray-50/50 hover:bg-gray-100 text-gray-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      isSelected ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  />
                  <div>
                    <div className="font-semibold text-sm">
                      {region.neighborhood}
                    </div>
                    <div className="text-xs text-gray-500">
                      {region.city} {region.district}
                    </div>
                  </div>
                </div>
                {isSelected && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600">
                    <Check className="w-4 h-4" />
                    선택됨
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* 하단 닫기 */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
