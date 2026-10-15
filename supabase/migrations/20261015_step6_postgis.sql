-- Step 6: PostGIS nearby search
create extension if not exists postgis with schema extensions;

alter table public.restaurants
  add column if not exists geom extensions.geography(Point, 4326);

-- coordinate order for PostGIS: ST_MakePoint(longitude, latitude)
update public.restaurants
  set geom = extensions.ST_SetSRID(extensions.ST_MakePoint(lng, lat), 4326)::extensions.geography
  where geom is null and lat is not null and lng is not null;

create or replace function public.restaurants_set_geom()
returns trigger language plpgsql set search_path = public, extensions as $$
begin
  if new.lat is not null and new.lng is not null then
    new.geom := ST_SetSRID(ST_MakePoint(new.lng, new.lat), 4326)::geography;
  end if;
  return new;
end $$;

drop trigger if exists trg_restaurants_geom on public.restaurants;
create trigger trg_restaurants_geom before insert or update of lat, lng
  on public.restaurants for each row execute function public.restaurants_set_geom();

create index if not exists restaurants_geom_gix on public.restaurants using gist (geom);

-- distance_m = straight-line (great-circle) distance in meters
create or replace function public.nearby_restaurants(
  p_lat double precision,
  p_lng double precision,
  p_radius_m integer default 1000,
  p_category text default null,
  p_query text default null,
  p_limit integer default 200
)
returns table (
  id uuid, source text, source_id text, name text, road_address text, lot_address text,
  category text, category_raw text, tel text, lat double precision, lng double precision,
  place_url text, business_status text, updated_at timestamptz, distance_m double precision
)
language sql stable security invoker set search_path = public, extensions as $$
  with me as (
    select ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography as g
  )
  select r.id, r.source, r.source_id, r.name, r.road_address, r.lot_address,
         r.category, r.category_raw, r.tel, r.lat, r.lng, r.place_url,
         r.business_status, r.updated_at,
         ST_Distance(r.geom, me.g) as distance_m
  from public.restaurants r, me
  where ST_DWithin(r.geom, me.g, least(greatest(p_radius_m, 1), 5000))
    and (p_category is null or p_category = '' or r.category = p_category)
    and (p_query is null or p_query = ''
         or r.name ilike '%' || p_query || '%'
         or r.category_raw ilike '%' || p_query || '%')
  order by distance_m asc
  limit least(greatest(p_limit, 1), 300);
$$;

grant execute on function public.nearby_restaurants(double precision, double precision, integer, text, text, integer) to anon, authenticated;
