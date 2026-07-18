# Utilitários Municipais — versão 1.5

Etapa 5 do projeto, com foco no módulo de Inscrição Imobiliária.

## Melhorias do módulo

- Detecção automática entre inscrição urbana e ITR.
- Seleção manual opcional do tipo.
- Colagem inteligente de valores com ou sem máscara.
- Normalização automática durante a digitação.
- Validação em tempo real.
- Painel com tipo identificado, quantidade de números e situação.
- Pré-visualização da inscrição normalizada.
- Cópia com máscara.
- Cópia somente dos números.
- Cópia automática opcional quando a inscrição estiver completa.
- Histórico persistente das inscrições copiadas.
- Botões de cópia no histórico.

## Padrões

### Urbano

```text
00.000.000.00.0000000
```

Total: 17 números.

### ITR

```text
000.000.000.000-0
```

Total: 13 números.

## Estrutura

```text
UtilitariosMunicipais_v1.5/
├── index.html
├── app.css
├── app.js
├── README.md
└── CHANGELOG.md
```

## Recursos mantidos

- Montador visual de nome de arquivo.
- Gerador sequencial de lotes.
- Calculadora UVRM.
- Calculadora percentual.
- Configurações, persistência e backup.
