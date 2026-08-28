# Utilitários Municipais — v4.4.4 DEV

## Objetivo

Adicionar suporte ao CNPJ alfanumérico preservando integralmente a
compatibilidade com CPF e CNPJ numérico.

## Implementado

- As 12 primeiras posições do CNPJ aceitam números e letras A-Z.
- As posições 13 e 14 permanecem exclusivamente numéricas.
- Máscara `AA.AAA.AAA/AAAA-00`.
- Detecção automática de CNPJ quando houver letras.
- Validação dos dígitos verificadores pelo módulo 11 conforme documentação
  técnica oficial da Receita Federal.
- Conversão de cada caractere para o cálculo por `ASCII - 48`.
- Compatibilidade com CNPJ numérico tradicional.
- Compatibilidade com CPF.
- Opções "Sem máscara" e "Copiar automaticamente".
- Histórico local e sincronizado.
- Deduplicação, fingerprints e tombstones preservados.
- Módulo CPF/CNPJ reformatado e indentado para manutenção.

## Casos oficiais usados na validação

- `00.000.000/E08G-12`
- `12.ABC.345/01DE-35`

## Banco de dados

Sem alteração de schema ou RLS.

## Ambiente

`APP_ENVIRONMENT = "development"`
