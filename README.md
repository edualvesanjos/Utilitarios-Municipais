# Utilitários Municipais — v4.3.5.4
Versão 4.3.5.4. Hotfix da 4.3.1 para corrigir a persistência da sequência do módulo Número de lote, sem alterar o escopo das próximas etapas da série 4.3. A identificação da conta e a fundação de históricos online permanecem preservadas.


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

O arquivo `SUPABASE_SETUP.sql` também foi atualizado e representa a instalação completa consolidada até a versão 4.3.5.4.

## Ambiente

```bash
npm install
npm run dev
```

O projeto mantém Vite, armazenamento local e sincronização seletiva com Supabase. O arquivo `.env` continua fora do repositório conforme `.gitignore`.

### Ajustes da 4.3.5.4

- Corrigido o reinício da sequência de lotes: após reiniciar, o primeiro lote gerado utiliza `00001` e somente o seguinte avança para `00002`.
- Removido o aviso redundante “Conta conectada ao Supabase” ao retornar para a aba; a sessão passa a ser atualizada silenciosamente.
- Ajustado o painel de modelos da Central de Documentos para eliminar a barra de rolagem vertical interna.
- Removido do Painel principal o indicador redundante de sincronização ao lado da identificação/saudação; o estado permanece no cabeçalho e no rodapé.

### Ajuste da 4.3.5.4

- A descrição de **Novo Lançamento** da Calculadora UVRM agora mantém um histórico local das descrições efetivamente utilizadas.
- Ao digitar novamente no campo **Descrição**, o navegador apresenta as descrições anteriores como sugestões de autopreenchimento.
- O histórico evita duplicidades sem diferenciar maiúsculas/minúsculas, preserva a grafia mais recente e mantém até 30 descrições.
- Campos vazios não são armazenados. A descrição só entra no histórico quando um lançamento válido é adicionado ou atualizado.

### Fechamento da 4.3.5.4

- Corrigido o resíduo visual `\\n` abaixo do campo **Descrição** em Calculadora UVRM > Novo Lançamento, preservando o autopreenchimento.
- Documentação reorganizada: `README.md` permanece na raiz; CHANGELOG, sincronização e relatórios em `docs/`; releases em `docs/releases/`; scripts do Supabase em `sql/`.

### Versão 4.3.5.4

Ativa a sincronização gradual dos históricos operacionais sobre a infraestrutura `history_entries` criada na 4.3.0, com fila offline, migração local e prevenção de duplicidades.

### 4.3.5.4

Novo módulo **Datas** para contar dias entre duas datas e somar/subtrair dias corridos. Inclui também a correção definitiva do resíduo visual `\\n` no campo Descrição da Calculadora UVRM.


### 4.3.5.4
Hotfix funcional para novos testes.

### 4.3.5.4

Hotfix de Configurações: botão Aplicar para Cor principal e alinhamento horizontal das ações de conta/sincronização.

### 4.3.5.4

Hotfix de precisão do total UVRM e refinamentos de layout.

### Alteração manual da versão

A versão corrente é controlada por `APP_VERSION` em `assets/js/core/config.js`. Para iniciar manualmente uma nova versão, altere somente essa constante, por exemplo `const APP_VERSION = "4.4.2";`. CHANGELOG e arquivos de release permanecem históricos.

### 4.3.6 — CPF / CNPJ

Novo módulo independente para normalização e validação de CPF/CNPJ, com histórico local e cópia automática opcional. A sincronização fica para 4.4.x.

### Ambientes Supabase

O projeto suporta ambientes separados de **Desenvolvimento** e **Produção**.

Consulte `docs/AMBIENTES_SUPABASE.md` antes de alterar banco, RLS ou sincronização. O ambiente ativo é definido por `APP_ENVIRONMENT` em `assets/js/core/config.js`.

### 4.3.6.1

Hotfix de interface, backup, históricos e identificação visual do ambiente DEV.

### 4.3.6.2 DEV

Ajuste visual do seletor de tipo em CPF/CNPJ para seguir o padrão do módulo Inscrição.

### 4.4.0 DEV

Início da série 4.4 com Histórico Global sincronizado, integração de Datas e CPF/CNPJ e sincronização offline-first pelo Supabase DEV.

### 4.4.0.1 DEV

Corrige a leitura/escrita dos históricos pela camada `StorageService`, eliminando o prefixo duplicado e restabelecendo upload/download entre navegadores.

### 4.4.0.2 DEV

Oculta campos técnicos no Histórico Global e fortalece a deduplicação entre navegadores ignorando identificadores técnicos.

### 4.4.0.3 DEV

Corrige restauração de abas inválidas e atualiza o Histórico de versões em Sobre.

### 4.4.1 DEV

Confiabilidade da sincronização: fila de pendências, reenvio automático, retomada após offline e estado visível no Histórico Global.

### 4.4.1.1 DEV

Corrige o carregamento inicial e a atualização pós-sincronização do histórico local de CPF/CNPJ.

### 4.4.1.2 DEV

Estabiliza a ordem dos históricos e incorpora as correções definitivas do histórico CPF/CNPJ.

### 4.4.1.3 DEV

Remove limpeza local incoerente de Lotes, atualiza UVRM para 5,2151 e adiciona histórico visual ao módulo Datas.

### 4.4.1.4

Padroniza os históricos sincronizados removendo limpezas apenas locais e melhora a apresentação do histórico de Datas.

### Produção 4.4.1.4

Fechada com `APP_ENVIRONMENT = "production"` e correção da persistência UVRM em `5,2151`.

### 4.4.2 DEV

Piloto de exclusão sincronizada no histórico de CPF/CNPJ usando tombstones em `history_entries`.


## Gerenciamento global de históricos — v4.4.4

A área **Configurações** diferencia duas operações:

- **Limpar históricos deste dispositivo**: remove somente a cópia local; registros do Supabase podem retornar após nova sincronização.
- **Excluir históricos sincronizados**: cria tombstones para os registros sincronizados da conta e propaga a exclusão aos demais navegadores/dispositivos.

A exclusão sincronizada exige usuário conectado, acesso à internet e confirmação dupla.


## CNPJ alfanumérico — v4.4.4

O módulo CPF/CNPJ suporta:

- CPF numérico;
- CNPJ numérico tradicional;
- CNPJ alfanumérico com 12 posições alfanuméricas e 2 dígitos verificadores numéricos;
- detecção automática;
- máscara, opção sem máscara e cópia automática;
- histórico local e sincronizado, incluindo deduplicação e tombstones.

A validação do CNPJ alfanumérico utiliza o cálculo oficial por módulo 11,
convertendo cada caractere alfanumérico pelo valor ASCII menos 48.
