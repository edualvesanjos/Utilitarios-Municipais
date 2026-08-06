# Utilitários Municipais — v4.1.2

Aplicação web modular para rotinas municipais, executada no navegador e compatível com Vite/StackBlitz.

## Alteração desta versão

O módulo **Fluxos de trabalho** foi retirado por não ser necessário nesta etapa do projeto. Também foram removidas suas referências de interface e seus arquivos exclusivos. Dados locais antigos do módulo são eliminados automaticamente ao iniciar a versão 4.1.2.

## Armazenamento

A aplicação mantém funcionamento híbrido: dados locais no navegador e sincronização seletiva com Supabase. A sincronização online permanece limitada a preferências, favoritos, modelos e configurações da UVRM; dados de fluxos não são enviados.

Execute no StackBlitz com:

```bash
npm install
npm run dev
```

## Supabase — versão 4.1

1. Execute `SUPABASE_SETUP.sql` no SQL Editor do projeto.
2. Em Authentication > Providers, mantenha o provedor Email habilitado.
3. Em Authentication > URL Configuration, cadastre a URL publicada do aplicativo.
4. Abra Configurações > Conta e sincronização online.
5. Crie uma conta ou entre com e-mail e senha.
6. Use **Sincronizar agora** para enviar as preferências locais.

A aplicação permanece funcional sem login e sem internet. Nesta etapa são sincronizados: aparência, nome de exibição, favoritos, modelos do sistema e configurações da UVRM.
