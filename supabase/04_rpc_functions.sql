-- =============================================================
-- 대시보드 집계 RPC 함수 (7종)
-- 공통 파라미터: p_from, p_to, p_dealer_ids, p_categories
--   - NULL 이면 "전체"를 의미한다
-- =============================================================

-- -------------------------------------------------------------
-- 1. KPI 요약 — 총매출 / 수량 / 평균단가 / 1위 대리점 / 전기 대비
-- -------------------------------------------------------------
create or replace function get_kpi_summary(
  p_from       date     default null,
  p_to         date     default null,
  p_dealer_ids bigint[] default null,
  p_categories text[]   default null
)
returns table (
  revenue            numeric,
  qty                bigint,
  avg_unit_price     numeric,
  top_dealer         text,
  top_dealer_revenue numeric,
  prev_revenue       numeric,
  revenue_change_pct numeric
)
language sql stable as $$
  with span as (
    select
      coalesce(p_from, (select min(sale_date) from sales)) as d_from,
      coalesce(p_to,   (select max(sale_date) from sales)) as d_to
  ),
  span2 as (
    select d_from, d_to, (d_to - d_from + 1) as days from span
  ),
  cur as (
    select s.amount, s.qty, s.dealership_id
    from sales s
    join products p on p.id = s.product_id
    cross join span2 sp
    where s.sale_date between sp.d_from and sp.d_to
      and (p_dealer_ids is null or s.dealership_id = any(p_dealer_ids))
      and (p_categories is null or p.category = any(p_categories))
  ),
  prv as (
    select s.amount
    from sales s
    join products p on p.id = s.product_id
    cross join span2 sp
    where s.sale_date between (sp.d_from - sp.days) and (sp.d_from - 1)
      and (p_dealer_ids is null or s.dealership_id = any(p_dealer_ids))
      and (p_categories is null or p.category = any(p_categories))
  ),
  prv_sum as (select coalesce(sum(amount), 0) as rev from prv),
  top as (
    select d.name as nm, sum(c.amount) as rev
    from cur c
    join dealerships d on d.id = c.dealership_id
    group by d.name
    order by rev desc
    limit 1
  )
  select
    coalesce(sum(cur.amount), 0),
    coalesce(sum(cur.qty), 0)::bigint,
    case when coalesce(sum(cur.qty), 0) > 0
         then round(sum(cur.amount) / sum(cur.qty))
         else 0 end,
    (select nm  from top),
    (select rev from top),
    (select rev from prv_sum),
    case when (select rev from prv_sum) > 0
         then round((coalesce(sum(cur.amount), 0) - (select rev from prv_sum))
                    * 100.0 / (select rev from prv_sum), 1)
         else null end
  from cur;
$$;

-- -------------------------------------------------------------
-- 2. 월별 매출 추이
-- -------------------------------------------------------------
create or replace function get_monthly_trend(
  p_from       date     default null,
  p_to         date     default null,
  p_dealer_ids bigint[] default null,
  p_categories text[]   default null
)
returns table (
  month   date,
  revenue numeric,
  qty     bigint
)
language sql stable as $$
  select
    date_trunc('month', s.sale_date)::date as month,
    sum(s.amount) as revenue,
    sum(s.qty)::bigint as qty
  from sales s
  join products p on p.id = s.product_id
  where s.sale_date >= coalesce(p_from, (select min(sale_date) from sales))
    and s.sale_date <= coalesce(p_to,   (select max(sale_date) from sales))
    and (p_dealer_ids is null or s.dealership_id = any(p_dealer_ids))
    and (p_categories is null or p.category = any(p_categories))
  group by 1
  order by 1;
$$;

-- -------------------------------------------------------------
-- 3. 대리점별 매출 순위
-- -------------------------------------------------------------
create or replace function get_sales_by_dealer(
  p_from       date     default null,
  p_to         date     default null,
  p_dealer_ids bigint[] default null,
  p_categories text[]   default null
)
returns table (
  dealership_id bigint,
  dealership    text,
  district      text,
  revenue       numeric,
  qty           bigint,
  share_pct     numeric
)
language sql stable as $$
  select
    d.id,
    d.name,
    d.district,
    sum(s.amount) as revenue,
    sum(s.qty)::bigint as qty,
    round(100.0 * sum(s.amount) / nullif(sum(sum(s.amount)) over (), 0), 1) as share_pct
  from sales s
  join products p    on p.id = s.product_id
  join dealerships d on d.id = s.dealership_id
  where s.sale_date >= coalesce(p_from, (select min(sale_date) from sales))
    and s.sale_date <= coalesce(p_to,   (select max(sale_date) from sales))
    and (p_dealer_ids is null or s.dealership_id = any(p_dealer_ids))
    and (p_categories is null or p.category = any(p_categories))
  group by d.id, d.name, d.district
  order by revenue desc;
$$;

-- -------------------------------------------------------------
-- 4. 카테고리별 매출 구성
-- -------------------------------------------------------------
create or replace function get_sales_by_category(
  p_from       date     default null,
  p_to         date     default null,
  p_dealer_ids bigint[] default null,
  p_categories text[]   default null
)
returns table (
  category  text,
  revenue   numeric,
  qty       bigint,
  share_pct numeric
)
language sql stable as $$
  select
    p.category,
    sum(s.amount) as revenue,
    sum(s.qty)::bigint as qty,
    round(100.0 * sum(s.amount) / nullif(sum(sum(s.amount)) over (), 0), 1) as share_pct
  from sales s
  join products p on p.id = s.product_id
  where s.sale_date >= coalesce(p_from, (select min(sale_date) from sales))
    and s.sale_date <= coalesce(p_to,   (select max(sale_date) from sales))
    and (p_dealer_ids is null or s.dealership_id = any(p_dealer_ids))
    and (p_categories is null or p.category = any(p_categories))
  group by p.category
  order by revenue desc;
$$;

-- -------------------------------------------------------------
-- 5. 품목별 매출 Top N
-- -------------------------------------------------------------
create or replace function get_sales_by_product(
  p_from       date     default null,
  p_to         date     default null,
  p_dealer_ids bigint[] default null,
  p_categories text[]   default null,
  p_limit      int      default 10
)
returns table (
  product_id bigint,
  product    text,
  category   text,
  revenue    numeric,
  qty        bigint
)
language sql stable as $$
  select
    p.id,
    p.name,
    p.category,
    sum(s.amount) as revenue,
    sum(s.qty)::bigint as qty
  from sales s
  join products p on p.id = s.product_id
  where s.sale_date >= coalesce(p_from, (select min(sale_date) from sales))
    and s.sale_date <= coalesce(p_to,   (select max(sale_date) from sales))
    and (p_dealer_ids is null or s.dealership_id = any(p_dealer_ids))
    and (p_categories is null or p.category = any(p_categories))
  group by p.id, p.name, p.category
  order by revenue desc
  limit p_limit;
$$;

-- -------------------------------------------------------------
-- 6. 요일별 평균 매출
-- -------------------------------------------------------------
create or replace function get_sales_by_dow(
  p_from       date     default null,
  p_to         date     default null,
  p_dealer_ids bigint[] default null,
  p_categories text[]   default null
)
returns table (
  dow         int,
  dow_label   text,
  revenue     numeric,
  avg_revenue numeric
)
language sql stable as $$
  select
    extract(dow from s.sale_date)::int as dow,
    (array['일','월','화','수','목','금','토'])[extract(dow from s.sale_date)::int + 1] as dow_label,
    sum(s.amount) as revenue,
    round(sum(s.amount) / count(distinct s.sale_date)) as avg_revenue
  from sales s
  join products p on p.id = s.product_id
  where s.sale_date >= coalesce(p_from, (select min(sale_date) from sales))
    and s.sale_date <= coalesce(p_to,   (select max(sale_date) from sales))
    and (p_dealer_ids is null or s.dealership_id = any(p_dealer_ids))
    and (p_categories is null or p.category = any(p_categories))
  group by 1, 2
  order by 1;
$$;

-- -------------------------------------------------------------
-- 7. 대리점 x 카테고리 히트맵
-- -------------------------------------------------------------
create or replace function get_dealer_category_matrix(
  p_from       date     default null,
  p_to         date     default null,
  p_dealer_ids bigint[] default null,
  p_categories text[]   default null
)
returns table (
  dealership text,
  category   text,
  revenue    numeric
)
language sql stable as $$
  select
    d.name,
    p.category,
    sum(s.amount) as revenue
  from sales s
  join products p    on p.id = s.product_id
  join dealerships d on d.id = s.dealership_id
  where s.sale_date >= coalesce(p_from, (select min(sale_date) from sales))
    and s.sale_date <= coalesce(p_to,   (select max(sale_date) from sales))
    and (p_dealer_ids is null or s.dealership_id = any(p_dealer_ids))
    and (p_categories is null or p.category = any(p_categories))
  group by d.name, p.category;
$$;

-- -------------------------------------------------------------
-- 데이터 기준일 (헤더 표시용)
-- -------------------------------------------------------------
create or replace function get_data_range()
returns table (min_date date, max_date date)
language sql stable as $$
  select min(sale_date), max(sale_date) from sales;
$$;

-- -------------------------------------------------------------
-- 권한 부여 — 익명 사용자가 호출할 수 있어야 한다
-- -------------------------------------------------------------
grant execute on function get_kpi_summary            to anon, authenticated;
grant execute on function get_monthly_trend          to anon, authenticated;
grant execute on function get_sales_by_dealer        to anon, authenticated;
grant execute on function get_sales_by_category      to anon, authenticated;
grant execute on function get_sales_by_product       to anon, authenticated;
grant execute on function get_sales_by_dow           to anon, authenticated;
grant execute on function get_dealer_category_matrix to anon, authenticated;
grant execute on function get_data_range             to anon, authenticated;

-- =============================================================
-- 동작 확인
-- =============================================================
-- select * from get_kpi_summary();
-- select * from get_monthly_trend();
-- select * from get_sales_by_dealer();
-- select * from get_sales_by_category();
-- select * from get_sales_by_product();
-- select * from get_sales_by_dow();
-- select * from get_dealer_category_matrix();
-- select * from get_kpi_summary('2026-07-01', '2026-09-12', array[1,2]::bigint[], array['에어컨']);
