# Utilitários Municipais v4.3.1.1

## Objetivo

Hotfix isolado da versão 4.3.1 para corrigir a continuidade da sequência no módulo **Número de lote**, sem antecipar funcionalidades planejadas para as próximas etapas da série 4.3.

## Correção

A versão anterior gravava corretamente `lastLotSequence` ao gerar lotes, porém na inicialização o campo **Sequência inicial** já possuía o valor HTML `4`. Por isso, a rotina que deveria restaurar `última sequência + 1` não era executada. Quando a opção **Salvar campos** estava ativa, um valor antigo do formulário também podia ser restaurado.

Na 4.3.1.1:

- `lastLotSequence` passa a ser a fonte autoritativa da sequência;
- ao abrir ou atualizar o aplicativo, **Sequência inicial = última sequência + 1**;
- `loteSequenciaInicial` deixa de integrar a persistência genérica de campos;
- a ação **Reiniciar sequência** continua definindo a última sequência como `00001` e preparando `00002`;
- histórico de lotes e demais módulos permanecem inalterados.

## Banco de dados

Nenhuma alteração de schema. Não há SQL novo para executar no Supabase.
