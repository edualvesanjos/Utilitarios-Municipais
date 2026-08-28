# Utilitários Municipais — v4.4.5 DEV

## Objetivo

Reduzir a dependência do botão manual de sincronização dos históricos e
incorporar a melhoria de usabilidade solicitada no campo CPF/CNPJ.

## Implementado

### Sincronização automática
- Ao abrir ou recarregar o aplicativo.
- Ao recuperar o foco da janela.
- Ao retornar para uma aba visível.
- Ao recuperar a conexão com a internet.
- Tentativas iniciais adicionais quando a sessão Supabase ainda está sendo carregada.
- Intervalo mínimo de 3 segundos entre eventos automáticos próximos.
- Reaproveitamento de `syncAll()` e da proteção contra sincronizações concorrentes.

### CPF/CNPJ
- Duplo clique em campo preenchido executa `input.select()`.
- Funciona para CPF, CNPJ numérico e CNPJ alfanumérico.
- Clique simples, máscara, validação, histórico e cópia permanecem inalterados.

## Preservado
- Sincronização manual.
- Retry/offline recovery.
- Deduplicação.
- Ordenação estável.
- Tombstones.
- Exclusão global sincronizada.

## Banco de dados
Sem alteração de schema ou RLS.

## Ambiente
`APP_ENVIRONMENT = "development"`

## Teste recomendado em dois navegadores
1. Abrir A e B com a mesma conta DEV.
2. Excluir um histórico em A.
3. Em B, alternar para outra janela e voltar: o item deve desaparecer após a sincronização automática.
4. Repetir e recarregar B: o item deve desaparecer sem clicar no botão manual.
5. Colocar B offline, alterar A, voltar B online: a sincronização deve ocorrer automaticamente.
6. Confirmar que o botão manual continua funcionando.
