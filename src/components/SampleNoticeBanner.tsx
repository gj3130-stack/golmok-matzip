'use client';

import React, { useState } from 'react';
import { Database, Map, CheckCircle2, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

interface NoticeBannerProps {
  dataSource: 'supabase' | 'local_dataset';
  isKakaoConnected?: boolean;
}

export default function SampleNoticeBanner({
  dataSource,
  isKakaoConnected = true,
}: NoticeBannerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const isSupabaseLive = dataSource === 'supabase';

  return (
    <div className={`border-b text-xs px-4 py-2.5 transition-colors ${
      isSupabaseLive
        ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
        : 'bg-blue-50 border-blue-200 text-blue-950'
    }`}>
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-medium">
            {isSupabaseLive ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <Database className="w-4 h-4 text-blue-600 shrink-0" />
            )}
            <span>
              {isSupabaseLive
                ? 'Supabase 실시간 데이터베이스 연동 활성화'
                : '카카오 지도 SDK & 데이터 파이프라인 연동 중'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-600 hover:text-gray-900 p-1 flex items-center gap-0.5 text-[11px] underline shrink-0"
            aria-label="상태 상세 보기"
          >
            {isExpanded ? (
              <>
                <span>접기</span>
                <ChevronUp className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                <span>상태 보기</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>

        {isExpanded && (
          <div className="mt-2.5 pt-2 border-t border-gray-200 text-gray-700 space-y-1.5 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-gray-900">• 카카오 지도:</span>
              <span className="text-emerald-700 font-medium">JavaScript 키 적용 완료</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-gray-900">• Supabase DB:</span>
              <span>
                {isSupabaseLive ? (
                  <strong className="text-emerald-700">라이브 테이블(restaurants) 연결 완료</strong>
                ) : (
                  <span className="text-blue-700">연결 대기 중 (SQL 스키마 적용 시 즉시 활성화)</span>
                )}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-gray-900">• 공공데이터 인증키:</span>
              <span className="text-gray-700">등록 완료 (API 세부 명세 접수 시 수집 시작)</span>
            </div>
            <p className="text-[10px] text-gray-500 pt-1">
              * 평점/리뷰/실시간 영업시간은 공공데이터 표준 명세에 포함되지 않는 항목으로 안전하게 기본 표기됩니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
