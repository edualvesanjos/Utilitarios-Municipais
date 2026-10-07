# Utilitários Municipais v4.7.1 DEV

## Objetivo

Retomar a recuperação de senha usando o fluxo documentado pelo SuperDB, preservando o isolamento local por identidade introduzido na linha 4.6.11.

## Fluxo

1. Na tela inicial, informar o e-mail e clicar em **Esqueci minha senha**.
2. O aplicativo chama `resetPasswordForEmail`, informando a URL absoluta atual como `redirectTo`.
3. O link recebido retorna ao aplicativo com `#token=…`.
4. O aplicativo exibe **Definir nova senha**.
5. A senha é concluída com `resetPassword({ token, password })`.
6. Após sucesso, o token é removido da URL e o usuário retorna ao login.

## Configuração necessária no SuperDB

A URL usada no ambiente DEV precisa estar cadastrada em **Autenticação → URLs de redirecionamento**.

## E-mail confirmado

Segundo a documentação atual do SuperDB, cadastro por e-mail e senha não confirma por si só a titularidade do e-mail. Recuperação de senha, login por código/link e OAuth são formas de provar a titularidade. Esta versão usa a recuperação como prova de posse do e-mail no fluxo de redefinição, mas não altera o fluxo geral de criação de contas.

## Banco de dados

Nenhum SQL novo é necessário.
