# Utilitários Municipais — Versão 2.4.4

Aplicação local para apoio a rotinas administrativas municipais.

## Novidades da versão 2.1

- Nova tela inicial em formato de dashboard.
- Cartões de acesso rápido para todas as ferramentas.
- Resumo dos modelos, históricos e cálculos armazenados.
- Exibição da próxima sequência de lote.
- Exibição do valor atual da UVRM.
- Informação sobre o último backup realizado.
- Lista consolidada de atividades recentes.
- Layout responsivo para computador e celular.

## Estrutura principal

```text
assets/
├── css/
│   ├── base.css
│   ├── layout.css
│   ├── components.css
│   └── modules/
│       ├── dashboard.css
│       ├── arquivo.css
│       ├── inscricao.css
│       ├── lotes.css
│       ├── uvrm.css
│       ├── percentual.css
│       └── configuracoes.css
└── js/
    ├── app.js
    ├── core/
    │   ├── config.js
    │   ├── storage.js
    │   ├── navigation.js
    │   └── form-persistence.js
    └── modules/
        ├── dashboard.js
        ├── arquivo.js
        ├── inscricao.js
        ├── lotes.js
        ├── uvrm.js
        ├── percentual.js
        └── configuracoes.js
```

## Utilização

Extraia o arquivo ZIP e abra `index.html` em um navegador moderno.

O sistema não exige instalação, servidor ou bibliotecas externas. Os dados continuam armazenados localmente no navegador.


## Atualização da versão 2.1.1

- Adicionado botão **Voltar para a Página Inicial** no rodapé de todas as ferramentas.
- Ao retornar ao dashboard, a página rola automaticamente para o topo.
- O último módulo utilizado fica destacado no dashboard.
- A versão central da aplicação foi atualizada para `2.1.1`.


## Correção da versão 2.1.2

- Restaurada a navegação pelos menus superiores.
- Corrigida a referência à configuração central da aplicação.
- Os menus superiores, cartões do dashboard e botões de retorno utilizam a mesma função de navegação.
- Mantidos o destaque do último módulo e o retorno automático ao topo.


## Correções da versão 2.1.3

### Montador de nome de arquivo

- O campo **Nome** preserva os espaços entre as palavras.
- O texto é convertido para maiúsculas.
- Acentos e caracteres especiais são removidos.
- O caractere `&` é substituído pela letra `E`.

Exemplo:

`João da Silva & Maria` → `JOAO DA SILVA E MARIA`

### Calculadora UVRM

- O botão **Copiar** do histórico agora copia exatamente o valor exibido como resultado.
- O texto completo da operação permanece visível no histórico.


## Versão 2.4.2 — Componentes reutilizáveis

A Versão 2.4.2 reorganiza recursos compartilhados sem alterar os formatos dos dados existentes.

### Novos componentes

```text
assets/js/components/
    notifications.js
    clipboard.js
    modal.js
    history.js

assets/js/core/
    utils.js
```

### Melhorias estruturais

- Notificações temporárias centralizadas.
- Cópia para a área de transferência centralizada e com tratamento de erro.
- Modal padronizado para confirmações importantes.
- Renderização compartilhada dos históricos de inscrição, lotes, UVRM e percentual.
- Função compartilhada para gerar identificadores.
- Funções compartilhadas para download de arquivos, leitura de JSON e formatação de datas.
- Remoção de implementações duplicadas nos módulos.

### Compatibilidade

- Mantidas todas as chaves atuais do `localStorage`.
- Históricos existentes continuam válidos.
- Backups das versões 2.1.x continuam importáveis.
- Não houve alteração nas regras de cálculo ou geração de resultados.


## Novidades da versão 2.4.2
- Pesquisa global de ferramentas no Dashboard, com abertura do primeiro resultado pela tecla Enter.
- Sistema de favoritos para acesso rápido.
- Estatísticas locais de acessos e ações por módulo.
- Indicadores de ações, favoritos e ferramenta mais utilizada.
- Estatísticas detalhadas na aba Configurações, com opção de zerar os contadores.
- Estrutura centralizada para validação de campos.


## Novidades da versão 2.4.2
Dashboard inteligente, histórico global, atalhos de teclado, modo compacto, pesquisa avançada e exportação de estatísticas em CSV, JSON e TXT.


## Novidades da versão 2.4.4

- Novo campo **Quantidade** nos lançamentos do tipo **Valor em UVRM**, iniciado em 1.
- Cálculo atualizado: valor em UVRM × quantidade × valor unitário da UVRM.
- O campo Quantidade é ocultado para lançamentos em reais.
- Compatibilidade com lançamentos anteriores, considerados com quantidade 1.


## Persistência na versão 2.4.4

- Restauração centralizada dos campos e históricos ao iniciar.
- Atualização ao retornar à aba, recuperar o foco ou usar a navegação voltar/avançar.
- Migração de chaves compatíveis de versões anteriores.
- O valor atual da UVRM é salvo imediatamente e restaurado independentemente da opção geral de salvar campos.
- Para preservar o armazenamento ao atualizar um aplicativo aberto diretamente por arquivo, substitua os arquivos dentro da mesma pasta usada anteriormente. Alterar o caminho do `index.html` pode criar um armazenamento local diferente no navegador.
