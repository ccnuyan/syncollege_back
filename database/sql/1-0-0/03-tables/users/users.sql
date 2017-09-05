create table users(
  id bigint primary key not null default id_generator(),
  
  user_key varchar(18) default random_string(18) not null,
  username varchar(255) unique not null,
  role int default 10, -- 99/student 10/teacher; 0/admin
  login_count int default 0 not null,
  last_login timestamptz,
  created_at timestamptz default now() not null,

  --profile
  nickname varchar(64),
  gender varchar(16)
);