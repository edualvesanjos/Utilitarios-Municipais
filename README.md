# Utilitários Municipais — v4.2.7

Versão corretiva e de refinamento da série 4.2, mantendo a sincronização online seletiva da Central de Documentos e consolidando ajustes de usabilidade e histórico.

## Principais alterações

- Central de Documentos: novo campo **Ordem**, abaixo de Categoria, com opções **Título** e **Categoria**.
- A ordenação é alfabética pelo critério selecionado e a preferência permanece salva no navegador após fechar o site.
- Removidos da biblioteca padrão: **Despacho de arquivamento**, **Ofício — solicitação de providências** e **Certidão administrativa**.
- Montador de Nome de Arquivo: **Copiar nome** mantém a cópia da Pré-visualização, exibe confirmação e registra o valor com data/hora no histórico do módulo e no Histórico global.
- Registros duplicados do mesmo nome são evitados no histórico recente.
- Sincronização online da Central de Documentos da v4.2.6 foi preservada.

## Ambiente

```bash
npm install
npm run dev
```

O projeto mantém Vite, armazenamento local e sincronização seletiva com Supabase. O arquivo `.env` continua fora do repositório conforme `.gitignore`.
