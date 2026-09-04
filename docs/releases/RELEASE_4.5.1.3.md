# Utilitários Municipais — v4.5.1.3 DEV

## Objetivo

Consolidar o alinhamento visual do painel principal após a retirada da antiga barra superior de módulos.

## Correção aplicada

Arquivo: `assets/css/v4/sidebar-45.css`

```css
.v45-sidebar ~ .tab-panel {
    grid-column: 2;
    min-width: 0;
    margin-top: 0px;
}
```

O valor `0px` substitui o ajuste provisório anterior de `-4px`.

## Escopo

- ajuste visual;
- revisão de regressão do layout;
- sem alterações funcionais;
- sem mudanças no Supabase;
- sem mudanças de schema;
- sem mudanças de RLS;
- sem Supabase Realtime;
- sem alterações na arquitetura de sincronização.

## Ambiente

`APP_ENVIRONMENT = "development"`
