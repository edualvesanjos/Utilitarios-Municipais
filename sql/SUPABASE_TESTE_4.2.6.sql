-- Utilitários Municipais v4.2.6
-- Consulta de validação dos modelos personalizados sincronizados.
-- Substitua o e-mail abaixo pelo usuário que deseja conferir.

with usuario as (
  select id, email
  from auth.users
  where lower(email) = lower('usuario@exemplo.com')
)
select
  u.email,
  d.data_type,
  d.version,
  jsonb_pretty(d.content) as conteudo,
  d.created_at,
  d.updated_at
from usuario u
join public.user_data d on d.user_id = u.id
where d.data_type = 'documents';

-- Quantidade de modelos personalizados contidos na chave local sincronizada.
with usuario as (
  select id, email
  from auth.users
  where lower(email) = lower('usuario@exemplo.com')
), docs as (
  select u.email, d.content
  from usuario u
  join public.user_data d on d.user_id = u.id
  where d.data_type = 'documents'
)
select
  email,
  jsonb_array_length(
    coalesce((content ->> 'utilitariosMunicipais:documentTemplates')::jsonb, '[]'::jsonb)
  ) as modelos_personalizados
from docs;
