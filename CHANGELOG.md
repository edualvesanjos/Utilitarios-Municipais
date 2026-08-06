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
