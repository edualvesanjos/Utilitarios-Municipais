# Utilitários Municipais v4.6.3 PROD

## Objetivo

Operar com sincronização normal do SuperDB, sem Realtime.

## Alterações homologadas

- Realtime removido da aplicação.
- Sincronização REST preservada.
- Autenticação e isolamento DEV/PROD preservados.
- Histórico e sync_log preservados.
- Operação offline, recuperação e solução de conflitos validadas.
- SuperDB DEV e PROD com Realtime desativado.
- Policies específicas sdb_rt_* removidas automaticamente pelo SuperDB; policies normais de RLS preservadas.
