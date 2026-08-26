# Utilitários Municipais — v4.4.1.1 DEV

## Corrigido

- CPF/CNPJ: Histórico local é renderizado automaticamente na inicialização.
- Não é mais necessário validar um novo CPF/CNPJ para os registros existentes aparecerem.
- Após mesclagem remota, o histórico visível de CPF/CNPJ é atualizado imediatamente.
- Mantidas as regras de sincronização e deduplicação da 4.4.1.

## Ambiente

A declaração ativa permanece `APP_ENVIRONMENT = "development"`.

## Banco de dados

Nenhuma alteração de schema ou RLS.
