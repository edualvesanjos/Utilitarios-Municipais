# Utilitários Municipais v4.6.0 DEV — Etapa 2

Etapa de migração controlada para o SuperDB.

## Escopo desta etapa

- SuperDB passa a ser o backend ativo apenas na branch DEV.
- Autenticação, restauração de sessão e `profiles` são habilitados no SuperDB.
- `user_data`, `sync_log` e `history_entries` ainda não são sincronizados nesta etapa.
- Supabase permanece carregado como backend legado/rollback, mas não é o provider ativo.
- O `profiles` usa SELECT + INSERT/UPDATE porque o SDK `@superdb/client@0.2.2` não expõe `.upsert()`.

## Configuração

Copie `.env.example` para `.env` e informe a mesma Anon Key usada no laboratório `utilitariosmunicipais_teste`.

## Testes

1. Abrir o site e confirmar no console `Cliente SuperDB inicializado.`
2. Entrar com a conta DEV já existente no SuperDB.
3. Confirmar que o cabeçalho mostra a conta autenticada.
4. Recarregar a página e confirmar restauração da sessão.
5. Conferir no SuperDB que `profiles` recebeu exatamente 1 registro do usuário.
6. Alterar o nome de exibição, sair/entrar e conferir a atualização do profile.
7. Confirmar que `user_data`, `sync_log` e `history_entries` continuam vazias nesta etapa.
