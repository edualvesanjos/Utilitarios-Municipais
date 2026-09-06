# Utilitários Municipais — v4.5.2.2 DEV

## Objetivo

Adicionar gerenciamento de categorias à Central de Documentos antes de ampliar sua sincronização online.

## Implementações

### Gerenciar categorias
Novo botão `Gerenciar categorias` permite:
- criar categorias;
- renomear categorias;
- excluir categorias.

Ao excluir uma categoria, nenhum modelo é apagado. Os modelos vinculados passam para `Sem categoria`.

### Persistência
Nova chave local:
- `utilitariosMunicipais:documentCategories`

As categorias padrão são usadas apenas na inicialização da nova chave. Depois disso, a lista passa a refletir as alterações do usuário.

### Filtros e edição
Os campos de categoria do filtro e do editor são preenchidos dinamicamente. Existe também a opção virtual `Sem categoria`.

### Exportação e importação
O pacote JSON passa para `schema_version: 2` e inclui:
- `categories`;
- `groups`;
- `templates`.

Pacotes antigos, sem `categories`, continuam aceitos. Categorias encontradas diretamente nos modelos importados também são incorporadas.

## Escopo técnico

- `APP_VERSION = "4.5.2.2"`
- `APP_ENVIRONMENT = "development"`
- sem mudanças no Supabase;
- sem mudanças de schema;
- sem mudanças de RLS;
- sem Supabase Realtime;
- sem alterações na arquitetura de sincronização online.
