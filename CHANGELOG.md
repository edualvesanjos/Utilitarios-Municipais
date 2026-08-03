# Changelog

## 3.4.2 — Personalização e ícones incorporados

- Adicionado o campo **Como gostaria de ser chamado?** em Configurações.
- A saudação inicial agora usa **Usuário** como padrão quando não há preferência salva.
- O nome de exibição é preservado no armazenamento local e nos backups.
- Aplicada uma paleta colorida aos ícones SVG incorporados, sem dependências externas.

# Histórico de alterações

## 3.4.1 — Refatoração conservadora

- Removido o projeto demonstrativo Vite que não era carregado pela aplicação.
- Removidos `package.json` e `package-lock.json`, pois o sistema é executado diretamente como aplicação estática.
- Removido o arquivo `.env` vazio do template StackBlitz.
- Removidas folhas CSS sem regras funcionais e suas referências no HTML.
- Preservadas todas as camadas JavaScript e CSS efetivamente carregadas.
- Mantidos os nomes e formatos das chaves de persistência para evitar perda de dados.
- Adicionado relatório técnico da refatoração.

## 3.4.0 — Ferramentas inteligentes

- Central de Documentos com modelos administrativos.
- Variáveis substituíveis, pré-visualização, cópia e exportação TXT.
- Modelos personalizados persistentes.
- Correção do botão Limpar campos no Montador de nome de arquivo.
