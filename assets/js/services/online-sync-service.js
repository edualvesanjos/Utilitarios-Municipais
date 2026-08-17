/* Versão 4.3.1 — conta no cabeçalho e estado técnico de sincronização no rodapé. */
(function () {
    "use strict";

    const SYNC_GROUPS = Object.freeze({
        preferences: Object.freeze([`${APP_CONFIG.storagePrefix}saveFields`]),
        favorites: Object.freeze([`${APP_CONFIG.storagePrefix}favorites`]),
        personalization: Object.freeze([
            `${APP_CONFIG.storagePrefix}ux31:prefs`,
            `${APP_CONFIG.storagePrefix}compactMode`
        ]),
        navigation: Object.freeze([
            `${APP_CONFIG.storagePrefix}activeTab`,
            `${APP_CONFIG.storagePrefix}lastToolTab`,
            `${APP_CONFIG.storagePrefix}recentTools`
        ]),
        documents: Object.freeze([`${APP_CONFIG.storagePrefix}documentTemplates`])
    });

    const STATE_KEY = `${APP_CONFIG.storagePrefix}online:state`;
    const LAST_SYNC_KEY = `${APP_CONFIG.storagePrefix}online:lastSync`;
    const LAST_ATTEMPT_KEY = `${APP_CONFIG.storagePrefix}online:lastAttempt`;
    const LAST_LOCAL_CHANGE_KEY = `${APP_CONFIG.storagePrefix}online:lastLocalChange`;
    const LAST_REMOTE_UPDATE_KEY = `${APP_CONFIG.storagePrefix}online:lastRemoteUpdate`;
    const AUTO_SYNC_KEY = `${APP_CONFIG.storagePrefix}online:autoSync`;
    const DEVICE_KEY = `${APP_CONFIG.storagePrefix}online:deviceId`;
    const PENDING_KEY = `${APP_CONFIG.storagePrefix}online:pending`;
    const CONFLICT_KEY = `${APP_CONFIG.storagePrefix}online:conflict`;
    const MIGRATION_KEY = `${APP_CONFIG.storagePrefix}online:conflictFix423`;
    const DOCUMENTS_MIGRATION_KEY = `${APP_CONFIG.storagePrefix}online:documents426`;
    const SYNC_SCHEMA_VERSION = 5;
    const CONFLICT_TOLERANCE_MS = 2500;

    let client = null;
    let session = null;
    let syncTimer = null;
    let applyingRemote = false;
    let syncInProgress = false;
    let currentConflict = null;
    let watchedLocalSnapshot = "";
    let localWatchTimer = null;

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

    function safeRemove(key) {
        try { localStorage.removeItem(key); } catch {}
    }

    function parseDate(value) {
        const timestamp = value ? Date.parse(value) : 0;
        return Number.isFinite(timestamp) ? timestamp : 0;
    }

    function nowIso() {
        return new Date().toISOString();
    }

    function stableStringify(value) {
        if (value === null || typeof value !== "object") return JSON.stringify(value);
        if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
        const keys = Object.keys(value).sort();
        return `{${keys.map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;
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
        safeSet(STATE_KEY, JSON.stringify({ ...value, updatedAt: nowIso() }));
        renderOnlineStatus();
    }

    function isAutoSyncEnabled() {
        return safeGet(AUTO_SYNC_KEY, "true") !== "false";
    }

    function setPending(value, markChange = false) {
        safeSet(PENDING_KEY, value ? "true" : "false");
        if (value && markChange) safeSet(LAST_LOCAL_CHANGE_KEY, nowIso());
        renderOnlineStatus();
    }

    function hasPendingChanges() {
        return safeGet(PENDING_KEY, "false") === "true";
    }

    function hasConflict() {
        return safeGet(CONFLICT_KEY, "false") === "true";
    }

    function setConflict(value, details = null) {
        safeSet(CONFLICT_KEY, value ? "true" : "false");
        currentConflict = value ? details : null;
        if (!value) safeRemove(CONFLICT_KEY);
        renderOnlineStatus();
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

    function localSnapshotObject() {
        return Object.fromEntries(collectLocalData().map((item) => [item.data_type, item.content]));
    }

    function remoteSnapshotObject(rows) {
        const result = Object.fromEntries(Object.keys(SYNC_GROUPS).map((group) => [group, {}]));
        rows.forEach((row) => {
            if (SYNC_GROUPS[row.data_type]) result[row.data_type] = row.content || {};
        });
        return result;
    }

    function snapshotsEqual(rows) {
        return stableStringify(localSnapshotObject()) === stableStringify(remoteSnapshotObject(rows));
    }

    function documentTemplatesCount(content = collectGroup(SYNC_GROUPS.documents)) {
        const key = `${APP_CONFIG.storagePrefix}documentTemplates`;
        const raw = content?.[key];
        if (raw == null) return 0;
        try {
            const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
            return Array.isArray(parsed) ? parsed.length : 0;
        } catch {
            return 0;
        }
    }

    async function uploadMissingDocumentGroup(rows) {
        if (!session?.user || rows.some((row) => row.data_type === "documents")) return rows;
        const content = collectGroup(SYNC_GROUPS.documents);
        if (!documentTemplatesCount(content)) return rows;
        const { error } = await client.from("user_data").upsert({
            user_id: session.user.id,
            data_type: "documents",
            content,
            version: SYNC_SCHEMA_VERSION
        }, { onConflict: "user_id,data_type" });
        if (error) throw error;
        await writeSyncLog("success", 1, { direction: "upload", groups: ["documents"], migration: "4.2.6" });
        return fetchRemoteRows();
    }

    function resetWatchedSnapshot() {
        watchedLocalSnapshot = stableStringify(localSnapshotObject());
    }

    function startSelectiveLocalWatch() {
        clearInterval(localWatchTimer);
        resetWatchedSnapshot();
        localWatchTimer = setInterval(() => {
            if (applyingRemote || !session?.user) {
                resetWatchedSnapshot();
                return;
            }
            const nextSnapshot = stableStringify(localSnapshotObject());
            if (nextSnapshot === watchedLocalSnapshot) return;
            watchedLocalSnapshot = nextSnapshot;
            scheduleAutoSync(true);
        }, 900);
    }

    function applyGroup(content) {
        if (!content || typeof content !== "object") return;
        applyingRemote = true;
        try {
            Object.entries(content).forEach(([key, value]) => {
                const permitted = Object.values(SYNC_GROUPS).some((keys) => keys.includes(key));
                if (permitted && key.startsWith(APP_CONFIG.storagePrefix)) safeSet(key, value);
            });
        } finally {
            applyingRemote = false;
        }
    }

    function refreshApplication() {
        const refreshers = [
            "refreshPersistedApplicationData",
            "applyPrefs",
            "renderDashboardFavorites",
            "refreshUsageViews",
            "updateDashboardLastToolHighlight",
            "refreshDocumentTemplates"
        ];
        refreshers.forEach((name) => {
            if (typeof window[name] === "function") {
                try { window[name](); } catch (error) { window.Logger?.warn(`Falha ao executar ${name}.`, error); }
            }
        });
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

    async function fetchRemoteRows() {
        const { data, error } = await client
            .from("user_data")
            .select("data_type,content,updated_at,version")
            .eq("user_id", session.user.id)
            .in("data_type", Object.keys(SYNC_GROUPS));
        if (error) throw error;
        return data || [];
    }

    function latestRemoteTimestamp(rows) {
        return rows.reduce((latest, row) => Math.max(latest, parseDate(row.updated_at)), 0);
    }

    function detectConflict(rows) {
        if (!hasPendingChanges() || !rows.length || snapshotsEqual(rows)) return false;
        const lastSync = parseDate(safeGet(LAST_SYNC_KEY, ""));
        const localChanged = parseDate(safeGet(LAST_LOCAL_CHANGE_KEY, ""));
        const remoteChanged = latestRemoteTimestamp(rows);
        return localChanged > lastSync + CONFLICT_TOLERANCE_MS
            && remoteChanged > lastSync + CONFLICT_TOLERANCE_MS;
    }

    async function pushLocalData({ silent = false, force = false } = {}) {
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
        if (hasConflict() && !force) {
            openConflictModal();
            return false;
        }

        syncInProgress = true;
        safeSet(LAST_ATTEMPT_KEY, nowIso());
        setOnlineState({ status: "syncing", direction: "upload" });
        try {
            const rows = collectLocalData().map((item) => ({
                user_id: session.user.id,
                data_type: item.data_type,
                content: item.content,
                version: SYNC_SCHEMA_VERSION
            }));
            const { data: savedRows, error } = await client
                .from("user_data")
                .upsert(rows, { onConflict: "user_id,data_type" })
                .select("data_type,content,updated_at,version");
            if (error) throw error;

            const remoteAt = latestRemoteTimestamp(savedRows || []);
            const syncedAt = remoteAt ? new Date(remoteAt).toISOString() : nowIso();
            safeSet(LAST_SYNC_KEY, syncedAt);
            safeSet(LAST_REMOTE_UPDATE_KEY, syncedAt);
            resetWatchedSnapshot();
            setPending(false);
            setConflict(false);
            setOnlineState({ status: "synced", at: syncedAt, direction: "upload" });
            await ensureProfile(session.user);
            await writeSyncLog("success", rows.length, { direction: "upload", groups: rows.map((row) => row.data_type) });
            if (!silent) notify("Dados locais enviados e sincronizados.");
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
            renderOnlineStatus();
        }
    }

    async function applyRemoteRows(rows, { silent = false } = {}) {
        rows.forEach((row) => {
            if (SYNC_GROUPS[row.data_type]) applyGroup(row.content);
        });
        const syncedAt = nowIso();
        const remoteAt = latestRemoteTimestamp(rows);
        safeSet(LAST_SYNC_KEY, syncedAt);
        if (remoteAt) safeSet(LAST_REMOTE_UPDATE_KEY, new Date(remoteAt).toISOString());
        setPending(false);
        setConflict(false);
        setOnlineState({ status: "synced", at: syncedAt, direction: "download" });
        refreshApplication();
        resetWatchedSnapshot();
        await writeSyncLog("success", rows.length, { direction: "download", groups: rows.map((row) => row.data_type) });
        if (!silent) notify("Dados online aplicados neste navegador.");
        return true;
    }

    async function pullRemoteData({ silent = false, force = false } = {}) {
        if (syncInProgress || !client || !session?.user) return false;
        if (!navigator.onLine) {
            if (!silent) notify("Sem conexão. Não foi possível baixar os dados online.", "warning");
            return false;
        }

        syncInProgress = true;
        safeSet(LAST_ATTEMPT_KEY, nowIso());
        setOnlineState({ status: "syncing", direction: "download" });
        try {
            let rows = await fetchRemoteRows();
            rows = await uploadMissingDocumentGroup(rows);
            if (!rows.length) {
                syncInProgress = false;
                return pushLocalData({ silent, force: true });
            }
            if (!force && detectConflict(rows)) {
                setConflict(true, { rows });
                setOnlineState({ status: "conflict", message: "Alterações locais e online foram encontradas." });
                await writeSyncLog("conflict", rows.length, { direction: "compare" });
                if (!silent) notify("Conflito detectado. Escolha quais dados devem prevalecer.", "warning");
                openConflictModal();
                return false;
            }
            return await applyRemoteRows(rows, { silent });
        } catch (error) {
            setOnlineState({ status: "error", message: error.message });
            await writeSyncLog("error", 0, { direction: "download", error: error.message });
            window.ErrorHandler?.report(error, "Download do Supabase", { silent: true });
            if (!silent) notify(`Falha ao baixar dados: ${error.message}`, "error");
            return false;
        } finally {
            syncInProgress = false;
            renderOnlineStatus();
        }
    }

    async function synchronize({ silent = false } = {}) {
        if (!client || !session?.user) {
            if (!silent) notify("Faça login para sincronizar.", "warning");
            return false;
        }
        if (!navigator.onLine) {
            setPending(hasPendingChanges());
            setOnlineState({ status: "offline" });
            if (!silent) notify("Sem conexão com a internet.", "warning");
            return false;
        }
        if (syncInProgress) return false;

        try {
            let rows = await fetchRemoteRows();
            rows = await uploadMissingDocumentGroup(rows);
            if (rows.length && snapshotsEqual(rows)) {
                const remoteAt = latestRemoteTimestamp(rows);
                const syncedAt = remoteAt ? new Date(remoteAt).toISOString() : nowIso();
                safeSet(LAST_SYNC_KEY, syncedAt);
                safeSet(LAST_REMOTE_UPDATE_KEY, syncedAt);
                setPending(false);
                setConflict(false);
                resetWatchedSnapshot();
                setOnlineState({ status: "synced", at: syncedAt, direction: "compare" });
                return true;
            }
            if (detectConflict(rows)) {
                setConflict(true, { rows });
                setOnlineState({ status: "conflict" });
                openConflictModal();
                return false;
            }
            if (hasPendingChanges() || !rows.length) return pushLocalData({ silent });
            return applyRemoteRows(rows, { silent });
        } catch (error) {
            setOnlineState({ status: "error", message: error.message });
            if (!silent) notify(`Falha ao comparar os dados: ${error.message}`, "error");
            return false;
        }
    }

    function scheduleAutoSync(markChange = true) {
        if (applyingRemote || !session?.user) return;
        setPending(true, markChange);
        if (!isAutoSyncEnabled()) return;
        clearTimeout(syncTimer);
        syncTimer = setTimeout(() => synchronize({ silent: true }), 1800);
    }

    function formatDate(value) {
        if (!value) return "Nunca";
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? "Nunca" : date.toLocaleString("pt-BR");
    }


    function getDisplayName() {
        try {
            const raw = safeGet(`${APP_CONFIG.storagePrefix}ux31:prefs`, "");
            const prefs = raw ? JSON.parse(raw) : {};
            const name = String(prefs?.displayName || "").replace(/\s+/g, " ").trim().slice(0, 40);
            if (name) return name;
        } catch {}
        const email = session?.user?.email || "";
        return email ? email.split("@")[0] : "Entrar";
    }

    function closeHeaderAccountMenu() {
        const menu = document.getElementById("headerAccountMenu");
        const button = document.getElementById("headerAccountButton");
        if (menu) menu.hidden = true;
        if (button) button.setAttribute("aria-expanded", "false");
    }

    function setupHeaderAccountControls() {
        const button = document.getElementById("headerAccountButton");
        const menu = document.getElementById("headerAccountMenu");
        if (!button || !menu || button.dataset.ready === "true") return;
        button.dataset.ready = "true";
        button.addEventListener("click", (event) => {
            event.stopPropagation();
            menu.hidden = !menu.hidden;
            button.setAttribute("aria-expanded", String(!menu.hidden));
        });
        menu.addEventListener("click", (event) => event.stopPropagation());
        document.addEventListener("click", closeHeaderAccountMenu);
        document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeHeaderAccountMenu(); });
        document.getElementById("headerSignIn")?.addEventListener("click", () => { closeHeaderAccountMenu(); openAuthModal(); });
        document.getElementById("headerSyncNow")?.addEventListener("click", () => { closeHeaderAccountMenu(); synchronize(); });
        document.getElementById("headerSignOut")?.addEventListener("click", () => { closeHeaderAccountMenu(); client?.auth.signOut(); });
        document.getElementById("headerAccountSettings")?.addEventListener("click", () => {
            closeHeaderAccountMenu();
            document.querySelector('.ux-main-navigation > [data-tab="configuracoes"]')?.click();
            window.setTimeout(() => document.getElementById("onlineSettingsPanel")?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
        });
    }

    function renderOnlineStatus() {
        const email = session?.user?.email || "";
        const displayName = getDisplayName();
        const lastSync = safeGet(LAST_SYNC_KEY, "");
        const lastAttempt = safeGet(LAST_ATTEMPT_KEY, "");
        document.querySelectorAll("[data-online-user]").forEach((el) => { el.textContent = email || "Não conectado"; });
        document.querySelectorAll("[data-online-last-sync]").forEach((el) => { el.textContent = formatDate(lastSync); });
        document.querySelectorAll("[data-online-last-attempt]").forEach((el) => { el.textContent = formatDate(lastAttempt); });
        document.querySelectorAll("[data-online-pending]").forEach((el) => { el.textContent = hasPendingChanges() ? `${Object.keys(SYNC_GROUPS).length} grupos` : "Nenhuma"; });
        document.querySelectorAll("[data-online-authenticated]").forEach((el) => { el.hidden = !session?.user; });
        document.querySelectorAll("[data-online-anonymous]").forEach((el) => { el.hidden = !!session?.user; });
        document.querySelectorAll("[data-header-authenticated]").forEach((el) => { el.hidden = !session?.user; });
        document.querySelectorAll("[data-header-anonymous]").forEach((el) => { el.hidden = !!session?.user; });
        const conflictButton = document.getElementById("onlineResolveConflict");
        if (conflictButton) conflictButton.hidden = !hasConflict();

        let text = "Local";
        let state = "local";
        let message = "Dados armazenados neste navegador.";
        let accountState = "Somente local";
        if (session?.user) {
            accountState = navigator.onLine ? "Online" : "Offline";
            if (!navigator.onLine) {
                text = hasPendingChanges() ? "Offline — pendente" : "Offline";
                state = "offline";
                message = hasPendingChanges() ? "As alterações serão enviadas após a reconexão." : "Sem conexão com a internet.";
            } else if (syncInProgress) {
                text = "Sincronizando";
                state = "syncing";
                message = "Comparando e transferindo dados.";
            } else if (hasConflict()) {
                text = "Conflito";
                state = "conflict";
                message = "Escolha entre manter os dados locais ou usar os dados online.";
            } else if (hasPendingChanges()) {
                text = "Pendente";
                state = "pending";
                message = "Existem alterações locais aguardando sincronização.";
            } else {
                text = "Sincronizado";
                state = "online";
                message = lastSync ? `Última sincronização: ${formatDate(lastSync)}.` : "Conta conectada.";
            }
        }

        const badges = [document.getElementById("onlineStatusBadge"), document.getElementById("homeOnlineStatusBadge")].filter(Boolean);
        badges.forEach((badge) => {
            badge.textContent = text;
            badge.dataset.state = state;
            badge.title = message;
            badge.setAttribute("aria-label", `Sincronização: ${text}. ${message}`);
        });
        const detail = document.getElementById("onlineStatusDetail");
        if (detail) detail.textContent = message;

        const accountName = document.getElementById("headerAccountName");
        const accountStateEl = document.getElementById("headerAccountState");
        const accountMenuName = document.getElementById("headerAccountMenuName");
        const accountEmail = document.getElementById("headerAccountEmail");
        const accountDot = document.getElementById("headerAccountDot");
        const menuDot = document.getElementById("headerMenuStatusDot");
        const menuStatusText = document.getElementById("headerMenuStatusText");
        const accountVisualState = session?.user ? (navigator.onLine ? "online" : "offline") : "local";
        if (accountName) accountName.textContent = session?.user ? displayName : "Entrar";
        if (accountStateEl) accountStateEl.textContent = accountState;
        if (accountMenuName) accountMenuName.textContent = session?.user ? displayName : "Não conectado";
        if (accountEmail) accountEmail.textContent = email || "Use o armazenamento local ou entre em uma conta.";
        [accountDot, menuDot].filter(Boolean).forEach((dot) => { dot.dataset.state = accountVisualState; });
        if (menuStatusText) menuStatusText.textContent = accountState;

        const footerDot = document.getElementById("footerSyncDot");
        const footerText = document.getElementById("footerSyncText");
        const footerTime = document.getElementById("footerSyncTime");
        if (footerDot) footerDot.dataset.state = state;
        if (footerText) footerText.textContent = session?.user ? text : "Somente local";
        if (footerTime) footerTime.textContent = session?.user
            ? (lastSync ? `Última sincronização: ${formatDate(lastSync)}` : message)
            : "Sem sincronização online";
    }

    function createConflictModal() {
        if (document.getElementById("onlineConflictModal")) return;
        const modal = document.createElement("div");
        modal.id = "onlineConflictModal";
        modal.className = "online-modal";
        modal.hidden = true;
        modal.innerHTML = `
            <div class="online-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="onlineConflictTitle">
                <button class="online-modal-close" type="button" aria-label="Fechar">×</button>
                <span class="eyebrow">Sincronização</span>
                <h2 id="onlineConflictTitle">Conflito de dados</h2>
                <p>Foram encontradas alterações neste navegador e também no Supabase após a última sincronização.</p>
                <p class="help-text">Nenhum dado será substituído até você escolher uma opção.</p>
                <div class="online-conflict-options">
                    <button id="onlineKeepLocal" class="primary" type="button"><strong>Manter dados locais</strong><span>Envia este navegador para o Supabase.</span></button>
                    <button id="onlineUseRemote" class="secondary" type="button"><strong>Usar dados online</strong><span>Substitui as preferências locais pelas armazenadas no Supabase.</span></button>
                </div>
                <button id="onlineResolveLater" class="text-button" type="button">Resolver depois</button>
            </div>`;
        document.body.appendChild(modal);
        const close = () => { modal.hidden = true; };
        modal.querySelector(".online-modal-close").addEventListener("click", close);
        modal.querySelector("#onlineResolveLater").addEventListener("click", close);
        modal.addEventListener("click", (event) => { if (event.target === modal) close(); });
        modal.querySelector("#onlineKeepLocal").addEventListener("click", async () => {
            close();
            await pushLocalData({ force: true });
        });
        modal.querySelector("#onlineUseRemote").addEventListener("click", async () => {
            const rows = currentConflict?.rows;
            close();
            if (rows?.length) await applyRemoteRows(rows);
            else await pullRemoteData({ force: true });
        });
    }

    function openConflictModal() {
        createConflictModal();
        const modal = document.getElementById("onlineConflictModal");
        if (modal) modal.hidden = false;
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
                <p class="help-text">Entre para sincronizar preferências, personalização, favoritos, continuidade do Dashboard e seus modelos personalizados da Central de Documentos.</p>
                <label>E-mail<input id="onlineEmail" type="email" autocomplete="email" required></label>
                <label>Senha<input id="onlinePassword" type="password" autocomplete="current-password" minlength="6" required></label>
                <div class="actions"><button id="onlineSignIn" class="primary" type="button">Entrar</button><button id="onlineSignUp" class="secondary" type="button">Criar conta</button></div>
                <button id="onlineResetPassword" class="text-button" type="button">Esqueci minha senha</button>
                <p id="onlineAuthFeedback" class="feedback" aria-live="polite"></p>
            </div>`;
        document.body.appendChild(modal);
        const close = () => { modal.hidden = true; };
        modal.querySelector(".online-modal-close").addEventListener("click", close);
        modal.addEventListener("click", (event) => { if (event.target === modal) close(); });
        const feedback = modal.querySelector("#onlineAuthFeedback");
        const credentials = () => ({ email: modal.querySelector("#onlineEmail").value.trim(), password: modal.querySelector("#onlinePassword").value });
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
            const { data, error } = await client.auth.signUp({ email, password, options: { emailRedirectTo: location.href.split("#")[0] } });
            feedback.textContent = error ? error.message : (data.session ? "Conta criada e login realizado." : "Conta criada. Confira seu e-mail para confirmar o cadastro.");
            if (!error && data.session) setTimeout(close, 700);
        });
        modal.querySelector("#onlineResetPassword").addEventListener("click", async () => {
            const email = modal.querySelector("#onlineEmail").value.trim();
            if (!email) { feedback.textContent = "Informe o e-mail."; return; }
            const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo: location.href.split("#")[0] });
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
                <div><span class="eyebrow">Versão 4.3.1</span><h3>Conta e gerenciamento da sincronização</h3><p class="help-text">O armazenamento local continua ativo. A sincronização online mantém preferências, favoritos e modelos personalizados da Central de Documentos disponíveis em outros computadores.</p></div>
                <span id="onlineStatusBadge" class="online-status-badge">Local</span>
            </div>
            <p id="onlineStatusDetail" class="online-status-detail">Dados armazenados neste navegador.</p>
            <div class="online-account-summary">
                <div><span>Conta</span><strong data-online-user>Não conectado</strong></div>
                <div><span>Última sincronização</span><strong data-online-last-sync>Nunca</strong></div>
                <div><span>Última tentativa</span><strong data-online-last-attempt>Nunca</strong></div>
                <div><span>Pendências</span><strong data-online-pending>Nenhuma</strong></div>
            </div>
            <div class="actions" data-online-anonymous><button id="onlineOpenAuth" class="primary" type="button">Entrar ou criar conta</button></div>
            <div class="actions" data-online-authenticated hidden>
                <button id="onlineSyncNow" class="primary" type="button">Sincronizar agora</button>
                <button id="onlineRestore" class="secondary" type="button">Usar dados online</button>
                <button id="onlineResolveConflict" class="secondary" type="button" hidden>Resolver conflito</button>
                <button id="onlineSignOut" class="danger-outline" type="button">Sair</button>
            </div>
            <label class="checkbox-row"><input id="onlineAutoSync" type="checkbox">Sincronizar automaticamente quando houver alterações</label>
            <p class="help-text">Sincronizados: preferências, nome de exibição, aparência, favoritos, última ferramenta, continuidade do Dashboard e modelos personalizados da Central de Documentos. Históricos dos módulos, estatísticas e valores da UVRM permanecem somente neste navegador.</p>`;
        root.prepend(panel);
        panel.querySelector("#onlineOpenAuth").addEventListener("click", openAuthModal);
        panel.querySelector("#onlineSyncNow").addEventListener("click", () => synchronize());
        panel.querySelector("#onlineRestore").addEventListener("click", () => pullRemoteData());
        panel.querySelector("#onlineResolveConflict").addEventListener("click", openConflictModal);
        panel.querySelector("#onlineSignOut").addEventListener("click", () => client?.auth.signOut());
        const auto = panel.querySelector("#onlineAutoSync");
        auto.checked = isAutoSyncEnabled();
        auto.addEventListener("change", () => {
            safeSet(AUTO_SYNC_KEY, auto.checked);
            notify(auto.checked ? "Sincronização automática ativada." : "Sincronização automática desativada.");
            if (auto.checked && hasPendingChanges()) scheduleAutoSync(false);
        });
        renderOnlineStatus();
    }

    async function initializeOnline() {
        addSettingsPanel();
        createAuthModal();
        createConflictModal();
        setupHeaderAccountControls();
        client = window.SupabaseClientService?.getClient() || null;
        if (!client) {
            const message = window.SupabaseClientService?.getError()?.message || "Cliente Supabase indisponível.";
            setOnlineState({ status: "unavailable", message });
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
        if (safeGet(MIGRATION_KEY, "false") !== "true") {
            setConflict(false);
            safeSet(MIGRATION_KEY, "true");
        }
        if (safeGet(DOCUMENTS_MIGRATION_KEY, "false") !== "true") {
            if (documentTemplatesCount() > 0) setPending(true, true);
            safeSet(DOCUMENTS_MIGRATION_KEY, "true");
        }
        renderOnlineStatus();

        client.auth.onAuthStateChange(async (event, nextSession) => {
            session = nextSession;
            resetWatchedSnapshot();
            renderOnlineStatus();
            if (event === "SIGNED_IN" && session?.user) {
                await ensureProfile(session.user);
                await synchronize({ silent: true });
                notify("Conta conectada ao Supabase.");
            }
            if (event === "SIGNED_OUT") {
                setConflict(false);
                setOnlineState({ status: "local" });
                notify("Sessão encerrada. O armazenamento local permanece disponível.");
            }
        });

        if (session?.user && navigator.onLine) await synchronize({ silent: true });

        window.addEventListener("storage", (event) => {
            if (event.key && Object.values(SYNC_GROUPS).some((keys) => keys.includes(event.key))) {
                resetWatchedSnapshot();
                scheduleAutoSync(true);
            }
        });
        startSelectiveLocalWatch();
        window.addEventListener("online", () => {
            renderOnlineStatus();
            if (session?.user && isAutoSyncEnabled()) synchronize({ silent: true });
        });
        window.addEventListener("offline", renderOnlineStatus);
        document.addEventListener("visibilitychange", () => {
            if (document.visibilityState === "visible" && session?.user && navigator.onLine && isAutoSyncEnabled()) synchronize({ silent: true });
        });
        window.addEventListener("beforeunload", () => {
            if (session?.user && hasPendingChanges()) safeSet(PENDING_KEY, "true");
        });

        window.OnlineSyncService = Object.freeze({
            sync: synchronize,
            upload: pushLocalData,
            restore: pullRemoteData,
            openLogin: openAuthModal,
            openConflict: openConflictModal,
            getSession: () => session,
            getGroups: () => Object.keys(SYNC_GROUPS),
            hasPendingChanges,
            hasConflict
        });
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initializeOnline, { once: true });
    else initializeOnline();
})();
