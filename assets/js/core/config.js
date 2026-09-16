const APP_VERSION = "4.6.1.6";
window.APP_VERSION = APP_VERSION;

/*
 * Ambiente ativo da aplicação.
 *
 * Para testes:
 *   const APP_ENVIRONMENT = "development";
 *
 * Para publicação oficial:
 *   const APP_ENVIRONMENT = "development";
 *
 * IMPORTANTE:
 * - Nunca coloque sb_secret_... ou service_role neste arquivo.
 * - Somente a Publishable key (sb_publishable_...) pode ficar no navegador.
 */
const APP_ENVIRONMENT = "development";
window.APP_ENVIRONMENT = APP_ENVIRONMENT;

const SUPABASE_ENVIRONMENTS = Object.freeze({
    production: Object.freeze({
        name: "Produção",
        url: "https://ehrujhxfiupghdfrumeq.supabase.co",
        publishableKey: "sb_publishable_2XNgzkyCD04BPUNNO1SJCg_moPRRk9N"
    }),
    development: Object.freeze({
        name: "Desenvolvimento",
        url: "https://rrddlydsnjugwcfwmvee.supabase.co",
        publishableKey: "sb_publishable_u75tO9Eyd8frEyr9KwsCZQ_bXf38TeU"
    })
});

function getSupabaseEnvironmentConfig(environment = APP_ENVIRONMENT) {
    const selected = SUPABASE_ENVIRONMENTS[environment];
    if (!selected) {
        throw new Error(`Ambiente Supabase inválido: ${environment}`);
    }
    return selected;
}

const ACTIVE_SUPABASE_CONFIG = getSupabaseEnvironmentConfig();

const APP_CONFIG = Object.freeze({
    name: "Utilitários Municipais",
    version: APP_VERSION,
    schemaVersion: 13,
    storagePrefix: "utilitariosMunicipais:",
    environment: APP_ENVIRONMENT,
    environmentName: ACTIVE_SUPABASE_CONFIG.name,
    debug: APP_ENVIRONMENT === "development",
    supabaseUrl: ACTIVE_SUPABASE_CONFIG.url,
    supabasePublishableKey: ACTIVE_SUPABASE_CONFIG.publishableKey
});

window.SUPABASE_ENVIRONMENTS = SUPABASE_ENVIRONMENTS;
window.getSupabaseEnvironmentConfig = getSupabaseEnvironmentConfig;


/* v4.6.0 DEV — abstração de backend para migração Supabase → SuperDB.
 * Etapa 1 mantém o Supabase como backend operacional e registra o SuperDB
 * homologado como destino da migração. Nenhuma chave privada deve ser incluída.
 */
const BACKEND_MIGRATION = Object.freeze({
    activeProvider: "superdb",
    targetProvider: "superdb",
    stage: "history-entries",
    superdb: Object.freeze({
        authUrl: "https://auth.superdb.com.br",
        project: "utilitariosmunicipais_teste",
        anonKey: ""
    })
});
window.BACKEND_MIGRATION = BACKEND_MIGRATION;
