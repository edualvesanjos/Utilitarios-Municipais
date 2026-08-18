-- ============================================================
-- UTILITÁRIOS MUNICIPAIS v4.3.0
-- Fundação do histórico online
-- Execute uma vez no SQL Editor do Supabase após a estrutura v4.1/4.2.
-- Seguro para reexecução.
-- ============================================================

begin;

create extension if not exists pgcrypto;

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

-- Reutiliza a função set_updated_at criada pela infraestrutura anterior.
-- Caso a instalação seja independente, cria a função se ainda não existir.
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

drop trigger if exists history_entries_set_updated_at on public.history_entries;
create trigger history_entries_set_updated_at
before update on public.history_entries
for each row execute function public.set_updated_at();

alter table public.history_entries enable row level security;

drop policy if exists history_entries_select_own on public.history_entries;
drop policy if exists history_entries_insert_own on public.history_entries;
drop policy if exists history_entries_update_own on public.history_entries;
drop policy if exists history_entries_delete_own on public.history_entries;

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

grant select, insert, update, delete on public.history_entries to authenticated;

commit;

-- Auditoria esperada: RLS true e 4 políticas.
select
  t.tablename,
  t.rowsecurity as rls_habilitado,
  count(p.policyname) as quantidade_politicas
from pg_tables t
left join pg_policies p
  on p.schemaname = t.schemaname
 and p.tablename = t.tablename
where t.schemaname = 'public'
  and t.tablename = 'history_entries'
group by t.tablename, t.rowsecurity;
