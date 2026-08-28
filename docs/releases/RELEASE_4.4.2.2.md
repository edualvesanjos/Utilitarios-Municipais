# Utilitários Municipais — v4.4.2.2 DEV

## Corrigido

- Corrigida colisão global entre os manipuladores de exclusão de Inscrição, Lotes e Percentual.
- Cada módulo agora utiliza um manipulador de exclusão com nome próprio.
- Inscrição e Lotes passam a remover imediatamente o registro correto da lista local.
- A atualização visual dos históricos após sincronização remota foi reforçada.
- Mantido o mecanismo de tombstones (`action = delete`) já validado na 4.4.2.

## Causa técnica

Na 4.4.2.1, Inscrição, Lotes e Percentual declaravam globalmente a função
`deleteSyncedHistoryItem`. Como os módulos são scripts clássicos, uma declaração
podia substituir a anterior. Assim, um botão de exclusão podia executar a rotina
de outro módulo, embora o tombstone ainda fosse registrado no banco.

## Ambiente

`APP_ENVIRONMENT = "development"`

## Banco de dados

Sem alteração de schema ou RLS.
