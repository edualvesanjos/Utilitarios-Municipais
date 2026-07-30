# Changelog

## 3.0.1

- Removidos avisos de versões antigas dos módulos Nome de arquivo, Inscrição imobiliária, Número de lote, Percentual e Configurações.
- Criada a área Sobre para centralizar versão, novidades, módulos disponíveis e histórico da Série 3.
- Adicionado o módulo Sobre ao registro central e ao manifesto modular.
- Atualizada a identificação interna para a versão 3.0.1.

## 3.0.0

- Início da arquitetura modular da série 3.
- Criado registro central de ferramentas e categorias.
- Dashboard passou a gerar o catálogo a partir do registro central.
- Adicionados filtros por categoria: Documentos, Cadastros, Cálculos e Sistema.
- Criado `StorageService` para persistência, histórico, backup, importação e migrações.
- Criado `ModuleManager` para registro e ciclo de vida dos módulos.
- Criada biblioteca inicial de componentes reutilizáveis.
- Adicionados manifestos `module.json` para todos os módulos existentes.
- Implantado schema de armazenamento versão 3, compatível com os dados da versão 2.
- Atualizada a identificação visual e interna para a versão 3.0.0.
