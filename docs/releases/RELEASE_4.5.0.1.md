# Utilitários Municipais — v4.5.0.1 DEV

## Objetivo

Correção responsiva da v4.5.0 DEV — Etapa 1.

## Correções

- ajuste do Dashboard em largura intermediária;
- reorganização antecipada do painel de Indicadores, Atalhos e Dica rápida;
- redução da sidebar nessa faixa de largura;
- cards de ferramentas adaptados para duas ou uma coluna;
- prevenção de sobreposição e rolagem horizontal inesperada.

## Preservado

- navegação lateral da v4.5.0;
- todos os módulos;
- históricos locais e sincronizados;
- sincronização automática atual;
- Central de Documentos;
- preferências do usuário.

## Fora do escopo

A Etapa 2 permanece separada. Nela serão avaliados:
- sidebar recolhível;
- comportamento móvel deslizante;
- ícone compacto de perfil na base da sidebar, com cor representando o estado da conexão/sincronização.

Supabase Realtime permanece fora do roadmap imediato.

## Ambiente

`APP_ENVIRONMENT = "development"`

## Testes prioritários

1. Janela maximizada em Full HD.
2. Janela em aproximadamente metade de um monitor Full HD.
3. Redimensionamento gradual entre desktop e tablet.
4. Cards de Acesso rápido.
5. Painel Indicadores/Atalhos/Dica rápida.
6. Todos os módulos pela sidebar.
7. Ausência de sobreposição e rolagem horizontal.
