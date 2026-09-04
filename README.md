# Utilitários Municipais

Aplicação web modular para rotinas administrativas municipais, com foco em produtividade, padronização, histórico local e sincronização opcional com Supabase.

## Estado atual

## Interface e navegação

A navegação principal utiliza uma barra lateral organizada por grupos:
Documentos, Cadastros, Cálculos, Produtividade e Sistema.
A pesquisa global e os atalhos de aparência ficam integrados à sidebar. No desktop, a barra pode ser recolhida; em telas menores, funciona como menu deslizante. O acesso à conta fica no cabeçalho, por um ícone compacto de perfil com indicação visual do estado de sincronização.


Módulos disponíveis: Montador de Nome de Arquivo, Inscrição Imobiliária, Número de Lote, Calculadora UVRM, Percentual, Datas, CPF/CNPJ e Central de Documentos.

O módulo CPF/CNPJ aceita CPF, CNPJ numérico tradicional e CNPJ alfanumérico, com validação, máscara, opção sem máscara, cópia e histórico.

A Central de Documentos permite criar, editar, pesquisar, ordenar, utilizar e excluir modelos próprios. Não existem modelos internos protegidos contra edição ou exclusão.

## Sincronização

O `localStorage` mantém a base local. Com usuário autenticado, os dados compatíveis podem ser sincronizados com Supabase.

Recursos atuais:

- sincronização manual e automática;
- sincronização ao abrir/recarregar, recuperar foco, retornar à aba e voltar ao estado online;
- retry para falhas temporárias;
- deduplicação determinística e ordenação estável;
- exclusão sincronizada por tombstones;
- separação entre limpeza local e exclusão remota;
- preferências de interface sincronizadas;
- nome de exibição único para Configurações, saudação e cabeçalho da conta.

## Ambientes

A configuração central fica em `assets/js/core/config.js`. Valide sempre a declaração ativa de `APP_ENVIRONMENT`, e não exemplos comentados.

## Histórico de versões

O histórico detalhado não é acumulado neste README.

- `docs/CHANGELOG.md`: alterações por versão.
- `docs/releases/RELEASE_x.x.x.md`: detalhes técnicos de cada release.
- **Sobre**: novidades atuais e histórico resumido.

## Fluxo de desenvolvimento

1. desenvolver e testar em `develop`;
2. manter `APP_ENVIRONMENT = "development"`;
3. fechar a DEV após aprovação;
4. gerar produção com `APP_ENVIRONMENT = "production"`;
5. PR `develop -> main`;
6. validar GitHub Pages;
7. criar tag/release.

## Manutenção

- preservar formatação e indentação dos arquivos alterados;
- não versionar `node_modules/`;
- manter o `package-lock.json` raiz versionado;
- validar JavaScript, JSON, IDs HTML e ZIP antes de cada fechamento.

- **Sobre:** Novidades da versão atual e Histórico de versões interativo com detalhes expansíveis.

- **Navegação lateral:** sidebar recolhível e compacta verticalmente, com rolagem apenas quando a altura disponível exigir.

- **Central de Documentos:** filtros superiores, organização por Categoria/Grupo, seleção por combobox e editor de modelos em largura total.

- **Navegação:** sidebar como navegação principal entre módulos; cabeçalho reservado à identidade do sistema e Conta/Sincronização.

- **Layout:** sidebar e painel principal alinhados verticalmente, com navegação lateral consolidada.
