# Utilitários Municipais — v4.5.0.4 DEV

## Objetivo
Etapa 3 da modernização da interface: Histórico de versões interativo em Sobre.

## Implementações
- cartões de versão clicáveis e expansíveis;
- resumo no estado recolhido;
- detalhamento categorizado quando disponível;
- somente uma versão expandida por vez;
- foco por teclado e `aria-expanded`;
- rolagem vertical preservada, sem rolagem horizontal.

## Preservado
- sidebar lateral e recolhível;
- menu móvel;
- conta compacta no cabeçalho;
- responsividade intermediária;
- sincronização automática existente;
- históricos e tombstones.

## Fora do escopo
- Supabase Realtime;
- alterações de schema/RLS;
- migrações de dados.

## Ambiente
`APP_ENVIRONMENT = "development"`

## Testes prioritários
1. Expandir e recolher versões.
2. Confirmar apenas uma versão aberta por vez.
3. Testar Tab, Enter e Espaço.
4. Verificar rolagem vertical e ausência de horizontal.
5. Testar tema claro/escuro.
6. Testar Full HD, meia tela e móvel.
7. Regressão rápida da sidebar, conta e módulos.
