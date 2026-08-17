# Utilitários Municipais — v4.3.1.1
Versão 4.3.1.1. Hotfix da 4.3.1 para corrigir a persistência da sequência do módulo Número de lote, sem alterar o escopo das próximas etapas da série 4.3. A identificação da conta e a fundação de históricos online permanecem preservadas.


## Principais alterações

- Corrigida a sequência do módulo Número de lote: após gerar lotes, fechar, atualizar ou reabrir o site, a próxima sequência parte da última sequência efetivamente gravada.
- A sequência inicial não depende mais da preferência genérica Salvar campos; o controle próprio `lastLotSequence` é a fonte autoritativa.

- Novo componente de conta no canto superior direito do cabeçalho, exibindo o nome de exibição e o estado Online/Offline.
- Menu da conta com e-mail, acesso a Conta e sincronização, ação Sincronizar agora e Sair da conta.
- Quando não há autenticação, o cabeçalho apresenta Entrar / Somente local e oferece acesso ao login.
- Rodapé ampliado com estado técnico independente: Somente local, Sincronizando, Sincronizado, Pendente, Offline, Conflito ou Erro.
- Última sincronização exibida no rodapé quando disponível.
- Mantida a estrutura de histórico online da 4.3.0, ainda sem migração automática dos históricos legados.

## Banco de dados

Para uma instalação que já utiliza a infraestrutura 4.1/4.2, execute no SQL Editor do Supabase:

```text
SUPABASE_HISTORY_4.3.0.sql
```

O script é seguro para reexecução e, ao final, apresenta uma auditoria da tabela `history_entries`. O resultado esperado é RLS habilitado e 4 políticas.

O arquivo `SUPABASE_SETUP.sql` também foi atualizado e representa a instalação completa consolidada até a versão 4.3.1.1.

## Ambiente

```bash
npm install
npm run dev
```

O projeto mantém Vite, armazenamento local e sincronização seletiva com Supabase. O arquivo `.env` continua fora do repositório conforme `.gitignore`.
