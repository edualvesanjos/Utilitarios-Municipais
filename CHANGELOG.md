# Changelog

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
