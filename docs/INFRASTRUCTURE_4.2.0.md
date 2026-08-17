# Infraestrutura 4.2.0

## Objetivo

Consolidar serviços transversais sem alterar o comportamento funcional homologado na versão 4.1.2.

## Camadas

- `core/config.js`: configuração central.
- `services/storage-service.js`: persistência local resiliente e migração.
- `services/supabase-client.js`: instância única do Supabase.
- `services/online-sync-service.js`: autenticação e sincronização.
- `services/logger.js`: logs padronizados.
- `services/error-handler.js`: captura e normalização de falhas.
- `services/version-service.js`: metadados da aplicação.

## Contingência

O armazenamento local permanece como base operacional. Se o Supabase, a biblioteca remota ou a conexão estiverem indisponíveis, o sistema continua funcionando localmente e registra o estado de indisponibilidade sem bloquear a inicialização.
