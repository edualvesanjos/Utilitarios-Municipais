/* Utilitários Municipais v4.6.2.2 DEV — SuperDB Client com isolamento de ambientes. */
import { createClient } from "https://esm.unpkg.com/@superdb/client@0.2.2";

let instance = null;
let initializationError = null;

function getConfiguration() {
    const migration = window.BACKEND_MIGRATION?.superdb || {};
    const env = import.meta.env || {};
    const environment = window.APP_ENVIRONMENT || "development";
    const key = environment === "production"
        ? env.VITE_SUPERDB_PROD_ANON_KEY
        : env.VITE_SUPERDB_DEV_ANON_KEY;

    return {
        environment,
        url: migration.authUrl || "https://auth.superdb.com.br",
        project: migration.project || "",
        schema: migration.schema || "",
        key: key || ""
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
        const { url, project, key } = getConfiguration();
        if (!isConfigured()) throw new Error("SuperDB DEV não configurado. Preencha VITE_SUPERDB_ANON_KEY no arquivo .env.");
        instance = createClient(url, key, { project });
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
