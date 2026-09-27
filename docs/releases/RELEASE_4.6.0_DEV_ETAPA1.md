# Utilitários Municipais — v4.6.0 DEV — Etapa 1

## Objetivo
Introduzir uma camada de abstração de backend antes da troca efetiva do Supabase pelo SuperDB.

## Estado desta etapa
- Backend operacional: Supabase de desenvolvimento.
- Destino da migração: SuperDB / `utilitariosmunicipais_teste`.
- `BackendClientService` passa a ser a dependência de `OnlineSyncService` e `HistoryService`.
- Não há migração de dados nem promoção para produção nesta etapa.

## Próxima etapa
Implementar o cliente SuperDB no adapter e ativar autenticação/sessão em DEV, preservando o Supabase de produção.
