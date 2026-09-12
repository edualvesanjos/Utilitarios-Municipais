# Utilitários Municipais — v4.5.2.3 DEV

## Objetivo
Evoluir a persistência e a sincronização da Central de Documentos após a estabilização de modelos, grupos e categorias.

## Implementações
- `window.refreshDocumentCentral` centraliza a atualização da interface após hidratação.
- `um:documents-changed` sinaliza alterações locais de modelos, grupos e categorias.
- A infraestrutura existente foi preservada e recebeu pontos de integração sem alteração estrutural arriscada.
- Compatibilidade com os dados locais anteriores preservada.

## Escopo técnico
- `APP_VERSION = "4.5.2.3"`
- `APP_ENVIRONMENT = "development"`
- sem novo schema Supabase;
- sem alteração de RLS;
- sem Supabase Realtime.
