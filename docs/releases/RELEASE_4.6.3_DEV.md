# Utilitários Municipais v4.6.3 DEV

## Objetivo

Desativar o Realtime e manter somente a sincronização normal com o SuperDB.

## Alterações

- Remove o carregamento do serviço Realtime.
- Remove conexões, desconexões e renovação de token Realtime do ciclo de autenticação.
- Remove o gatilho de sincronização iniciado por eventos Realtime.
- Preserva autenticação, sincronização REST, histórico, sync_log e isolamento DEV/PROD.
- Nenhuma alteração de schema, RLS ou dados nesta versão.

## Banco

A desativação do Realtime no painel/policies do SuperDB será feita somente após a validação desta versão DEV sem Realtime.
