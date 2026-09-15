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


## v4.6.0 DEV — Etapa 2 (correção)

- Corrige a persistência de **Como gostaria de ser chamado?** em `profiles.display_name`.
- O evento `um:display-name-changed` agora chama `ensureProfile()` diretamente quando existe sessão autenticada.
- A sincronização geral de `user_data`, `sync_log` e `history_entries` permanece fora do escopo desta etapa.


## v4.6.0 DEV — Etapa 3
- `user_data` ativo no SuperDB.
- SELECT pelo SDK; upsert via REST homologado.
- `sync_log` ainda não é gravado.
- `history_entries` permanece para etapa posterior.


### v4.6.0 DEV — Etapa 3 (correção)
- Corrige a leitura de `user_data` no SuperDB.
- O SDK `@superdb/client@0.2.2` não oferece o modificador `.in()` usado pelo fluxo legado do Supabase.
- `fetchRemoteRows()` agora faz SELECT autenticado por `user_id` e filtra os `data_type` conhecidos na aplicação.
- O REST upsert permanece como estratégia de gravação.


### v4.6.0 DEV — Etapa 3 (correção 2)

- Corrige `updated_at` no REST upsert de `user_data`.
- Cada lote de sincronização passa a enviar explicitamente o timestamp de atualização.
- `documents` também passa a enviar `updated_at`.
- `Última sincronização` passa a registrar o instante real em que o upload foi concluído com sucesso.
- `Última atualização remota` continua baseada no timestamp retornado pelo backend.


### v4.6.0 DEV — Etapa 3 (correção 5)
- Parte da Correção 2; Correções 3 e 4 descartadas.
- Preserva a instância do cliente após erro 401 e adiciona diagnóstico DEV do ciclo de autenticação.
- Permite nova tentativa sem reload após credenciais inválidas.
