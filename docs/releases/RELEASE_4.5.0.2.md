# Utilitários Municipais — v4.5.0.2 DEV

## Escopo

Etapa 2 da modernização da navegação lateral.

## Implementado

- sidebar recolhível em desktop;
- persistência local do estado expandido/recolhido;
- menu lateral deslizante em telas menores;
- backdrop e fechamento por Escape;
- fechamento automático do menu móvel após selecionar um módulo;
- conta/status transferidos do cabeçalho para a base da sidebar;
- ícone de pessoa como acesso compacto à conta;
- indicador de cor usando o estado real da sincronização;
- menu de conta preservando nome, e-mail e ações existentes.

## Estados visuais do perfil

- cinza: somente local / não conectado;
- verde: sincronizado;
- amarelo: pendente ou offline;
- azul: sincronizando;
- vermelho: conflito ou erro.

## Preservado

- todos os módulos da v4.5.0.1;
- correção responsiva da Etapa 1;
- históricos locais e sincronizados;
- tombstones;
- sincronização automática atual;
- Central de Documentos;
- preferências do usuário.

## Fora do escopo

- Supabase Realtime;
- alterações de schema ou RLS;
- Histórico de versões interativo, reservado para a Etapa 3.

## Ambiente

`APP_ENVIRONMENT = "development"`

## Testes prioritários

1. Expandir e recolher a sidebar no desktop.
2. Recarregar a página e confirmar a persistência do estado.
3. Abrir todos os módulos com a sidebar expandida e recolhida.
4. Testar menu móvel em largura menor que 820 px.
5. Abrir e fechar o menu móvel pelo botão, backdrop e Escape.
6. Confirmar que selecionar um módulo fecha o menu móvel.
7. Clicar no ícone de pessoa e testar o menu da conta.
8. Verificar as cores do status em local, sincronizado, pendente/offline e sincronizando.
9. Testar “Conta e sincronização”, “Sincronizar agora” e “Sair”.
10. Repetir teste em meia tela Full HD para garantir ausência de regressão.
