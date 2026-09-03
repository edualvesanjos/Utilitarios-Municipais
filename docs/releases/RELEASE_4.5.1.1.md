# Utilitários Municipais — v4.5.1.1 DEV

## Objetivo

Aplicar a correção aprovada para **Limpar filtros** na Central de Documentos e consolidar a **sidebar** como única navegação principal entre módulos.

## Central de Documentos

Ao clicar em **Limpar filtros**:

1. Pesquisa é limpa;
2. Categoria retorna para Todas;
3. Grupo retorna para Todos;
4. Ordem retorna para Título;
5. o modelo atualmente selecionado é desmarcado;
6. a combobox Modelo volta para **“Selecione um modelo de documento...”**;
7. o painel Documento volta ao estado inicial **“Selecione um modelo”**.

A ação não exclui nem modifica modelos salvos.

## Navegação

A antiga barra superior de módulos/abas abertas foi removida.

A navegação passa a seguir esta arquitetura:

- **Sidebar:** navegação principal entre módulos;
- **Cabeçalho:** identidade da aplicação, ambiente e Conta/Sincronização;
- **Mobile:** botão de menu continua abrindo a sidebar.

Também foram removidos o código e os estilos que existiam apenas para a barra de abas abertas (`uxTabsBar`).

## Fora do escopo

- Supabase Realtime;
- mudanças de schema;
- mudanças de RLS;
- alterações na arquitetura de sincronização;
- mudanças funcionais adicionais na Central de Documentos.

## Ambiente

`APP_ENVIRONMENT = "development"`

## Testes prioritários

1. Abrir um modelo na Central de Documentos.
2. Alterar um ou mais filtros.
3. Clicar em Limpar filtros.
4. Confirmar a mensagem “Selecione um modelo de documento...” na combobox.
5. Confirmar o painel “Selecione um modelo”.
6. Reabrir o mesmo modelo e verificar que seu conteúdo não foi alterado.
7. Navegar por todos os módulos usando somente a sidebar.
8. Confirmar que a antiga barra horizontal de módulos não é mais exibida.
9. Confirmar o botão Conta/Sincronização no cabeçalho.
10. Testar sidebar expandida, recolhida, meia tela e mobile.
