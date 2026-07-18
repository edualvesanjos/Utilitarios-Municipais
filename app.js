const $ = (selector) => document.querySelector(selector);

const STORAGE_PREFIX = "utilitariosMunicipais:";
const LOT_SEQUENCE_KEY = `${STORAGE_PREFIX}lastLotSequence`;
const ACTIVE_TAB_KEY = `${STORAGE_PREFIX}activeTab`;
const SAVE_FIELDS_KEY = `${STORAGE_PREFIX}saveFields`;
const FORM_DATA_KEY = `${STORAGE_PREFIX}formData`;
const FILE_HISTORY_KEY = `${STORAGE_PREFIX}fileHistory`;
const FILE_FAVORITES_KEY = `${STORAGE_PREFIX}fileFavorites`;

const formatCurrency = (value) =>
    new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL"
    }).format(Number(value) || 0);

const onlyDigits = (value) => String(value || "").replace(/\D/g, "");

const normalizeText = (value) =>
    String(value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");

function parseDecimal(value) {
    const normalized = String(value ?? "")
        .trim()
        .replace(/\s/g, "")
        .replace(/\./g, "")
        .replace(",", ".");

    const number = Number(normalized);
    return Number.isFinite(number) ? number : NaN;
}

function showToast(message) {
    const toast = $("#toast");
    toast.textContent = message;
    toast.classList.add("show");

    window.clearTimeout(showToast.timeout);
    showToast.timeout = window.setTimeout(() => {
        toast.classList.remove("show");
    }, 1800);
}

async function copyText(text) {
    const value = String(text || "").trim();

    if (!value || value === "—") {
        showToast("Não há conteúdo para copiar.");
        return false;
    }

    try {
        await navigator.clipboard.writeText(value);
        showToast("Conteúdo copiado.");
        return true;
    } catch {
        const textarea = document.createElement("textarea");
        textarea.value = value;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();

        const copied = document.execCommand("copy");
        textarea.remove();

        showToast(copied ? "Conteúdo copiado." : "Não foi possível copiar.");
        return copied;
    }
}

function getJson(key, fallback) {
    try {
        const value = localStorage.getItem(key);
        return value === null ? fallback : JSON.parse(value);
    } catch {
        return fallback;
    }
}

function setJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

/* Navegação por abas */

function activateTab(tabId) {
    const targetButton = document.querySelector(
        `.tab-button[data-tab="${tabId}"]`
    );
    const targetPanel = document.getElementById(tabId);

    if (!button || !panel) {
        return;
    }

    document.querySelectorAll(".tab-button").forEach((button) => {
        button.classList.toggle("active", button === targetButton);
    });

    document.querySelectorAll(".tab-panel").forEach((panel) => {
        panel.classList.toggle("active", panel === targetPanel);
    });

    localStorage.setItem(ACTIVE_TAB_KEY, tabId);
}

document.querySelectorAll(".tab-button").forEach((button) => {
    button.addEventListener("click", () => {
        activateTab(button.dataset.tab);
    });
});

/* Persistência opcional dos campos */

const persistentFieldIds = [
    "arquivoNome",
    "arquivoProcesso",
    "arquivoPrefixo",
    "arquivoModelo",
    "arquivoAnaliseProjeto",
    "arquivoIncluirDataHora",
    "arquivoMaiusculas",
    "loteSetor",
    "loteQuadra",
    "loteQuantidade",
    "uvrmQuantidade",
    "uvrmValor",
    "percentualBase",
    "percentualTaxa",
    "percentualOperacao"
];

function shouldSaveFields() {
    return localStorage.getItem(SAVE_FIELDS_KEY) === "true";
}

function collectFormData() {
    const data = {};

    for (const id of persistentFieldIds) {
        const field = document.getElementById(id);

        if (!field) continue;

        data[id] = field.type === "checkbox"
            ? field.checked
            : field.value;
    }

    return data;
}

function saveFormData() {
    if (!shouldSaveFields()) {
        return;
    }

    setJson(FORM_DATA_KEY, collectFormData());
}

function restoreFormData() {
    if (!shouldSaveFields()) {
        return;
    }

    const data = getJson(FORM_DATA_KEY, {});

    for (const [id, value] of Object.entries(data)) {
        const field = document.getElementById(id);

        if (!field) continue;

        if (field.type === "checkbox") {
            field.checked = Boolean(value);
        } else {
            field.value = value;
        }
    }
}

for (const id of persistentFieldIds) {
    const field = document.getElementById(id);

    if (field) {
        field.addEventListener("input", saveFormData);
        field.addEventListener("change", saveFormData);
    }
}

/* Gerador de nome de arquivo */

function formatProcessNumber(value) {
    const digits = onlyDigits(value).slice(0, 12);

    if (digits.length <= 4) {
        return digits;
    }

    return `${digits.slice(0, -4)}-${digits.slice(-4)}`;
}

function isValidProcessNumber(value) {
    return /^\d+-\d{4}$/.test(String(value).trim());
}

function updateProcessField() {
    const field = $("#arquivoProcesso");
    const help = $("#arquivoProcessoAjuda");

    field.value = formatProcessNumber(field.value);
    field.classList.remove("input-error");
    help.classList.remove("error", "success");

    if (!field.value) {
        help.textContent = "Padrão obrigatório: número-ano.";
        return;
    }

    if (!isValidProcessNumber(field.value)) {
        field.classList.add("input-error");
        help.textContent = "Processo incompleto. Use o padrão número-ano.";
        help.classList.add("error");
        return;
    }

    help.textContent = "Número do processo válido.";
    help.classList.add("success");
}

function getDateTimeStamp() {
    const now = new Date();

    return [
        String(now.getDate()).padStart(2, "0"),
        String(now.getMonth() + 1).padStart(2, "0"),
        String(now.getFullYear()),
        String(now.getHours()).padStart(2, "0"),
        String(now.getMinutes()).padStart(2, "0"),
        String(now.getSeconds()).padStart(2, "0")
    ].join("");
}

function buildFileName() {
    const nome = normalizeText($("#arquivoNome").value);
    const processo = $("#arquivoProcesso").value.trim();
    const prefixo = normalizeText($("#arquivoPrefixo").value);
    const modelo = $("#arquivoModelo").value;
    const analiseProjeto = $("#arquivoAnaliseProjeto").checked;
    const incluirDataHora = $("#arquivoIncluirDataHora").checked;
    const maiusculas = $("#arquivoMaiusculas").checked;

    let parts;

    switch (modelo) {
        case "nomeProcesso":
            parts = [nome, processo];
            break;
        case "prefixoProcessoNome":
            parts = [prefixo, processo, nome];
            break;
        default:
            parts = [processo, nome];
    }

    if (modelo !== "prefixoProcessoNome" && prefixo) {
        parts.unshift(prefixo);
    }

    if (analiseProjeto) {
        parts.push("AP");
    }

    if (incluirDataHora) {
        parts.push(getDateTimeStamp());
    }

    let result = parts.filter(Boolean).join("_");

    if (maiusculas) {
        result = result.toUpperCase();
    }

    return result;
}

function getFileHistory() {
    return getJson(FILE_HISTORY_KEY, []);
}

function getFileFavorites() {
    return getJson(FILE_FAVORITES_KEY, []);
}

function renderFileList({
    targetId,
    items,
    emptyMessage,
    removable = false,
    onRemove = null
}) {
    const list = document.getElementById(targetId);

    if (items.length === 0) {
        list.innerHTML = `<li class="empty-state">${emptyMessage}</li>`;
        return;
    }

    list.innerHTML = "";

    for (const item of items) {
        const li = document.createElement("li");
        const text = document.createElement("span");
        const actions = document.createElement("div");
        const copyButton = document.createElement("button");

        text.textContent = item;
        actions.className = "list-actions";

        copyButton.textContent = "Copiar";
        copyButton.className = "icon-button mini-button";
        copyButton.addEventListener("click", () => copyText(item));

        actions.appendChild(copyButton);

            removeButton.textContent = "Remover";
            removeButton.className = "danger-outline mini-button";
            removeButton.addEventListener("click", () => onRemove(item));
            actions.appendChild(removeButton);
        }

        li.append(text, actions);
        list.appendChild(li);
    }
}

function renderFileHistory() {
    renderFileList({
        targetId: "arquivoHistorico",
        items: getFileHistory(),
        emptyMessage: "Nenhum nome gerado recentemente."
    });
}

function renderFileFavorites() {
    renderFileList({
        targetId: "arquivoFavoritos",
        items: getFileFavorites(),
        emptyMessage: "Nenhum favorito salvo.",
        removable: true,
        onRemove: removeFileFavorite
    });
}

function addFileHistory(item) {
    const history = getFileHistory()
        .filter((entry) => entry !== item)
        .slice(0, 9);

    history.unshift(item);
    setJson(FILE_HISTORY_KEY, history);
    renderFileHistory();
}

function addFileFavorite(item) {
    const favorites = getFileFavorites();

    if (favorites.includes(item)) {
        showToast("Este nome já está nos favoritos.");
        return;
    }

    favorites.unshift(item);
    setJson(FILE_FAVORITES_KEY, favorites.slice(0, 20));
    renderFileFavorites();
    showToast("Favorito adicionado.");
}

function removeFileFavorite(item) {
    const favorites = getFileFavorites().filter((entry) => entry !== item);
    setJson(FILE_FAVORITES_KEY, favorites);
    renderFileFavorites();
    showToast("Favorito removido.");
}

$("#arquivoProcesso").addEventListener("input", updateProcessField);

$("#gerarArquivo").addEventListener("click", () => {
    const processo = $("#arquivoProcesso").value.trim();
    const result = buildFileName();
    const mensagem = $("#arquivoMensagem");

        setFeedback(
            mensagem,
            "Corrija o número do processo para o padrão número-ano.",
            "error"
        );
        return;
    }

    if (!result) {
        setFeedback(
            mensagem,
            "Informe pelo menos o nome, o processo ou o prefixo.",
            "error"
        );
        return;
    }

    $("#arquivoResultado").textContent = result;
    addFileHistory(result);
    saveFormData();

    setFeedback(mensagem, "Nome de arquivo gerado.", "success");
});

$("#favoritarArquivo").addEventListener("click", () => {
    const current = $("#arquivoResultado").textContent.trim();

    if (!current || current === "—") {
        const processo = $("#arquivoProcesso").value.trim();

        if (processo && !isValidProcessNumber(processo)) {
            showToast("Corrija o número do processo.");
            return;
        }

        const generated = buildFileName();

        if (!generated) {
            showToast("Gere um nome antes de favoritar.");
            return;
        }

        $("#arquivoResultado").textContent = generated;
        addFileHistory(generated);
        addFileFavorite(generated);
        return;
    }
});

$("#limparArquivo").addEventListener("click", () => {
    $("#arquivoNome").value = "";
    $("#arquivoProcesso").value = "";
    $("#arquivoPrefixo").value = "";
    $("#arquivoAnaliseProjeto").checked = false;
    $("#arquivoIncluirDataHora").checked = false;
    $("#arquivoMaiusculas").checked = false;
    $("#arquivoResultado").textContent = "—";

    updateProcessField();
    setFeedback($("#arquivoMensagem"));
});

$("#limparHistoricoArquivo").addEventListener("click", () => {
    localStorage.removeItem(FILE_HISTORY_KEY);
    renderFileHistory();
    showToast("Histórico removido.");
});

$("#limparFavoritosArquivo").addEventListener("click", () => {
    localStorage.removeItem(FILE_FAVORITES_KEY);
    renderFileFavorites();
    showToast("Favoritos removidos.");
});

document.querySelectorAll("[data-copy-target]").forEach((button) => {
    button.addEventListener("click", () => {
        const target = document.getElementById(button.dataset.copyTarget);
        copyText(target.textContent);
    });
});

document.querySelectorAll("[data-copy-input]").forEach((button) => {
    button.addEventListener("click", () => {
        const input = document.getElementById(button.dataset.copyInput);
        copyText(input.value);
    });
});

/* Inscrição imobiliária */

function applyUrbanMask(value) {
    const digits = onlyDigits(value).slice(0, 17);
    const groups = [2, 3, 3, 2, 7];
    const parts = [];
    let index = 0;

    for (const size of groups) {
        const part = digits.slice(index, index + size);

        if (!part) break;

        parts.push(part);
        index += size;
    }

    return parts.join(".");
}

function applyItrMask(value) {
    const digits = onlyDigits(value).slice(0, 13);
    const first = digits.slice(0, 3);
    const second = digits.slice(3, 6);
    const third = digits.slice(6, 9);
    const fourth = digits.slice(9, 12);
    const verifier = digits.slice(12, 13);

    let result = first;

    if (second) result += `.${second}`;
    if (third) result += `.${third}`;
    if (fourth) result += `.${fourth}`;
    if (verifier) result += `-${verifier}`;

    return result;
}

function updateRegistrationField() {
    const field = $("#inscricaoValor");
    const help = $("#inscricaoAjuda");
    const isItr = $("#inscricaoItr").checked;
    const expected = isItr ? 13 : 17;

    field.placeholder = isItr
        ? "000.000.000.000-0"
        : "00.000.000.00.0000000";

    field.value = isItr
        ? applyItrMask(field.value)
        : applyUrbanMask(field.value);

    const digits = onlyDigits(field.value);

    help.classList.remove("error", "success");

    if (digits.length === 0) {
        help.textContent = isItr
            ? "Digite 13 números para o padrão ITR."
            : "Digite 17 números para o padrão urbano.";
        return;
    }

    if (digits.length !== expected) {
        help.textContent =
            `Quantidade incorreta: ${digits.length} de ${expected} números.`;
        help.classList.add("error");
        return;
    }

    help.textContent = "Inscrição válida.";
    help.classList.add("success");
}

$("#inscricaoValor").addEventListener("input", updateRegistrationField);

$("#inscricaoItr").addEventListener("change", () => {
    $("#inscricaoValor").value = "";
    updateRegistrationField();
});

$("#copiarInscricao").addEventListener("click", () => {
    const isItr = $("#inscricaoItr").checked;
    const expected = isItr ? 13 : 17;
    const value = $("#inscricaoValor").value;

    if (onlyDigits(value).length !== expected) {
        showToast("Complete a inscrição antes de copiar.");
        return;
    }

    copyText(value);
});

$("#limparInscricao").addEventListener("click", () => {
    $("#inscricaoValor").value = "";
    updateRegistrationField();
});

/* Gerador de número de lote */

function getLastLotSequence() {
    const stored = Number(localStorage.getItem(LOT_SEQUENCE_KEY));
    return Number.isInteger(stored) && stored >= 3 ? stored : 3;
}

function updateLastLotDisplay() {
    $("#loteUltimaSequencia").textContent = String(
        getLastLotSequence()
    ).padStart(5, "0");
}

$("#gerarLotes").addEventListener("click", () => {
    const setor = $("#loteSetor").value;
    const quadra = $("#loteQuadra").value;
    const quantity = Math.min(
        100,
        Math.max(1, Number($("#loteQuantidade").value) || 1)
    );

    const start = getLastLotSequence() + 1;
    const generated = [];

    for (let index = 0; index < quantity; index += 1) {
        const sequence = String(start + index).padStart(5, "0");
        generated.push(`${setor}.${quadra}.${sequence}`);
    }

    localStorage.setItem(
        LOT_SEQUENCE_KEY,
        String(start + quantity - 1)
    );

    $("#loteResultado").textContent = generated.join("\n");
    updateLastLotDisplay();
    saveFormData();
});

$("#copiarLotes").addEventListener("click", () => {
    copyText($("#loteResultado").textContent);
});

$("#limparLotes").addEventListener("click", () => {
    $("#loteResultado").textContent = "—";
    $("#loteQuantidade").value = 1;
    saveFormData();
});

$("#reiniciarSequenciaLotes").addEventListener("click", () => {
    const confirmed = window.confirm(
        "Deseja reiniciar a sequência de lotes para 00003?"
    );

    if (!confirmed) return;

    localStorage.setItem(LOT_SEQUENCE_KEY, "3");
    $("#loteResultado").textContent = "—";
    updateLastLotDisplay();
    showToast("Sequência reiniciada.");
});

/* Calculadora UVRM */

$("#calcularUvrm").addEventListener("click", () => {
    const quantity = parseDecimal($("#uvrmQuantidade").value);
    const unitValue = parseDecimal($("#uvrmValor").value);

    if (
        !Number.isFinite(quantity) ||
        !Number.isFinite(unitValue) ||
        quantity <= 0 ||
        unitValue <= 0
    ) {
        $("#uvrmResultado").textContent = "R$ 0,00";
        setFeedback(
            mensagem,
            "Informe valores maiores que zero.",
            "error"
        );
        return;
    }

    $("#uvrmResultado").textContent = formatCurrency(quantity * unitValue);
    setFeedback(mensagem, "Cálculo realizado.", "success");
    saveFormData();
});

$("#limparUvrm").addEventListener("click", () => {
    $("#uvrmQuantidade").value = "";
    $("#uvrmValor").value = "";
    $("#uvrmResultado").textContent = "R$ 0,00";
    setFeedback($("#uvrmMensagem"));
    saveFormData();
});

/* Calculadora percentual */

$("#calcularPercentual").addEventListener("click", () => {
    const base = parseDecimal($("#percentualBase").value);
    const rate = parseDecimal($("#percentualTaxa").value);
    const operation = $("#percentualOperacao").value;

    if (
        !Number.isFinite(base) ||
        !Number.isFinite(rate) ||
        base < 0 ||
        rate < 0
    ) {
        $("#percentualResultado").textContent = "R$ 0,00";
        $("#percentualFinal").textContent = "R$ 0,00";
        setFeedback(
            mensagem,
            "Informe valores válidos para o cálculo.",
            "error"
        );
        return;
    }

    const percentageValue = base * (rate / 100);
    let finalValue = percentageValue;

    if (operation === "acrescentar") {
        finalValue = base + percentageValue;
    }

    if (operation === "descontar") {
        finalValue = base - percentageValue;
    }

    $("#percentualResultado").textContent =
        formatCurrency(percentageValue);
    $("#percentualFinal").textContent =
        formatCurrency(finalValue);

    setFeedback(mensagem, "Cálculo realizado.", "success");
    saveFormData();
});

$("#limparPercentual").addEventListener("click", () => {
    $("#percentualBase").value = "";
    $("#percentualTaxa").value = "";
    $("#percentualOperacao").selectedIndex = 0;
    $("#percentualResultado").textContent = "R$ 0,00";
    $("#percentualFinal").textContent = "R$ 0,00";
    setFeedback($("#percentualMensagem"));
    saveFormData();
});

/* Configurações e backup */

$("#salvarCampos").addEventListener("change", (event) => {
    localStorage.setItem(SAVE_FIELDS_KEY, String(event.target.checked));

    if (event.target.checked) {
        saveFormData();
        showToast("Salvamento automático ativado.");
    } else {
        localStorage.removeItem(FORM_DATA_KEY);
        showToast("Salvamento automático desativado.");
    }
});

function collectBackupData() {
    const data = {};

    for (let index = 0; index < localStorage.length; index += 1) {
        const key = localStorage.key(index);

        if (key && key.startsWith(STORAGE_PREFIX)) {
            data[key] = localStorage.getItem(key);
        }
    }

    return {
        application: "Utilitários Municipais",
        version: "1.3.1",
        exportedAt: new Date().toISOString(),
        data
    };
}

$("#exportarDados").addEventListener("click", () => {
    const blob = new Blob(
        [JSON.stringify(backup, null, 2)],
        { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const date = new Date().toISOString().slice(0, 10);

    link.href = url;
    link.download = `utilitarios-municipais-backup-${date}.json`;
    link.click();

    URL.revokeObjectURL(url);
    showToast("Backup exportado.");
});

$("#importarDados").addEventListener("change", async (event) => {
    const [file] = event.target.files;

    if (!file) return;

    try {
        const text = await file.text();
        const backup = JSON.parse(text);

        if (
            !backup ||
            backup.application !== "Utilitários Municipais" ||
            typeof backup.data !== "object"
        ) {
            throw new Error("Arquivo incompatível.");
        }

        for (const [key, value] of Object.entries(backup.data)) {
            if (key.startsWith(STORAGE_PREFIX)) {
                localStorage.setItem(key, value);
            }
        }

        showToast("Backup importado.");
        window.setTimeout(() => window.location.reload(), 600);
    } catch {
        showToast("Não foi possível importar o backup.");
    } finally {
        event.target.value = "";
    }
});

$("#limparTodosDados").addEventListener("click", () => {
    const confirmed = window.confirm(
        "Esta ação apagará todos os dados locais da aplicação. Continuar?"
    );

    if (!confirmed) return;

    const keysToRemove = [];

    for (let index = 0; index < localStorage.length; index += 1) {
        const key = localStorage.key(index);

        if (key && key.startsWith(STORAGE_PREFIX)) {
            keysToRemove.push(key);
        }
    }

    for (const key of keysToRemove) {
        localStorage.removeItem(key);
    }

    showToast("Dados locais apagados.");
    window.setTimeout(() => window.location.reload(), 600);
});

/* Inicialização */

function initializeApplication() {
    $("#salvarCampos").checked = shouldSaveFields();

    restoreFormData();
    updateProcessField();
    updateRegistrationField();
    updateLastLotDisplay();
    renderFileHistory();
    renderFileFavorites();

    const savedTab = localStorage.getItem(ACTIVE_TAB_KEY) || "arquivo";
    activateTab(savedTab);
}

initializeApplication();
