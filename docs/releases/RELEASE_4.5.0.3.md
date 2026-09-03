# Utilitários Municipais — v4.5.0.3 DEV

## Objetivo

Correção visual e de posicionamento após os testes da Etapa 2.

## Correções

- novo visual para o botão Recolher/Expandir;
- botão com ícone vetorial, rótulo e estados hover/active;
- no modo recolhido, permanece apenas o ícone;
- conta/status retornam ao cabeçalho;
- botão da conta permanece compacto, somente com figura de pessoa;
- indicador de sincronização continua sobreposto ao perfil;
- detalhes e ações aparecem somente após clicar no perfil.

## Preservado

- sidebar recolhível;
- persistência do estado da sidebar;
- menu móvel deslizante;
- correção responsiva da v4.5.0.1;
- todos os módulos;
- sincronização automática atual;
- históricos e tombstones.

## Fora do escopo

- Supabase Realtime;
- alterações de schema/RLS;
- Histórico de versões interativo, reservado para a Etapa 3.

## Ambiente

`APP_ENVIRONMENT = "development"`

## Testes prioritários

1. Visual do botão Recolher com sidebar expandida.
2. Visual do botão Expandir com sidebar recolhida.
3. Persistência após recarregar a página.
4. Botão compacto da conta no cabeçalho.
5. Abrir/fechar menu da conta.
6. Testar Sincronizar agora, Conta e sincronização e Sair.
7. Verificar cores do status no ícone.
8. Repetir testes em Full HD, meia tela Full HD e tela móvel.
