create table files(
  id bigint primary key not null default id_generator(),
  uploader_id bigint NOT NULL,
  filename varchar(256) NOT NULL,
  title varchar(256),
  etag varchar(256),
  mime varchar(256),
  size integer,
  uploaded_at timestamptz default now() not null,
  status integer default 0 -- 0:luanched, 1:uploaded, -1 removed
);