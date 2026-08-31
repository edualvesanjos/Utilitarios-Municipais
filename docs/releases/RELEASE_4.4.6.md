# Utilitários Municipais — v4.4.6 DEV

## Objetivo

Consolidar documentação e interface, corrigindo também a divergência visual do nome de exibição.

## Implementado

- README descreve somente o estado atual.
- Sobre > Histórico de versões possui altura limitada, rolagem vertical e `overflow-x: hidden`.
- `ux31:prefs.displayName` permanece como fonte única do nome de exibição.
- O mesmo nome alimenta Configurações, saudação, cabeçalho e menu da conta.
- Alteração local atualiza o cabeçalho imediatamente.
- Preferência recebida por sincronização atualiza também o campo de Configurações quando ele não está em edição.
- Sincronização normal das preferências é preservada.

### Central de Documentos
- Interface reorganizada em duas áreas claras: **Modelos** e **Documento**.
- Pesquisa, categoria e ordem foram agrupadas.
- Cards de modelo ficaram mais compactos.
- A lista utiliza rolagem vertical e bloqueia rolagem horizontal.
- Estado inicial mostra apenas a orientação para selecionar ou criar um modelo.
- Ações principais e secundárias foram separadas visualmente.
- O modelo interno anteriormente criado pela aplicação foi removido.
- A Central passa a trabalhar somente com modelos armazenados pelo usuário.
- Todo modelo listado pode ser alterado e excluído.
- Estrutura persistida em `documentTemplates` foi preservada, evitando migração antes da evolução de sincronização.

## Banco de dados

Sem alteração de schema ou RLS.

## Ambiente

`APP_ENVIRONMENT = "development"`

## Testes recomendados

1. Alterar “Como gostaria de ser chamado?” e sair do campo.
2. Confirmar imediatamente o mesmo nome na saudação e no cabeçalho.
3. Recarregar e confirmar persistência.
4. Alterar no navegador A e sincronizar.
5. No navegador B, recuperar foco/recarregar e confirmar o mesmo valor no campo, saudação e cabeçalho.
6. Confirmar rolagem vertical em Sobre > Histórico de versões e ausência de barra horizontal.
7. Abrir a Central de Documentos sem modelos e confirmar o estado inicial vazio.
8. Criar um modelo, editar, salvar, recarregar e confirmar persistência.
9. Excluir o modelo criado e confirmar sua remoção da lista.
10. Confirmar que não existe modelo padrão/protegido.
11. Testar pesquisa, categoria e ordenação.
12. Validar a Central em largura reduzida, sem rolagem horizontal.
