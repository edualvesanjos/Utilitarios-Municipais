# Utilitários Municipais v4.7.2 PROD

## Objetivo

Publicar em produção a correção homologada na v4.7.1.3 DEV para impedir falsos conflitos ao trocar de módulo.

## Alterações

- `activeTab`, `lastToolTab` e `recentTools` permanecem locais ao navegador.
- O grupo de navegação deixa de participar da sincronização online e da detecção de conflitos.
- Os demais grupos sincronizados continuam inalterados.
- Mantido o fluxo de recuperação de senha já homologado em produção.
- Ambiente configurado como `production`.

## Banco de dados

Nenhuma alteração de banco de dados ou SQL é necessária.

## Validação

A correção foi homologada em DEV antes deste fechamento de produção.
