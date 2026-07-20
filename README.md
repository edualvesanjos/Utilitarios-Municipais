# Utilitários Municipais — versão 1.4.1

Refatoração completa do módulo Gerador de Nome de Arquivo.

## Principais mudanças

- Remoção dos modelos fixos de nomenclatura.
- Montador visual baseado em blocos.
- Blocos disponíveis:
  - Nome
  - Prefixo
  - Processo
  - AP
  - Data/Hora
- Ativação e desativação individual de cada bloco.
- Reordenação por botões Subir e Descer.
- Pré-visualização automática em tempo real.
- Separador configurável.
- Nome sempre em letras maiúsculas e sem espaços.
- Processo digitado como `número/ano` e convertido para `número-ano`.
- Data e hora no padrão `ddmmaaaahhmmss`.
- Modelos personalizados salvos no navegador.
- Histórico dos nomes copiados.

## Exemplo

```text
Nome: Eduardo Alves dos Anjos
Prefixo: DAE
Processo: 22667/2026
AP: ativado
Data/Hora: ativado
```

Ordem:

```text
Nome
Prefixo
Processo
AP
Data/Hora
```

Resultado:

```text
EDUARDOALVESDOSANJOS_DAE_22667-2026_AP_18072026153045
```


```text
UtilitariosMunicipais_v1.4/
├── index.html
├── app.css
├── app.js
├── README.md
└── CHANGELOG.md
```



- A pré-visualização foi movida para logo abaixo do painel de opções.
- Os botões `Copiar nome`, `Salvar modelo` e `Limpar campos` agora aparecem imediatamente após a pré-visualização.
- Os painéis `Blocos disponíveis` e `Ordem dos blocos` permanecem abaixo desses controles.
