# Utilitários Municipais — v4.2.1

## Primeira sincronização seletiva

A versão 4.2.1 utiliza a infraestrutura criada na 4.2.0 para sincronizar somente dados pequenos e necessários à experiência do usuário. O aplicativo continua funcionando com `localStorage` quando não há login, conexão ou disponibilidade do Supabase.

### Dados sincronizados

- preferências gerais e persistência de campos;
- nome de exibição, tema, fonte, cor, layout e seções do Dashboard;
- ferramentas favoritas;
- aba ativa, última ferramenta e ferramentas recentes.

### Dados mantidos somente no navegador

- históricos dos módulos;
- estatísticas de uso e atividades;
- modelos de nome de arquivo e documentos;
- documentos personalizados;
- valor e casas decimais da UVRM;
- backups e logs locais.

Quando uma alteração ocorre sem conexão, ela é marcada como pendente e pode ser enviada automaticamente após a reconexão. A resolução avançada de conflitos entre dispositivos permanece planejada para a versão 4.2.2.

## Execução no StackBlitz

```bash
npm install
npm run dev
```

## Supabase

1. Execute `SUPABASE_SETUP.sql` no SQL Editor, caso ainda não tenha sido aplicado.
2. Mantenha o provedor Email habilitado em Authentication.
3. Cadastre a URL publicada do aplicativo em Authentication > URL Configuration.
4. Abra Configurações > Conta e sincronização online.
5. Entre ou crie uma conta e use **Sincronizar agora**.

O módulo **Fluxos de trabalho** permanece removido desde a versão 4.1.2.
