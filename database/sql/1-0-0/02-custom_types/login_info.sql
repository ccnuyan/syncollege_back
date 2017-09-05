create type login_info as(
  id bigint,
  username varchar,
  gender varchar,
  nickname varchar, 
  role int,
  success boolean,
  message varchar
);