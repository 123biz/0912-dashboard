-- 취급 품목 10종

create table products (
  id          bigint generated always as identity primary key,
  sku         text not null unique,
  name        text not null,
  category    text not null,
  list_price  numeric(12,0) not null,
  unit_cost   numeric(12,0) not null
);

alter table products enable row level security;

create policy "products_public_read"
  on products for select
  to anon, authenticated
  using (true);

insert into products (sku, name, category, list_price, unit_cost) values
  ('RF-2001', '양문형 냉장고 830L', '냉장고',   2450000, 1690000),
  ('RF-2002', '김치냉장고 320L',    '냉장고',   1280000,  870000),
  ('WM-3001', '드럼세탁기 25kg',    '세탁기',   1590000, 1080000),
  ('WM-3002', '건조기 20kg',        '세탁기',   1340000,  920000),
  ('TV-4001', 'OLED TV 65인치',     'TV',       3290000, 2280000),
  ('TV-4002', 'QLED TV 55인치',     'TV',       1490000, 1010000),
  ('AC-5001', '스탠드 에어컨 18평', '에어컨',   2190000, 1500000),
  ('AC-5002', '벽걸이 에어컨 7평',  '에어컨',    790000,  530000),
  ('AP-6001', '공기청정기 30평',    '생활가전',  690000,  450000),
  ('VC-6002', '무선청소기',         '생활가전',  890000,  590000);
