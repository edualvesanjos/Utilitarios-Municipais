# Utilitários Municipais — Versão 3.0.1

A versão 3 inicia a migração do aplicativo para uma plataforma modular e extensível, preservando os recursos e dados locais da série 2.

## Arquitetura da V3

- Registro central e declarativo de ferramentas em `assets/js/registry/tools.js`.
- Serviço unificado de persistência em `assets/js/services/storage-service.js`.
- Gerenciador de módulos e ciclo de vida em `assets/js/core/module-manager.js`.
- Biblioteca de componentes reutilizáveis em `assets/js/components/component-library.js`.
- Manifesto individual de cada ferramenta na pasta `modules/<id>/module.json`.
- Dashboard alimentado pelo registro central, com filtro por categorias.
- Schema de armazenamento identificado como versão 3.

## Compatibilidade

O prefixo de armazenamento da versão 2 foi mantido. Favoritos, estatísticas, configurações, modelos, sequências e históricos existentes continuam disponíveis quando a V3 substitui os arquivos na mesma pasta/origem do navegador.

## Módulos preservados

- Montador de nome de arquivo.
- Inscrição imobiliária.
- Gerador de número de lote.
- Calculadora UVRM com lista de lançamentos.
- Calculadora percentual.
- Dashboard, favoritos, pesquisa, estatísticas, backup e configurações.

## Execução

Abra `index.html` em um navegador moderno. Para preservar o armazenamento local de uma versão anterior, mantenha o arquivo na mesma pasta utilizada anteriormente.


## Revisão 3.0.1

Os avisos históricos exibidos dentro dos módulos foram removidos. As informações de versão, novidades e evolução passaram a ficar concentradas na nova área **Sobre**.
