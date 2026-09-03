# Utilitários Municipais — v4.5.1 DEV

## Objetivo

Reorganizar a Central de Documentos para um fluxo horizontal e mais direto:

**filtrar → selecionar modelo → editar documento**.

## Nova estrutura

### Modelos de documento
O painel ocupa toda a largura no início da Central e contém:

- Pesquisar;
- Categoria;
- Grupo;
- Ordem;
- Limpar filtros;
- Gerenciar grupos;
- combobox larga para seleção do modelo.

### Documento
Após a seleção do modelo, o editor ocupa toda a largura disponível.

Os metadados do modelo agora são:
- Título;
- Categoria;
- Grupo.

## Grupos

Foi adicionado `utilitariosMunicipais:documentGroups` para manter a lista de grupos cadastrados no dispositivo.

O gerenciador permite:
- criar grupo;
- renomear grupo;
- excluir grupo.

Quando um grupo é excluído, os modelos não são apagados. Eles passam para **Sem grupo**.

## Compatibilidade de dados

Formato anterior:

```js
{ id, title, category, content }
```

Formato atual:

```js
{ id, title, category, group, content }
```

Modelos antigos sem `group` continuam sendo carregados normalmente e são tratados como **Sem grupo**.

O campo `group` integra o próprio registro do modelo, portanto o formato sincronizado existente de `documentTemplates` continua aceitando o registro ampliado sem mudança de schema.

A lista independente de grupos não altera a arquitetura de sincronização nesta versão.

## Fora do escopo

- Supabase Realtime;
- alterações de schema;
- alterações de RLS;
- reformulação da sincronização da Central de Documentos.

## Ambiente

`APP_ENVIRONMENT = "development"`

## Testes prioritários

1. Criar modelo sem grupo.
2. Criar grupo e atribuir a um modelo.
3. Criar mais de um grupo.
4. Filtrar por Categoria.
5. Filtrar por Grupo.
6. Pesquisar por título, grupo e conteúdo.
7. Testar Ordem por Título, Categoria e Grupo.
8. Selecionar modelos com nomes longos na combobox.
9. Renomear grupo e confirmar atualização dos modelos.
10. Excluir grupo e confirmar que os modelos passam para Sem grupo.
11. Editar, salvar e excluir modelos.
12. Testar modelos antigos já existentes no localStorage.
13. Testar Full HD, meia tela e mobile.
14. Confirmar ausência de rolagem horizontal.
