const APP_VERSION = "4.6.2";
window.APP_VERSION = APP_VERSION;

/*
 * Ambiente ativo da aplicação.
 *
 * Para testes:
 *   const APP_ENVIRONMENT = "development";
 *
 * Para publicação oficial:
 *   const APP_ENVIRONMENT = "production";
 *
 * IMPORTANTE:
 * - Nunca inclua chaves privadas ou credenciais administrativas
 *   no código executado pelo navegador.
 * - Credenciais públicas necessárias ao frontend devem ser
 *   fornecidas somente pelos mecanismos previstos para o ambiente.
 */
const APP_ENVIRONMENT = "production";
window.APP_ENVIRONMENT = APP_ENVIRONMENT;

const APP_ENVIRONMENT_NAMES = Object.freeze({
    development: "Desenvolvimento",
    production: "Produção"
});

function getEnvironmentName(environment = APP_ENVIRONMENT) {
    return APP_ENVIRONMENT_NAMES[environment] || environment;
}

const APP_CONFIG = Object.freeze({
    name: "Utilitários Municipais",
    version: APP_VERSION,
    schemaVersion: 13,
    storagePrefix: "utilitariosMunicipais:",
    environment: APP_ENVIRONMENT,
    environmentName: getEnvironmentName(),
    debug: APP_ENVIRONMENT === "development"
});

/* v4.6.x DEV — SuperDB como backend operacional exclusivo.
 * Migração funcional concluída em DEV após homologação de autenticação,
 * user_data, sync_log e history_entries.
 * Nenhuma chave privada deve ser incluída no código-fonte.
 */
const BACKEND_MIGRATION = Object.freeze({
    activeProvider: "superdb",
    targetProvider: "superdb",
    stage: "superdb-only",
    superdb: Object.freeze({
        authUrl: "https://auth.superdb.com.br",
        project: "p_f1c97412fa",
        anonKey: "eyJhbGciOiJFUzI1NiIsImtpZCI6ImRwa18yNjA2XzY1NzMwNTM2IiwidHlwIjoiSldUIn0.eyJyb2xlIjoiYW5vbiIsInByb2plY3RfaWQiOiIzNjhiNzE5Ny00NGFlLTQ2ZWMtODU4Yy1hOGQ3NTY0OTRjYjMiLCJwcm9qZWN0X3NjaGVtYSI6InByb2pfcF9mMWM5NzQxMmZhIiwia3YiOjEsInN1YiI6ImFwaWtleTphbm9uIiwiaWF0IjoxNzkwMzAyOTU5LCJpc3MiOiJodHRwczovL2F1dGguc3VwZXJkLmNvbS5iciIsImF1ZCI6Imh0dHBzOi8vYXBpLnN1cGVyZGIuY29tLmJyIn0.dQdOKwx9ADDGcPE03uSTJ_cY6YD15YsmP7_X_Pb7WnlZmh_sY_io8ct_0jQ5neN3-WdbxOBO7Nj5axM0uR5t8g"
    })
});

window.BACKEND_MIGRATION = BACKEND_MIGRATION;
