/* Cliente Supabase único e reutilizável — v4.2.0. */
(function () {
    "use strict";

    let instance = null;
    let initializationError = null;

    function getConfiguration() {
        const runtime = window.__APP_ENV__ || {};
        return {
            url: runtime.VITE_SUPABASE_URL || APP_CONFIG.supabaseUrl,
            key: runtime.VITE_SUPABASE_ANON_KEY || APP_CONFIG.supabasePublishableKey
        };
    }

    function isConfigured() {
        const { url, key } = getConfiguration();
        const placeholder = /SEU-PROJETO-DE-TESTE|COLE_A_CHAVE|example|placeholder/i;
        return Boolean(
            url &&
            key &&
            !placeholder.test(url) &&
            !placeholder.test(key)
        );
    }

    function getClient() {
        if (instance) return instance;
        if (initializationError) return null;

        try {
            if (!window.supabase?.createClient) throw new Error("Biblioteca Supabase não carregada.");
            const { url, key } = getConfiguration();
            if (!isConfigured()) {
                throw new Error(
                    `Supabase não configurado para o ambiente "${APP_CONFIG.environment}". ` +
                    "Preencha URL e Publishable key em assets/js/core/config.js."
                );
            }

            instance = window.supabase.createClient(url, key, {
                auth: {
                    persistSession: true,
                    autoRefreshToken: true,
                    detectSessionInUrl: true
                }
            });
            window.Logger?.info("Cliente Supabase inicializado.");
            return instance;
        } catch (error) {
            initializationError = error;
            window.ErrorHandler?.report(error, "Supabase", { silent: true });
            return null;
        }
    }

    window.SupabaseClientService = Object.freeze({
        getClient,
        isConfigured,
        getConfiguration,
        getEnvironment: () => ({
            id: APP_CONFIG.environment,
            name: APP_CONFIG.environmentName
        }),
        getError: () => initializationError
    });
})();
