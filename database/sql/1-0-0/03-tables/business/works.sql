create table works(
  id bigint primary key not null default id_generator(),
  
  creator_id bigint,
  snapshot TEXT not null,
  content TEXT not null,
  last_modification timestamptz default now() not null,
  created_at timestamptz default now() not null,
);