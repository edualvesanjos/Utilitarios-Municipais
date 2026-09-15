/* Utilitários Municipais v4.6.0 DEV — Backend Adapter, Etapa 1. */
(function () {
    "use strict";

    let initializationError = null;

    function getActiveProvider() {
        return window.BACKEND_MIGRATION?.activeProvider || "supabase";
    }

    function getTargetProvider() {
        return window.BACKEND_MIGRATION?.targetProvider || getActiveProvider();
    }

    function getClient() {
        try {
            const provider = getActiveProvider();
            if (provider === "supabase") {
                return window.SupabaseClientService?.getClient?.() || null;
            }
            throw new Error(`Provider ainda não ativado nesta etapa: ${provider}`);
        } catch (error) {
            initializationError = error;
            window.ErrorHandler?.report(error, "Backend Adapter", { silent: true });
            return null;
        }
    }

    function isConfigured() {
        if (getActiveProvider() === "supabase") {
            return Boolean(window.SupabaseClientService?.isConfigured?.());
        }
        return false;
    }

    function getEnvironment() {
        return {
            id: APP_CONFIG.environment,
            name: APP_CONFIG.environmentName,
            activeProvider: getActiveProvider(),
            targetProvider: getTargetProvider(),
            migrationStage: window.BACKEND_MIGRATION?.stage || "legacy"
        };
    }

    window.BackendClientService = Object.freeze({
        getClient,
        isConfigured,
        getEnvironment,
        getActiveProvider,
        getTargetProvider,
        getError: () => initializationError || window.SupabaseClientService?.getError?.() || null
    });
})();
