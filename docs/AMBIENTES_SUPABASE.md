# Ambientes Supabase — Desenvolvimento e Produção

## Objetivo

O Utilitários Municipais passa a possuir dois ambientes independentes:

| Ambiente | Finalidade |
|---|---|
| `development` | testes de SQL, RLS, sincronização e novas versões |
| `production` | site oficial e dados reais |

A seleção é feita em:

`assets/js/core/config.js`

```javascript
const APP_ENVIRONMENT = "development";
```

ou:

```javascript
const APP_ENVIRONMENT = "production";
```

## Produção

O projeto de produção já está configurado no objeto `SUPABASE_ENVIRONMENTS.production`.

Não altere essa configuração durante os testes.

## Desenvolvimento — o que você precisa fazer no Supabase

1. No Dashboard do Supabase, crie um segundo projeto no plano Free.
2. Sugestão de nome: **Utilitarios Municipais - Desenvolvimento**.
3. Aguarde a criação do banco.
4. Abra **SQL Editor** no projeto de desenvolvimento.
5. Execute:
   `sql/SETUP_DEVELOPMENT.sql`
6. Em seguida execute:
   `sql/AUDIT_DEVELOPMENT.sql`
7. Abra o painel **Connect** ou **Settings > API Keys**.
8. Copie apenas:
   - **Project URL**
   - **Publishable key** (`sb_publishable_...`)
9. Em `assets/js/core/config.js`, substitua somente estes dois valores:

```javascript
development: Object.freeze({
    name: "Desenvolvimento",
    url: "https://SEU-PROJETO-DE-TESTE.supabase.co",
    publishableKey: "sb_publishable_COLE_A_CHAVE_DO_PROJETO_DE_TESTE"
})
```

10. Confirme que:

```javascript
const APP_ENVIRONMENT = "development";
```

## Importante sobre chaves

Use no navegador somente a **Publishable key**.

Nunca coloque no HTML/JavaScript:

- `sb_secret_...`
- `service_role`

Essas chaves têm privilégios elevados e não pertencem ao frontend.

## Usuários de teste

Os usuários do Supabase Auth **não são copiados** de Produção para Desenvolvimento.

Para testar autenticação:

1. abra a versão apontando para `development`;
2. use **Entrar ou criar conta**;
3. crie uma conta específica de testes no projeto de desenvolvimento.

Pode ser o mesmo endereço de e-mail utilizado em produção, mas será uma identidade separada porque cada projeto Supabase possui seu próprio Auth.

## Como saber em qual ambiente o site está

O cabeçalho passa a exibir:

- **DEV** quando `APP_ENVIRONMENT = "development"`
- **PROD** quando `APP_ENVIRONMENT = "production"`

Antes de executar testes destrutivos, confirme visualmente **DEV**.

## Fluxo recomendado

### Desenvolvimento

```text
Código em desenvolvimento
        ↓
APP_ENVIRONMENT = development
        ↓
Supabase Desenvolvimento
        ↓
testes / SQL / RLS / sincronização
```

### Produção

```text
Versão aprovada
        ↓
APP_ENVIRONMENT = production
        ↓
Supabase Produção
```

## Publicação

Antes de publicar uma versão oficial:

1. terminar os testes em Desenvolvimento;
2. aplicar no banco de Produção somente os scripts SQL aprovados;
3. executar a auditoria correspondente;
4. alterar `APP_ENVIRONMENT` para `production`;
5. confirmar visualmente o badge **PROD**;
6. publicar no GitHub Pages.

## Regra de segurança

**Nunca use dados reais para testar migrações destrutivas.**

O banco de Desenvolvimento deve conter apenas contas e registros de teste.

## Estado da configuração — v4.3.6

O ambiente de Desenvolvimento está configurado neste pacote.

- `APP_ENVIRONMENT = "development"`
- Project URL de Desenvolvimento configurado.
- Publishable key de Desenvolvimento configurada.
- Produção preservada separadamente.

Antes dos testes, execute `sql/SETUP_DEVELOPMENT.sql` e depois `sql/AUDIT_DEVELOPMENT.sql` no projeto Supabase de Desenvolvimento.
