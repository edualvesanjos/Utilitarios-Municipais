# Utilitários Municipais — v4.5.0.6 DEV

## Objetivo

Ajustar a distribuição vertical da sidebar para que, em resoluções e alturas usuais, o conteúdo caiba sem necessidade de rolagem.

## Alterações

- redução do padding externo da sidebar;
- redução controlada da altura do botão Recolher;
- campo de pesquisa mais compacto;
- menor espaçamento entre grupos de navegação;
- cabeçalhos dos grupos mais compactos;
- itens de navegação com altura mínima reduzida;
- rodapé e controles de aparência mais compactos;
- compactação adicional para telas com até 820 px de altura.

## Regra de overflow

A barra de rolagem não foi escondida.

`overflow-y: auto` permanece ativo para funcionar como proteção quando a altura disponível for realmente insuficiente.

## Preservado

- sidebar expandida e recolhida;
- persistência do estado recolhido;
- menu móvel;
- conta compacta no cabeçalho;
- responsividade para meia tela Full HD;
- Histórico de versões interativo;
- sincronização atual;
- todos os módulos existentes.

## Ambiente

`APP_ENVIRONMENT = "development"`

## Testes prioritários

1. Testar sidebar expandida em Full HD.
2. Confirmar ausência de scrollbar vertical quando todo o conteúdo couber.
3. Testar em janela com menor altura.
4. Confirmar que a scrollbar aparece somente quando necessária.
5. Testar sidebar recolhida.
6. Testar meia tela Full HD.
7. Testar viewport móvel.
8. Verificar acesso a todos os itens de navegação.
9. Verificar controles de tema e fonte.
10. Fazer regressão rápida do Histórico de versões e da conta no cabeçalho.
