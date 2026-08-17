# Sincronização 4.2.1

## Objetivo

Validar a persistência online antes da futura sincronização de históricos.

## Categorias em `public.user_data`

- `preferences`
- `favorites`
- `personalization`
- `navigation`

Cada registro é identificado por `user_id + data_type` e usa `version = 2`.

## Contingência

A gravação local ocorre independentemente do Supabase. Alterações efetuadas sem conexão recebem estado pendente e são reenviadas quando a conexão retorna, desde que a sincronização automática esteja habilitada.

## Limites desta etapa

Não há mesclagem campo a campo nem resolução avançada de conflitos. Ao usar **Baixar dados online**, os grupos remotos suportados substituem os mesmos grupos locais. Históricos e conteúdos operacionais não são enviados.
