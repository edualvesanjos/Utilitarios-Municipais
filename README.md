# Utilitários Municipais — v4.2.6

## Sincronização online da Central de Documentos

A versão 4.2.6 amplia de forma controlada a sincronização com o Supabase. Além dos grupos já sincronizados, os **modelos personalizados da Central de Documentos** passam a ser mantidos online por usuário.

### Dados sincronizados

- preferências gerais e persistência de campos;
- nome de exibição, tema, fonte, cor, layout e seções do Dashboard;
- ferramentas favoritas;
- aba ativa, última ferramenta e ferramentas recentes;
- **modelos personalizados da Central de Documentos**.

Os modelos padrão da Central de Documentos continuam incorporados ao aplicativo e não são gravados no banco, evitando duplicação de dados.

### Dados que continuam somente no navegador

- históricos dos módulos;
- estatísticas de uso e atividades;
- modelos do Montador de Nome de Arquivo;
- valor e casas decimais da UVRM;
- backups e logs locais.

## Execução no StackBlitz

```bash
npm install
npm run dev
```

## Teste recomendado da 4.2.6

1. Entre com a mesma conta em dois computadores/navegadores.
2. No primeiro, crie um modelo personalizado na Central de Documentos e aguarde o estado **Sincronizado**.
3. No segundo, execute **Sincronizar agora** ou reabra a aplicação.
4. Confirme que o modelo aparece na Central de Documentos.
5. Edite o modelo no segundo computador e confirme a atualização no primeiro.
6. Exclua um modelo personalizado e confirme que a exclusão também é propagada.
7. Faça um teste sem internet: crie/edite um modelo, restabeleça a conexão e confirme a sincronização posterior.

Não é necessária alteração estrutural no banco para esta versão: a tabela `public.user_data` já aceita a nova categoria `documents`.
