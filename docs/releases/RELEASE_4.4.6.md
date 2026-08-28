# Utilitários Municipais — v4.4.6 DEV

## Objetivo

Consolidar documentação e interface, corrigindo também a divergência visual do nome de exibição.

## Implementado

- README descreve somente o estado atual.
- Sobre > Histórico de versões possui altura limitada, rolagem vertical e `overflow-x: hidden`.
- `ux31:prefs.displayName` permanece como fonte única do nome de exibição.
- O mesmo nome alimenta Configurações, saudação, cabeçalho e menu da conta.
- Alteração local atualiza o cabeçalho imediatamente.
- Preferência recebida por sincronização atualiza também o campo de Configurações quando ele não está em edição.
- Sincronização normal das preferências é preservada.

## Banco de dados

Sem alteração de schema ou RLS.

## Ambiente

`APP_ENVIRONMENT = "development"`

## Testes recomendados

1. Alterar “Como gostaria de ser chamado?” e sair do campo.
2. Confirmar imediatamente o mesmo nome na saudação e no cabeçalho.
3. Recarregar e confirmar persistência.
4. Alterar no navegador A e sincronizar.
5. No navegador B, recuperar foco/recarregar e confirmar o mesmo valor no campo, saudação e cabeçalho.
6. Confirmar rolagem vertical em Sobre > Histórico de versões e ausência de barra horizontal.
