# Utilitários Municipais — v4.5.3.5 DEV

## Objetivo
Corrigir a causa raiz do backdrop da sidebar móvel no Safari/Edge do iOS.

## Diagnóstico
O elemento `v45SidebarBackdrop` estava dentro da sidebar. Como a sidebar usa `transform` para abrir/fechar, o WebKit cria um containing block e passa a tratar o `position: fixed` do backdrop em relação ao próprio menu, impedindo que cubra corretamente o restante da viewport.

## Correção
- backdrop movido para fora da sidebar;
- sidebar e backdrop passam a ser elementos irmãos;
- backdrop em `z-index: 2050`;
- sidebar em `z-index: 2100`;
- backdrop ocupa a viewport completa;
- conteúdo externo bloqueado para toque;
- sidebar permanece interativa;
- regras provisórias anteriores removidas para evitar conflitos de CSS.

## Testes
- Safari no iOS 26;
- Edge no iOS 26;
- abrir menu;
- tocar em itens;
- tocar no backdrop para fechar;
- alternar entre módulos;
- teste de regressão desktop.
