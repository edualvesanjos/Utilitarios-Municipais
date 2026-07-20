# Changelog

## 2.1.0

### Adicionado

- Dashboard como nova tela inicial.
- Cartões de acesso rápido aos seis módulos existentes.
- Contadores de modelos, históricos e cálculos armazenados.
- Indicadores de próxima sequência de lote, valor da UVRM e último backup.
- Lista consolidada de atividades recentes.
- Botão para atualização manual do resumo.
- Arquivos modulares `dashboard.js` e `dashboard.css`.

### Alterado

- A aba inicial padrão passou a ser `Início`.
- A versão central da aplicação foi atualizada para `2.1.0`.
- A navegação atualiza o dashboard sempre que ele é aberto.

### Compatibilidade

- Mantidos os dados e as chaves existentes no `localStorage`.
- Mantidas integralmente as funcionalidades da versão 2.0.2.
- Mantido o funcionamento local sem servidor ou dependências externas.

## 2.0.2

### Corrigido

- Removida a inserção indevida de `arquivoRemoverPontos` no bloco de data/hora.
- A regra de remoção de pontos agora afeta igualmente prévia, cópia e histórico.
- Corrigida a atualização inconsistente do número da versão.

### Estrutura

- Criado `assets/js/core/config.js`.
- Centralizados nome da aplicação, versão e prefixo do armazenamento.
- Interface e backup agora consultam a configuração central.

## 2.0.1

### Corrigido

- Adicionado ao montador de nome de arquivo o checkbox **Remover pontos (.) dos números**.
- A opção é iniciada marcada por padrão.
- Pontos entre algarismos são removidos do nome final quando a opção está ativa.
- A preferência do checkbox é mantida no armazenamento local.

## 2.0.0

### Estrutura

- Criada a pasta `assets`.
- Separados os estilos em arquivos gerais e arquivos por módulo.
- Separadas as rotinas JavaScript em núcleo, módulos e inicialização.
- Ajustado o `index.html` para carregar os arquivos na ordem correta.

### Compatibilidade

- Mantido o funcionamento local, sem servidor.
- Mantidos os dados existentes no `localStorage`.
- Mantidos os identificadores dos campos e as chaves de armazenamento.
- Mantidas todas as funcionalidades da versão 1.9.

### Documentação

- Atualizados README e CHANGELOG.
- Atualizada a identificação visual para a versão 2.0.

## 1.9.0

- Painel de resumo dos dados locais.
- Backup completo em JSON.
- Importação validada.
- Registro do último backup.
- Limpeza seletiva.
- Restauração completa dos dados.

## 1.8.0

### Adicionado

- Cinco tipos de cálculo percentual.
- Cálculo em tempo real.
- Proporção percentual.
- Variação percentual.
- Histórico pesquisável.
- Cópia simples e completa dos resultados.
- Resumo da operação e situação do cálculo.

### Melhorado

- Acréscimo e desconto percentual.
- Validação dos valores.
- Organização visual da Calculadora Percentual.
- Integração com persistência e backup.

### Mantido

- Todas as funcionalidades da versão 1.7.1.

## 1.7.1
- O campo **Valor atual da UVRM** passa a preservar exatamente o valor digitado, sem arredondamento nem formatação automática.



## 1.7.0

### Adicionado

- Conversão bidirecional entre reais e UVRM.
- Cálculo em tempo real.
- Arredondamento configurável.
- Persistência do valor da UVRM.
- Histórico pesquisável.
- Cópia simples e completa do resultado.
- Restauração do valor padrão.

### Melhorado

- Layout da Calculadora UVRM.
- Validação e mensagens de apoio.
- Integração com a persistência local.

### Mantido

- Todas as funcionalidades da versão 1.6.2.

## 1.6.2

### Melhorado

- A próxima sequência fica automaticamente preparada no campo `Sequência inicial` após cada geração.
- Removido o botão `Usar próxima sequência`.

## 1.6.1
- Correção: o campo **Setor** passa a preservar exatamente o valor digitado, sem completar com zeros à esquerda.



## 1.6.0

### Adicionado

- Sequência inicial configurável.
- Separador configurável.
- Pré-visualização em tempo real.
- Exportação TXT.
- Histórico de gerações.
- Botão para usar a próxima sequência.
- Resumo da última sequência, próxima sequência e quantidade.

### Melhorado

- Setor e quadra agora são digitáveis.
- Preenchimento automático com zeros.
- Fluxo de geração em lote.
- Controle persistente da sequência.

### Mantido

- Todas as funcionalidades da versão 1.5.1.

## 1.5.0

### Adicionado

- Detecção automática do tipo de inscrição.
- Seleção manual entre Urbano e ITR.
- Colagem inteligente.
- Normalização automática.
- Painel de situação e contagem de números.
- Pré-visualização da inscrição.
- Cópia somente dos números.
- Cópia automática opcional.
- Histórico persistente de inscrições.

### Melhorado

- Validação em tempo real.
- Experiência de digitação e colagem.
- Organização visual do módulo de inscrição imobiliária.
- Backup atualizado para incluir preferências e histórico do módulo.

### Mantido

- Todas as funcionalidades da versão 1.4.1.

## 1.4.1

### Ajustado

- Pré-visualização posicionada logo abaixo das opções `Análise de projeto` e `Incluir data/hora`.
- Botões `Copiar nome`, `Salvar modelo` e `Limpar campos` movidos para junto da pré-visualização.
- Painéis de blocos mantidos abaixo dos controles principais.

## 1.4.0

### Refatorado

- Gerador de Nome de Arquivo integralmente refeito como montador visual.

### Adicionado

- Blocos configuráveis.
- Reordenação dos blocos.
- Separador configurável.
- Prévia em tempo real.
- Salvamento de modelos personalizados.
- Aplicação e remoção de modelos.
- Histórico de nomes copiados.
- Conversão automática de processo de `/` para `-`.
- Nome sempre em maiúsculas e sem separadores internos.

### Removido

- Modelos fixos de nomenclatura.
- Opção de conversão para maiúsculas.
- Validação obrigatória do processo.
- Seleção de extensão.
- Seleção de tipo de documento.

### Mantido

- Inscrição imobiliária.
- Gerador de lotes.
- Calculadora UVRM.
- Calculadora percentual.
- Configurações e backup.
