# Changelog

## 2.4.4
- Corrigida a restauração do valor atual da UVRM ao iniciar.
- Corrigida a renderização dos históricos laterais durante a inicialização.
- Adicionada atualização dos dados persistidos em `pageshow`, foco, visibilidade e evento de armazenamento.
- Adicionada migração de chaves compatíveis de versões anteriores.
- Tornada a restauração de cada histórico independente para evitar que uma falha interrompa os demais módulos.


## 2.4.1
- Alterado o exemplo do campo Nome para “Nome da Pessoa ou Razão Social”.
- O botão Copiar nome agora copia exatamente o texto exibido na pré-visualização.
- Reforçado o carregamento de todos os históricos existentes na inicialização e ao restaurar a página.
- Valores iniciais do Gerador de número de lote alterados para setor 99 e quadra 999.
- Separador inicial dos lotes alterado para Sem separador.
- Incluída migração segura dos antigos valores-padrão da versão 2.4.

# Histórico de versões

## 2.4
- Dashboard inteligente com ferramentas recentes e mais utilizadas.
- Histórico global de acessos e ações.
- Atalhos de teclado: Ctrl+K, Ctrl+1 a Ctrl+6, Esc e Ctrl+Shift+C.
- Notificações visuais por tipo: sucesso, aviso e erro.
- Pesquisa avançada por nomes, descrições, palavras-chave e apelidos.
- Interface compacta com preferência persistente.
- Exportação de estatísticas em CSV, JSON e TXT.
- Redefinição independente de estatísticas, favoritos e históricos.
- Registro detalhado de ações e último uso por módulo.
- Backup completo preserva os novos dados e preferências.

## 2.3
- Pesquisa global, favoritos, estatísticas e validação centralizada.

## 2.4.2
- Calculadora UVRM transformada em lista de lançamentos por operação.
- Inclusão de valores em UVRM ou diretamente em reais.
- Descrição opcional para cada lançamento.
- Cópia individual, edição e exclusão de itens.
- Totalização automática e cópia de todos os valores.
- Finalização de operações com histórico detalhado e opção de reabertura.
- Persistência automática da operação atual.
- Compatibilidade mantida com o histórico UVRM das versões anteriores.


## 2.4.3
- Adicionado multiplicador de quantidade para lançamentos em UVRM.
- Campo iniciado automaticamente com o valor 1.
- Cálculo alterado para UVRM informada × quantidade × valor unitário.
- Exibição detalhada da fórmula na pré-visualização e na lista.
- Preservada compatibilidade com lançamentos da versão 2.4.2.
