# Utilitários Municipais — versão 2.1

Aplicação local para apoio a rotinas administrativas municipais.

## Novidades da versão 2.1

- Nova tela inicial em formato de dashboard.
- Cartões de acesso rápido para todas as ferramentas.
- Resumo dos modelos, históricos e cálculos armazenados.
- Exibição da próxima sequência de lote.
- Exibição do valor atual da UVRM.
- Informação sobre o último backup realizado.
- Lista consolidada de atividades recentes.
- Layout responsivo para computador e celular.

## Estrutura principal

```text
assets/
├── css/
│   ├── base.css
│   ├── layout.css
│   ├── components.css
│   └── modules/
│       ├── dashboard.css
│       ├── arquivo.css
│       ├── inscricao.css
│       ├── lotes.css
│       ├── uvrm.css
│       ├── percentual.css
│       └── configuracoes.css
└── js/
    ├── app.js
    ├── core/
    │   ├── config.js
    │   ├── storage.js
    │   ├── navigation.js
    │   └── form-persistence.js
    └── modules/
        ├── dashboard.js
        ├── arquivo.js
        ├── inscricao.js
        ├── lotes.js
        ├── uvrm.js
        ├── percentual.js
        └── configuracoes.js
```

## Utilização

Extraia o arquivo ZIP e abra `index.html` em um navegador moderno.

O sistema não exige instalação, servidor ou bibliotecas externas. Os dados continuam armazenados localmente no navegador.
