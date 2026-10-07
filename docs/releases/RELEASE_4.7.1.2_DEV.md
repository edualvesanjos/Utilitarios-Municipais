# Utilitários Municipais v4.7.1.2 DEV

## Objetivo
Corrigir a recuperação de senha para funcionar com o cliente SuperDB atualmente usado pelo aplicativo.

## Alterações
- Pedido de recuperação via `POST /auth/v1/password/forgot`.
- Redefinição via `POST /auth/v1/password/reset`.
- Header `X-SuperDB-Project` selecionado pelo ambiente.
- `redirect_to` continua centralizado na configuração DEV/PROD.
- Timeout e tratamento de erros mantidos.

## Banco de dados
Nenhum SQL novo.
