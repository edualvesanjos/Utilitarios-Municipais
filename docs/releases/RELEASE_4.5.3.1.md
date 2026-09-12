# Utilitários Municipais — v4.5.3.1 DEV

## Objetivo

Correção crítica da regressão de autenticação identificada nos testes da v4.5.3 DEV.

## Correções

- ícone de logon/logoff volta a responder;
- tela de login deixa de permanecer indefinidamente em `Entrando...`;
- restaurado o fluxo original de `renderOnlineStatus()`;
- removida a instrumentação experimental de estado que interferia no fluxo da conta.

## Mantido

- melhorias seguras nas mensagens de conflito;
- mensagens de alterações pendentes;
- sincronização da Central de Documentos;
- `SYNC_SCHEMA_VERSION = 7`;
- Supabase Realtime fora do escopo.

## Teste prioritário

1. Abrir o menu da conta pelo ícone.
2. Fazer login.
3. Confirmar que `Entrando...` é encerrado e a conta fica conectada.
4. Atualizar a página e confirmar permanência da sessão.
5. Fazer logout.
6. Fazer novo login.
7. Confirmar sincronização da Central de Documentos após autenticação.
