/* Utilitários Municipais v4.3.0 — fundação do histórico sincronizável. */
(function () {
    "use strict";

    const OUTBOX_KEY = "history:outbox";
    const DEVICE_KEY = "online:deviceId";
    const HISTORY_SCHEMA_VERSION = 1;
    const SUPPORTED_MODULES = Object.freeze(["arquivo", "inscricao", "lote", "uvrm", "percentual"]);

    function nowIso() {
        return new Date().toISOString();
    }

    function randomId() {
        if (crypto.randomUUID) return crypto.randomUUID();
        const bytes = new Uint8Array(16);
        crypto.getRandomValues(bytes);
        bytes[6] = (bytes[6] & 0x0f) | 0x40;
        bytes[8] = (bytes[8] & 0x3f) | 0x80;
        const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0"));
        return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex.slice(6, 8).join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10).join("")}`;
    }

    function getDeviceId() {
        let id = StorageService.getText(DEVICE_KEY, "");
        if (!id) {
            id = randomId();
            StorageService.setText(DEVICE_KEY, id);
        }
        return id;
    }

    function safeTimestamp(value) {
        const date = value ? new Date(value) : new Date();
        return Number.isNaN(date.getTime()) ? nowIso() : date.toISOString();
    }

    function normalizeValue(value) {
        if (value === undefined) return null;
        if (value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
            return value;
        }
        try {
            return JSON.parse(JSON.stringify(value));
        } catch {
            return String(value);
        }
    }

    function createRecord({ module, action = "record", value = null, timestamp = null, clientId = null, metadata = {} }) {
        if (!SUPPORTED_MODULES.includes(module)) throw new Error(`Módulo de histórico não suportado: ${module}`);
        return {
            id: randomId(),
            client_id: clientId || randomId(),
            module,
            action: String(action || "record"),
            value: normalizeValue(value),
            metadata: normalizeValue(metadata) || {},
            occurred_at: safeTimestamp(timestamp),
            device_id: getDeviceId(),
            schema_version: HISTORY_SCHEMA_VERSION,
            sync_status: "pending"
        };
    }

    function listPending() {
        const rows = StorageService.get(OUTBOX_KEY, []);
        return Array.isArray(rows) ? rows : [];
    }

    function enqueue(input) {
        const record = input?.module ? createRecord(input) : input;
        if (!record?.client_id) throw new Error("Registro de histórico sem client_id.");
        const rows = listPending();
        if (!rows.some((item) => item.client_id === record.client_id)) rows.push(record);
        StorageService.set(OUTBOX_KEY, rows);
        return record;
    }

    function removePending(clientIds) {
        const ids = new Set(Array.isArray(clientIds) ? clientIds : [clientIds]);
        const next = listPending().filter((item) => !ids.has(item.client_id));
        StorageService.set(OUTBOX_KEY, next);
        return next;
    }

    function clearPending() {
        StorageService.remove(OUTBOX_KEY);
    }

    async function uploadPending() {
        const sync = window.OnlineSyncService;
        const session = sync?.getSession?.();
        const client = window.SupabaseClientService?.getClient?.();
        const rows = listPending();
        if (!rows.length) return { uploaded: 0, remaining: 0 };
        if (!client || !session?.user) return { uploaded: 0, remaining: rows.length, reason: "not_authenticated" };
        if (!navigator.onLine) return { uploaded: 0, remaining: rows.length, reason: "offline" };

        const payload = rows.map((row) => ({
            id: row.id,
            user_id: session.user.id,
            client_id: row.client_id,
            module: row.module,
            action: row.action,
            value: row.value,
            metadata: row.metadata || {},
            occurred_at: row.occurred_at,
            device_id: row.device_id,
            schema_version: row.schema_version || HISTORY_SCHEMA_VERSION
        }));

        const { data, error } = await client
            .from("history_entries")
            .upsert(payload, { onConflict: "user_id,client_id", ignoreDuplicates: false })
            .select("client_id");
        if (error) throw error;
        const uploadedIds = (data || []).map((item) => item.client_id);
        removePending(uploadedIds);
        return { uploaded: uploadedIds.length, remaining: listPending().length };
    }

    async function listRemote({ module = null, limit = 100 } = {}) {
        const sync = window.OnlineSyncService;
        const session = sync?.getSession?.();
        const client = window.SupabaseClientService?.getClient?.();
        if (!client || !session?.user) return [];
        let query = client
            .from("history_entries")
            .select("id,client_id,module,action,value,metadata,occurred_at,device_id,schema_version,created_at,updated_at")
            .eq("user_id", session.user.id)
            .order("occurred_at", { ascending: false })
            .limit(Math.max(1, Math.min(Number(limit) || 100, 500)));
        if (module) query = query.eq("module", module);
        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    }

    window.HistoryService = Object.freeze({
        schemaVersion: HISTORY_SCHEMA_VERSION,
        supportedModules: SUPPORTED_MODULES,
        createRecord,
        enqueue,
        listPending,
        removePending,
        clearPending,
        uploadPending,
        listRemote,
        getDeviceId
    });
})();
