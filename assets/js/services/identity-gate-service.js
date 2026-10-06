/* Utilitários Municipais v4.6.11 DEV — isolamento local por identidade. */
(function () {
    "use strict";

    const PREFIX = APP_CONFIG.storagePrefix;
    const META = "um4611:";
    const MODE_KEY = `${META}mode`;
    const OWNER_KEY = `${META}owner`;
    const LOCAL_SNAPSHOT_KEY = `${META}snapshot:local`;
    const USER_SNAPSHOT_PREFIX = `${META}snapshot:user:`;
    const MIGRATED_KEY = `${META}legacyMigrated`;
    const SESSION_GATE_KEY = `${META}gatePassed`;
    const TRANSITION_KEY = `${META}identityTransition`;

    function appKeys() {
        const keys = [];
        for (let i = 0; i < localStorage.length; i += 1) {
            const key = localStorage.key(i);
            if (key?.startsWith(PREFIX)) keys.push(key);
        }
        return keys;
    }

    function captureRuntime() {
        const data = {};
        appKeys().forEach((key) => { data[key] = localStorage.getItem(key); });
        return data;
    }

    function clearRuntime() {
        appKeys().forEach((key) => localStorage.removeItem(key));
    }

    function saveSnapshot(key, data = captureRuntime()) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    function readSnapshot(key) {
        try { return JSON.parse(localStorage.getItem(key) || "{}"); } catch { return {}; }
    }

    function restoreSnapshot(key) {
        clearRuntime();
        const data = readSnapshot(key);
        Object.entries(data).forEach(([storageKey, value]) => {
            if (storageKey.startsWith(PREFIX) && value !== null) localStorage.setItem(storageKey, String(value));
        });
    }

    function snapshotKeyForUser(userId) {
        return `${USER_SNAPSHOT_PREFIX}${userId}`;
    }

    function persistActiveSnapshot() {
        const mode = localStorage.getItem(MODE_KEY);
        if (mode === "local") saveSnapshot(LOCAL_SNAPSHOT_KEY);
        if (mode === "account") {
            const owner = localStorage.getItem(OWNER_KEY);
            if (owner) saveSnapshot(snapshotKeyForUser(owner));
        }
    }

    function migrateLegacyOnce() {
        if (localStorage.getItem(MIGRATED_KEY) === "true") return;
        saveSnapshot(LOCAL_SNAPSHOT_KEY);
        clearRuntime();
        localStorage.setItem(MIGRATED_KEY, "true");
        localStorage.removeItem(MODE_KEY);
        localStorage.removeItem(OWNER_KEY);
    }

    function prepareBoot() {
        migrateLegacyOnce();
        if (sessionStorage.getItem(SESSION_GATE_KEY) !== "true") {
            persistActiveSnapshot();
            clearRuntime();
            localStorage.removeItem(MODE_KEY);
            localStorage.removeItem(OWNER_KEY);
            return;
        }
        const mode = localStorage.getItem(MODE_KEY);
        const owner = localStorage.getItem(OWNER_KEY);
        if (mode === "local") restoreSnapshot(LOCAL_SNAPSHOT_KEY);
        else if (mode === "account" && owner) restoreSnapshot(snapshotKeyForUser(owner));
    }

    function waitForClient(timeoutMs = 10000) {
        return new Promise((resolve, reject) => {
            const started = Date.now();
            const timer = setInterval(() => {
                const client = window.BackendClientService?.getClient?.();
                if (client?.auth) { clearInterval(timer); resolve(client); return; }
                if (Date.now() - started >= timeoutMs) {
                    clearInterval(timer);
                    reject(new Error("Serviço de autenticação indisponível."));
                }
            }, 100);
        });
    }

    function showGate() {
        if (sessionStorage.getItem(SESSION_GATE_KEY) === "true" || document.getElementById("identityGate")) return;
        const gate = document.createElement("div");
        gate.id = "identityGate";
        gate.className = "identity-gate";
        gate.innerHTML = `
            <section class="identity-gate-card" role="dialog" aria-modal="true" aria-labelledby="identityGateTitle">
                <div class="identity-gate-brand"><span aria-hidden="true">🏛</span><div><strong>Utilitários Municipais</strong><small>v${APP_CONFIG.version} DEV</small></div></div>
                <h1 id="identityGateTitle">Acessar o aplicativo</h1>
                <p>Entre com sua conta para carregar e sincronizar somente os seus dados.</p>
                <label>E-mail<input id="identityGateEmail" type="email" autocomplete="email"></label>
                <label>Senha<input id="identityGatePassword" type="password" autocomplete="current-password"></label>
                <button id="identityGateLogin" class="primary" type="button">Entrar</button>
                <div class="identity-gate-divider"><span>ou</span></div>
                <button id="identityGateLocal" class="secondary" type="button">Usar somente local</button>
                <p class="help-text">No modo local, os dados ficam somente neste navegador e nunca são sincronizados com o SuperDB.</p>
                <p id="identityGateFeedback" class="feedback" aria-live="polite"></p>
            </section>`;
        document.body.appendChild(gate);

        const feedback = gate.querySelector("#identityGateFeedback");
        const email = gate.querySelector("#identityGateEmail");
        const password = gate.querySelector("#identityGatePassword");
        const login = gate.querySelector("#identityGateLogin");
        const local = gate.querySelector("#identityGateLocal");

        async function chooseLocal() {
            local.disabled = true; login.disabled = true;
            feedback.textContent = "Preparando modo local...";
            try {
                const client = await waitForClient(3000).catch(() => null);
                if (client?.auth?.signOut) await client.auth.signOut().catch?.(() => {});
            } catch { }
            restoreSnapshot(LOCAL_SNAPSHOT_KEY);
            localStorage.setItem(MODE_KEY, "local");
            localStorage.removeItem(OWNER_KEY);
            sessionStorage.setItem(SESSION_GATE_KEY, "true");
            location.reload();
        }

        async function chooseAccount() {
            const userEmail = email.value.trim();
            const userPassword = password.value;
            if (!userEmail || !userPassword) { feedback.textContent = "Informe o e-mail e a senha."; return; }
            login.disabled = true; local.disabled = true;
            feedback.textContent = "Entrando...";
            sessionStorage.setItem(TRANSITION_KEY, "true");
            try {
                const client = await waitForClient();
                const { data, error } = await client.auth.signInWithPassword({ email: userEmail, password: userPassword });
                if (error) throw error;
                const userId = data?.session?.user?.id;
                if (!userId) throw new Error("Não foi possível identificar o usuário autenticado.");
                restoreSnapshot(snapshotKeyForUser(userId));
                localStorage.setItem(MODE_KEY, "account");
                localStorage.setItem(OWNER_KEY, userId);
                sessionStorage.setItem(SESSION_GATE_KEY, "true");
                sessionStorage.removeItem(TRANSITION_KEY);
                location.reload();
            } catch (error) {
                sessionStorage.removeItem(TRANSITION_KEY);
                feedback.textContent = error?.message || "Não foi possível entrar.";
                password.value = ""; password.focus();
                login.disabled = false; local.disabled = false;
            }
        }

        login.addEventListener("click", chooseAccount);
        local.addEventListener("click", chooseLocal);
        password.addEventListener("keydown", (event) => { if (event.key === "Enter") chooseAccount(); });
        setTimeout(() => email.focus(), 0);
    }

    async function prepareSignOut() {
        persistActiveSnapshot();
        clearRuntime();
        localStorage.removeItem(MODE_KEY);
        localStorage.removeItem(OWNER_KEY);
        sessionStorage.removeItem(SESSION_GATE_KEY);
    }

    function isAccountMode() { return localStorage.getItem(MODE_KEY) === "account"; }
    function isLocalMode() { return localStorage.getItem(MODE_KEY) === "local"; }
    function isIdentityTransition() { return sessionStorage.getItem(TRANSITION_KEY) === "true"; }

    prepareBoot();
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", showGate, { once: true });
    else showGate();

    setInterval(() => {
        if (sessionStorage.getItem(SESSION_GATE_KEY) === "true") persistActiveSnapshot();
    }, 1500);
    window.addEventListener("pagehide", persistActiveSnapshot);

    window.IdentityGateService = Object.freeze({
        persistActiveSnapshot, prepareSignOut, isAccountMode, isLocalMode, isIdentityTransition
    });
})();
