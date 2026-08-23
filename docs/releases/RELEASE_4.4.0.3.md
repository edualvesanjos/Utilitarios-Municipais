# Utilitários Municipais — v4.4.0.3 DEV

## Corrigido
- Gerenciamento de abas ignora e remove automaticamente identificadores inválidos (`null`, `undefined`, vazio ou módulo inexistente).
- Estado antigo `openedTabs` é saneado ao iniciar, sem limpar os demais dados locais.
- `activateTab` não cria mais abas para IDs inválidos.
- Sobre > Histórico de versões atualizado até a versão 4.4.0.3.
- Painel Novidades atualizado para refletir as alterações reais da versão.

## Ambiente
A declaração ativa permanece `APP_ENVIRONMENT = "development"`.

## Banco de dados
Nenhuma alteração de schema ou RLS.
