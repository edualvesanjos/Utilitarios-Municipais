# Utilitários Municipais — v4.3.0

Primeira versão da série 4.3. Esta etapa cria a fundação técnica para históricos operacionais sincronizáveis entre dispositivos, preservando o funcionamento local e sem ativar ainda a migração automática dos históricos existentes.

## Principais alterações

- Nova tabela Supabase `history_entries`, dedicada a registros operacionais por usuário.
- Identificação idempotente por `client_id`, permitindo evitar duplicidades em futuras sincronizações entre computadores.
- Registro preparado com módulo, ação, valor, metadados, data da ocorrência, dispositivo e versão do schema.
- RLS e políticas completas para que cada usuário acesse somente os próprios registros.
- Novo `HistoryService` no front-end para criar registros canônicos, manter uma fila local de pendências e oferecer operações de upload/consulta para as próximas etapas.
- Schema local atualizado para a versão 13.
- A sincronização automática dos históricos legados permanece desativada nesta etapa; os históricos atuais continuam funcionando localmente sem alteração de comportamento.
- Mantidas as sincronizações já consolidadas na série 4.2, incluindo preferências, favoritos, navegação e modelos personalizados da Central de Documentos.

## Banco de dados

Para uma instalação que já utiliza a infraestrutura 4.1/4.2, execute no SQL Editor do Supabase:

```text
SUPABASE_HISTORY_4.3.0.sql
```

O script é seguro para reexecução e, ao final, apresenta uma auditoria da tabela `history_entries`. O resultado esperado é RLS habilitado e 4 políticas.

O arquivo `SUPABASE_SETUP.sql` também foi atualizado e representa a instalação completa consolidada até a versão 4.3.0.

## Ambiente

```bash
npm install
npm run dev
```

O projeto mantém Vite, armazenamento local e sincronização seletiva com Supabase. O arquivo `.env` continua fora do repositório conforme `.gitignore`.
