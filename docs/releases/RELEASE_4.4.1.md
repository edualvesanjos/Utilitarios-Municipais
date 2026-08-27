# Utilitários Municipais — v4.4.1 DEV

Etapa de confiabilidade da sincronização.

## Implementado

- Proteção contra sincronizações concorrentes.
- Fila de pendências preservada em falhas e offline.
- Metadados locais de tentativa: quantidade, horário e último erro.
- Reenvio automático com intervalo progressivo, limitado a 60 segundos.
- Retomada automática ao:
  - recuperar conexão;
  - voltar à aba;
  - reabrir o aplicativo com pendências.
- Histórico Global mostra:
  - quantidade de registros pendentes;
  - horário da última sincronização bem-sucedida.
- Leitura remota paginada, com suporte de até 2.000 registros nesta etapa.
- Deduplicação e funcionamento offline-first da 4.4.0.x preservados.

## Ambiente

A declaração ativa permanece `APP_ENVIRONMENT = "development"`.

## Banco de dados

Nenhuma alteração de schema ou RLS.
