-- ============================================================
-- UTILITÁRIOS MUNICIPAIS v4.3.1.1
-- Supabase: tabelas, gatilhos, RLS e políticas por usuário
-- Execute integralmente no SQL Editor do Supabase.
-- ============================================================

begin;

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Perfil complementar do usuário
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Usuário',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_display_name_length
    check (char_length(trim(display_name)) between 1 and 40)
);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- Dados sincronizados por categoria
create table if not exists public.user_data (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  data_type text not null,
  content jsonb not null default '{}'::jsonb,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_data_type_not_empty check (char_length(trim(data_type)) > 0),
  constraint user_data_version_positive check (version >= 1),
  constraint user_data_user_type_unique unique (user_id, data_type)
);

create index if not exists user_data_user_id_idx
  on public.user_data(user_id);

create index if not exists user_data_user_updated_idx
  on public.user_data(user_id, updated_at desc);

drop trigger if exists user_data_set_updated_at on public.user_data;
create trigger user_data_set_updated_at
before update on public.user_data
for each row execute function public.set_updated_at();

-- Registro técnico das sincronizações
create table if not exists public.sync_log (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'success',
  app_version text,
  device_id text,
  synced_items integer not null default 0,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint sync_log_status_valid check (status in ('success', 'partial', 'error')),
  constraint sync_log_items_nonnegative check (synced_items >= 0)
);

create index if not exists sync_log_user_created_idx
  on public.sync_log(user_id, created_at desc);

-- Histórico operacional sincronizável (v4.3.0)
create table if not exists public.history_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid not null,
  module text not null,
  action text not null default 'record',
  value jsonb,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  device_id text,
  schema_version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint history_entries_module_not_empty check (char_length(trim(module)) > 0),
  constraint history_entries_action_not_empty check (char_length(trim(action)) > 0),
  constraint history_entries_schema_positive check (schema_version >= 1),
  constraint history_entries_user_client_unique unique (user_id, client_id)
);

create index if not exists history_entries_user_occurred_idx
  on public.history_entries(user_id, occurred_at desc);
create index if not exists history_entries_user_module_occurred_idx
  on public.history_entries(user_id, module, occurred_at desc);
create index if not exists history_entries_device_idx
  on public.history_entries(user_id, device_id);

drop trigger if exists history_entries_set_updated_at on public.history_entries;
create trigger history_entries_set_updated_at
before update on public.history_entries
for each row execute function public.set_updated_at();

-- Habilitação obrigatória do Row Level Security
alter table public.profiles enable row level security;
alter table public.user_data enable row level security;
alter table public.sync_log enable row level security;
alter table public.history_entries enable row level security;

-- Remove políticas anteriores com os mesmos nomes, permitindo reexecutar o script
drop policy if exists profiles_select_own on public.profiles;
drop policy if exists profiles_insert_own on public.profiles;
drop policy if exists profiles_update_own on public.profiles;
drop policy if exists profiles_delete_own on public.profiles;

drop policy if exists user_data_select_own on public.user_data;
drop policy if exists user_data_insert_own on public.user_data;
drop policy if exists user_data_update_own on public.user_data;
drop policy if exists user_data_delete_own on public.user_data;

drop policy if exists sync_log_select_own on public.sync_log;
drop policy if exists sync_log_insert_own on public.sync_log;
drop policy if exists sync_log_delete_own on public.sync_log;

drop policy if exists history_entries_select_own on public.history_entries;
drop policy if exists history_entries_insert_own on public.history_entries;
drop policy if exists history_entries_update_own on public.history_entries;
drop policy if exists history_entries_delete_own on public.history_entries;

-- Políticas: perfil
create policy profiles_select_own
on public.profiles for select
to authenticated
using ((select auth.uid()) = id);

create policy profiles_insert_own
on public.profiles for insert
to authenticated
with check ((select auth.uid()) = id);

create policy profiles_update_own
on public.profiles for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy profiles_delete_own
on public.profiles for delete
to authenticated
using ((select auth.uid()) = id);

-- Políticas: dados sincronizados
create policy user_data_select_own
on public.user_data for select
to authenticated
using ((select auth.uid()) = user_id);

create policy user_data_insert_own
on public.user_data for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy user_data_update_own
on public.user_data for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy user_data_delete_own
on public.user_data for delete
to authenticated
using ((select auth.uid()) = user_id);

-- Políticas: logs. Não há UPDATE intencionalmente.
create policy sync_log_select_own
on public.sync_log for select
to authenticated
using ((select auth.uid()) = user_id);

create policy sync_log_insert_own
on public.sync_log for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy sync_log_delete_own
on public.sync_log for delete
to authenticated
using ((select auth.uid()) = user_id);


-- Políticas: histórico operacional
create policy history_entries_select_own
on public.history_entries for select
to authenticated
using ((select auth.uid()) = user_id);

create policy history_entries_insert_own
on public.history_entries for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy history_entries_update_own
on public.history_entries for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy history_entries_delete_own
on public.history_entries for delete
to authenticated
using ((select auth.uid()) = user_id);

-- Privilégios de tabela. O RLS continua filtrando as linhas.
grant usage on schema public to authenticated;
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.user_data to authenticated;
grant select, insert, delete on public.sync_log to authenticated;
grant select, insert, update, delete on public.history_entries to authenticated;
grant usage, select on sequence public.sync_log_id_seq to authenticated;

commit;

-- ============================================================
-- AUDITORIA: execute após o bloco acima
-- ============================================================

select
  t.tablename,
  t.rowsecurity as rls_habilitado,
  count(p.policyname) as quantidade_politicas
from pg_tables t
left join pg_policies p
  on p.schemaname = t.schemaname
 and p.tablename = t.tablename
where t.schemaname = 'public'
  and t.tablename in ('profiles', 'user_data', 'sync_log', 'history_entries')
group by t.tablename, t.rowsecurity
order by t.tablename;

-- Resultado esperado:
-- history_entries | true | 4
-- profiles  | true | 4
-- sync_log  | true | 3
-- user_data | true | 4
