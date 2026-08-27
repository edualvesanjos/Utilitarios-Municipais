# Utilitários Municipais — v4.4.0.1 DEV

Hotfix da camada de sincronização do Histórico Global.

## Corrigido

- `HistoryService` não duplica mais o prefixo `utilitariosMunicipais:` ao acessar históricos locais.
- O `StorageService` passa a receber apenas os sufixos:
  - `fileHistory`
  - `registrationHistory`
  - `lotHistory`
  - `uvrmHistory`
  - `percentageHistory`
  - `datesHistory`
  - `documentoFiscalHistory`
- Corrigida a varredura de históricos locais para envio ao Supabase.
- Corrigida a mesclagem de registros remotos no navegador que recebe a sincronização.
- Datas permanece registrado como `module = datas`.
- CPF/CNPJ permanece registrado como `module = cpf-cnpj`.
- Mensagem de sincronização passa a informar quantos registros foram enviados e recebidos.

## Ambiente

A declaração ativa foi validada como:

`APP_ENVIRONMENT = "development"`

## Banco de dados

Nenhuma alteração de schema ou RLS. Não é necessário executar novo SQL.
