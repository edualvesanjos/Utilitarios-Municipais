# Utilitários Municipais — v4.0.0

Aplicação web modular para rotinas municipais.

## Novidade principal

A versão 4 inicia os **Fluxos Integrados**. O novo módulo permite registrar os dados do atendimento uma única vez e encaminhá-los para a Central de Documentos, Montador de Nome de Arquivo, Calculadora UVRM e Histórico Global.

## Recursos do fluxo

- salvamento automático do atendimento atual;
- acompanhamento visual das etapas;
- arquivamento de fluxos finalizados;
- exportação em JSON;
- transferência de campos compatíveis entre módulos;
- compatibilidade com dados e configurações da Série 3.

Abra `index.html` em um navegador moderno.


## Supabase — versão 4.1

1. Execute `SUPABASE_SETUP.sql` no SQL Editor do projeto.
2. Em Authentication > Providers, mantenha o provedor Email habilitado.
3. Em Authentication > URL Configuration, cadastre a URL publicada do aplicativo.
4. Abra Configurações > Conta e sincronização online.
5. Crie uma conta ou entre com e-mail e senha.
6. Use **Sincronizar agora** para enviar as preferências locais.

A aplicação permanece funcional sem login e sem internet. Nesta etapa são sincronizados: aparência, nome de exibição, favoritos, modelos do sistema e configurações da UVRM.
