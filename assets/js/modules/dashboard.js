/* Módulo: dashboard e tela inicial. */


function updateDashboardLastToolHighlight() {
    const lastTool = localStorage.getItem(LAST_TOOL_TAB_KEY);

    document.querySelectorAll(".dashboard-tool-card").forEach((card) => {
        card.classList.toggle(
            "is-last-used",
            Boolean(lastTool) && card.dataset.openTab === lastTool
        );
    });
}

function getDashboardArray(key) {
    const value = getJson(key, []);
    return Array.isArray(value) ? value : [];
}

function formatDashboardBackupDate(value) {
    if (!value) {
        return "Não realizado";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
        timeStyle: "short"
    }).format(date);
}

function formatDashboardUvrmValue(value) {
    const text = String(value || "39,99").trim();
    return `R$ ${text || "39,99"}`;
}

function dashboardRecentText(item) {
    if (typeof item === "string") {
        return item;
    }

    if (!item || typeof item !== "object") {
        return "";
    }

    const preferredKeys = [
        "value",
        "name",
        "result",
        "formatted",
        "masked",
        "calculation",
        "text",
        "label"
    ];

    for (const key of preferredKeys) {
        if (item[key] !== undefined && item[key] !== null) {
            return String(item[key]);
        }
    }

    return Object.values(item)
        .filter((value) => ["string", "number"].includes(typeof value))
        .slice(0, 2)
        .join(" • ");
}

function collectDashboardRecentItems() {
    const sources = [
        {
            key: FILE_HISTORY_KEY,
            module: "Nome de arquivo",
            tab: "arquivo"
        },
        {
            key: REGISTRATION_HISTORY_KEY,
            module: "Inscrição imobiliária",
            tab: "inscricao"
        },
        {
            key: LOT_HISTORY_KEY,
            module: "Número de lote",
            tab: "lote"
        },
        {
            key: UVRM_HISTORY_KEY,
            module: "Calculadora UVRM",
            tab: "uvrm"
        },
        {
            key: PERCENTAGE_HISTORY_KEY,
            module: "Percentual",
            tab: "percentual"
        }
    ];

    return sources
        .flatMap((source) =>
            getDashboardArray(source.key)
                .slice(0, 2)
                .map((item, index) => ({
                    ...source,
                    index,
                    text: dashboardRecentText(item),
                    timestamp:
                        item && typeof item === "object"
                            ? item.timestamp || item.date || item.createdAt || ""
                            : ""
                }))
        )
        .filter((item) => item.text)
        .sort((left, right) => {
            const leftTime = Date.parse(left.timestamp) || 0;
            const rightTime = Date.parse(right.timestamp) || 0;
            return rightTime - leftTime || left.index - right.index;
        })
        .slice(0, 6);
}

function renderDashboardRecentItems() {
    const list = $("#dashboardRecentList");

    if (!list) {
        return;
    }

    const items = collectDashboardRecentItems();

    if (!items.length) {
        list.innerHTML =
            '<li class="empty-state">Nenhuma atividade registrada.</li>';
        return;
    }

    list.innerHTML = "";

    items.forEach((item) => {
        const row = document.createElement("li");
        const content = document.createElement("div");
        const module = document.createElement("strong");
        const text = document.createElement("span");
        const button = document.createElement("button");

        module.textContent = item.module;
        text.textContent = item.text;
        button.type = "button";
        button.className = "text-button";
        button.textContent = "Abrir";
        button.addEventListener("click", () => activateTab(item.tab));

        content.append(module, text);
        row.append(content, button);
        list.appendChild(row);
    });
}

function updateDashboardSummary() {
    updateDashboardLastToolHighlight();
    const metrics = {
        dashboardFileModels: getDashboardArray(FILE_MODELS_KEY).length,
        dashboardFileHistory: getDashboardArray(FILE_HISTORY_KEY).length,
        dashboardRegistrationHistory:
            getDashboardArray(REGISTRATION_HISTORY_KEY).length,
        dashboardLotHistory: getDashboardArray(LOT_HISTORY_KEY).length,
        dashboardUvrmHistory: getDashboardArray(UVRM_HISTORY_KEY).length,
        dashboardPercentageHistory:
            getDashboardArray(PERCENTAGE_HISTORY_KEY).length
    };

    Object.entries(metrics).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = String(value);
        }
    });

    const nextLot = $("#dashboardNextLotSequence");
    if (nextLot) {
        nextLot.textContent = String(getLastLotSequence() + 1);
    }

    const uvrmValue = $("#dashboardUvrmValue");
    if (uvrmValue) {
        uvrmValue.textContent = formatDashboardUvrmValue(
            localStorage.getItem(UVRM_VALUE_KEY)
        );
    }

    const lastBackup = $("#dashboardLastBackup");
    if (lastBackup) {
        lastBackup.textContent = formatDashboardBackupDate(
            localStorage.getItem(LAST_BACKUP_KEY)
        );
    }

    renderDashboardRecentItems();
}

document.querySelectorAll("[data-open-tab]").forEach((element) => {
    element.addEventListener("click", () => {
        activateTab(element.dataset.openTab);
    });
});

const dashboardRefresh = $("#dashboardRefresh");

if (dashboardRefresh) {
    dashboardRefresh.addEventListener("click", () => {
        updateDashboardSummary();
        showToast("Resumo do dashboard atualizado.");
    });
}
