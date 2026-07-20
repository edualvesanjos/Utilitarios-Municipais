/* Módulo: configurações, backup e restauração. */

/* Configurações */

const settingsHistoryKeys = [FILE_HISTORY_KEY, REGISTRATION_HISTORY_KEY, LOT_HISTORY_KEY, UVRM_HISTORY_KEY, PERCENTAGE_HISTORY_KEY];

function getStoredArrayLength(key) {
    const value = getJson(key, []);
    return Array.isArray(value) ? value.length : 0;
}

function updateSettingsSummary() {
    const modelCount = getStoredArrayLength(FILE_MODELS_KEY);
    const historyCount = settingsHistoryKeys.reduce((total, key) => total + getStoredArrayLength(key), 0);
    $("#configModelosSalvos").textContent = String(modelCount);
    $("#configHistoricosSalvos").textContent = String(historyCount);
    $("#configSequenciaLote").textContent = String(getLastLotSequence()).padStart(5, "0");
    const lastBackup = localStorage.getItem(LAST_BACKUP_KEY);
    $("#ultimoBackupInfo").textContent = lastBackup ? `Último backup exportado em ${new Date(lastBackup).toLocaleString("pt-BR")}.` : "Nenhum backup registrado.";
}

function buildBackupPayload() {
    const data = {};
    for (let i = 0; i < localStorage.length; i += 1) {
        const key = localStorage.key(i);
        if (key && key.startsWith(STORAGE_PREFIX)) data[key] = localStorage.getItem(key);
    }
    return {app:APP_CONFIG.name,version:APP_CONFIG.version,exportedAt:new Date().toISOString(),storagePrefix:STORAGE_PREFIX,data};
}

function validateBackupPayload(payload) {
    if (!payload || typeof payload !== "object") return "Estrutura de backup inválida.";
    if (payload.app !== APP_CONFIG.name) return "O arquivo não pertence ao aplicativo Utilitários Municipais.";
    if (!payload.data || typeof payload.data !== "object") return "O arquivo não contém dados restauráveis.";
    if (Object.keys(payload.data).some((key) => !key.startsWith(STORAGE_PREFIX))) return "O backup contém chaves incompatíveis.";
    return "";
}

$("#exportarBackup").addEventListener("click", () => {
    saveFormData();
    const payload = buildBackupPayload();
    const blob = new Blob([JSON.stringify(payload, null, 2)], {type:"application/json;charset=utf-8"});
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `utilitarios-municipais-backup-${new Date().toISOString().slice(0,10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    localStorage.setItem(LAST_BACKUP_KEY, payload.exportedAt);
    $("#backupStatus").textContent = "Backup exportado com sucesso.";
    updateSettingsSummary();
    showToast("Backup exportado.");
});

$("#importarBackup").addEventListener("change", async (event) => {
    const [file] = event.target.files;
    if (!file) return;
    try {
        const payload = JSON.parse(await file.text());
        const error = validateBackupPayload(payload);
        if (error) throw new Error(error);
        if (!window.confirm("A importação substituirá os dados atuais. Deseja continuar?")) return;
        Object.keys(localStorage).filter((key)=>key.startsWith(STORAGE_PREFIX)).forEach((key)=>localStorage.removeItem(key));
        Object.entries(payload.data).forEach(([key,value])=>{if(typeof value === "string") localStorage.setItem(key,value);});
        localStorage.setItem(LAST_BACKUP_KEY,new Date().toISOString());
        $("#backupStatus").textContent="Backup importado. A página será atualizada.";
        showToast("Backup importado com sucesso.");
        window.setTimeout(()=>window.location.reload(),300);
    } catch (error) {
        $("#backupStatus").textContent=error.message || "Não foi possível importar o backup.";
        $("#backupStatus").classList.add("error");
        showToast("Falha ao importar o backup.");
    } finally { event.target.value=""; }
});

$("#executarLimpezaSeletiva").addEventListener("click", () => {
    const clearModels=$("#limparModelosArquivos").checked, clearHistories=$("#limparHistoricosGerais").checked, clearFields=$("#limparPreferenciasCampos").checked, resetSequence=$("#reiniciarSequenciaNoReset").checked;
    if (!clearModels && !clearHistories && !clearFields && !resetSequence) { showToast("Selecione pelo menos uma opção."); return; }
    if (!window.confirm("Deseja executar a limpeza selecionada?")) return;
    if (clearModels) localStorage.removeItem(FILE_MODELS_KEY);
    if (clearHistories) settingsHistoryKeys.forEach((key)=>localStorage.removeItem(key));
    if (clearFields) [FORM_DATA_KEY,FILE_BUILDER_KEY,REGISTRATION_AUTO_COPY_KEY,UVRM_VALUE_KEY,UVRM_DECIMALS_KEY].forEach((key)=>localStorage.removeItem(key));
    if (resetSequence) localStorage.setItem(LOT_SEQUENCE_KEY,"3");
    showToast("Limpeza seletiva concluída.");
    window.setTimeout(()=>window.location.reload(),300);
});

$("#limparTudo").addEventListener("click", () => {
    if (!window.confirm("Esta ação apagará todos os dados do aplicativo. Deseja continuar?")) return;
    Object.keys(localStorage).filter((key)=>key.startsWith(STORAGE_PREFIX)).forEach((key)=>localStorage.removeItem(key));
    showToast("Todos os dados foram removidos.");
    window.setTimeout(()=>window.location.reload(),300);
});
