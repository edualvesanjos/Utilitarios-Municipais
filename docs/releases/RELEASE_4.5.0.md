# Utilitários Municipais — v4.5.0 DEV

## Escopo

Etapa 1 da evolução visual da série 4.5.x.

O objetivo é validar uma nova navegação lateral antes de avançar para
recolhimento da sidebar, drawer móvel e migração da área da conta/status.

## Implementado

- navegação principal lateral;
- agrupamento visível por categoria;
- acesso direto a todos os módulos;
- pesquisa global na sidebar;
- atalhos de tema e fonte na base;
- destaque do item ativo;
- comportamento adaptativo básico em telas menores.

## Preservado

- todos os módulos da v4.4.6.1;
- históricos locais e sincronizados;
- tombstones;
- sincronização automática atual;
- Central de Documentos;
- preferências do usuário.

## Fora do escopo desta etapa

- sidebar recolhível;
- menu móvel deslizante;
- transferência da conta/status para a sidebar;
- Supabase Realtime;
- alterações de schema ou RLS.

## Ambiente

`APP_ENVIRONMENT = "development"`

## Testes recomendados

1. Abrir todos os módulos pela sidebar.
2. Confirmar o destaque correto do item ativo.
3. Usar a pesquisa global pela sidebar.
4. Testar tema e tamanho de fonte.
5. Abrir Central de Documentos, Configurações, Histórico Global e Sobre.
6. Verificar navegação por abas abertas.
7. Testar em largura de desktop, intermediária e celular.
8. Confirmar ausência de rolagem horizontal inesperada.
9. Confirmar que sincronização e nome do usuário continuam funcionando.
