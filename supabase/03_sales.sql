-- 매출 팩트 테이블 + 시드 데이터
-- 기간: 2026-01-01 ~ 2026-09-12 (255일), 약 9,000행
-- 계절성 / 요일 효과 / 대리점 규모 편차 / 할인 이벤트 / 성장 추세 반영

-- 결정론적 난수 헬퍼 (시드 생성 후 drop 해도 됨)
create or replace function rnd(seed text) returns numeric
language sql immutable as $$
  select ('x' || substr(md5(seed), 1, 8))::bit(32)::bigint / 4294967295.0;
$$;

create table sales (
  id            bigint generated always as identity primary key,
  dealership_id bigint not null references dealerships(id),
  product_id    bigint not null references products(id),
  sale_date     date   not null,
  qty           int    not null check (qty > 0),
  unit_price    numeric(12,0) not null,
  amount        numeric(14,0) generated always as (qty * unit_price) stored,
  unique (dealership_id, product_id, sale_date)
);

create index idx_sales_date    on sales (sale_date);
create index idx_sales_dealer  on sales (dealership_id, sale_date);
create index idx_sales_product on sales (product_id, sale_date);

alter table sales enable row level security;

create policy "sales_public_read"
  on sales for select
  to anon, authenticated
  using (true);

-- -------------------------------------------------------------
-- 시드 데이터 생성
-- -------------------------------------------------------------
with assortment as (
  select d.id as dealership_id, d.name as dname,
         p.id as product_id, p.category, p.list_price,
         row_number() over (partition by d.id
                            order by md5(d.id::text || ':' || p.id::text)) as rn,
         5 + (d.id % 6)::int as keep          -- 대리점당 5~10개 품목
  from dealerships d cross join products p
),
picked as (select * from assortment where rn <= keep),
cal as (
  select g::date as sale_date
  from generate_series('2026-01-01'::date, '2026-09-12'::date, interval '1 day') g
),
grid as (
  select pk.dealership_id, pk.product_id, pk.list_price, c.sale_date,
    -- 대리점 규모
    case pk.dname
      when '강남대리점'   then 1.9 when '서초대리점' then 1.6
      when '송파대리점'   then 1.5 when '영등포대리점' then 1.4
      when '마포대리점'   then 1.1 when '용산대리점' then 1.05
      when '성동대리점'   then 0.95 when '노원대리점' then 0.9
      when '강서대리점'   then 0.85 else 0.8
    end as size_f,
    -- 계절성
    case pk.category
      when '에어컨' then case extract(month from c.sale_date)
        when 1 then 0.25 when 2 then 0.30 when 3 then 0.50 when 4 then 0.90
        when 5 then 1.80 when 6 then 3.20 when 7 then 4.00 when 8 then 3.40
        else 1.50 end
      when '냉장고' then case extract(month from c.sale_date)
        when 3 then 1.3 when 4 then 1.2 when 8 then 1.2 when 9 then 1.4 else 1.0 end
      when 'TV' then case extract(month from c.sale_date)
        when 1 then 1.3 when 2 then 1.2 when 6 then 1.3 when 7 then 1.2 else 0.95 end
      when '세탁기' then case extract(month from c.sale_date)
        when 3 then 1.3 when 4 then 1.2 when 9 then 1.2 else 1.0 end
      else case extract(month from c.sale_date)   -- 생활가전: 미세먼지 시즌
        when 3 then 1.6 when 4 then 1.7 when 5 then 1.4 when 6 then 1.1 else 0.9 end
    end as season_f,
    -- 요일 (0=일, 6=토)
    case extract(dow from c.sale_date)
      when 0 then 1.35 when 6 then 1.45 when 5 then 1.15 when 1 then 0.80 else 0.95
    end as dow_f,
    -- 완만한 성장 추세
    1.0 + 0.018 * (extract(month from c.sale_date) - 1) as trend_f,
    rnd(pk.dealership_id || '-' || pk.product_id || '-' || c.sale_date || '-o') as r_occ,
    rnd(pk.dealership_id || '-' || pk.product_id || '-' || c.sale_date || '-q') as r_qty,
    rnd(pk.dealership_id || '-' || pk.product_id || '-' || c.sale_date || '-p') as r_prc
  from picked pk cross join cal c
)
insert into sales (dealership_id, product_id, sale_date, qty, unit_price)
select
  dealership_id, product_id, sale_date,
  1 + floor(r_qty * least(3.2, 1.0 + size_f * season_f * 0.7))::int as qty,
  round(list_price * case when r_prc < 0.12 then 0.80     -- 프로모션가
                          when r_prc < 0.35 then 0.90     -- 일반 할인
                          else 0.97 end, -3) as unit_price
from grid
where r_occ < least(0.85, 0.35 * size_f * season_f * dow_f * trend_f);

-- 확인
select count(*) as 행수,
       min(sale_date) as 시작, max(sale_date) as 종료,
       to_char(sum(amount), 'FM999,999,999,999') as 총매출
from sales;
