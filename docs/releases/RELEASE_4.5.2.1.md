# Utilitários Municipais — v4.5.2.1 DEV

## Objetivo

Evoluir a Central de Documentos com recursos locais de gerenciamento e portabilidade dos modelos.

## Implementações

### Duplicar modelo
Cria uma cópia independente do modelo selecionado, mantendo categoria, grupo e conteúdo e acrescentando `(cópia)` ao título.

### Exportar modelos
Exporta todos os modelos e grupos em arquivo JSON estruturado.

### Importar modelos
Importa pacotes JSON com validação. Modelos exatamente iguais aos existentes são ignorados, colisões de ID recebem novos identificadores e dados locais não são sobrescritos.

## Persistência

Mantidas:
- `utilitariosMunicipais:documentTemplates`
- `utilitariosMunicipais:documentGroups`
- `utilitariosMunicipais:documentSort`

## Escopo técnico

- `APP_VERSION = "4.5.2.1"`
- `APP_ENVIRONMENT = "development"`
- sem mudanças de schema;
- sem mudanças de RLS;
- sem Supabase Realtime;
- sem alterações na arquitetura de sincronização.
