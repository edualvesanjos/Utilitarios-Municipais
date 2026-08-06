# Sincronização — versão 4.2.3

## Objetivo

Eliminar falsos conflitos sem reduzir a proteção contra alterações concorrentes reais.

## Alterações técnicas

- monitoramento por snapshot somente dos grupos sincronizados;
- comparação estável e independente da ordem das propriedades JSON;
- encerramento automático de pendência quando local e Supabase são idênticos;
- referência temporal baseada no `updated_at` retornado pelo Supabase;
- tolerância de 2,5 segundos para diferenças entre relógio local e servidor;
- limpeza única do estado de conflito legado da versão 4.2.2.

## Critério de conflito

A tela somente é aberta quando os conteúdos são diferentes e existem alterações locais e remotas posteriores à última sincronização, além da tolerância temporal configurada.
