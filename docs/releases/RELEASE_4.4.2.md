# Utilitários Municipais — v4.4.2 DEV

Primeiro piloto de exclusão sincronizada de históricos.

## Implementado

- CPF/CNPJ passa a permitir excluir um registro individual do histórico.
- A exclusão:
  1. remove o registro do histórico local;
  2. cria um registro `action = delete` em `history_entries`;
  3. envia um tombstone com a assinatura do registro excluído;
  4. ao sincronizar outro navegador, o tombstone remove o item equivalente localmente;
  5. registros marcados como excluídos não são reimportados durante a mesclagem.
- O registro original permanece no banco durante este piloto; o tombstone define sua exclusão lógica.
- Nenhum botão global de limpeza foi reativado.
- Mantidas deduplicação, ordenação estável, fila, reenvio e funcionamento offline-first.

## Teste recomendado

Navegador A:
- criar/usar um CPF ou CNPJ;
- sincronizar;
- excluir o registro pelo novo botão;
- sincronizar novamente.

Supabase DEV:
- confirmar novo registro com `module = cpf-cnpj` e `action = delete`.

Navegador B:
- sincronizar;
- confirmar que o item desaparece;
- atualizar/reabrir o site;
- sincronizar novamente;
- confirmar que o item não reaparece.

## Ambiente

`APP_ENVIRONMENT = "development"`

## Banco de dados

Nenhuma alteração de schema ou RLS é necessária.
A coluna `action` já aceita valores textuais não vazios, incluindo `delete`.
