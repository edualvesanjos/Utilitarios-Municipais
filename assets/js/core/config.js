const APP_VERSION = "4.6.2.2";
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
const APP_ENVIRONMENT = "development";
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

/* v4.6.2.2 DEV — configuração isolada por ambiente.
 * A troca DEV/PROD é controlada exclusivamente por APP_ENVIRONMENT.
 * Projeto/schema não podem mais ser sobrescritos por VITE_SUPERDB_PROJECT.
 */
const SUPERDB_ENVIRONMENTS = Object.freeze({
    development: Object.freeze({
        authUrl: "https://auth.superdb.com.br",
        project: "utilitariosmunicipais_teste",
        schema: "proj_utilitariosmunicipais_teste"
    }),
    production: Object.freeze({
        authUrl: "https://auth.superdb.com.br",
        project: "p_f1c97412fa",
        schema: "proj_p_f1c97412fa"
    })
});

const ACTIVE_SUPERDB = SUPERDB_ENVIRONMENTS[APP_ENVIRONMENT];
if (!ACTIVE_SUPERDB) {
    throw new Error(`Ambiente SuperDB inválido: ${APP_ENVIRONMENT}`);
}

const BACKEND_MIGRATION = Object.freeze({
    activeProvider: "superdb",
    targetProvider: "superdb",
    stage: "superdb-only",
    superdb: ACTIVE_SUPERDB
});
window.BACKEND_MIGRATION = BACKEND_MIGRATION;
