-- 동네맛zip: restaurants 테이블 (5단계)
-- 주의: 이전 schema.sql의 샘플용 restaurants 테이블은 구조가 달라 삭제 후 새로 만듭니다.
drop table if exists public.restaurants cascade;

create table public.restaurants (
  id              uuid primary key default gen_random_uuid(),
  source          text not null,               -- 데이터 출처 (예: 'kakao_local', 'data_go_kr')
  source_id       text not null,               -- 출처의 원본 ID
  name            text not null,
  road_address    text,
  lot_address     text,
  category        text not null,               -- 앱 업종 (한식/중식/.../카페/디저트/기타)
  category_raw    text,                        -- 출처 원본 업종 문자열
  tel             text,
  lat             double precision not null,
  lng             double precision not null,
  place_url       text,
  business_status text,                        -- 출처가 제공할 때만 저장, 없으면 NULL
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),  -- 갱신일 (재수집 시 갱신)
  constraint restaurants_source_uniq unique (source, source_id)
);

create index restaurants_lat_lng_idx on public.restaurants (lat, lng);
create index restaurants_category_idx on public.restaurants (category);

-- 갱신 시 updated_at 자동 반영
create or replace function public.set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger restaurants_set_updated_at
before update on public.restaurants
for each row execute function public.set_updated_at();

-- RLS: 누구나 읽기만 가능, 쓰기 정책은 만들지 않음
-- (서버의 service_role 키만 RLS를 우회해 쓰기 가능)
alter table public.restaurants enable row level security;

create policy "restaurants_public_read"
  on public.restaurants for select
  to anon, authenticated
  using (true);

revoke insert, update, delete on public.restaurants from anon, authenticated;