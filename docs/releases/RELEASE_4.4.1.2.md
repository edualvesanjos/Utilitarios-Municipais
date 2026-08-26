# Utilitários Municipais — v4.4.1.2 DEV

## Corrigido
- Ordem determinística dos históricos após troca de aba e sincronização.
- Mesclagem remota: mesclar → deduplicar → ordenar → salvar.
- Histórico Global usa prioridade única de datas e desempate estável.
- CPF/CNPJ incorpora carregamento central seguro e escape HTML local.
- Histórico CPF/CNPJ carrega sem necessidade de nova validação.

## Ambiente
`APP_ENVIRONMENT = "development"`

## Banco de dados
Nenhuma alteração de schema ou RLS.
