/* Versão 4.2.1 — primeira sincronização seletiva de preferências e favoritos. */
(function () {
    "use strict";

    const SYNC_GROUPS = Object.freeze({
        preferences: Object.freeze([
            `${APP_CONFIG.storagePrefix}saveFields`
        ]),
        favorites: Object.freeze([
            `${APP_CONFIG.storagePrefix}favorites`
        ]),
        personalization: Object.freeze([
            `${APP_CONFIG.storagePrefix}ux31:prefs`,
            `${APP_CONFIG.storagePrefix}compactMode`
        ]),
        navigation: Object.freeze([
            `${APP_CONFIG.storagePrefix}activeTab`,
            `${APP_CONFIG.storagePrefix}lastToolTab`,
            `${APP_CONFIG.storagePrefix}recentTools`
        ])
    });

    const STATE_KEY = `${APP_CONFIG.storagePrefix}online:state`;
    const LAST_SYNC_KEY = `${APP_CONFIG.storagePrefix}online:lastSync`;
    const AUTO_SYNC_KEY = `${APP_CONFIG.storagePrefix}online:autoSync`;
    const DEVICE_KEY = `${APP_CONFIG.storagePrefix}online:deviceId`;
    const PENDING_KEY = `${APP_CONFIG.storagePrefix}online:pending`;
    const SYNC_SCHEMA_VERSION = 2;

    let client = null;
    let session = null;
    let syncTimer = null;
    let applyingRemote = false;
    let syncInProgress = false;

    function notify(message, type = "success") {
        if (window.NotificationService && typeof NotificationService[type] === "function") {
            NotificationService[type](message);
        } else if (typeof showToast === "function") {
            showToast(message);
        } else {
            window.Logger?.info(message);
        }
    }

    function safeGet(key, fallback = null) {
        try {
            const value = localStorage.getItem(key);
            return value === null ? fallback : value;
        } catch (error) {
            window.ErrorHandler?.report(error, "Leitura da sincronização", { silent: true });
            return fallback;
        }
    }

    function safeSet(key, value) {
        try {
            localStorage.setItem(key, String(value));
            return true;
        } catch (error) {
            window.ErrorHandler?.report(error, "Gravação da sincronização", { silent: true });
            return false;
        }
    }

    function getDeviceId() {
        let id = safeGet(DEVICE_KEY, "");
        if (!id) {
            id = crypto.randomUUID?.() || `device-${Date.now()}-${Math.random().toString(16).slice(2)}`;
            safeSet(DEVICE_KEY, id);
        }
        return id;
    }

    function setOnlineState(value) {
        safeSet(STATE_KEY, JSON.stringify(value));
        renderOnlineStatus();
    }

    function isAutoSyncEnabled() {
        return safeGet(AUTO_SYNC_KEY, "true") !== "false";
    }

    function setPending(value) {
        safeSet(PENDING_KEY, value ? "true" : "false");
        renderOnlineStatus();
    }

    function hasPendingChanges() {
        return safeGet(PENDING_KEY, "false") === "true";
    }

    function collectGroup(keys) {
        const content = {};
        keys.forEach((key) => {
            const value = safeGet(key, null);
            if (value !== null) content[key] = value;
        });
        return content;
    }

    function collectLocalData() {
        return Object.entries(SYNC_GROUPS).map(([data_type, keys]) => ({
            data_type,
            content: collectGroup(keys)
        }));
    }

    function applyGroup(content) {
        if (!content || typeof content !== "object") return;
        applyingRemote = true;
        try {
            Object.entries(content).forEach(([key, value]) => {
                const permitted = Object.values(SYNC_GROUPS).some((keys) => keys.includes(key));
                if (permitted && key.startsWith(APP_CONFIG.storagePrefix)) {
                    safeSet(key, value);
                }
            });
        } finally {
            applyingRemote = false;
        }
    }

    function refreshApplication() {
        if (typeof refreshPersistedApplicationData === "function") {
            try { refreshPersistedApplicationData(); } catch {}
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
        if (typeof updateDashboardLastToolHighlight === "function") {
            try { updateDashboardLastToolHighlight(); } catch {}
        }
    }

    async function ensureProfile(user) {
        if (!user) return;
        const prefsKey = `${APP_CONFIG.storagePrefix}ux31:prefs`;
        let displayName = "Usuário";
        try {
            const prefs = JSON.parse(safeGet(prefsKey, "{}"));
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
                details: { sync_schema: SYNC_SCHEMA_VERSION, ...details }
            });
        } catch (error) {
            window.Logger?.warn("Não foi possível gravar o log de sincronização.", error);
        }
    }

    async function pushLocalData({ silent = false } = {}) {
        if (syncInProgress) return false;
        if (!client || !session?.user) {
            if (!silent) notify("Faça login para sincronizar.", "warning");
            return false;
        }
        if (!navigator.onLine) {
            setPending(true);
            setOnlineState({ status: "offline", message: "Sincronização pendente" });
            if (!silent) notify("Sem conexão. As alterações permanecem salvas localmente.", "warning");
            return false;
        }

        syncInProgress = true;
        setOnlineState({ status: "syncing" });
        try {
            const rows = collectLocalData().map((item) => ({
                user_id: session.user.id,
                data_type: item.data_type,
                content: item.content,
                version: SYNC_SCHEMA_VERSION
            }));

            const { error } = await client
                .from("user_data")
                .upsert(rows, { onConflict: "user_id,data_type" });

            if (error) throw error;

            const now = new Date().toISOString();
            safeSet(LAST_SYNC_KEY, now);
            setPending(false);
            setOnlineState({ status: "synced", at: now });
            await ensureProfile(session.user);
            await writeSyncLog("success", rows.length, {
                direction: "upload",
                groups: rows.map((row) => row.data_type)
            });
            if (!silent) notify("Preferências e favoritos sincronizados com o Supabase.");
            return true;
        } catch (error) {
            setPending(true);
            setOnlineState({ status: "error", message: error.message });
            await writeSyncLog("error", 0, { direction: "upload", error: error.message });
            window.ErrorHandler?.report(error, "Envio ao Supabase", { silent: true });
            if (!silent) notify(`Falha ao sincronizar: ${error.message}`, "error");
            return false;
        } finally {
            syncInProgress = false;
        }
    }

    async function pullRemoteData({ silent = false } = {}) {
        if (syncInProgress || !client || !session?.user) return false;
        if (!navigator.onLine) {
            if (!silent) notify("Sem conexão. Não foi possível baixar os dados online.", "warning");
            return false;
        }

        syncInProgress = true;
        setOnlineState({ status: "syncing" });
        try {
            const { data, error } = await client
                .from("user_data")
                .select("data_type,content,updated_at,version")
                .eq("user_id", session.user.id)
                .in("data_type", Object.keys(SYNC_GROUPS));

            if (error) throw error;

            if (!data?.length) {
                syncInProgress = false;
                return pushLocalData({ silent });
            }

            data.forEach((row) => {
                if (SYNC_GROUPS[row.data_type]) applyGroup(row.content);
            });

            const now = new Date().toISOString();
            safeSet(LAST_SYNC_KEY, now);
            setPending(false);
            setOnlineState({ status: "synced", at: now });
            refreshApplication();
            await writeSyncLog("success", data.length, {
                direction: "download",
                groups: data.map((row) => row.data_type)
            });
            if (!silent) notify("Preferências e favoritos online foram restaurados.");
            return true;
        } catch (error) {
            setOnlineState({ status: "error", message: error.message });
            await writeSyncLog("error", 0, { direction: "download", error: error.message });
            window.ErrorHandler?.report(error, "Download do Supabase", { silent: true });
            if (!silent) notify(`Falha ao baixar dados: ${error.message}`, "error");
            return false;
        } finally {
            syncInProgress = false;
        }
    }

    function scheduleAutoSync() {
        if (applyingRemote || !session?.user) return;
        setPending(true);
        if (!isAutoSyncEnabled()) return;
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
        const lastSync = safeGet(LAST_SYNC_KEY, "");
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
        if (!badge) return;

        let text = "Local";
        let state = "local";
        if (session?.user) {
            if (!navigator.onLine) {
                text = hasPendingChanges() ? "Offline — pendente" : "Offline";
                state = "offline";
            } else if (syncInProgress) {
                text = "Sincronizando";
                state = "syncing";
            } else if (hasPendingChanges()) {
                text = "Pendente";
                state = "pending";
            } else {
                text = "Sincronizado";
                state = "online";
            }
        }
        badge.textContent = text;
        badge.dataset.state = state;
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
                <p class="help-text">Entre para sincronizar preferências, personalização, favoritos e continuidade do Dashboard.</p>
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
        const modal = document.getElementById("onlineAuthModal");
        if (!modal) return;
        modal.hidden = false;
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
                    <span class="eyebrow">Versão 4.2.1</span>
                    <h3>Conta e sincronização online</h3>
                    <p class="help-text">O armazenamento local continua ativo. A conta online permite recuperar as preferências em outro computador.</p>
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
            <p class="help-text">Sincronizados nesta etapa: preferências, nome de exibição, aparência, favoritos, última ferramenta e continuidade do Dashboard. Históricos, modelos, documentos e valores da UVRM permanecem somente neste navegador.</p>`;
        root.prepend(panel);

        panel.querySelector("#onlineOpenAuth").addEventListener("click", openAuthModal);
        panel.querySelector("#onlineSyncNow").addEventListener("click", () => pushLocalData());
        panel.querySelector("#onlineRestore").addEventListener("click", () => pullRemoteData());
        panel.querySelector("#onlineSignOut").addEventListener("click", () => client?.auth.signOut());
        const auto = panel.querySelector("#onlineAutoSync");
        auto.checked = isAutoSyncEnabled();
        auto.addEventListener("change", () => {
            safeSet(AUTO_SYNC_KEY, auto.checked);
            notify(auto.checked ? "Sincronização automática ativada." : "Sincronização automática desativada.");
            if (auto.checked && hasPendingChanges()) scheduleAutoSync();
        });
        renderOnlineStatus();
    }

    async function initializeOnline() {
        addSettingsPanel();
        createAuthModal();

        client = window.SupabaseClientService?.getClient() || null;
        if (!client) {
            const message = window.SupabaseClientService?.getError()?.message || "Cliente Supabase indisponível.";
            setOnlineState({ status: "unavailable", message });
            renderOnlineStatus();
            window.Logger?.warn(message);
            return;
        }

        try {
            const { data, error } = await client.auth.getSession();
            if (error) throw error;
            session = data.session;
        } catch (error) {
            window.ErrorHandler?.report(error, "Sessão Supabase", { silent: true });
            session = null;
        }
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
            if (event.key && Object.values(SYNC_GROUPS).some((keys) => keys.includes(event.key))) {
                scheduleAutoSync();
            }
        });
        document.addEventListener("change", scheduleAutoSync, true);
        document.addEventListener("click", (event) => {
            if (event.target.closest("button")) scheduleAutoSync();
        }, true);
        window.addEventListener("online", () => {
            renderOnlineStatus();
            if (session?.user && isAutoSyncEnabled() && hasPendingChanges()) {
                pushLocalData({ silent: true });
            }
        });
        window.addEventListener("offline", renderOnlineStatus);

        window.OnlineSyncService = Object.freeze({
            sync: pushLocalData,
            restore: pullRemoteData,
            openLogin: openAuthModal,
            getSession: () => session,
            getGroups: () => Object.keys(SYNC_GROUPS),
            hasPendingChanges
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initializeOnline, { once: true });
    } else {
        initializeOnline();
    }
})();
