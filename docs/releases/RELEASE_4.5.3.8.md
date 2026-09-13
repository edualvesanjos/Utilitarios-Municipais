# Utilitários Municipais — v4.5.3.8 DEV

## Objetivo
Refatorar a sidebar móvel em vez de continuar acumulando correções pontuais.

## Diagnóstico
Foram identificados 7 blocos responsivos antigos relacionados à sidebar em breakpoints móveis.
Essas regras foram acumuladas ao longo da série 4.5.x e aplicavam combinações diferentes de
`display`, `grid`, `flex`, larguras, overflow e posicionamento.

## Correção
- remoção das regras mobile concorrentes da sidebar;
- criação de uma única fonte de verdade para `max-width: 820px`;
- grid vertical interno com quatro áreas: topo, pesquisa, navegação e rodapé;
- navegação com rolagem vertical e sem overflow horizontal;
- backdrop externo mantido abaixo da sidebar;
- nenhum CSS específico para Safari, Edge ou Chrome.

## Homologação
Usar o fluxo automatizado:
develop -> PR homolog -> GitHub Actions -> GitHub Pages de homologação.

## Testes prioritários
- Safari iOS 26;
- Edge iOS 26;
- Chrome iOS 26;
- se disponível, Chrome/Edge Android;
- abrir/fechar sidebar;
- campo Pesquisar ferramenta;
- todos os grupos e módulos;
- rolagem vertical;
- backdrop e toque fora;
- regressão desktop.
