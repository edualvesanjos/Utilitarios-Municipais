# Utilitários Municipais — v4.4.2.1 DEV

## Implementado
- Exclusão sincronizada expandida para Montador de Nome de Arquivo, Inscrição, Lotes, UVRM, Percentual e Datas.
- CPF/CNPJ mantém o mecanismo de tombstone validado na 4.4.2.
- Datas passa a enfileirar novos registros imediatamente para sincronização.
- Exclusões continuam lógicas: `action = delete` em `history_entries`, sem apagar fisicamente o registro original.
- Ações globais de Configurações permanecem inalteradas.

## Ambiente
`APP_ENVIRONMENT = "development"`

## Banco de dados
Sem alteração de schema ou RLS.
