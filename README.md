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


## v4.6.0.6 DEV — Etapa 3

- Corrige atualização imediata da UI após logout no SuperDB.
- Mantém armazenamento local após encerramento da sessão.
- Mantém a migração DEV via Backend Adapter; produção/main continua fora desta etapa.


## v4.6.0.7 DEV — Etapa 4

- Ativa `sync_log` no SuperDB DEV.
- Mantém `history_entries` fora da migração nesta etapa.


## v4.6.0.8 DEV — Etapa 4

- Adiciona renovação automática do JWT do SuperDB com `refreshSession()`.
- Trata sessão persistida expirada e expiração durante a sincronização.
- Preserva dados locais quando uma sessão não puder ser renovada.


## v4.6.0.9 DEV — Etapa 4

- Feedback explícito para sincronização manual sem alterações.
- Campo Cor principal passa a refletir a preferência recuperada do backend.


## v4.6.1 DEV — Etapa 5

- Inicia `history_entries` no SuperDB DEV.
- Escrita usa REST upsert idempotente por `user_id + client_id`.
- Outbox, merge remoto e tombstones permanecem preservados.


## v4.6.1.2 DEV — Etapa 5

Diagnóstico seguro da estrutura retornada por `getDataPlaneToken()`, sem exposição do token.


## v4.6.1.3 DEV — Etapa 5

Corrige a obtenção do Data Plane token para `history_entries`, aceitando o retorno direto em string do SuperDB 0.2.2.



## v4.6.1.4 DEV — Etapa 5

O envio REST de `history_entries` passa a usar a mesma rota e os mesmos headers
do upsert REST homologado no laboratório SuperDB v0.2.0.


## v4.6.1.5 DEV — Compatibilidade de validação

- Protege os listeners do `ValidationCenter` contra `Event.target` que não seja um `Element`.
- Corrige o erro observado no Firefox sem alterar as regras de validação dos campos.
