# Utilitários Municipais — v4.5.1.2 PRODUÇÃO

## Objetivo

Corrigir o desalinhamento vertical do painel principal após a remoção da antiga barra superior de módulos.

## Correção

No arquivo:

`assets/css/v4/sidebar-45.css`

a regra da área principal passou a incluir:

```css
.v45-sidebar ~ .tab-panel {
    grid-column: 2;
    min-width: 0;
    margin-top: -4px;
}
```

O ajuste sobe apenas o painel principal e mantém a sidebar na posição atual.

## Escopo

- ajuste exclusivamente visual;
- sem alterações de funcionalidades;
- sem mudanças no Supabase;
- sem mudanças de schema;
- sem mudanças de RLS;
- sem Realtime;
- sem alterações na arquitetura de sincronização.

## Ambiente

`APP_ENVIRONMENT = "production"`
