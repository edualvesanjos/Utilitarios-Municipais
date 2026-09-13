# Utilitários Municipais — v4.5.3 DEV

## Objetivo
Robustez da sincronização e proteção contra perda silenciosa de dados.

## Etapa inicial
- tornar os estados de sincronização mais claros;
- melhorar mensagens de pendência, offline, erro e conflito;
- reforçar que conflitos exigem decisão do usuário e não descartam automaticamente um dos lados;
- preservar a sincronização validada da Central de Documentos;
- preparar testes de login, logout, refresh e múltiplos navegadores.

## Configuração
- `APP_VERSION = "4.5.3"`
- `APP_ENVIRONMENT = "development"`
- `SYNC_SCHEMA_VERSION = 7`
- sem Supabase Realtime.
