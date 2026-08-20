# Utilitários Municipais — v4.3.5.2
Versão 4.3.5.2. Hotfix da 4.3.1 para corrigir a persistência da sequência do módulo Número de lote, sem alterar o escopo das próximas etapas da série 4.3. A identificação da conta e a fundação de históricos online permanecem preservadas.


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

O arquivo `SUPABASE_SETUP.sql` também foi atualizado e representa a instalação completa consolidada até a versão 4.3.5.2.

## Ambiente

```bash
npm install
npm run dev
```

O projeto mantém Vite, armazenamento local e sincronização seletiva com Supabase. O arquivo `.env` continua fora do repositório conforme `.gitignore`.

### Ajustes da 4.3.5.2

- Corrigido o reinício da sequência de lotes: após reiniciar, o primeiro lote gerado utiliza `00001` e somente o seguinte avança para `00002`.
- Removido o aviso redundante “Conta conectada ao Supabase” ao retornar para a aba; a sessão passa a ser atualizada silenciosamente.
- Ajustado o painel de modelos da Central de Documentos para eliminar a barra de rolagem vertical interna.
- Removido do Painel principal o indicador redundante de sincronização ao lado da identificação/saudação; o estado permanece no cabeçalho e no rodapé.

### Ajuste da 4.3.5.2

- A descrição de **Novo Lançamento** da Calculadora UVRM agora mantém um histórico local das descrições efetivamente utilizadas.
- Ao digitar novamente no campo **Descrição**, o navegador apresenta as descrições anteriores como sugestões de autopreenchimento.
- O histórico evita duplicidades sem diferenciar maiúsculas/minúsculas, preserva a grafia mais recente e mantém até 30 descrições.
- Campos vazios não são armazenados. A descrição só entra no histórico quando um lançamento válido é adicionado ou atualizado.

### Fechamento da 4.3.5.2

- Corrigido o resíduo visual `\\n` abaixo do campo **Descrição** em Calculadora UVRM > Novo Lançamento, preservando o autopreenchimento.
- Documentação reorganizada: `README.md` permanece na raiz; CHANGELOG, sincronização e relatórios em `docs/`; releases em `docs/releases/`; scripts do Supabase em `sql/`.

### Versão 4.3.5.2

Ativa a sincronização gradual dos históricos operacionais sobre a infraestrutura `history_entries` criada na 4.3.0, com fila offline, migração local e prevenção de duplicidades.

### 4.3.5.2

Novo módulo **Datas** para contar dias entre duas datas e somar/subtrair dias corridos. Inclui também a correção definitiva do resíduo visual `\\n` no campo Descrição da Calculadora UVRM.


### 4.3.5.2
Hotfix funcional para novos testes.

### 4.3.5.2

Hotfix de Configurações: botão Aplicar para Cor principal e alinhamento horizontal das ações de conta/sincronização.
