# Utilitários Municipais — v4.5.2.4 DEV

## Objetivo

Ativar a sincronização efetiva de modelos, grupos e categorias da Central de Documentos entre navegadores/dispositivos, aproveitando a infraestrutura existente do Supabase.

## Implementações

### Grupo `documents`

O grupo passa a transportar:

- `utilitariosMunicipais:documentTemplates`
- `utilitariosMunicipais:documentGroups`
- `utilitariosMunicipais:documentCategories`

Não foi criada nova tabela. Os três conjuntos permanecem dentro do registro `documents` da tabela `user_data`.

### Compatibilidade com dados remotos existentes

Quando o registro remoto `documents` ainda contém apenas os templates, a migração acrescenta somente as chaves ausentes de grupos e categorias.

Os templates que já estão no Supabase não são substituídos durante essa migração estrutural.

### Sincronização automática

O evento `um:documents-changed`, introduzido na versão anterior, passa a acionar diretamente `scheduleAutoSync()`.

O monitoramento periódico existente permanece como mecanismo complementar.

### Migração local

A chave:

`utilitariosMunicipais:online:documents4524`

garante que instalações provenientes das versões 4.5.2.1, 4.5.2.2 ou 4.5.2.3 sejam marcadas para comparação/sincronização na primeira execução desta versão.

### Atualização da interface

Após download dos dados online, `refreshDocumentCentral` atualiza modelos, filtros, grupos e categorias na Central.

## Teste recomendado em dois navegadores

1. No Navegador A, criar uma categoria e um grupo.
2. Criar ou alterar um modelo usando esses valores.
3. Executar a sincronização.
4. No Navegador B, usar a mesma conta e executar a sincronização.
5. Confirmar o recebimento do modelo, da categoria e do grupo.
6. Alterar no Navegador B e repetir no sentido inverso.
7. Testar também renomeação e exclusão de categoria/grupo.

## Escopo técnico

- `APP_VERSION = "4.5.2.4"`
- `APP_ENVIRONMENT = "development"`
- `SYNC_SCHEMA_VERSION = 6`
- sem novas tabelas Supabase;
- sem alterações de RLS;
- sem Supabase Realtime.
