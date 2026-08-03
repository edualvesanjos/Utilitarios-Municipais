# Utilitários Municipais — versão 3.4.2

Aplicação web estática e modular para apoio às rotinas administrativas municipais.

## Execução

Abra `index.html` em um navegador moderno ou publique o conteúdo desta pasta em um servidor estático, como GitHub Pages.

A aplicação não depende de Node.js, Vite, instalação de pacotes ou processo de compilação.

## Estrutura principal

- `index.html`: estrutura das telas e carregamento dos recursos.
- `assets/css`: estilos compartilhados, módulos e evoluções visuais da série 3.
- `assets/js/core`: navegação, persistência, validação, análise de uso e experiência.
- `assets/js/modules`: regras funcionais de cada ferramenta.
- `assets/js/components`: componentes reutilizáveis.
- `assets/js/registry`: catálogo central de ferramentas.
- `modules`: manifestos declarativos dos módulos.

## Compatibilidade

A refatoração 3.4.1 preserva as chaves de armazenamento local e os formatos de históricos, favoritos, configurações e modelos das versões anteriores.

Consulte `REFACTORING_REPORT.md` para os detalhes da limpeza realizada.


## Versão 3.4.2

- Nome de exibição configurável em **Configurações > Aparência e Dashboard**.
- Saudação padrão **Olá, Usuário!** quando nenhum nome estiver salvo.
- Ícones coloridos em SVG incorporados ao código, sem downloads ou bibliotecas externas.
