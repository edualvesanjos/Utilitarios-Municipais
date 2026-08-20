# Utilitários Municipais — v4.3.4

Versão de testes da sincronização operacional da série 4.3.

## Entregas
- Sincronização gradual dos históricos de Arquivo, Inscrição, Lotes, UVRM e Percentual.
- Migração única dos históricos locais existentes.
- Idempotência por `client_id` e `upsert`, evitando duplicidade em reenvios.
- Mesclagem de registros remotos no armazenamento local sem duplicar conteúdo equivalente.
- Retomada automática da fila ao reconectar, retornar à aba e autenticar.
- Ajustes visuais pendentes em Sobre e Biblioteca.

## Banco de dados
Não há novo schema. Para testar a sincronização, a tabela `history_entries` da versão 4.3.0 precisa já existir no Supabase.
