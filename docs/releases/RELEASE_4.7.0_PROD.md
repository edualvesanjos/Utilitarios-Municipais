# Utilitários Municipais v4.7.0 PROD

## Objetivo

Consolidar em produção as funcionalidades e correções homologadas após a v4.6.3 PROD.

## Alterações homologadas

- Sincronização normal do SuperDB preservada, sem Realtime.
- Preferências operacionais, modelos do montador, sequência de Lotes e histórico recente da UVRM sincronizados.
- Entrada obrigatória por conta SuperDB ou modo Somente local.
- Armazenamento local isolado por usuário autenticado.
- Sincronização e conflitos bloqueados antes da identificação da identidade ativa.
- Modo Somente local sem comunicação com o SuperDB.
- Histórico de versões desacoplado do `index.html`.
- README reorganizado e CHANGELOG mantido como histórico técnico completo.

## Banco de dados

Nenhum SQL adicional é necessário para este fechamento de produção. As estruturas exigidas pelas versões homologadas anteriores devem estar previamente aplicadas no ambiente de produção.
