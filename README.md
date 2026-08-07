# Utilitários Municipais — v4.2.5

## Correção do gerenciamento da sincronização

A versão 4.2.5 corrige o aproveitamento horizontal da aba Configurações, eliminando o espaço em branco lateral e mantendo as melhorias de sincronização e usabilidade consolidadas anteriormente.

### Dados sincronizados

- preferências gerais e persistência de campos;
- nome de exibição, tema, fonte, cor, layout e seções do Dashboard;
- ferramentas favoritas;
- aba ativa, última ferramenta e ferramentas recentes.

### Alterações da versão 4.2.5

- cliques, cópias, cálculos e navegação comum não são mais tratados como alterações pendentes;
- somente as chaves efetivamente sincronizadas são monitoradas;
- os conteúdos local e remoto são comparados antes da abertura do conflito;
- dados idênticos limpam automaticamente pendências e conflitos antigos;
- o horário `updated_at` retornado pelo Supabase passa a ser usado como referência após o envio;
- foi adicionada tolerância temporal para diferenças de poucos milissegundos entre navegador e servidor.

### Dados mantidos somente no navegador

- históricos dos módulos;
- estatísticas de uso e atividades;
- modelos de nome de arquivo e documentos;
- documentos personalizados;
- valor e casas decimais da UVRM;
- backups e logs locais.

## Execução no StackBlitz

```bash
npm install
npm run dev
```

## Teste recomendado

1. Entre na conta do Supabase.
2. Clique em **Sincronizar agora**.
3. Navegue entre módulos, faça cálculos e copie resultados. A tela de conflito não deve aparecer.
4. Altere um favorito ou uma preferência. O estado deve mudar para pendente e depois para sincronizado.
5. Faça alterações diferentes em dois computadores antes de sincronizar para validar o conflito real.

O módulo **Fluxos de trabalho** permanece removido desde a versão 4.1.2.
