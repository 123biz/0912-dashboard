-- 서울 시내 대리점 10개

create table dealerships (
  id         bigint generated always as identity primary key,
  name       text not null,
  district   text not null,
  address    text,
  manager    text,
  phone      text,
  opened_on  date
);

alter table dealerships enable row level security;

create policy "dealerships_public_read"
  on dealerships for select
  to anon, authenticated
  using (true);

insert into dealerships (name, district, address, manager, phone, opened_on) values
  ('강남대리점',   '강남구',   '서울특별시 강남구 테헤란로 152',   '김도현', '02-538-1101',  '2015-03-02'),
  ('서초대리점',   '서초구',   '서울특별시 서초구 서초대로 397',   '이하늘', '02-535-1102',  '2016-05-09'),
  ('송파대리점',   '송파구',   '서울특별시 송파구 올림픽로 269',   '최민석', '02-412-1103',  '2015-11-02'),
  ('마포대리점',   '마포구',   '서울특별시 마포구 월드컵로 212',   '유성민', '02-3153-1104', '2017-08-03'),
  ('영등포대리점', '영등포구', '서울특별시 영등포구 당산로 123',   '하준서', '02-2670-1105', '2015-04-06'),
  ('용산대리점',   '용산구',   '서울특별시 용산구 녹사평대로 150', '홍세진', '02-2199-1106', '2017-10-16'),
  ('노원대리점',   '노원구',   '서울특별시 노원구 노해로 437',     '조민지', '02-2116-1107', '2016-04-04'),
  ('강서대리점',   '강서구',   '서울특별시 강서구 화곡로 302',     '엄채원', '02-2600-1108', '2016-11-07'),
  ('관악대리점',   '관악구',   '서울특별시 관악구 관악로 145',     '표시현', '02-879-1109',  '2018-07-03'),
  ('성동대리점',   '성동구',   '서울특별시 성동구 고산자로 270',   '강예린', '02-2286-1110', '2019-06-03');
