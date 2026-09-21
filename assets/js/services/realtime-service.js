import { RealtimeClient } from "https://esm.sh/@supabase/realtime-js@2";

/* Utilitários Municipais v4.6.1.10 DEV — Teste controlado da renovação do token Realtime. */
(async function () {
    "use strict";

    const REALTIME_TOKEN_URL =
        "https://auth.superdb.com.br/rt/v1/token";

    const REALTIME_SCHEMA =
        "proj_utilitariosmunicipais_teste";

    const REALTIME_TABLE = "user_data";

    const DEBOUNCE_MS = 750;
    const TOKEN_RENEWAL_MARGIN_MS = 5 * 60 * 1000;
    const MIN_TOKEN_RENEWAL_DELAY_MS = 30 * 1000;
    const TOKEN_RENEWAL_TEST_DELAY_MS = 60 * 1000;

    let realtimeClient = null;
    let realtimeChannel = null;
    let debounceTimer = null;
    let initializationInProgress = false;
    let subscriptionStatus = "CLOSED";
    let tokenRenewalTimer = null;
    let tokenRenewalInProgress = false;

    function devLog(message, details = null) {
        if (window.APP_ENVIRONMENT !== "development") return;

        try {
            if (details === null) {
                console.info(`[Realtime DEV] ${message}`);
            } else {
                console.info(`[Realtime DEV] ${message}`, details);
            }
        } catch { }
    }

    function getSuperDbClient() {
        return window.BackendClientService?.getClient?.() || null;
    }

    function getSession() {
        return window.OnlineSyncService?.getSession?.() || null;
    }

    function extractDataPlaneToken(result) {
        if (typeof result === "string") return result;

        return (
            result?.token ||
            result?.access_token ||
            result?.data?.token ||
            result?.data?.access_token ||
            null
        );
    }

    async function ensureFreshSuperDbSession() {
        const sync = window.OnlineSyncService;

        if (!sync?.ensureFreshSession) {
            return Boolean(getSession()?.user);
        }

        return sync.ensureFreshSession({ silent: true });
    }

    function clearTokenRenewalTimer() {
        clearTimeout(tokenRenewalTimer);
        tokenRenewalTimer = null;
    }

    function scheduleTokenRenewal(expiresIn) {
        clearTokenRenewalTimer();

        const lifetimeMs = Number(expiresIn) * 1000;
        if (!Number.isFinite(lifetimeMs) || lifetimeMs <= 0) {
            devLog("Renovação automática não agendada: validade do token indisponível.");
            return;
        }

        // TESTE CONTROLADO v4.6.1.10: força a renovação em 60 segundos.
        // Restaurar o cálculo normal antes do fechamento para produção.
        const delayMs = TOKEN_RENEWAL_TEST_DELAY_MS;

        tokenRenewalTimer = setTimeout(() => {
            renewRealtimeToken().catch((error) => {
                devLog("Falha na renovação automática do token.", {
                    message: error?.message || String(error)
                });
            });
        }, delayMs);

        devLog("Renovação do token agendada.", {
            expiresIn: Number(expiresIn),
            renewInSeconds: Math.round(delayMs / 1000),
            testMode: delayMs === TOKEN_RENEWAL_TEST_DELAY_MS
        });
    }

    async function renewRealtimeToken() {
        if (tokenRenewalInProgress) return false;
        if (!realtimeClient || !getSession()?.user) return false;

        tokenRenewalInProgress = true;
        const activeClient = realtimeClient;

        try {
            const sessionReady = await ensureFreshSuperDbSession();
            if (!sessionReady) {
                throw new Error("Sessão SuperDB indisponível para renovar o Realtime.");
            }

            const mint = await mintRealtimeToken();

            if (realtimeClient !== activeClient || !getSession()?.user) {
                return false;
            }

            if (typeof activeClient.setAuth !== "function") {
                throw new Error("Cliente Realtime não oferece setAuth().");
            }

            await activeClient.setAuth(mint.token);
            scheduleTokenRenewal(mint.expires_in);

            devLog("Token Realtime renovado.", {
                expiresIn: mint.expires_in ?? null,
                status: subscriptionStatus
            });

            return true;
        } finally {
            tokenRenewalInProgress = false;
        }
    }

    async function mintRealtimeToken() {
        const superdb = getSuperDbClient();

        if (!superdb?.auth?.getDataPlaneToken) {
            throw new Error(
                "Cliente SuperDB autenticado indisponível."
            );
        }

        const result =
            await superdb.auth.getDataPlaneToken();

        const credential =
            extractDataPlaneToken(result);

        if (!credential) {
            throw new Error(
                "Data Plane Token não encontrado."
            );
        }

        const response = await fetch(
            REALTIME_TOKEN_URL,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${credential}`
                }
            }
        );

        if (!response.ok) {
            throw new Error(
                `Falha ao obter token Realtime: HTTP ${response.status}`
            );
        }

        const mint = await response.json();

        if (!mint?.token || !mint?.url) {
            throw new Error(
                "Resposta Realtime incompleta."
            );
        }

        return mint;
    }

    function scheduleRemoteChange() {
        clearTimeout(debounceTimer);

        debounceTimer = setTimeout(async () => {
            debounceTimer = null;

            const sync = window.OnlineSyncService;

            if (!sync?.handleRealtimeChange) return;

            devLog(
                "Alterações remotas consolidadas; solicitando sincronização."
            );

            try {
                await sync.handleRealtimeChange();
            } catch (error) {
                devLog("Falha ao processar alteração remota.", {
                    message:
                        error?.message || String(error)
                });
            }
        }, DEBOUNCE_MS);
    }

    function handleDatabaseChange(payload) {
        const row =
            payload?.new ||
            payload?.old ||
            {};

        devLog("Evento recebido.", {
            eventType:
                payload?.eventType ?? null,
            dataType:
                row?.data_type ?? null,
            updatedAt:
                row?.updated_at ?? null
        });

        scheduleRemoteChange();
    }

    async function disconnect() {
        clearTimeout(debounceTimer);
        debounceTimer = null;
        clearTokenRenewalTimer();
        tokenRenewalInProgress = false;

        try {
            if (realtimeChannel && realtimeClient) {
                await realtimeClient.removeChannel?.(
                    realtimeChannel
                );
            }
        } catch { }

        try {
            realtimeClient?.disconnect?.();
        } catch { }

        realtimeChannel = null;
        realtimeClient = null;
        subscriptionStatus = "CLOSED";

        devLog("Realtime desconectado.");
    }

    async function connect() {
        if (initializationInProgress) return false;

        if (!getSession()?.user) {
            devLog(
                "Conexão ignorada: usuário não autenticado."
            );
            return false;
        }

        initializationInProgress = true;

        try {
            await disconnect();

            const mint =
                await mintRealtimeToken();

            realtimeClient =
                new RealtimeClient(
                    mint.url,
                    {
                        params: {
                            apikey: mint.token
                        }
                    }
                );

            realtimeChannel =
                realtimeClient
                    .channel(
                        `${REALTIME_SCHEMA}:db-changes`,
                        {
                            config: {
                                private: true
                            }
                        }
                    )
                    .on(
                        "postgres_changes",
                        {
                            event: "*",
                            schema: REALTIME_SCHEMA,
                            table: REALTIME_TABLE
                        },
                        handleDatabaseChange
                    );

            realtimeChannel.subscribe(
                (status, error) => {
                    subscriptionStatus =
                        status || "CLOSED";

                    devLog(
                        "Status da assinatura.",
                        {
                            status:
                                subscriptionStatus,
                            error:
                                error?.message ||
                                error ||
                                null
                        }
                    );
                }
            );

            devLog("Cliente criado.", {
                expiresIn:
                    mint.expires_in ?? null
            });

            scheduleTokenRenewal(mint.expires_in);

            return true;
        } catch (error) {
            devLog(
                "Falha ao conectar.",
                {
                    message:
                        error?.message ||
                        String(error)
                }
            );

            await disconnect();
            return false;
        } finally {
            initializationInProgress = false;
        }
    }

    window.addEventListener("um:session-ready", () => {
        connect().catch((error) => {
            devLog(
                "Falha na conexão após sessão pronta.",
                {
                    message:
                        error?.message ||
                        String(error)
                }
            );
        });
    });
    
    if (getSession()?.user) {
        connect().catch((error) => {
            devLog(
                "Falha na conexão na verificação inicial.",
                {
                    message:
                        error?.message ||
                        String(error)
                }
            );
        });
    }  

    window.RealtimeService =
    Object.freeze({
        connect,
        disconnect,
        isConnected: () =>
            subscriptionStatus ===
            "SUBSCRIBED"
    });
})();