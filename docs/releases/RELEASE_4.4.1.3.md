# Utilitários Municipais — v4.4.1.3 DEV

## Alterado
- Lotes: removido o botão `Limpar` do Histórico de gerações. A ação anterior apagava apenas o `localStorage` e poderia ser revertida pela sincronização.
- UVRM: valor padrão alterado de R$ 39,99 para R$ 5,2151, inclusive em restauração e fallbacks.
- Datas: incluído painel visível de Histórico de cálculos.
- Datas: cada registro permite copiar o resultado.
- Datas: histórico com rolagem somente vertical e sem botão de limpeza local.
- Datas: painel é atualizado no carregamento e após mesclagem da sincronização.

## Ambiente
`APP_ENVIRONMENT = "development"`

## Banco de dados
Nenhuma alteração de schema ou RLS.
