/* Inicialização e integração geral da aplicação. */

/* Inicialização */

function applyApplicationMetadata() {
    document.title = APP_CONFIG.name;

    document.querySelectorAll("[data-app-version]").forEach((element) => {
        element.textContent = APP_CONFIG.version;
    });

    document.querySelectorAll("[data-app-name]").forEach((element) => {
        element.textContent = APP_CONFIG.name;
    });
}


function applyVersion241Defaults() {
    const migrationKey = `${STORAGE_PREFIX}migration:2.4.1`;

    if (localStorage.getItem(migrationKey) === "done") {
        return;
    }

    // Converte apenas os valores-padrão antigos, preservando escolhas personalizadas.
    if ($("#loteSetor").value === "97") {
        $("#loteSetor").value = "99";
    }

    if ($("#loteQuadra").value === "997") {
        $("#loteQuadra").value = "999";
    }

    if ($("#loteSeparador").value === ".") {
        $("#loteSeparador").value = "";
    }

    localStorage.setItem(migrationKey, "done");
    saveFormData();
}

function renderAllExistingHistories() {
    safeInvoke(renderFileHistory);
    safeInvoke(renderRegistrationHistory);
    safeInvoke(renderLotHistory);
    safeInvoke(renderUvrmHistory);
    safeInvoke(renderPercentageHistory);
}

function initializeApplication() {
    applyApplicationMetadata();
    if (typeof initializeV3Architecture === "function") initializeV3Architecture();
    migrateCompatibleStorageKeys();
    const salvarCampos = $("#salvarCampos");
    if (salvarCampos) {
        salvarCampos.checked = shouldSaveFields();
    }

    restoreFormData();
    applyVersion241Defaults();

    $("#arquivoSeparador").value = fileBuilderState.separator;
    $("#arquivoAnaliseProjeto").checked =
        fileBuilderState.enabled.includes("ap");
    $("#arquivoDataHora").checked =
        fileBuilderState.enabled.includes("datahora");

    renderAvailableBlocks();
    renderBlockOrder();
    renderFileModels();
    renderFileHistory();
    updateFilePreview();

    $("#inscricaoCopiaAutomatica").checked =
        localStorage.getItem(REGISTRATION_AUTO_COPY_KEY) === "true";

    renderRegistrationHistory();
    updateRegistrationField();

    if (!$("#loteSequenciaInicial").value) {
        $("#loteSequenciaInicial").value = getLastLotSequence() + 1;
    }

    renderLotHistory();
    updateLastLotDisplay();
    updateLotPreview();

    const storedUvrmValue = localStorage.getItem(UVRM_VALUE_KEY);
    const restoredUvrmValue = storedUvrmValue && storedUvrmValue.trim()
        ? storedUvrmValue
        : $("#uvrmValorUnitario").value || "39,99";
    $("#uvrmValorUnitario").value = restoredUvrmValue;
    localStorage.setItem(UVRM_VALUE_KEY, restoredUvrmValue);

    const restoredUvrmDecimals = localStorage.getItem(UVRM_DECIMALS_KEY)
        || $("#uvrmCasas").value
        || "2";
    $("#uvrmCasas").value = restoredUvrmDecimals;
    localStorage.setItem(UVRM_DECIMALS_KEY, restoredUvrmDecimals);

    renderUvrmHistory();
    renderUvrmCurrentList();
    updateUvrmTypeInterface();
    clearUvrmResult();

    renderPercentageHistory();
    updatePercentageMode();

    // Garante a recuperação de todos os históricos já existentes ao abrir ou restaurar a página.
    renderAllExistingHistories();

    updateSettingsSummary();
    updateDashboardSummary();

    const storedTab = localStorage.getItem(ACTIVE_TAB_KEY);
    activateTab(storedTab && document.getElementById(storedTab) ? storedTab : "inicio", { track: false });
}

function refreshPersistedApplicationData() {
    migrateCompatibleStorageKeys();

    const storedUvrmValue = localStorage.getItem(UVRM_VALUE_KEY);
    if (storedUvrmValue !== null && document.activeElement !== $("#uvrmValorUnitario")) {
        $("#uvrmValorUnitario").value = storedUvrmValue;
    }

    const storedDecimals = localStorage.getItem(UVRM_DECIMALS_KEY);
    if (storedDecimals !== null) {
        $("#uvrmCasas").value = storedDecimals;
    }

    renderAllExistingHistories();
    safeInvoke(renderUvrmCurrentList);
    safeInvoke(updateSettingsSummary);
    safeInvoke(updateDashboardSummary);
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeApplication, { once: true });
} else {
    initializeApplication();
}

window.addEventListener("pageshow", refreshPersistedApplicationData);
window.addEventListener("focus", refreshPersistedApplicationData);
document.addEventListener("visibilitychange", () => {
    if (!document.hidden) refreshPersistedApplicationData();
});
window.addEventListener("storage", refreshPersistedApplicationData);
