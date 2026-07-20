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

function initializeApplication() {
    applyApplicationMetadata();
    $("#salvarCampos").checked = shouldSaveFields();

    restoreFormData();

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
    $("#uvrmValorUnitario").value =
        storedUvrmValue && storedUvrmValue.trim()
            ? storedUvrmValue
            : "39,99";

    $("#uvrmCasas").value =
        localStorage.getItem(UVRM_DECIMALS_KEY) || "2";

    renderUvrmHistory();
    clearUvrmResult();

    renderPercentageHistory();
    updatePercentageMode();

    updateSettingsSummary();
    updateDashboardSummary();

    const storedTab = localStorage.getItem(ACTIVE_TAB_KEY);
    activateTab(storedTab && document.getElementById(storedTab) ? storedTab : "inicio");
}

initializeApplication();
