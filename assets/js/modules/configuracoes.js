/* Módulo: configurações, backup e restauração. */

/* Configurações */

const settingsHistoryKeys = [FILE_HISTORY_KEY, REGISTRATION_HISTORY_KEY, LOT_HISTORY_KEY, UVRM_HISTORY_KEY, PERCENTAGE_HISTORY_KEY];

function getStoredArrayLength(key) {
    const value = getJson(key, []);
    return Array.isArray(value) ? value.length : 0;
}

function updateSettingsStatistics() {
    const summary = getUsageSummary();
    const map = {configTotalAccesses: summary.totalAccesses, configTotalActions: summary.totalActions, configFavoriteCount: summary.favoriteCount};
    Object.entries(map).forEach(([id, value]) => { const el = document.getElementById(id); if (el) el.textContent = String(value); });
    const body = document.getElementById("configStatisticsBody");
    if (body) body.innerHTML = summary.rows.map(row => `<tr><td>${row.name}</td><td>${row.accesses}</td><td>${row.actions}</td><td><strong>${row.accesses + row.actions}</strong></td></tr>`).join("");
}

function updateSettingsSummary() {
    const lastBackup = localStorage.getItem(LAST_BACKUP_KEY);
    $("#ultimoBackupInfo").textContent = lastBackup ? `Último backup exportado em ${formatDateTime(lastBackup)}.` : "Nenhum backup registrado.";
    updateSettingsStatistics();
}

function formatBackupTimestamp(date = new Date()) {
    const pad = (value) => String(value).padStart(2, "0");
    return `${pad(date.getDate())}${pad(date.getMonth() + 1)}${date.getFullYear()}${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
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
    downloadTextFile(
        `UM-BKP-${APP_VERSION}-${formatBackupTimestamp(new Date())}.json`,
        JSON.stringify(payload, null, 2),
        "application/json;charset=utf-8"
    );
    localStorage.setItem(LAST_BACKUP_KEY, payload.exportedAt);
    $("#backupStatus").textContent = "Backup exportado com sucesso.";
    updateSettingsSummary();
    showToast("Backup exportado.");
});

$("#importarBackup").addEventListener("change", async (event) => {
    const [file] = event.target.files;
    if (!file) return;
    try {
        const payload = await readJsonFile(file);
        const error = validateBackupPayload(payload);
        if (error) throw new Error(error);
        const confirmed = await confirmAction(
            "A importação substituirá os dados atuais. Deseja continuar?",
            {
                title: "Importar backup",
                confirmText: "Importar"
            }
        );
        if (!confirmed) return;
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

$("#executarLimpezaSeletiva").addEventListener("click", async () => {
    const clearModels=$("#limparModelosArquivos").checked, clearHistories=$("#limparHistoricosGerais").checked, clearFields=$("#limparPreferenciasCampos").checked, resetSequence=$("#reiniciarSequenciaNoReset").checked;
    if (!clearModels && !clearHistories && !clearFields && !resetSequence) { showToast("Selecione pelo menos uma opção."); return; }
    const confirmed = await confirmAction(
        "Deseja executar a limpeza selecionada?",
        {
            title: "Limpeza seletiva",
            confirmText: "Executar limpeza"
        }
    );
    if (!confirmed) return;
    if (clearModels) localStorage.removeItem(FILE_MODELS_KEY);
    if (clearHistories) settingsHistoryKeys.forEach((key)=>localStorage.removeItem(key));
    if (clearFields) [FORM_DATA_KEY,FILE_BUILDER_KEY,REGISTRATION_AUTO_COPY_KEY,UVRM_VALUE_KEY,UVRM_DECIMALS_KEY].forEach((key)=>localStorage.removeItem(key));
    if (resetSequence) localStorage.setItem(LOT_SEQUENCE_KEY,"3");
    showToast("Limpeza seletiva concluída.");
    window.setTimeout(()=>window.location.reload(),300);
});

$("#limparTudo").addEventListener("click", async () => {
    const confirmed = await confirmAction(
        "Esta ação apagará todos os dados do aplicativo. Deseja continuar?",
        {
            title: "Apagar todos os dados",
            confirmText: "Apagar tudo"
        }
    );
    if (!confirmed) return;
    Object.keys(localStorage).filter((key)=>key.startsWith(STORAGE_PREFIX)).forEach((key)=>localStorage.removeItem(key));
    showToast("Todos os dados foram removidos.");
    window.setTimeout(()=>window.location.reload(),300);
});


const resetStatisticsButton = $("#resetarEstatisticas");
if (resetStatisticsButton) resetStatisticsButton.addEventListener("click", async () => {
    const confirmed = await confirmAction("Deseja zerar as estatísticas de acessos e ações?", {title:"Zerar estatísticas",confirmText:"Zerar"});
    if (!confirmed) return;
    resetUsageStatistics();
    showToast("Estatísticas zeradas.");
});

function statisticsExportRows(){return getUsageSummary().rows.map(r=>({ferramenta:r.name,acessos:r.accesses,acoes:r.actions,total:r.accesses+r.actions,ultimoUso:r.lastUsed?formatDateTime(r.lastUsed):"Nunca"}));}
function exportStatistics(format){const rows=statisticsExportRows(),date=todayIsoDate();if(format==="json")return downloadTextFile(`estatisticas-utilitarios-${date}.json`,JSON.stringify({exportadoEm:new Date().toISOString(),resumo:getUsageSummary(),ferramentas:rows},null,2),"application/json;charset=utf-8");if(format==="csv"){const text=["Ferramenta;Acessos;Ações;Total;Último uso",...rows.map(r=>[r.ferramenta,r.acessos,r.acoes,r.total,r.ultimoUso].map(v=>`"${String(v).replace(/"/g,'""')}"`).join(";"))].join("\n");return downloadTextFile(`estatisticas-utilitarios-${date}.csv`,text,"text/csv;charset=utf-8");}const text=["ESTATÍSTICAS — UTILITÁRIOS MUNICIPAIS",`Exportado em: ${formatDateTime(new Date().toISOString())}`,"",...rows.map(r=>`${r.ferramenta}: ${r.acessos} acessos | ${r.acoes} ações | ${r.total} total | Último uso: ${r.ultimoUso}`)].join("\n");downloadTextFile(`estatisticas-utilitarios-${date}.txt`,text,"text/plain;charset=utf-8");}
[["exportarEstatisticasCsv","csv"],["exportarEstatisticasJson","json"],["exportarEstatisticasTxt","txt"]].forEach(([id,type])=>{const b=$("#"+id);if(b)b.addEventListener("click",()=>{exportStatistics(type);NotificationService.success("Estatísticas exportadas.");});});
const resetFav=$("#resetarFavoritos");if(resetFav)resetFav.addEventListener("click",async()=>{if(await confirmAction("Deseja remover todas as ferramentas favoritas?",{title:"Resetar favoritos",confirmText:"Resetar"})){localStorage.removeItem(FAVORITES_KEY);renderDashboardFavorites();refreshUsageViews();NotificationService.success("Favoritos removidos.");}});
const resetHist=$("#resetarHistoricos");if(resetHist)resetHist.addEventListener("click",async()=>{if(await confirmAction("Deseja apagar todos os históricos das ferramentas?",{title:"Resetar históricos",confirmText:"Apagar"})){settingsHistoryKeys.forEach(k=>localStorage.removeItem(k));NotificationService.success("Históricos removidos.");window.setTimeout(()=>window.location.reload(),250);}});
