-- Utilitários Municipais v4.6.7 DEV
-- Execute no schema DEV ativo do SuperDB antes dos testes da sequência de lotes.
-- Se o editor já estiver apontando para proj_utilitariosmunicipais_teste,
-- mantenha o schema qualificado abaixo.

create table if not exists proj_utilitariosmunicipais_teste.lot_sequence_state (
    user_id uuid primary key references auth.users(id) on delete cascade,
    last_sequence integer not null default 0,
    revision bigint not null default 1,
    device_id text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint lot_sequence_nonnegative check (last_sequence between 0 and 99999),
    constraint lot_sequence_revision_positive check (revision >= 1)
);

create or replace function proj_utilitariosmunicipais_teste.set_lot_sequence_updated_at()
returns trigger language plpgsql security invoker
set search_path = proj_utilitariosmunicipais_teste
as $$ begin new.updated_at = now(); return new; end; $$;

drop trigger if exists lot_sequence_state_set_updated_at on proj_utilitariosmunicipais_teste.lot_sequence_state;
create trigger lot_sequence_state_set_updated_at
before update on proj_utilitariosmunicipais_teste.lot_sequence_state
for each row execute function proj_utilitariosmunicipais_teste.set_lot_sequence_updated_at();

alter table proj_utilitariosmunicipais_teste.lot_sequence_state enable row level security;

drop policy if exists lot_sequence_state_select_own on proj_utilitariosmunicipais_teste.lot_sequence_state;
drop policy if exists lot_sequence_state_insert_own on proj_utilitariosmunicipais_teste.lot_sequence_state;
drop policy if exists lot_sequence_state_update_own on proj_utilitariosmunicipais_teste.lot_sequence_state;
drop policy if exists lot_sequence_state_delete_own on proj_utilitariosmunicipais_teste.lot_sequence_state;

create policy lot_sequence_state_select_own on proj_utilitariosmunicipais_teste.lot_sequence_state
for select to authenticated using ((select auth.uid()) = user_id);
create policy lot_sequence_state_insert_own on proj_utilitariosmunicipais_teste.lot_sequence_state
for insert to authenticated with check ((select auth.uid()) = user_id);
create policy lot_sequence_state_update_own on proj_utilitariosmunicipais_teste.lot_sequence_state
for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy lot_sequence_state_delete_own on proj_utilitariosmunicipais_teste.lot_sequence_state
for delete to authenticated using ((select auth.uid()) = user_id);

grant select, insert, update, delete on proj_utilitariosmunicipais_teste.lot_sequence_state to authenticated;
