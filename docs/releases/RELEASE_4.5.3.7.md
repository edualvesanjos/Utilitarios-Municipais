# Utilitários Municipais — v4.5.3.7 DEV

## Objetivo
Corrigir a regressão mobile observada na v4.5.3.6.

## Diagnóstico
A v4.5.3.6 adicionou uma nova composição flexível à sidebar e aplicou `order`,
`width: 100%` e regras de layout a seletores internos. No iOS isso alterou o
fluxo original e deslocou a navegação para a direita, deixando essencialmente
o campo Pesquisar ferramenta visível.

## Correção
- removido integralmente o bloco regressivo da v4.5.3.6;
- mantida a estrutura original da sidebar;
- sem `flex-direction` ou `order` adicionais;
- navegação limitada horizontalmente sem reposicionamento;
- overflow horizontal bloqueado;
- backdrop externo da v4.5.3.5 preservado.

## Homologação
Publicar pelo fluxo automatizado:
develop -> PR homolog -> GitHub Actions -> GitHub Pages de homologação.

## Testes prioritários
- Safari no iOS 26;
- Edge no iOS 26;
- campo Pesquisar ferramenta;
- visibilidade completa dos menus;
- toque nos módulos;
- rolagem vertical;
- backdrop;
- tocar fora para fechar;
- regressão desktop.
