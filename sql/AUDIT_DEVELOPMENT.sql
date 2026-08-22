-- Auditoria do banco de desenvolvimento — Utilitários Municipais

-- 1. Tabelas esperadas e RLS
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
-- profiles        | true | 4
-- sync_log        | true | 3
-- user_data       | true | 4

-- 2. Confirmar que não há dados de produção copiados acidentalmente
select 'profiles' as tabela, count(*) as registros from public.profiles
union all
select 'user_data', count(*) from public.user_data
union all
select 'sync_log', count(*) from public.sync_log
union all
select 'history_entries', count(*) from public.history_entries;

-- Em um projeto recém-criado, os totais devem ser zero antes do primeiro teste.
