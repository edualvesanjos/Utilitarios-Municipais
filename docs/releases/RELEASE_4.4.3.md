# Utilitários Municipais — v4.4.3 DEV

## Objetivo

Separar de forma explícita a limpeza local da exclusão sincronizada dos históricos.

## Implementado

- Nova ação **Limpar históricos deste dispositivo**.
- Nova ação **Excluir históricos sincronizados**.
- Exclusão sincronizada global com tombstones para todos os módulos suportados.
- Coleta de registros locais e remotos antes da exclusão global, evitando reaparecimento de registros antigos.
- Confirmação dupla para a exclusão sincronizada.
- Exigência de conexão com a internet e usuário autenticado para a exclusão sincronizada.
- Remoção da opção ambígua **Todos os históricos** da limpeza seletiva.
- Remoção do antigo botão **Resetar históricos**.
- A ação **Apagar todos os dados** foi explicitamente definida como local.
- `configuracoes.js` foi reformatado e indentado para facilitar manutenção.

## Históricos abrangidos

- Montador de Nome de Arquivo
- Inscrição
- Lotes
- UVRM
- Percentual
- Datas
- CPF/CNPJ

## Banco de dados

Sem alteração de schema ou RLS. O mecanismo permanece baseado em tombstones
na tabela `history_entries`.

## Ambiente

`APP_ENVIRONMENT = "development"`
