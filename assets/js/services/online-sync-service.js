/* Versão 4.1 — autenticação e sincronização online com Supabase. */
(function () {
    "use strict";

    const ONLINE_KEYS = Object.freeze({
        preferences: [
            `${APP_CONFIG.storagePrefix}ux31:prefs`,
            `${APP_CONFIG.storagePrefix}compactMode`,
            `${APP_CONFIG.storagePrefix}saveFields`
        ],
        favorites: [
            `${APP_CONFIG.storagePrefix}favorites`
        ],
        models: [
            `${APP_CONFIG.storagePrefix}fileModels`,
            `${APP_CONFIG.storagePrefix}documentTemplates`
        ],
        settings: [
            `${APP_CONFIG.storagePrefix}uvrmValue`,
            `${APP_CONFIG.storagePrefix}uvrmDecimals`
        ]
    });

    const STATE_KEY = `${APP_CONFIG.storagePrefix}online:state`;
    const LAST_SYNC_KEY = `${APP_CONFIG.storagePrefix}online:lastSync`;
    const AUTO_SYNC_KEY = `${APP_CONFIG.storagePrefix}online:autoSync`;
    const DEVICE_KEY = `${APP_CONFIG.storagePrefix}online:deviceId`;
    let client = null;
    let session = null;
    let syncTimer = null;
    let applyingRemote = false;

    function notify(message, type = "success") {
        if (window.NotificationService && typeof NotificationService[type] === "function") {
            NotificationService[type](message);
        } else if (typeof showToast === "function") {
            showToast(message);
        } else {
            console.log(message);
        }
    }

    function getDeviceId() {
        let id = localStorage.getItem(DEVICE_KEY);
        if (!id) {
            id = (crypto.randomUUID?.() || `device-${Date.now()}-${Math.random().toString(16).slice(2)}`);
            localStorage.setItem(DEVICE_KEY, id);
        }
        return id;
    }

    function setOnlineState(value) {
        localStorage.setItem(STATE_KEY, JSON.stringify(value));
        renderOnlineStatus();
    }

    function getOnlineState() {
        try {
            return JSON.parse(localStorage.getItem(STATE_KEY) || "{}");
        } catch {
            return {};
        }
    }

    function isAutoSyncEnabled() {
        return localStorage.getItem(AUTO_SYNC_KEY) !== "false";
    }

    function collectGroup(keys) {
        const content = {};
        keys.forEach((key) => {
            const value = localStorage.getItem(key);
            if (value !== null) content[key] = value;
        });
        return content;
    }

    function collectLocalData() {
        return Object.entries(ONLINE_KEYS).map(([data_type, keys]) => ({
            data_type,
            content: collectGroup(keys)
        }));
    }

    function applyGroup(content) {
        if (!content || typeof content !== "object") return;
        applyingRemote = true;
        try {
            Object.entries(content).forEach(([key, value]) => {
                if (key.startsWith(APP_CONFIG.storagePrefix)) {
                    localStorage.setItem(key, String(value));
                }
            });
        } finally {
            applyingRemote = false;
        }
    }

    function refreshApplication() {
        if (typeof refreshPersistedApplicationData === "function") {
            refreshPersistedApplicationData();
        }
        if (typeof applyPrefs === "function") {
            try { applyPrefs(); } catch {}
        }
        if (typeof renderDashboardFavorites === "function") {
            try { renderDashboardFavorites(); } catch {}
        }
        if (typeof refreshUsageViews === "function") {
            try { refreshUsageViews(); } catch {}
        }
    }

    async function ensureProfile(user) {
        if (!user) return;
        const prefsKey = `${APP_CONFIG.storagePrefix}ux31:prefs`;
        let displayName = "Usuário";
        try {
            const prefs = JSON.parse(localStorage.getItem(prefsKey) || "{}");
            displayName = String(prefs.displayName || "Usuário").trim().slice(0, 40) || "Usuário";
        } catch {}
        const { error } = await client.from("profiles").upsert(
            { id: user.id, display_name: displayName },
            { onConflict: "id" }
        );
        if (error) throw error;
    }

    async function writeSyncLog(status, syncedItems, details = {}) {
        if (!session?.user) return;
        try {
            await client.from("sync_log").insert({
                user_id: session.user.id,
                status,
                app_version: APP_CONFIG.version,
                device_id: getDeviceId(),
                synced_items: syncedItems,
                details
            });
        } catch (error) {
            console.warn("Não foi possível gravar o log de sincronização.", error);
        }
    }

    async function pushLocalData({ silent = false } = {}) {
        if (!client || !session?.user) {
            if (!silent) notify("Faça login para sincronizar.", "warning");
            return false;
        }
        if (!navigator.onLine) {
            if (!silent) notify("Sem conexão. Os dados permanecem salvos localmente.", "warning");
            return false;
        }

        const userId = session.user.id;
        const rows = collectLocalData().map((item) => ({
            user_id: userId,
            data_type: item.data_type,
            content: item.content,
            version: 1
        }));

        const { error } = await client
            .from("user_data")
            .upsert(rows, { onConflict: "user_id,data_type" });

        if (error) {
            setOnlineState({ status: "error", message: error.message });
            await writeSyncLog("error", 0, { direction: "upload", error: error.message });
            if (!silent) notify(`Falha ao sincronizar: ${error.message}`, "error");
            return false;
        }

        const now = new Date().toISOString();
        localStorage.setItem(LAST_SYNC_KEY, now);
        setOnlineState({ status: "synced", at: now });
        await ensureProfile(session.user);
        await writeSyncLog("success", rows.length, { direction: "upload" });
        if (!silent) notify("Dados locais sincronizados com o Supabase.");
        return true;
    }

    async function pullRemoteData({ silent = false } = {}) {
        if (!client || !session?.user || !navigator.onLine) return false;

        const { data, error } = await client
            .from("user_data")
            .select("data_type,content,updated_at")
            .eq("user_id", session.user.id);

        if (error) {
            setOnlineState({ status: "error", message: error.message });
            await writeSyncLog("error", 0, { direction: "download", error: error.message });
            if (!silent) notify(`Falha ao baixar dados: ${error.message}`, "error");
            return false;
        }

        if (!data?.length) {
            return pushLocalData({ silent });
        }

        data.forEach((row) => {
            if (ONLINE_KEYS[row.data_type]) applyGroup(row.content);
        });

        const now = new Date().toISOString();
        localStorage.setItem(LAST_SYNC_KEY, now);
        setOnlineState({ status: "synced", at: now });
        refreshApplication();
        await writeSyncLog("success", data.length, { direction: "download" });
        if (!silent) notify("Dados online restaurados neste navegador.");
        return true;
    }

    function scheduleAutoSync() {
        if (applyingRemote || !isAutoSyncEnabled() || !session?.user) return;
        clearTimeout(syncTimer);
        syncTimer = setTimeout(() => pushLocalData({ silent: true }), 1800);
    }

    function formatDate(value) {
        if (!value) return "Nunca";
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? "Nunca" : date.toLocaleString("pt-BR");
    }

    function renderOnlineStatus() {
        const email = session?.user?.email || "";
        const lastSync = localStorage.getItem(LAST_SYNC_KEY);
        document.querySelectorAll("[data-online-user]").forEach((el) => {
            el.textContent = email || "Não conectado";
        });
        document.querySelectorAll("[data-online-last-sync]").forEach((el) => {
            el.textContent = formatDate(lastSync);
        });
        document.querySelectorAll("[data-online-authenticated]").forEach((el) => {
            el.hidden = !session?.user;
        });
        document.querySelectorAll("[data-online-anonymous]").forEach((el) => {
            el.hidden = !!session?.user;
        });
        const badge = document.getElementById("onlineStatusBadge");
        if (badge) {
            badge.textContent = session?.user ? (navigator.onLine ? "Online" : "Offline") : "Local";
            badge.dataset.state = session?.user ? (navigator.onLine ? "online" : "offline") : "local";
        }
    }

    function createAuthModal() {
        if (document.getElementById("onlineAuthModal")) return;
        const modal = document.createElement("div");
        modal.id = "onlineAuthModal";
        modal.className = "online-modal";
        modal.hidden = true;
        modal.innerHTML = `
            <div class="online-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="onlineAuthTitle">
                <button class="online-modal-close" type="button" aria-label="Fechar">×</button>
                <span class="eyebrow">Supabase</span>
                <h2 id="onlineAuthTitle">Acesso online</h2>
                <p class="help-text">Entre para sincronizar preferências, favoritos, modelos e configurações da UVRM.</p>
                <label>E-mail<input id="onlineEmail" type="email" autocomplete="email" required></label>
                <label>Senha<input id="onlinePassword" type="password" autocomplete="current-password" minlength="6" required></label>
                <div class="actions">
                    <button id="onlineSignIn" class="primary" type="button">Entrar</button>
                    <button id="onlineSignUp" class="secondary" type="button">Criar conta</button>
                </div>
                <button id="onlineResetPassword" class="text-button" type="button">Esqueci minha senha</button>
                <p id="onlineAuthFeedback" class="feedback" aria-live="polite"></p>
            </div>`;
        document.body.appendChild(modal);

        const close = () => { modal.hidden = true; };
        modal.querySelector(".online-modal-close").addEventListener("click", close);
        modal.addEventListener("click", (event) => { if (event.target === modal) close(); });

        const feedback = modal.querySelector("#onlineAuthFeedback");
        const credentials = () => ({
            email: modal.querySelector("#onlineEmail").value.trim(),
            password: modal.querySelector("#onlinePassword").value
        });

        modal.querySelector("#onlineSignIn").addEventListener("click", async () => {
            const { email, password } = credentials();
            feedback.textContent = "Entrando...";
            const { error } = await client.auth.signInWithPassword({ email, password });
            feedback.textContent = error ? error.message : "Login realizado.";
            if (!error) setTimeout(close, 500);
        });

        modal.querySelector("#onlineSignUp").addEventListener("click", async () => {
            const { email, password } = credentials();
            feedback.textContent = "Criando conta...";
            const { data, error } = await client.auth.signUp({
                email,
                password,
                options: { emailRedirectTo: location.href.split("#")[0] }
            });
            feedback.textContent = error
                ? error.message
                : (data.session ? "Conta criada e login realizado." : "Conta criada. Confira seu e-mail para confirmar o cadastro.");
            if (!error && data.session) setTimeout(close, 700);
        });

        modal.querySelector("#onlineResetPassword").addEventListener("click", async () => {
            const email = modal.querySelector("#onlineEmail").value.trim();
            if (!email) {
                feedback.textContent = "Informe o e-mail.";
                return;
            }
            const { error } = await client.auth.resetPasswordForEmail(email, {
                redirectTo: location.href.split("#")[0]
            });
            feedback.textContent = error ? error.message : "E-mail de recuperação enviado.";
        });
    }

    function openAuthModal() {
        createAuthModal();
        document.getElementById("onlineAuthModal").hidden = false;
        document.getElementById("onlineEmail")?.focus();
    }

    function addSettingsPanel() {
        const root = document.querySelector("#configuracoes .builder-panel");
        if (!root || document.getElementById("onlineSettingsPanel")) return;
        const panel = document.createElement("section");
        panel.id = "onlineSettingsPanel";
        panel.className = "settings-card online-settings-card";
        panel.innerHTML = `
            <div class="section-heading">
                <div>
                    <span class="eyebrow">Versão 4.1</span>
                    <h3>Conta e sincronização online</h3>
                    <p class="help-text">O armazenamento local continua ativo. A conta online permite recuperar dados em outro computador.</p>
                </div>
                <span id="onlineStatusBadge" class="online-status-badge">Local</span>
            </div>
            <div class="online-account-summary">
                <div><span>Conta</span><strong data-online-user>Não conectado</strong></div>
                <div><span>Última sincronização</span><strong data-online-last-sync>Nunca</strong></div>
            </div>
            <div class="actions" data-online-anonymous>
                <button id="onlineOpenAuth" class="primary" type="button">Entrar ou criar conta</button>
            </div>
            <div class="actions" data-online-authenticated hidden>
                <button id="onlineSyncNow" class="primary" type="button">Sincronizar agora</button>
                <button id="onlineRestore" class="secondary" type="button">Baixar dados online</button>
                <button id="onlineSignOut" class="danger-outline" type="button">Sair</button>
            </div>
            <label class="checkbox-row">
                <input id="onlineAutoSync" type="checkbox">
                Sincronizar automaticamente quando houver alterações
            </label>
            <p class="help-text">Nesta etapa são sincronizados: aparência, nome de exibição, favoritos, modelos e valor da UVRM.</p>`;
        root.prepend(panel);

        panel.querySelector("#onlineOpenAuth").addEventListener("click", openAuthModal);
        panel.querySelector("#onlineSyncNow").addEventListener("click", () => pushLocalData());
        panel.querySelector("#onlineRestore").addEventListener("click", () => pullRemoteData());
        panel.querySelector("#onlineSignOut").addEventListener("click", () => client.auth.signOut());
        const auto = panel.querySelector("#onlineAutoSync");
        auto.checked = isAutoSyncEnabled();
        auto.addEventListener("change", () => {
            localStorage.setItem(AUTO_SYNC_KEY, String(auto.checked));
            notify(auto.checked ? "Sincronização automática ativada." : "Sincronização automática desativada.");
        });
        renderOnlineStatus();
    }

    async function initializeOnline() {
        addSettingsPanel();
        createAuthModal();

        if (!window.supabase?.createClient) {
            setOnlineState({ status: "unavailable", message: "Biblioteca Supabase não carregada." });
            renderOnlineStatus();
            return;
        }

        client = window.supabase.createClient(
            APP_CONFIG.supabaseUrl,
            APP_CONFIG.supabasePublishableKey,
            {
                auth: {
                    persistSession: true,
                    autoRefreshToken: true,
                    detectSessionInUrl: true
                }
            }
        );

        const { data } = await client.auth.getSession();
        session = data.session;
        renderOnlineStatus();

        client.auth.onAuthStateChange(async (event, nextSession) => {
            session = nextSession;
            renderOnlineStatus();
            if (event === "SIGNED_IN" && session?.user) {
                await ensureProfile(session.user);
                await pullRemoteData({ silent: true });
                notify("Conta conectada ao Supabase.");
            }
            if (event === "SIGNED_OUT") {
                setOnlineState({ status: "local" });
                notify("Sessão encerrada. O armazenamento local permanece disponível.");
            }
        });

        if (session?.user && navigator.onLine) {
            await pullRemoteData({ silent: true });
        }

        window.addEventListener("storage", (event) => {
            if (event.key?.startsWith(APP_CONFIG.storagePrefix)) scheduleAutoSync();
        });
        document.addEventListener("change", scheduleAutoSync, true);
        document.addEventListener("click", (event) => {
            if (event.target.closest("button")) scheduleAutoSync();
        }, true);
        window.addEventListener("online", () => {
            renderOnlineStatus();
            if (session?.user && isAutoSyncEnabled()) pushLocalData({ silent: true });
        });
        window.addEventListener("offline", renderOnlineStatus);

        window.OnlineSyncService = Object.freeze({
            sync: pushLocalData,
            restore: pullRemoteData,
            openLogin: openAuthModal,
            getSession: () => session
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initializeOnline, { once: true });
    } else {
        initializeOnline();
    }
})();