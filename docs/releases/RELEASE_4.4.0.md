# Utilitários Municipais — v4.4.0 DEV

Primeira etapa da série 4.4, dedicada ao Histórico Global sincronizado.

## Implementado

- Histórico Global passa a reunir e sincronizar:
  - Nome de arquivo
  - Inscrição imobiliária
  - Número de lote
  - Calculadora UVRM
  - Percentual
  - Datas
  - CPF / CNPJ
- Varredura idempotente dos históricos locais com `client_id` determinístico.
- Envio por `upsert` para `history_entries`, evitando duplicidades equivalentes.
- Mesclagem dos registros remotos aos históricos locais.
- Funcionamento offline-first: alterações permanecem locais e entram na fila para envio posterior.
- Botão **Sincronizar histórico** para testes e sincronização manual.
- Datas passa a manter histórico local das operações realizadas.
- CPF/CNPJ passa a notificar a fila de sincronização após alterações no histórico local.

## Ambiente

Esta release de desenvolvimento mantém `APP_ENVIRONMENT = "development"` e deve usar exclusivamente o Supabase DEV.

## Banco de dados

A versão utiliza a tabela `history_entries` já existente. Nenhuma alteração de schema é necessária nesta etapa.
