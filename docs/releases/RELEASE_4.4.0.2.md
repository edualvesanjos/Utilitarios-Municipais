# Utilitários Municipais — v4.4.0.2 DEV

Hotfix de apresentação e deduplicação do Histórico Global.

## Corrigido

- O Histórico Global deixa de exibir UUIDs e campos técnicos como:
  - `id`
  - `client_id`
  - `device_id`
  - `schema_version`
  - campos técnicos de sincronização
- A assinatura usada para deduplicação passa a ignorar identificadores técnicos.
- Registros funcionalmente equivalentes passam a ser comparados pelo conteúdo útil.
- A mesclagem local/remota usa a mesma regra de fingerprint sanitizado.

## Objetivo do teste

- Confirmar que o mesmo histórico não é duplicado ao sincronizar repetidamente em dois navegadores.
- Confirmar que UUIDs não aparecem mais no conteúdo visível do Histórico Global.

## Ambiente

`APP_ENVIRONMENT = "development"`

## Banco de dados

Nenhuma alteração de schema ou RLS.
