const $ = (selector) => document.querySelector(selector);

const STORAGE_PREFIX = "utilitariosMunicipais:";
const ACTIVE_TAB_KEY = `${STORAGE_PREFIX}activeTab`;
const LOT_SEQUENCE_KEY = `${STORAGE_PREFIX}lastLotSequence`;
const SAVE_FIELDS_KEY = `${STORAGE_PREFIX}saveFields`;
const FORM_DATA_KEY = `${STORAGE_PREFIX}formData`;
const FILE_HISTORY_KEY = `${STORAGE_PREFIX}fileHistory`;
const FILE_MODELS_KEY = `${STORAGE_PREFIX}fileModels`;
const FILE_BUILDER_KEY = `${STORAGE_PREFIX}fileBuilder`;

const formatCurrency = (value) =>
    new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL"
    }).format(Number(value) || 0);

const onlyDigits = (value) => String(value || "").replace(/\D/g, "");

function normalizeCompact(value) {
    return String(value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]/g, "")
        .toUpperCase();
}

function normalizePrefix(value) {
    return normalizeCompact(value);
}

function normalizeProcess(value) {
    return String(value || "")
        .trim()
        .replace(/\s+/g, "")
        .replace(/\//g, "-")
        .toUpperCase();
}

function parseDecimal(value) {
    const normalized = String(value ?? "")
        .trim()
        .replace(/\s/g, "")
        .replace(/\./g, "")
        .replace(",", ".");

    const number = Number(normalized);
    return Number.isFinite(number) ? number : NaN;
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

function setFeedback(element, message = "", type = "") {
    element.textContent = message;
    element.classList.remove("error", "success");

    if (type) {
        element.classList.add(type);
    }
}

/* Navegação */

function activateTab(tabId) {
    const button = document.querySelector(
        `.tab-button[data-tab="${tabId}"]`
    );
    const panel = document.getElementById(tabId);

    if (!button || !panel) {
        return;
    }

    document.querySelectorAll(".tab-button").forEach((item) => {
        item.classList.toggle("active", item === button);
    });

    document.querySelectorAll(".tab-panel").forEach((item) => {
        item.classList.toggle("active", item === panel);
    });

    localStorage.setItem(ACTIVE_TAB_KEY, tabId);
}

document.querySelectorAll(".tab-button").forEach((button) => {
    button.addEventListener("click", () => {
        activateTab(button.dataset.tab);
    });
});

/* Montador de nome de arquivo */

const fileBlocks = {
    nome: {
        label: "Nome",
        getValue: () => normalizeCompact($("#arquivoNome").value)
    },
    prefixo: {
        label: "Prefixo",
        getValue: () => normalizePrefix($("#arquivoPrefixo").value)
    },
    processo: {
        label: "Processo",
        getValue: () => normalizeProcess($("#arquivoProcesso").value)
    },
    ap: {
        label: "AP",
        getValue: () => $("#arquivoAnaliseProjeto").checked ? "AP" : ""
    },
    datahora: {
        label: "Data/Hora",
        getValue: () => $("#arquivoDataHora").checked ? getDateTimeStamp() : ""
    }
};

const defaultFileBuilder = {
    enabled: ["nome", "prefixo", "processo", "ap", "datahora"],
    order: ["nome", "prefixo", "processo", "ap", "datahora"],
    separator: "_"
};

let fileBuilderState = getJson(FILE_BUILDER_KEY, defaultFileBuilder);

function sanitizeFileBuilderState(state) {
    const validIds = Object.keys(fileBlocks);
    const order = Array.isArray(state?.order)
        ? state.order.filter((id) => validIds.includes(id))
        : [...defaultFileBuilder.order];

    for (const id of validIds) {
        if (!order.includes(id)) {
            order.push(id);
        }
    }

    const enabled = Array.isArray(state?.enabled)
        ? state.enabled.filter((id) => validIds.includes(id))
        : [...defaultFileBuilder.enabled];

    return {
        enabled,
        order,
        separator: typeof state?.separator === "string"
            ? state.separator
            : "_"
    };
}

fileBuilderState = sanitizeFileBuilderState(fileBuilderState);

function saveFileBuilderState() {
    fileBuilderState.separator = $("#arquivoSeparador").value;
    setJson(FILE_BUILDER_KEY, fileBuilderState);
}

function renderAvailableBlocks() {
    const container = $("#arquivoBlocosDisponiveis");
    container.innerHTML = "";

    for (const id of fileBuilderState.order) {
        const block = fileBlocks[id];
        const label = document.createElement("label");
        const checkbox = document.createElement("input");

        label.className = "block-toggle";
        checkbox.type = "checkbox";
        checkbox.checked = fileBuilderState.enabled.includes(id);

        checkbox.addEventListener("change", () => {
            if (checkbox.checked) {
                if (!fileBuilderState.enabled.includes(id)) {
                    fileBuilderState.enabled.push(id);
                }
            } else {
                fileBuilderState.enabled =
                    fileBuilderState.enabled.filter((item) => item !== id);
            }

            saveFileBuilderState();
            renderBlockOrder();
            updateFilePreview();
        });

        label.append(checkbox, document.createTextNode(block.label));
        container.appendChild(label);
    }
}

function moveBlock(id, direction) {
    const index = fileBuilderState.order.indexOf(id);
    const targetIndex = index + direction;

    if (
        index < 0 ||
        targetIndex < 0 ||
        targetIndex >= fileBuilderState.order.length
    ) {
        return;
    }

    const [item] = fileBuilderState.order.splice(index, 1);
    fileBuilderState.order.splice(targetIndex, 0, item);

    saveFileBuilderState();
    renderAvailableBlocks();
    renderBlockOrder();
    updateFilePreview();
}

function renderBlockOrder() {
    const list = $("#arquivoOrdemBlocos");
    list.innerHTML = "";

    const enabledOrder = fileBuilderState.order.filter((id) =>
        fileBuilderState.enabled.includes(id)
    );

    if (enabledOrder.length === 0) {
        const li = document.createElement("li");
        li.className = "empty-state";
        li.textContent = "Nenhum bloco selecionado.";
        list.appendChild(li);
        return;
    }

    enabledOrder.forEach((id) => {
        const li = document.createElement("li");
        const label = document.createElement("strong");
        const actions = document.createElement("div");
        const up = document.createElement("button");
        const down = document.createElement("button");

        li.className = "block-order-item";
        label.textContent = fileBlocks[id].label;
        actions.className = "block-order-actions";

        up.textContent = "Subir";
        up.className = "secondary mini-button";
        up.addEventListener("click", () => moveBlock(id, -1));

        down.textContent = "Descer";
        down.className = "secondary mini-button";
        down.addEventListener("click", () => moveBlock(id, 1));

        actions.append(up, down);
        li.append(label, actions);
        list.appendChild(li);
    });
}

function buildFileName() {
    const separator = $("#arquivoSeparador").value;

    return fileBuilderState.order
        .filter((id) => fileBuilderState.enabled.includes(id))
        .map((id) => fileBlocks[id].getValue())
        .filter(Boolean)
        .join(separator);
}

function updateFilePreview() {
    const preview = buildFileName();
    $("#arquivoPreview").textContent = preview || "—";
    saveFileBuilderState();
}

function getFileHistory() {
    return getJson(FILE_HISTORY_KEY, []);
}

function addFileHistory(item) {
    const history = getFileHistory()
        .filter((entry) => entry !== item)
        .slice(0, 14);

    history.unshift(item);
    setJson(FILE_HISTORY_KEY, history);
    renderFileHistory();
}

function renderFileHistory() {
    const list = $("#arquivoHistorico");
    const history = getFileHistory();

    if (history.length === 0) {
        list.innerHTML =
            '<li class="empty-state">Nenhum nome copiado recentemente.</li>';
        return;
    }

    list.innerHTML = "";

    history.forEach((item) => {
        const li = document.createElement("li");
        const text = document.createElement("span");
        const button = document.createElement("button");

        text.textContent = item;
        button.textContent = "Copiar";
        button.className = "secondary mini-button";
        button.addEventListener("click", () => copyText(item));

        li.append(text, button);
        list.appendChild(li);
    });
}

function getFileModels() {
    return getJson(FILE_MODELS_KEY, []);
}

function renderFileModels() {
    const list = $("#arquivoModelos");
    const models = getFileModels();

    if (models.length === 0) {
        list.innerHTML =
            '<li class="empty-state">Nenhum modelo salvo.</li>';
        return;
    }

    list.innerHTML = "";

    models.forEach((model) => {
        const li = document.createElement("li");
        const text = document.createElement("span");
        const actions = document.createElement("div");
        const applyButton = document.createElement("button");
        const removeButton = document.createElement("button");

        text.textContent = model.name;
        actions.className = "list-actions";

        applyButton.textContent = "Aplicar";
        applyButton.className = "secondary mini-button";
        applyButton.addEventListener("click", () => {
            fileBuilderState = sanitizeFileBuilderState(model.builder);
            $("#arquivoSeparador").value = fileBuilderState.separator;
            $("#arquivoAnaliseProjeto").checked =
                fileBuilderState.enabled.includes("ap");
            $("#arquivoDataHora").checked =
                fileBuilderState.enabled.includes("datahora");

            saveFileBuilderState();
            renderAvailableBlocks();
            renderBlockOrder();
            updateFilePreview();
            showToast("Modelo aplicado.");
        });

        removeButton.textContent = "Remover";
        removeButton.className = "danger-outline mini-button";
        removeButton.addEventListener("click", () => {
            const updated = getFileModels().filter(
                (item) => item.id !== model.id
            );

            setJson(FILE_MODELS_KEY, updated);
            renderFileModels();
            showToast("Modelo removido.");
        });

        actions.append(applyButton, removeButton);
        li.append(text, actions);
        list.appendChild(li);
    });
}

$("#salvarModeloArquivo").addEventListener("click", () => {
    const name = $("#arquivoNomeModelo").value.trim();

    if (!name) {
        setFeedback(
            $("#arquivoMensagem"),
            "Informe um nome para o modelo.",
            "error"
        );
        return;
    }

    const models = getFileModels();
    models.unshift({
        id: crypto.randomUUID
            ? crypto.randomUUID()
            : String(Date.now()),
        name,
        builder: {
            enabled: [...fileBuilderState.enabled],
            order: [...fileBuilderState.order],
            separator: $("#arquivoSeparador").value
        }
    });

    setJson(FILE_MODELS_KEY, models.slice(0, 20));
    $("#arquivoNomeModelo").value = "";
    renderFileModels();

    setFeedback(
        $("#arquivoMensagem"),
        "Modelo salvo.",
        "success"
    );
});

$("#copiarArquivoPreview").addEventListener("click", async () => {
    const result = buildFileName();

    if (!result) {
        setFeedback(
            $("#arquivoMensagem"),
            "Preencha ao menos um bloco ativo.",
            "error"
        );
        return;
    }

    const copied = await copyText(result);

    if (copied) {
        addFileHistory(result);
        setFeedback(
            $("#arquivoMensagem"),
            "Nome copiado.",
            "success"
        );
    }
});

$("#limparArquivo").addEventListener("click", () => {
    $("#arquivoNome").value = "";
    $("#arquivoProcesso").value = "";
    $("#arquivoPrefixo").value = "";
    $("#arquivoAnaliseProjeto").checked = false;
    $("#arquivoDataHora").checked = false;

    updateFilePreview();
    setFeedback($("#arquivoMensagem"));
});

$("#limparHistoricoArquivo").addEventListener("click", () => {
    localStorage.removeItem(FILE_HISTORY_KEY);
    renderFileHistory();
    showToast("Histórico removido.");
});

$("#limparModelosArquivo").addEventListener("click", () => {
    localStorage.removeItem(FILE_MODELS_KEY);
    renderFileModels();
    showToast("Modelos removidos.");
});

[
    "arquivoNome",
    "arquivoProcesso",
    "arquivoPrefixo",
    "arquivoSeparador",
    "arquivoAnaliseProjeto",
    "arquivoDataHora"
].forEach((id) => {
    const field = document.getElementById(id);

    field.addEventListener("input", updateFilePreview);
    field.addEventListener("change", () => {
        if (id === "arquivoAnaliseProjeto") {
            toggleBlockFromOption("ap", field.checked);
        }

        if (id === "arquivoDataHora") {
            toggleBlockFromOption("datahora", field.checked);
        }

        updateFilePreview();
    });
});

function toggleBlockFromOption(id, enabled) {
    if (enabled && !fileBuilderState.enabled.includes(id)) {
        fileBuilderState.enabled.push(id);
    }

    if (!enabled) {
        fileBuilderState.enabled =
            fileBuilderState.enabled.filter((item) => item !== id);
    }

    renderAvailableBlocks();
    renderBlockOrder();
    saveFileBuilderState();
}

/* Persistência opcional dos demais campos */

const persistentFieldIds = [
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

    persistentFieldIds.forEach((id) => {
        const field = document.getElementById(id);

        if (field) {
            data[id] = field.value;
        }
    });

    return data;
}

function saveFormData() {
    if (shouldSaveFields()) {
        setJson(FORM_DATA_KEY, collectFormData());
    }
}

function restoreFormData() {
    if (!shouldSaveFields()) {
        return;
    }

    const data = getJson(FORM_DATA_KEY, {});

    Object.entries(data).forEach(([id, value]) => {
        const field = document.getElementById(id);

        if (field) {
            field.value = value;
        }
    });
}

persistentFieldIds.forEach((id) => {
    const field = document.getElementById(id);

    if (field) {
        field.addEventListener("input", saveFormData);
        field.addEventListener("change", saveFormData);
    }
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

/* Lotes */

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
    if (!window.confirm("Deseja reiniciar a sequência para 00003?")) {
        return;
    }

    localStorage.setItem(LOT_SEQUENCE_KEY, "3");
    $("#loteResultado").textContent = "—";
    updateLastLotDisplay();
    showToast("Sequência reiniciada.");
});

/* UVRM */

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
            $("#uvrmMensagem"),
            "Informe valores maiores que zero.",
            "error"
        );
        return;
    }

    $("#uvrmResultado").textContent = formatCurrency(quantity * unitValue);
    setFeedback($("#uvrmMensagem"), "Cálculo realizado.", "success");
    saveFormData();
});

$("#limparUvrm").addEventListener("click", () => {
    $("#uvrmQuantidade").value = "";
    $("#uvrmValor").value = "";
    $("#uvrmResultado").textContent = "R$ 0,00";
    setFeedback($("#uvrmMensagem"));
    saveFormData();
});

/* Percentual */

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
            $("#percentualMensagem"),
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

/* Configurações */

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
        version: "1.4",
        exportedAt: new Date().toISOString(),
        data
    };
}

$("#exportarDados").addEventListener("click", () => {
    const blob = new Blob(
        [JSON.stringify(collectBackupData(), null, 2)],
        { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download =
        `utilitarios-municipais-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();

    URL.revokeObjectURL(url);
    showToast("Backup exportado.");
});

$("#importarDados").addEventListener("change", async (event) => {
    const [file] = event.target.files;

    if (!file) {
        return;
    }

    try {
        const backup = JSON.parse(await file.text());

        if (
            backup?.application !== "Utilitários Municipais" ||
            typeof backup.data !== "object"
        ) {
            throw new Error("Backup inválido.");
        }

        Object.entries(backup.data).forEach(([key, value]) => {
            if (key.startsWith(STORAGE_PREFIX)) {
                localStorage.setItem(key, value);
            }
        });

        showToast("Backup importado.");
        window.setTimeout(() => window.location.reload(), 600);
    } catch {
        showToast("Não foi possível importar o backup.");
    } finally {
        event.target.value = "";
    }
});

$("#limparTodosDados").addEventListener("click", () => {
    if (!window.confirm("Apagar todos os dados locais da aplicação?")) {
        return;
    }

    const keys = [];

    for (let index = 0; index < localStorage.length; index += 1) {
        const key = localStorage.key(index);

        if (key && key.startsWith(STORAGE_PREFIX)) {
            keys.push(key);
        }
    }

    keys.forEach((key) => localStorage.removeItem(key));

    showToast("Dados locais apagados.");
    window.setTimeout(() => window.location.reload(), 600);
});

/* Inicialização */

function initializeApplication() {
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

    updateRegistrationField();
    updateLastLotDisplay();

    activateTab(localStorage.getItem(ACTIVE_TAB_KEY) || "arquivo");
}

initializeApplication();
