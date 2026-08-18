# Utilitários Municipais v4.3.0

## Objetivo

Criar a fundação de dados necessária para que os históricos dos módulos possam ser sincronizados com segurança na série 4.3, sem alterar ainda o comportamento operacional dos históricos locais.

## Entregas

- Tabela Supabase `history_entries` com isolamento por usuário via RLS.
- Chave de idempotência `(user_id, client_id)` para impedir duplicação da mesma ação em reenvios.
- Índices por usuário, módulo, data e dispositivo.
- `HistoryService` com geração de registros canônicos e fila local (`history:outbox`).
- Métodos preparatórios `uploadPending()` e `listRemote()` para a integração gradual das próximas versões.
- Script incremental `SUPABASE_HISTORY_4.3.0.sql`.
- `SUPABASE_SETUP.sql` consolidado atualizado.
- Schema local 13 e metadados 4.3.0.

## Compatibilidade

Os históricos existentes de Nome de Arquivo, Inscrição Imobiliária, Número de Lote, UVRM e Percentual continuam usando as estruturas locais anteriores nesta versão. Nenhuma migração automática é executada na 4.3.0.

## Próxima etapa

A 4.3.1 poderá começar a integrar os módulos à nova camada, convertendo novas ações em registros canônicos e testando upload idempotente de forma controlada.
