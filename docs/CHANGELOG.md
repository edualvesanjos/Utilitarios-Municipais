# Changelog

## 4.4.6

### Interface
- Histórico de versões com rolagem vertical e sem rolagem horizontal.
- Nome de exibição unificado entre Configurações, saudação e cabeçalho.
- Cabeçalho atualizado imediatamente após alteração do nome.
- Campo de Configurações atualizado após recebimento de preferências sincronizadas.

### Documentação
- README consolidado para descrever somente o estado atual.
- Histórico detalhado mantido no CHANGELOG e em `docs/releases/`.

### Banco de dados
- Sem alteração de schema ou RLS.


## 4.4.5

### Produção
- Testes DEV aprovados e pacote fechado para produção.

### Adicionado
- Sincronização automática dos históricos ao iniciar/recarregar o aplicativo.
- Sincronização ao recuperar foco, tornar a aba visível e retornar ao modo online.
- Controle de intervalo para evitar chamadas automáticas redundantes.
- Seleção de todo o CPF/CNPJ por duplo clique no campo preenchido.

### Mantido
- Botão manual "Sincronizar histórico".
- Retry após falhas e recuperação offline.
- Deduplicação, ordenação estável e tombstones.
- Compatibilidade com CPF, CNPJ numérico e CNPJ alfanumérico.

### Banco de dados
- Sem alteração de schema ou RLS.


## 4.4.4

### Adicionado
- Suporte ao CNPJ alfanumérico.
- Máscara para 12 posições alfanuméricas e 2 dígitos verificadores numéricos.
- Validação oficial dos dígitos verificadores por módulo 11.

### Mantido
- CPF numérico.
- CNPJ numérico tradicional.
- Histórico, sincronização, deduplicação e exclusão por tombstones.

### Manutenção
- `cpf-cnpj.js` reformatado e indentado.

### Banco de dados
- Sem alteração de schema ou RLS.


## 4.4.3

### Adicionado
- Separação entre limpeza local e exclusão sincronizada dos históricos.
- Exclusão global sincronizada com tombstones para todos os módulos.
- Confirmação dupla para exclusão sincronizada.

### Alterado
- Removida a opção ambígua "Todos os históricos" da limpeza seletiva.
- Removido o antigo botão "Resetar históricos".
- "Apagar todos os dados" agora explicita que a operação é apenas local.
- `configuracoes.js` reformatado para facilitar manutenção.

### Banco de dados
- Sem alteração de schema ou RLS.


## 4.4.2.2

### Corrigido
- Isolados os manipuladores de exclusão de Inscrição, Lotes e Percentual.
- Corrigida a remoção local e a atualização visual após sincronização remota.

### Banco de dados
- Sem alteração de schema ou RLS.


## 4.4.2.1

### Adicionado
- Exclusão sincronizada em todos os históricos dos módulos.
- Enfileiramento imediato do histórico de Datas.

### Banco de dados
- Sem alteração de schema ou RLS.


## 4.4.2

### Adicionado
- Piloto de exclusão sincronizada no histórico de CPF/CNPJ.
- Tombstones em `history_entries` com `action = delete`.
- Propagação de exclusões entre navegadores.

### Alterado
- Mesclagem remota passa a respeitar tombstones antes de reimportar registros.

### Banco de dados
- Sem alteração de schema ou RLS.


## 4.4.1.4

### Corrigido
- Persistência do valor padrão UVRM mantém `5,2151` após recarregar o site.

### Alterado
- Removidas limpezas locais dos históricos sincronizados dos módulos.
- Mantidas, por enquanto, as ações administrativas globais de Configurações.
- Melhorada a separação visual do histórico de Datas.

### Banco de dados
- Sem alteração de schema ou RLS.


## 4.4.1.3

### Alterado
- Removido `Limpar` do histórico de Lotes.
- UVRM padrão atualizado para R$ 5,2151.
- Adicionado histórico visual ao módulo Datas, com cópia e rolagem vertical.

### Banco de dados
- Sem alteração de schema ou RLS.


## 4.4.1.2

### Corrigido
- Ordem estável dos históricos.
- Mesclagem remota determinística.
- Correções definitivas do histórico CPF/CNPJ.

### Banco de dados
- Sem alteração de schema ou RLS.


## 4.4.1.1

### Corrigido
- Histórico local de CPF/CNPJ carrega automaticamente ao abrir.
- Mesclagem remota atualiza imediatamente a lista visível de CPF/CNPJ.

### Banco de dados
- Sem alteração de schema ou RLS.


## 4.4.1

### Adicionado
- Reenvio automático progressivo da fila de históricos.
- Estado de sincronização com pendências e última sincronização.
- Retomada automática após offline/reabertura.
- Leitura remota paginada.

### Alterado
- Sincronizações concorrentes passam a compartilhar a mesma execução.

### Banco de dados
- Sem alteração de schema ou RLS.


## 4.4.0.3

### Corrigido
- Remoção automática de abas inválidas como `null`.
- Validação defensiva antes de abrir/restaurar abas.
- Histórico de versões e Novidades atualizados.

### Banco de dados
- Sem alteração de schema ou RLS.


## 4.4.0.2

### Corrigido
- UUIDs e campos técnicos deixam de aparecer no Histórico Global.
- Deduplicação passa a ignorar IDs técnicos.
- Mesclagem local/remota utiliza fingerprint sanitizado.

### Banco de dados
- Sem alteração de schema ou RLS.


## 4.4.0.1

### Corrigido
- Chaves locais do HistoryService deixam de receber prefixo duplicado.
- Varredura local e mesclagem remota do Histórico Global corrigidas.
- Status de sincronização informa enviados e recebidos.

### Banco de dados
- Sem alteração de schema ou RLS.


## 4.4.0

### Adicionado
- Histórico Global sincronizado para sete módulos.
- Datas e CPF/CNPJ integrados aos históricos e à sincronização.
- Sincronização manual no Histórico Global.

### Alterado
- Varredura idempotente contínua dos históricos locais.
- Mesclagem local/remota com deduplicação e operação offline-first.

### Banco de dados
- Sem alteração de schema; utiliza `history_entries`.


## 4.3.6.2

### Interface
- CPF / CNPJ adota o mesmo padrão visual de radio buttons do módulo Inscrição imobiliária.


## 4.3.6.1

### Alterado
- Refinamentos de backup, históricos UVRM/Percentual, CPF/CNPJ, Datas e identificação do ambiente de banco.


## 4.3.6

### Adicionado
- Novo módulo CPF / CNPJ com detecção automática, máscaras, validação, histórico local e cópia automática opcional.


## 4.3.5.4

### Alterado
- Aplicação unificada de Tema, Tamanho da fonte e Cor principal.
- Removido Interface e produtividade.
- Criada constante central `APP_VERSION`.


## 4.3.5.3

### Corrigido
- Total UVRM por soma de valores já arredondados.
- Seletor de Cor principal compacto.
- Botões de conta/sincronização na mesma linha em desktop.



## 4.3.5.2

### Corrigido
- Cor principal com botão **Aplicar**, confirmação visual e persistência.
- Botões de conta/sincronização alinhados horizontalmente.


## 4.3.5.1

### Corrigido
- Ajustes em Datas, Lotes, Percentual, Configurações, sincronização, backup e `.gitignore`.



## 4.3.5

### Adicionado
- Novo módulo **Datas** com contador entre datas e operações de soma/subtração de dias corridos.
- Painel de resultado, cópia, limpeza e validações.
- Integração à navegação, pesquisa global e Biblioteca.

### Corrigido
- Removido o resíduo literal `\n` do campo Descrição da Calculadora UVRM.

### Banco de dados
- Sem alteração de schema.


## 4.3.4

### Sincronização de históricos
- Os cinco históricos operacionais (Nome de arquivo, Inscrição, Lotes, UVRM e Percentual) passam a registrar novos eventos na fila online.
- Históricos locais anteriores são migrados uma única vez usando identificadores determinísticos, reduzindo duplicidades entre dispositivos.
- Upload usa `upsert` pela chave única `(user_id, client_id)`, tornando reenvios idempotentes.
- Registros remotos são mesclados ao histórico local por conteúdo, sem duplicar itens equivalentes.
- Fila pendente é retomada ao reconectar, voltar para a aba ou autenticar.

### Interface
- Removido o indicador de versão ao lado de “Sobre os Utilitários Municipais”.
- Removida a seção “Módulos disponíveis” de Sobre.
- Removido o indicador de versão ao lado de “Biblioteca de ferramentas”.

### Banco de dados
- Sem alteração de schema: utiliza a tabela `history_entries` criada na 4.3.0.


## 4.3.3

### Corrigido
- Removido o texto literal `\\n` abaixo de **Calculadora UVRM > Novo Lançamento > Descrição**.

### Organizado
- `README.md` mantido na raiz para o GitHub.
- CHANGELOG, sincronização e relatórios técnicos movidos para `docs/`.
- Releases movidos para `docs/releases/`.
- Scripts SQL movidos para `sql/`.

### Mantido
- Autopreenchimento UVRM da 4.3.2.1.
- Nenhuma alteração no schema do Supabase.


## 4.3.2.1

### Adicionado
- Histórico local de descrições utilizadas em **Calculadora UVRM > Novo Lançamento**.
- Sugestões de autopreenchimento no próprio campo **Descrição**, reutilizando textos já usados.
- Deduplicação das descrições e limite de 30 sugestões recentes.

### Mantido
- Nenhuma alteração no schema do Supabase; o histórico de descrições permanece local nesta etapa.


## 4.3.2

### Corrigido
- Reinício da sequência de Lotes agora prepara e gera efetivamente `00001` como primeiro número; a geração seguinte avança para `00002`.
- Estado reiniciado da sequência permanece correto mesmo se a página for recarregada antes da primeira geração.
- Central de Documentos não força mais barra de rolagem vertical interna na lista de modelos.

### Ajustado
- Removido o toast “Conta conectada ao Supabase” das atualizações de sessão; retorno à aba ocorre silenciosamente.
- Removido o indicador redundante de sincronização do Painel principal; cabeçalho e rodapé permanecem como referências de conta e sincronização.


## 4.3.1.1 — Hotfix da sequência do módulo Lotes

- Corrigida a recuperação da última sequência efetivamente gerada ao abrir ou atualizar o site.
- A Sequência inicial agora é sempre preparada como `última sequência + 1`, usando `lastLotSequence` como fonte autoritativa.
- A sequência do módulo Lotes deixou de depender da opção genérica **Salvar campos**, evitando restauração de valor antigo ou retorno indevido para 4.
- Mantido o comportamento de reinício manual da sequência para 00001/00002.
- Nenhuma alteração de banco de dados ou do escopo funcional planejado para a série 4.3.

## 4.3.1 — Identidade da conta e status de sincronização

- Adicionado indicador de usuário conectado no canto superior direito do cabeçalho.
- O cabeçalho utiliza o nome de exibição configurado no sistema e apresenta Online, Offline ou Somente local.
- Adicionado menu da conta com e-mail, acesso às configurações de sincronização, sincronização manual, login e saída.
- O rodapé passa a representar o estado técnico da sincronização separadamente da identidade da conta.
- Estados técnicos contemplados: local, sincronizando, sincronizado, pendente, offline, conflito e erro.
- Exibida a data/hora da última sincronização no rodapé quando disponível.
- Mantida integralmente a fundação de histórico online da 4.3.0 e os dados locais existentes.
- Atualizados versão interna, README, manifest, metadados e painel Novidades.

## 4.3.0 — Fundação do histórico online

- Criada a tabela `history_entries` no Supabase para futuros históricos operacionais sincronizados por usuário.
- Adicionados `client_id` único por usuário, `device_id`, módulo, ação, valor, metadados e data da ocorrência.
- Adicionados índices, trigger de atualização, RLS e quatro políticas próprias da tabela de históricos.
- Criado `HistoryService` com modelo canônico de registro, fila local de pendências e operações preparatórias de upload e consulta remota.
- Atualizado o schema local para a versão 13.
- Mantida desativada a sincronização automática dos históricos existentes nesta etapa, evitando migração prematura ou duplicidades.
- Preservada integralmente a sincronização seletiva consolidada na série 4.2.
- Atualizados versão interna, README, manifest, metadados, SQL consolidado e painel Novidades.

## 4.2.7 — Ordenação de documentos e correção do histórico

- Adicionado campo **Ordem** na Central de Documentos, com ordenação alfabética por Título ou Categoria.
- Preferência de ordenação persistida no navegador.
- Removidos os modelos padrão Despacho de arquivamento, Ofício — solicitação de providências e Certidão administrativa.
- Corrigido o botão **Copiar nome** do Montador para confirmar a cópia e registrar o valor no histórico do módulo e no Histórico global com data/hora.
- Mantida a sincronização online seletiva dos modelos personalizados da Central de Documentos.

## 4.2.6 — Sincronização da Central de Documentos

- Inclui os modelos personalizados da Central de Documentos na sincronização online por usuário.
- Mantém os modelos padrão apenas no código da aplicação, sem duplicá-los no Supabase.
- Propaga criação, edição e exclusão de modelos personalizados entre dispositivos da mesma conta.
- Atualiza a Central de Documentos após a aplicação de dados recebidos do Supabase.
- Adiciona migração segura para enviar modelos locais existentes quando ainda não houver o grupo `documents` online.
- Mantém históricos, estatísticas e UVRM fora da sincronização para testes controlados antes da versão 4.3.
- Atualiza versão interna, painel Novidades, README e metadados.

## 4.2.5 — Correção do layout de Configurações

- Corrige o deslocamento das opções para a esquerda na aba Configurações.
- Faz o conteúdo principal utilizar toda a largura disponível da página.
- Reorganiza os cartões auxiliares em uma grade responsiva abaixo das configurações.
- Preserva as funcionalidades e correções consolidadas na versão 4.2.4.

## 4.2.5 — Estabilização e melhorias de usabilidade

- Indicador de sincronização também na página Início, utilizando o mesmo estado da área Configurações.
- Remoção da sobrescrita antiga do painel Novidades e atualização correta do módulo Sobre.
- Remoção da opção duplicada Interface compacta no grupo Interface.
- Botão Voltar para a Página Inicial movido para o rodapé de Configurações.
- Reposicionamento do botão Novo modelo na Central de documentos.
- Remoção dos modelos Mensagem inicial de atendimento e Declaração de residência.
- Separação das variáveis assinatura e cargo, ambas sem preenchimento padrão.
- Histórico global iniciado com o filtro de período Hoje.

## 4.2.3 — Correção de falsos conflitos

- Removido o rastreamento genérico de cliques e alterações em toda a interface.
- Adicionado monitoramento seletivo somente das chaves incluídas na sincronização.
- Adicionada comparação determinística entre o conteúdo local e o conteúdo remoto.
- Pendências e conflitos antigos são eliminados automaticamente quando os dados são idênticos.
- O `updated_at` retornado pelo Supabase é utilizado como referência da sincronização.
- Adicionada tolerância temporal para evitar conflito por diferenças mínimas de relógio.
- Atualizados versão interna, schema local, README, manifest e painel Novidades.

## 4.2.2 — Gerenciamento da sincronização

- Indicador visual de estado: local, sincronizando, sincronizado, pendente, offline, conflito e erro.
- Exibição da última sincronização, última tentativa e quantidade de grupos pendentes.
- Botão de sincronização bidirecional para comparar dados locais e remotos.
- Detecção de alterações concorrentes entre dispositivos.
- Resolução explícita de conflitos, permitindo manter os dados locais ou utilizar os dados online.
- Retomada automática da sincronização ao restabelecer a conexão e ao retornar à aplicação.
- Favicon SVG embutido no `index.html`.
- Atualização do painel Novidades do módulo Sobre.

# 4.2.2

- Ativada a primeira sincronização seletiva sobre a infraestrutura da versão 4.2.0.
- Sincronização de preferências, nome de exibição, aparência, favoritos e continuidade do Dashboard.
- Inclusão das chaves de última ferramenta, aba ativa e ferramentas recentes.
- Históricos, modelos, documentos e configurações da UVRM permanecem exclusivamente locais.
- Inclusão de estado de alterações pendentes e reenvio automático após reconexão.
- Restrição da restauração às categorias oficialmente suportadas nesta etapa.
- Migração do schema local para a versão 8.

# 4.2.0

- Criação de cliente Supabase centralizado e reutilizável.
- Fortalecimento do StorageService com fallback e tratamento de falhas.
- Inclusão de Logger, ErrorHandler e VersionService.
- Migração do schema local para a versão 7.
- Sincronização online adaptada para utilizar a nova infraestrutura.
- Preservação das funcionalidades e dos dados locais da versão 4.1.2.
- Inclusão de `.env.example` para documentação da configuração.

# 4.1.2

- Removido o módulo **Fluxos de trabalho** da navegação, do registro de ferramentas e da interface.
- Removidos os arquivos JavaScript, CSS e metadados exclusivos do módulo.
- Adicionada limpeza automática das chaves locais `workflowCurrent` e `workflowHistory`.
- Confirmado que os dados de fluxos não integram a lista de dados sincronizados com o Supabase.
- Atualizadas as referências de versão e a área Sobre.

# 4.1.1

- Corrigida a inicialização quando o controle legado `#salvarCampos` não existe no HTML.
- Adicionada configuração `package.json` para execução pelo Vite no StackBlitz.
- Adicionado vínculo do `manifest.json` no documento principal.
- Realizadas verificações de sintaxe JavaScript, IDs duplicados e referências de arquivos.

# Changelog

## 4.1.0
- Integração com o projeto Supabase informado.
- Login e cadastro por e-mail e senha.
- Recuperação de senha.
- Funcionamento híbrido: armazenamento local + sincronização online.
- Sincronização de preferências visuais, nome de exibição, favoritos, modelos e UVRM.
- Botões para sincronizar e restaurar dados online.
- Log técnico de sincronizações.
- Script SQL com tabelas, índices, RLS e 11 políticas por usuário.
- Preservação integral dos módulos e dados locais da versão 4.0.

# Changelog

## 4.0.0
- Novo módulo Fluxos de trabalho.
- Contexto compartilhado de interessado, processo, endereço, CNAE, zoneamento e assunto.
- Transferência automática para Central de Documentos e Nome de Arquivo.
- Etapas visuais, arquivamento e exportação JSON.
- Atualização do schema de armazenamento para a Série 4.
- Preservação das funcionalidades e dados da v3.4.2.
