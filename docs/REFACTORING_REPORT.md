# Relatório de refatoração — versão 3.4.2

## Estratégia

A limpeza foi deliberadamente conservadora. Foram removidos apenas arquivos que não eram referenciados pelo `index.html`, pelos scripts carregados ou pelos manifestos da aplicação.

## Itens removidos

### Template Vite não utilizado

- `src/`
- `package.json`
- `package-lock.json`

Esses arquivos pertenciam ao projeto demonstrativo padrão do Vite e não participavam da aplicação municipal, que funciona diretamente pelo `index.html`.

### Resíduo de ambiente

- `.env`

Continha apenas o comentário padrão do StackBlitz e nenhuma configuração.

### Folhas de estilo vazias

- `assets/css/layout.css`
- `assets/css/modules/arquivo.css`
- `assets/css/modules/lotes.css`

Os arquivos continham apenas comentários informando que os estilos estavam em outras folhas. As respectivas tags `<link>` também foram removidas.

## Itens preservados intencionalmente

Alguns arquivos possuem nomes de versões anteriores, como `experience-31.js`, `dashboard-32.js` e `productivity-33.js`. Eles continuam sendo carregados e contêm funcionalidades ativas, portanto não foram removidos nem fundidos nesta revisão.

Também foram mantidos os manifestos em `modules/`, mesmo quando a aplicação usa um registro JavaScript central, pois eles documentam e sustentam a arquitetura modular planejada.

## Compatibilidade de dados

Não foram alterados:

- prefixo do armazenamento local;
- nomes das chaves;
- estrutura dos históricos;
- favoritos;
- estatísticas;
- modelos;
- configurações visuais.

## Validações executadas

- verificação de sintaxe de todos os arquivos JavaScript com Node.js;
- validação de todos os arquivos JSON;
- confirmação de existência de todos os CSS e scripts referenciados pelo HTML;
- verificação de referências remanescentes aos arquivos removidos;
- teste de integridade do arquivo ZIP.

## Resultado

Tamanho antes da limpeza: 335302 bytes.
Tamanho após a limpeza: 273974 bytes.
Redução aproximada: 61328 bytes.


## Alterações posteriores

A versão 3.4.2 preserva a refatoração e acrescenta nome de exibição configurável e ícones SVG coloridos incorporados.
