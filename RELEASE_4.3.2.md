# Utilitários Municipais — v4.3.2

Versão de correções e refinamentos de interface sobre a série 4.3.

## Correções

- **Lotes:** `Reiniciar sequência` passa a gerar `00001` efetivamente como primeiro lote, inclusive se o site for recarregado antes da geração.
- **Sessão Supabase:** removido o aviso repetitivo de conta conectada ao retornar para a aba; a atualização de sessão é silenciosa.
- **Central de Documentos:** removida a limitação de altura que criava barra de rolagem vertical interna no painel de modelos.
- **Painel principal:** removido o indicador redundante de sincronização; o estado continua disponível no cabeçalho e no rodapé.

## Banco de dados

Nenhuma alteração de schema. Não é necessário executar novo SQL para atualizar da 4.3.1.1 para a 4.3.2.
