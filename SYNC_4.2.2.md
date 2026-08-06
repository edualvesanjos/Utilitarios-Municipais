# Gerenciamento da sincronização — versão 4.2.2

## Objetivo

Consolidar a sincronização seletiva implantada na 4.2.1 antes da pausa planejada para testes do banco de dados.

## Recursos

- estado visual da sincronização;
- data da última sincronização e da última tentativa;
- indicação de alterações pendentes;
- sincronização manual bidirecional;
- retomada automática após reconexão;
- verificação ao retornar para a aplicação;
- detecção de conflito quando existem alterações locais e remotas posteriores à última sincronização;
- escolha explícita entre manter os dados locais ou utilizar os dados online.

## Política de segurança

Conflitos nunca são resolvidos automaticamente. Enquanto houver conflito, a sincronização automática permanece bloqueada para evitar sobrescrita silenciosa.

## Dados incluídos

- preferências;
- favoritos;
- personalização;
- aba ativa, última ferramenta e ferramentas recentes.

## Dados excluídos nesta etapa

- históricos;
- modelos;
- documentos;
- valores e configurações da UVRM;
- estatísticas de uso.
