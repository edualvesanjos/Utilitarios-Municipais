# Utilitários Municipais — v4.5.0.5 DEV

## Objetivo

Corrigir a desconfiguração visual encontrada na Etapa 3 do Histórico de versões.

## Causa identificada

O CSS legado de `.about-timeline article` ainda aplicava:

```css
grid-template-columns: 70px 1fr;
```

Esse estilo também atingia os novos cartões interativos, comprimindo o cabeçalho da versão em aproximadamente 70 px e fazendo o texto aparecer verticalizado.

## Correções

- neutralização do grid legado nos cartões interativos;
- cartão passa a usar toda a largura disponível;
- versão e descrição permanecem horizontais;
- seta de expansão permanece alinhada à direita;
- detalhes em duas colunas no desktop;
- uma coluna em telas menores;
- rolagem vertical interna mantida;
- rolagem horizontal bloqueada.

## Preservado

- expansão/recolhimento;
- uma versão aberta por vez;
- navegação por teclado;
- sidebar;
- conta no cabeçalho;
- responsividade geral;
- sincronização existente.

## Ambiente

`APP_ENVIRONMENT = "development"`

## Testes prioritários

1. Abrir Sobre → Histórico de versões.
2. Confirmar que `4.5.0.5` aparece horizontalmente.
3. Expandir e recolher versões.
4. Confirmar seta à direita.
5. Verificar duas colunas nos detalhes em desktop.
6. Verificar uma coluna em telas menores.
7. Confirmar rolagem vertical sem barra horizontal.
8. Testar tema claro e escuro.
