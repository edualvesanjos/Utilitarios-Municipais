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
        return Boolean(url && key);
    }

    function getClient() {
        if (instance) return instance;
        if (initializationError) return null;

        try {
            if (!window.supabase?.createClient) throw new Error("Biblioteca Supabase não carregada.");
            const { url, key } = getConfiguration();
            if (!url || !key) throw new Error("Configuração do Supabase ausente.");

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
        getError: () => initializationError
    });
})();
