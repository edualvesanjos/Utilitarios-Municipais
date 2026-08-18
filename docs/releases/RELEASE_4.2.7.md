# Utilitários Municipais — versão 4.2.7

## Escopo

Versão corretiva anterior à 4.3, com foco em refinamentos da Central de Documentos e correção do histórico do Montador de Nome de Arquivo.

## Entregas

- Ordenação persistente da Central de Documentos por Título ou Categoria.
- Remoção de três modelos padrão: Despacho de arquivamento, Ofício — solicitação de providências e Certidão administrativa.
- Correção de **Copiar nome**: confirmação visual, histórico local e Histórico global com timestamp.
- Compatibilidade com registros antigos do histórico de nomes, que continuam visíveis no módulo.
- Preservação da sincronização seletiva da Central de Documentos implementada na v4.2.6.

## Testes sugeridos

1. Alterar Ordem para Categoria, fechar e reabrir a aplicação e confirmar a persistência.
2. Alternar entre Título e Categoria e conferir a ordenação alfabética.
3. Confirmar que os três modelos removidos não aparecem na biblioteca padrão.
4. Usar Copiar nome no Montador e verificar a mensagem de confirmação.
5. Conferir o novo registro no Histórico do Montador e no Histórico global com Período = Hoje.
6. Repetir a cópia do mesmo nome e verificar que não há duplicidade no histórico recente.
7. Confirmar que modelos personalizados continuam sincronizando entre dispositivos.
