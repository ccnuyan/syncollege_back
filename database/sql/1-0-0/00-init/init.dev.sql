drop schema if exists syncollege_db CASCADE;

create schema syncollege_db;
set search_path = syncollege_db;

select 'Schema initialized' as result;

create extension if not exists pgcrypto with schema syncollege_db;