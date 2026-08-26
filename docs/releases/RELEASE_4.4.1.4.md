# Utilitários Municipais — v4.4.1.4 DEV

## Alterado
- Removidos os botões locais `Limpar` dos históricos de:
  - Montador de Nome de Arquivo;
  - Inscrição;
  - CPF/CNPJ;
  - UVRM;
  - Percentual.
- Lotes e Datas permanecem sem limpeza local de histórico.
- Motivo: a exclusão apenas do `localStorage` não remove os registros sincronizados do Supabase e poderia ser revertida pela sincronização.
- As ações globais de limpeza em Configurações permanecem inalteradas nesta versão.
- Datas: adicionada separação visual entre dados da operação e resultado no histórico.

## Ambiente
`APP_ENVIRONMENT = "development"`

## Banco de dados
Nenhuma alteração de schema ou RLS.
