# Utilitários Municipais

Aplicação web que reúne ferramentas de apoio a rotinas administrativas municipais em uma única interface. O projeto funciona no navegador e combina armazenamento local com sincronização opcional por usuário no SuperDB.

## Principais recursos

- Montador de nomes de arquivo e modelos reutilizáveis.
- Formatação e validação de inscrição imobiliária, CPF e CNPJ.
- Geração e controle de sequência de lotes.
- Cálculos de UVRM, percentuais e datas.
- Central de documentos, biblioteca de ferramentas e histórico global.
- Preferências e históricos sincronizáveis entre dispositivos.
- Modo **Somente local**, sem comunicação com o SuperDB.
- Isolamento dos dados locais por usuário autenticado.

## Como usar

Ao abrir a aplicação, escolha uma das formas de acesso:

1. **Entrar com SuperDB** — autentica o usuário, ativa o espaço local exclusivo da conta e habilita a sincronização normal.
2. **Usar somente local** — mantém os dados exclusivamente no navegador atual, sem sincronização online.

A aplicação não deve sincronizar dados antes da identificação do usuário ou da escolha explícita do modo somente local.

## Desenvolvimento

O projeto utiliza HTML, CSS e JavaScript, com Vite para o ambiente de desenvolvimento e build.

```bash
npm install
npm run dev
```

Para gerar o build:

```bash
npm run build
```

As configurações sensíveis do ambiente devem ser fornecidas pelas variáveis previstas no projeto e não devem ser gravadas diretamente no repositório.

## Fluxo de versões

O desenvolvimento é realizado primeiro na branch `develop`. As versões DEV são testadas antes da promoção para homologação e, posteriormente, produção.

O histórico técnico completo das alterações está em [docs/CHANGELOG.md](docs/CHANGELOG.md). Documentos específicos de releases anteriores estão em [docs/releases](docs/releases).

## Estrutura relevante

- `index.html` — estrutura principal da interface.
- `assets/js/` — módulos, componentes e serviços JavaScript.
- `assets/data/version-history.json` — dados exibidos em **Sobre → Histórico de versões**.
- `docs/CHANGELOG.md` — histórico técnico completo.
- `sql/` — scripts de banco de dados utilizados pelas versões que exigiram alterações de estrutura.

## Ajuda e manutenção

Para problemas ou melhorias, utilize os recursos de acompanhamento do próprio repositório GitHub e informe a versão do aplicativo, o navegador utilizado e os passos para reproduzir o comportamento.

O projeto é mantido no próprio repositório e sua documentação deve acompanhar cada versão funcional ou corretiva.
