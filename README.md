# Utilitários Municipais — versão 1.3.1

Revisão corretiva da Etapa 4, aplicada sobre a versão 1.3.

## Alterações no Gerador de Nome de Arquivo

- Removida a seleção de extensão.
- Removida a seleção de tipo de documento.
- Adicionada a opção “Análise de projeto”, que inclui `AP`.
- Número do processo padronizado como `número-ano`.
- Máscara automática do processo.
- Data e hora unificadas no padrão `ddmmaaaahhmmss`.
- O resultado é gerado sem extensão.

## Exemplos

Sem análise de projeto:

```text
12345-2026_EMPRESA_EXEMPLO
```

Com análise de projeto:

```text
12345-2026_EMPRESA_EXEMPLO_AP
```

Com data e hora:

```text
12345-2026_EMPRESA_EXEMPLO_AP_18072026153045
```

## Estrutura

```text
UtilitariosMunicipais_v1.3.1/
├── index.html
├── app.css
├── app.js
├── README.md
└── CHANGELOG.md
```
