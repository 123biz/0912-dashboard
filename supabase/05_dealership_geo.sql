-- 대리점 좌표 추가 + 지도용 집계 함수
--
-- 좌표는 각 대리점 주소가 속한 자치구 내 해당 도로 위치를 기준으로 한
-- 근사값이다. 주소 자체가 가상 데이터이므로 측량 수준의 정밀도는 아니며,
-- 구 단위 위치는 정확하다.

alter table dealerships
  add column if not exists lat numeric(9,6),
  add column if not exists lng numeric(9,6);

update dealerships set lat = 37.500622, lng = 127.036456 where name = '강남대리점';
update dealerships set lat = 37.493900, lng = 127.014800 where name = '서초대리점';
update dealerships set lat = 37.514500, lng = 127.105900 where name = '송파대리점';
update dealerships set lat = 37.566300, lng = 126.901900 where name = '마포대리점';
update dealerships set lat = 37.526400, lng = 126.896200 where name = '영등포대리점';
update dealerships set lat = 37.532400, lng = 126.990000 where name = '용산대리점';
update dealerships set lat = 37.654200, lng = 127.056800 where name = '노원대리점';
update dealerships set lat = 37.550900, lng = 126.849500 where name = '강서대리점';
update dealerships set lat = 37.478400, lng = 126.951600 where name = '관악대리점';
update dealerships set lat = 37.563400, lng = 127.037100 where name = '성동대리점';

-- 좌표 누락 확인 (0 이어야 정상)
select count(*) as 좌표누락 from dealerships where lat is null or lng is null;

-- -------------------------------------------------------------
-- 지도용: 대리점별 매출 + 좌표
-- -------------------------------------------------------------
create or replace function get_dealer_geo_sales(
  p_from       date     default null,
  p_to         date     default null,
  p_dealer_ids bigint[] default null,
  p_categories text[]   default null
)
returns table (
  dealership_id bigint,
  dealership    text,
  district      text,
  lat           numeric,
  lng           numeric,
  revenue       numeric,
  qty           bigint,
  share_pct     numeric
)
language sql stable as $$
  select
    d.id,
    d.name,
    d.district,
    d.lat,
    d.lng,
    sum(s.amount),
    sum(s.qty)::bigint,
    round(100.0 * sum(s.amount) / nullif(sum(sum(s.amount)) over (), 0), 1)
  from sales s
  join products p    on p.id = s.product_id
  join dealerships d on d.id = s.dealership_id
  where d.lat is not null
    and d.lng is not null
    and s.sale_date >= coalesce(p_from, (select min(sale_date) from sales))
    and s.sale_date <= coalesce(p_to,   (select max(sale_date) from sales))
    and (p_dealer_ids is null or s.dealership_id = any(p_dealer_ids))
    and (p_categories is null or p.category = any(p_categories))
  group by d.id, d.name, d.district, d.lat, d.lng
  order by 6 desc;
$$;

grant execute on function get_dealer_geo_sales to anon, authenticated;

notify pgrst, 'reload schema';

-- 동작 확인
select * from get_dealer_geo_sales();
