# Utilitários Municipais — versão 4.2.6

## Objetivo

Validar a capacidade de sincronização do sistema com um conjunto de dados funcional e editável antes da etapa 4.3.

## Implementação

A chave local `utilitariosMunicipais:documentTemplates`, utilizada para os modelos personalizados da Central de Documentos, passa a compor o grupo remoto `documents` em `public.user_data`.

Os modelos padrão continuam no código-fonte e não são enviados ao Supabase. Isso reduz volume, evita duplicação e permite que apenas o conteúdo criado pelo usuário seja sincronizado.

## Banco de dados

Nenhuma tabela nova é necessária. A estrutura criada por `SUPABASE_SETUP.sql` já suporta qualquer `data_type`, incluindo `documents`. As políticas RLS existentes continuam isolando os registros pelo `user_id` autenticado.

## Testes prioritários

- criação de modelo no dispositivo A e leitura no B;
- edição no B e atualização no A;
- exclusão propagada;
- alteração offline e sincronização após reconexão;
- conflito real com alterações concorrentes em dois dispositivos;
- conferência no Supabase de uma linha `data_type = 'documents'` para o usuário.
