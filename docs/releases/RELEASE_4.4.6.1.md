# Utilitários Municipais — v4.4.6.1 PRODUÇÃO

## Objetivo

Corrigir a falha visual identificada na Central de Documentos após a seleção de um modelo.

## Correção

O elemento de estado vazio (`document-editor-empty`) utilizava `display: grid`.
Essa regra de CSS prevalecia visualmente mesmo quando o elemento recebia o atributo `hidden`,
fazendo com que o texto “Selecione um modelo” permanecesse ocupando uma grande área acima do documento.

Foi adicionada a regra específica:

```css
.document-editor-empty[hidden] {
    display: none;
}
```

Com isso:
- o estado vazio aparece somente quando nenhum modelo está aberto;
- ao selecionar ou criar um modelo, a área desaparece completamente;
- o editor passa a ocupar o topo do painel sem espaço em branco residual.

## Compatibilidade

- Mantida a estrutura `documentTemplates`.
- Mantidas edição e exclusão de todos os modelos.
- Mantido o leiaute reorganizado da v4.4.6.
- Sem migração de dados.

## Banco de dados

Sem alteração de schema ou RLS.

## Ambiente

`APP_ENVIRONMENT = "production"`

## Testes recomendados

1. Abrir a Central de Documentos sem selecionar modelo.
2. Confirmar a mensagem “Selecione um modelo”.
3. Selecionar um modelo existente.
4. Confirmar que a mensagem desaparece e o editor começa no topo, sem grande espaço vazio.
5. Clicar em “Novo modelo” e confirmar o mesmo comportamento.
6. Voltar/recarregar e repetir os testes.

## Fechamento de produção

Versão promovida para produção após aprovação dos testes da v4.4.6.1 DEV.

O fechamento preserva:
- Central de Documentos reorganizada;
- modelos exclusivamente editáveis/excluíveis pelo usuário;
- correção do espaço em branco ao abrir um modelo;
- nome de exibição unificado entre Configurações, saudação e cabeçalho;
- README consolidado como documentação do estado atual;
- histórico de versões com rolagem vertical e sem rolagem horizontal.

Não houve alteração de schema ou RLS no fechamento.
