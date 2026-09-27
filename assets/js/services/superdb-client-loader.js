/* Utilitários Municipais v4.6.2.4 DEV — SuperDB Client com ambiente e sessão isolados. */
import { createClient } from "https://esm.unpkg.com/@superdb/client@0.2.2";

let instance = null;
let initializationError = null;

function getConfiguration() {
    const migration = window.BACKEND_MIGRATION?.superdb || {};
    const env = import.meta.env || {};
    const environment = window.APP_ENVIRONMENT || "development";
    // PROD possui fallback versionado para não depender do .env no deploy.
    // DEV mantém compatibilidade com o secret legado do homolog.
    const key = environment === "production"
        ? (env.VITE_SUPERDB_PROD_ANON_KEY || migration.anonKey)
        : (env.VITE_SUPERDB_DEV_ANON_KEY || env.VITE_SUPERDB_ANON_KEY || migration.anonKey);

    return {
        environment,
        url: migration.authUrl || "https://auth.superdb.com.br",
        project: migration.project || "",
        schema: migration.schema || "",
        key: key || ""
    };
}

function createEnvironmentStorage(environment, project) {
    const prefix = `um:superdb:${environment}:${project}:`;

    return {
        getItem(key) {
            try { return localStorage.getItem(`${prefix}${key}`); }
            catch { return null; }
        },
        setItem(key, value) {
            try { localStorage.setItem(`${prefix}${key}`, value); }
            catch { /* armazenamento indisponível: sessão permanece somente no ciclo atual */ }
        },
        removeItem(key) {
            try { localStorage.removeItem(`${prefix}${key}`); }
            catch { /* sem ação */ }
        }
    };
}

function isConfigured() {
    const { url, project, key } = getConfiguration();
    const placeholder = /COLE_AQUI|placeholder|SEU[_-]?PROJETO/i;
    return Boolean(url && project && key && !placeholder.test(url) && !placeholder.test(project) && !placeholder.test(key));
}

function getClient() {
    if (instance) return instance;
    if (initializationError) return null;
    try {
        const { environment, url, project, key } = getConfiguration();
        if (!isConfigured()) {
            const variable = environment === "production"
                ? "VITE_SUPERDB_PROD_ANON_KEY"
                : "VITE_SUPERDB_DEV_ANON_KEY";
            throw new Error(`SuperDB ${environment === "production" ? "PROD" : "DEV"} não configurado. Verifique ${variable} e a configuração do ambiente.`);
        }
        instance = createClient(url, key, {
            project,
            storage: createEnvironmentStorage(environment, project)
        });
        window.Logger?.info("Cliente SuperDB inicializado.");
        return instance;
    } catch (error) {
        initializationError = error;
        window.ErrorHandler?.report(error, "SuperDB", { silent: true });
        return null;
    }
}

window.SuperDBClientService = Object.freeze({
    getClient,
    isConfigured,
    getConfiguration,
    getError: () => initializationError
});
