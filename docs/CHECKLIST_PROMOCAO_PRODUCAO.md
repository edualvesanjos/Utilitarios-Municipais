# Checklist — promover uma versão para Produção

- [ ] Testes concluídos com badge **DEV**
- [ ] `APP_ENVIRONMENT = "development"` durante todos os testes
- [ ] RLS auditado em Desenvolvimento
- [ ] Sincronização testada com conta de teste
- [ ] SQL/migrations aprovados
- [ ] Backup ou precaução de produção avaliada antes de mudança estrutural
- [ ] SQL aprovado executado em Produção
- [ ] Auditoria executada em Produção
- [ ] `APP_ENVIRONMENT` alterado para `"production"`
- [ ] `APP_VERSION` corresponde à release
- [ ] Badge **PROD** confirmado antes da publicação
- [ ] README / CHANGELOG / RELEASE / Novidades revisados
- [ ] Pacote final validado
