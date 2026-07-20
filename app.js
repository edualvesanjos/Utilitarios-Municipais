const $ = (selector) => document.querySelector(selector);

const STORAGE_PREFIX = "utilitariosMunicipais:";
const ACTIVE_TAB_KEY = `${STORAGE_PREFIX}activeTab`;
const LOT_SEQUENCE_KEY = `${STORAGE_PREFIX}lastLotSequence`;
const SAVE_FIELDS_KEY = `${STORAGE_PREFIX}saveFields`;
const FORM_DATA_KEY = `${STORAGE_PREFIX}formData`;
const FILE_HISTORY_KEY = `${STORAGE_PREFIX}fileHistory`;
const FILE_MODELS_KEY = `${STORAGE_PREFIX}fileModels`;
const FILE_BUILDER_KEY = `${STORAGE_PREFIX}fileBuilder`;
const REGISTRATION_HISTORY_KEY = `${STORAGE_PREFIX}registrationHistory`;
const REGISTRATION_AUTO_COPY_KEY = `${STORAGE_PREFIX}registrationAutoCopy`;
const LOT_HISTORY_KEY = `${STORAGE_PREFIX}lotHistory`;
const UVRM_VALUE_KEY = `${STORAGE_PREFIX}uvrmValue`;
const UVRM_HISTORY_KEY = `${STORAGE_PREFIX}uvrmHistory`;
const UVRM_DECIMALS_KEY = `${STORAGE_PREFIX}uvrmDecimals`;
const PERCENTAGE_HISTORY_KEY = `${STORAGE_PREFIX}percentageHistory`;
const LAST_BACKUP_KEY = `${STORAGE_PREFIX}lastBackup`;

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
    "loteSequenciaInicial",
    "loteSeparador",
    "uvrmQuantidade",
    "uvrmValor",
    "percentualModo",
    "percentualValor1",
    "percentualValor2"
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

let lastAutoCopiedRegistration = "";

function getSelectedRegistrationType() {
    return document.querySelector(
        'input[name="inscricaoTipo"]:checked'
    )?.value || "auto";
}

function detectRegistrationType(digits) {
    const selectedType = getSelectedRegistrationType();

    if (selectedType !== "auto") {
        return selectedType;
    }

    if (digits.length > 13) {
        return "urbano";
    }

    if (digits.length === 13) {
        return "itr";
    }

    return "indefinido";
}

function applyUrbanMask(value) {
    const digits = onlyDigits(value).slice(0, 17);
    const groups = [2, 3, 3, 2, 7];
    const parts = [];
    let index = 0;

    for (const size of groups) {
        const part = digits.slice(index, index + size);

        if (!part) {
            break;
        }

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

function getRegistrationHistory() {
    return getJson(REGISTRATION_HISTORY_KEY, []);
}

function addRegistrationHistory(masked, type) {
    const item = {
        masked,
        digits: onlyDigits(masked),
        type,
        copiedAt: new Date().toISOString()
    };

    const history = getRegistrationHistory()
        .filter((entry) => entry.masked !== masked)
        .slice(0, 14);

    history.unshift(item);
    setJson(REGISTRATION_HISTORY_KEY, history);
    renderRegistrationHistory();
}

function renderRegistrationHistory() {
    const list = $("#inscricaoHistorico");
    const history = getRegistrationHistory();

    if (history.length === 0) {
        list.innerHTML =
            '<li class="empty-state">Nenhuma inscrição copiada recentemente.</li>';
        return;
    }

    list.innerHTML = "";

    history.forEach((item) => {
        const li = document.createElement("li");
        const text = document.createElement("span");
        const actions = document.createElement("div");
        const maskedButton = document.createElement("button");
        const digitsButton = document.createElement("button");

        text.textContent = `${item.masked} (${item.type.toUpperCase()})`;
        actions.className = "list-actions";

        maskedButton.textContent = "Copiar";
        maskedButton.className = "secondary mini-button";
        maskedButton.addEventListener("click", () => copyText(item.masked));

        digitsButton.textContent = "Números";
        digitsButton.className = "secondary mini-button";
        digitsButton.addEventListener("click", () => copyText(item.digits));

        actions.append(maskedButton, digitsButton);
        li.append(text, actions);
        list.appendChild(li);
    });
}

async function maybeAutoCopyRegistration(masked, type, valid) {
    if (
        !valid ||
        !$("#inscricaoCopiaAutomatica").checked ||
        masked === lastAutoCopiedRegistration
    ) {
        return;
    }

    const copied = await copyText(masked);

    if (copied) {
        lastAutoCopiedRegistration = masked;
        addRegistrationHistory(masked, type);
    }
}

function updateRegistrationField() {
    const field = $("#inscricaoValor");
    const preview = $("#inscricaoPreview");
    const help = $("#inscricaoAjuda");
    const typeElement = $("#inscricaoTipoDetectado");
    const countElement = $("#inscricaoContagem");
    const statusElement = $("#inscricaoStatus");

    const rawDigits = onlyDigits(field.value);
    const type = detectRegistrationType(rawDigits);
    const exceeded = (type === "urbano" && rawDigits.length > 17) || (type === "itr" && rawDigits.length > 13);
    const maxLength = type === "itr" ? 13 : 17;
    const digits = rawDigits.slice(0, maxLength);

    let masked = "";
    let expected = 0;
    let typeLabel = "Aguardando";

    if (type === "urbano") {
        expected = 17;
        typeLabel = "Urbano";
        masked = applyUrbanMask(digits);
    } else if (type === "itr") {
        expected = 13;
        typeLabel = "ITR";
        masked = applyItrMask(digits);
    } else {
        masked = digits;
    }

    field.value = masked;
    preview.textContent = masked || "—";
    typeElement.textContent = typeLabel;
    countElement.textContent = String(digits.length);

    help.classList.remove("error", "success");
    statusElement.classList.remove("status-valid", "status-invalid");

    if (digits.length === 0) {
        statusElement.textContent = "Aguardando";
        help.textContent =
            "O padrão urbano possui 17 números e o ITR possui 13 números.";
        lastAutoCopiedRegistration = "";
        return;
    }

    if (type === "indefinido") {
        statusElement.textContent = "Incompleta";
        statusElement.classList.add("status-invalid");
        help.textContent =
            "Continue digitando ou selecione manualmente o tipo.";
        help.classList.add("error");
        lastAutoCopiedRegistration = "";
        return;
    }

    if (exceeded) {
        statusElement.textContent = "Inválida";
        statusElement.classList.add("status-invalid");
        help.textContent = `Quantidade incorreta: informado ${rawDigits.length} números. O padrão ${typeLabel} aceita exatamente ${expected} números.`;
        help.classList.add("error");
        lastAutoCopiedRegistration = "";
        return;
    }

    const valid = digits.length === expected;

    if (valid) {
        statusElement.textContent = "Completa";
        statusElement.classList.add("status-valid");
        help.textContent = `Inscrição ${typeLabel} completa e normalizada.`;
        help.classList.add("success");
        maybeAutoCopyRegistration(masked, type, true);
    } else {
        statusElement.textContent = "Incompleta";
        statusElement.classList.add("status-invalid");
        help.textContent =
            `Quantidade atual: ${digits.length} de ${expected} números.`;
        help.classList.add("error");
        lastAutoCopiedRegistration = "";
    }
}

$("#inscricaoValor").addEventListener("input", updateRegistrationField);

$("#inscricaoValor").addEventListener("paste", () => {
    window.setTimeout(updateRegistrationField, 0);
});

document
    .querySelectorAll('input[name="inscricaoTipo"]')
    .forEach((radio) => {
        radio.addEventListener("change", () => {
            lastAutoCopiedRegistration = "";
            updateRegistrationField();
        });
    });

$("#inscricaoCopiaAutomatica").addEventListener("change", (event) => {
    localStorage.setItem(
        REGISTRATION_AUTO_COPY_KEY,
        String(event.target.checked)
    );

    lastAutoCopiedRegistration = "";

    if (event.target.checked) {
        showToast("Cópia automática ativada.");
        updateRegistrationField();
    } else {
        showToast("Cópia automática desativada.");
    }
});

$("#copiarInscricao").addEventListener("click", async () => {
    const masked = $("#inscricaoPreview").textContent.trim();
    const digits = onlyDigits(masked);
    const type = detectRegistrationType(digits);
    const expected = type === "urbano" ? 17 : type === "itr" ? 13 : 0;

    if (!expected || digits.length !== expected) {
        showToast("Complete a inscrição antes de copiar.");
        return;
    }

    const copied = await copyText(masked);

    if (copied) {
        addRegistrationHistory(masked, type);
    }
});

$("#copiarInscricaoSemMascara").addEventListener("click", async () => {
    const masked = $("#inscricaoPreview").textContent.trim();
    const digits = onlyDigits(masked);
    const type = detectRegistrationType(digits);
    const expected = type === "urbano" ? 17 : type === "itr" ? 13 : 0;

    if (!expected || digits.length !== expected) {
        showToast("Complete a inscrição antes de copiar.");
        return;
    }

    const copied = await copyText(digits);

    if (copied) {
        addRegistrationHistory(masked, type);
    }
});

$("#limparInscricao").addEventListener("click", () => {
    $("#inscricaoValor").value = "";
    lastAutoCopiedRegistration = "";
    updateRegistrationField();
});

$("#limparHistoricoInscricao").addEventListener("click", () => {
    localStorage.removeItem(REGISTRATION_HISTORY_KEY);
    renderRegistrationHistory();
    showToast("Histórico de inscrições removido.");
});

/* Lotes */

function getLastLotSequence() {
    const stored = Number(localStorage.getItem(LOT_SEQUENCE_KEY));
    return Number.isInteger(stored) && stored >= 3 ? stored : 3;
}

function formatLotPart(value, size, pad=true) {
    const d=onlyDigits(value).slice(0,size);
    return pad?d.padStart(size,"0"):d;
}

function getLotFormValues() {
    const sector = formatLotPart($("#loteSetor").value, 3, false);
    const block = formatLotPart($("#loteQuadra").value, 3);
    const quantity = Math.min(
        100,
        Math.max(1, Number($("#loteQuantidade").value) || 1)
    );
    const initial = Math.min(
        99999,
        Math.max(1, Number($("#loteSequenciaInicial").value) || 1)
    );
    const separator = $("#loteSeparador").value;

    return { sector, block, quantity, initial, separator };
}

function buildLotNumber(sector, block, sequence, separator) {
    return [
        sector,
        block,
        String(sequence).padStart(5, "0")
    ].join(separator);
}

function generateLotList() {
    const { sector, block, quantity, initial, separator } =
        getLotFormValues();

    return Array.from({ length: quantity }, (_, index) =>
        buildLotNumber(sector, block, initial + index, separator)
    );
}

function updateLotPreview() {
    const { sector, block, quantity, initial, separator } =
        getLotFormValues();

    $("#loteSetor").value = onlyDigits($("#loteSetor").value).slice(0, 3);
    $("#loteQuadra").value = onlyDigits($("#loteQuadra").value).slice(0, 3);
    $("#loteQuantidadeResumo").textContent = String(quantity);
    $("#loteProximaSequencia").textContent =
        String(getLastLotSequence() + 1).padStart(5, "0");

    const preview = buildLotNumber(
        sector,
        block,
        initial,
        separator
    );

    $("#lotePreview").textContent = preview;
    $("#lotePadraoExemplo").textContent = preview;
    saveFormData();
}

function updateLastLotDisplay() {
    const last = getLastLotSequence();
    $("#loteUltimaSequencia").textContent =
        String(last).padStart(5, "0");
    $("#loteProximaSequencia").textContent =
        String(last + 1).padStart(5, "0");
}

function getLotHistory() {
    return getJson(LOT_HISTORY_KEY, []);
}

function addLotHistory(lots) {
    const item = {
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
        first: lots[0],
        last: lots[lots.length - 1],
        quantity: lots.length,
        content: lots.join("\n"),
        createdAt: new Date().toISOString()
    };

    const history = getLotHistory().slice(0, 14);
    history.unshift(item);
    setJson(LOT_HISTORY_KEY, history);
    renderLotHistory();
}

function renderLotHistory() {
    const list = $("#loteHistorico");
    const history = getLotHistory();

    if (history.length === 0) {
        list.innerHTML =
            '<li class="empty-state">Nenhum lote gerado recentemente.</li>';
        return;
    }

    list.innerHTML = "";

    history.forEach((item) => {
        const li = document.createElement("li");
        const text = document.createElement("span");
        const actions = document.createElement("div");
        const copyButton = document.createElement("button");

        text.textContent = item.quantity === 1
            ? item.first
            : `${item.first} até ${item.last} (${item.quantity})`;

        actions.className = "list-actions";
        copyButton.textContent = "Copiar";
        copyButton.className = "secondary mini-button";
        copyButton.addEventListener("click", () => copyText(item.content));

        actions.append(copyButton);
        li.append(text, actions);
        list.appendChild(li);
    });
}

[
    "loteSetor",
    "loteQuadra",
    "loteQuantidade",
    "loteSequenciaInicial",
    "loteSeparador",
    "loteSequenciaInicial",
    "loteSeparador"
].forEach((id) => {
    const field = document.getElementById(id);
    field.addEventListener("input", updateLotPreview);
    field.addEventListener("change", updateLotPreview);
});

$("#gerarLotes").addEventListener("click", () => {
    const lots = generateLotList();
    const { initial, quantity } = getLotFormValues();
    const finalSequence = initial + quantity - 1;
    const nextSequence = finalSequence + 1;

    $("#loteResultado").textContent = lots.join("\n");
    localStorage.setItem(LOT_SEQUENCE_KEY, String(finalSequence));

    $("#loteSequenciaInicial").value = nextSequence;

    updateLastLotDisplay();
    updateLotPreview();
    addLotHistory(lots);
    showToast(`${lots.length} lote(s) gerado(s). Próxima sequência preparada.`);
});

$("#copiarLotes").addEventListener("click", () => {
    copyText($("#loteResultado").textContent);
});

$("#baixarLotesTxt").addEventListener("click", () => {
    const content = $("#loteResultado").textContent.trim();

    if (!content || content === "—") {
        showToast("Gere os lotes antes de baixar.");
        return;
    }

    const blob = new Blob([content], {
        type: "text/plain;charset=utf-8"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `lotes-${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();

    URL.revokeObjectURL(url);
    showToast("Arquivo TXT gerado.");
});

$("#limparLotes").addEventListener("click", () => {
    $("#loteResultado").textContent = "—";
    $("#loteQuantidade").value = 1;
    updateLotPreview();
});

$("#reiniciarSequenciaLotes").addEventListener("click", () => {
    if (!window.confirm("Deseja reiniciar a sequência para 00003?")) {
        return;
    }

    localStorage.setItem(LOT_SEQUENCE_KEY, "3");
    $("#loteSequenciaInicial").value = 4;
    $("#loteResultado").textContent = "—";

    updateLastLotDisplay();
    updateLotPreview();
    showToast("Sequência reiniciada.");
});

$("#limparHistoricoLotes").addEventListener("click", () => {
    localStorage.removeItem(LOT_HISTORY_KEY);
    renderLotHistory();
    showToast("Histórico de lotes removido.");
});

/* UVRM */

const DEFAULT_UVRM_VALUE = 39.99;
let uvrmInputOrigin = "";
let uvrmCurrentPlainValue = "";
let uvrmCurrentFullText = "";

function parseLocaleNumber(value) {
    if (typeof value === "number") {
        return value;
    }

    const normalized = String(value)
        .trim()
        .replace(/\s/g, "")
        .replace(/\./g, "")
        .replace(",", ".");

    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : NaN;
}

function formatDecimal(value, decimals) {
    return Number(value).toLocaleString("pt-BR", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
}

function formatUvrmCurrency(value) {
    return Number(value).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function getUvrmValue() {
    const value = parseLocaleNumber($("#uvrmValorUnitario").value);
    return Number.isFinite(value) && value > 0 ? value : NaN;
}

function getUvrmDecimals() {
    return Math.max(2, Math.min(6, Number($("#uvrmCasas").value) || 2));
}

function getUvrmHistory() {
    return getJson(UVRM_HISTORY_KEY, []);
}

function addUvrmHistory(fullText, plainValue) {
    const item = {
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
        fullText,
        plainValue,
        createdAt: new Date().toISOString()
    };

    const history = getUvrmHistory()
        .filter((entry) => entry.fullText !== fullText)
        .slice(0, 29);

    history.unshift(item);
    setJson(UVRM_HISTORY_KEY, history);
    renderUvrmHistory();
}

function renderUvrmHistory() {
    const list = $("#uvrmHistorico");
    const query = ($("#pesquisaHistoricoUvrm").value || "")
        .trim()
        .toLocaleLowerCase("pt-BR");

    const history = getUvrmHistory().filter((item) =>
        item.fullText.toLocaleLowerCase("pt-BR").includes(query)
    );

    if (history.length === 0) {
        list.innerHTML =
            '<li class="empty-state">Nenhum cálculo encontrado.</li>';
        return;
    }

    list.innerHTML = "";

    history.forEach((item) => {
        const li = document.createElement("li");
        const text = document.createElement("span");
        const actions = document.createElement("div");
        const copyButton = document.createElement("button");

        text.textContent = item.fullText;
        actions.className = "list-actions";
        copyButton.textContent = "Copiar";
        copyButton.className = "secondary mini-button";
        copyButton.addEventListener("click", () => copyText(item.fullText));

        actions.append(copyButton);
        li.append(text, actions);
        list.appendChild(li);
    });
}

function clearUvrmResult(message = "Digite em apenas um dos campos para calcular automaticamente.") {
    $("#uvrmResultado").textContent = "—";
    $("#uvrmAjuda").textContent = message;
    $("#uvrmAjuda").classList.remove("error", "success");
    uvrmCurrentPlainValue = "";
    uvrmCurrentFullText = "";
}

function calculateUvrmFromReais() {
    const unitValue = getUvrmValue();
    const reais = parseLocaleNumber($("#uvrmValorReais").value);
    const decimals = getUvrmDecimals();

    if (!Number.isFinite(unitValue)) {
        clearUvrmResult("Informe um valor válido para a UVRM.");
        $("#uvrmAjuda").classList.add("error");
        return;
    }

    if (!Number.isFinite(reais) || reais < 0) {
        clearUvrmResult();
        return;
    }

    const quantity = reais / unitValue;
    const formattedQuantity = formatDecimal(quantity, decimals);
    const formattedReais = formatUvrmCurrency(reais);

    $("#uvrmQuantidade").value = formattedQuantity;
    $("#uvrmResultado").textContent = `${formattedQuantity} UVRM`;
    $("#uvrmAjuda").textContent = "Conversão de reais para UVRM atualizada.";
    $("#uvrmAjuda").classList.remove("error");
    $("#uvrmAjuda").classList.add("success");

    uvrmCurrentPlainValue = `${formattedQuantity} UVRM`;
    uvrmCurrentFullText = `${formattedReais} = ${formattedQuantity} UVRM`;
}

function calculateReaisFromUvrm() {
    const unitValue = getUvrmValue();
    const quantity = parseLocaleNumber($("#uvrmQuantidade").value);
    const decimals = getUvrmDecimals();

    if (!Number.isFinite(unitValue)) {
        clearUvrmResult("Informe um valor válido para a UVRM.");
        $("#uvrmAjuda").classList.add("error");
        return;
    }

    if (!Number.isFinite(quantity) || quantity < 0) {
        clearUvrmResult();
        return;
    }

    const reais = quantity * unitValue;
    const formattedReais = formatUvrmCurrency(reais);
    const formattedQuantity = formatDecimal(quantity, decimals);

    $("#uvrmValorReais").value = formatDecimal(reais, 2);
    $("#uvrmResultado").textContent = formattedReais;
    $("#uvrmAjuda").textContent = "Conversão de UVRM para reais atualizada.";
    $("#uvrmAjuda").classList.remove("error");
    $("#uvrmAjuda").classList.add("success");

    uvrmCurrentPlainValue = formattedReais;
    uvrmCurrentFullText = `${formattedQuantity} UVRM = ${formattedReais}`;
}

function recalculateUvrm() {
    if (uvrmInputOrigin === "uvrm") {
        calculateReaisFromUvrm();
    } else if (uvrmInputOrigin === "reais") {
        calculateUvrmFromReais();
    } else {
        clearUvrmResult();
    }
}

$("#uvrmValorReais").addEventListener("input", () => {
    uvrmInputOrigin = "reais";
    $("#uvrmQuantidade").value = "";
    calculateUvrmFromReais();
});

$("#uvrmQuantidade").addEventListener("input", () => {
    uvrmInputOrigin = "uvrm";
    $("#uvrmValorReais").value = "";
    calculateReaisFromUvrm();
});

$("#uvrmValorUnitario").addEventListener("input", () => {
    localStorage.setItem(UVRM_VALUE_KEY, $("#uvrmValorUnitario").value);
    recalculateUvrm();
});


$("#uvrmCasas").addEventListener("change", () => {
    localStorage.setItem(UVRM_DECIMALS_KEY, $("#uvrmCasas").value);
    recalculateUvrm();
});

$("#uvrmRestaurarPadrao").addEventListener("click", () => {
    $("#uvrmValorUnitario").value = formatDecimal(DEFAULT_UVRM_VALUE, 2);
    localStorage.setItem(UVRM_VALUE_KEY, String(DEFAULT_UVRM_VALUE));
    recalculateUvrm();
    showToast("Valor padrão da UVRM restaurado.");
});

$("#copiarUvrmValor").addEventListener("click", async () => {
    if (!uvrmCurrentPlainValue) {
        showToast("Informe um valor para realizar o cálculo.");
        return;
    }

    const copied = await copyText(uvrmCurrentPlainValue);

    if (copied) {
        addUvrmHistory(uvrmCurrentFullText, uvrmCurrentPlainValue);
    }
});

$("#copiarUvrmCompleto").addEventListener("click", async () => {
    if (!uvrmCurrentFullText) {
        showToast("Informe um valor para realizar o cálculo.");
        return;
    }

    const copied = await copyText(uvrmCurrentFullText);

    if (copied) {
        addUvrmHistory(uvrmCurrentFullText, uvrmCurrentPlainValue);
    }
});

$("#limparUvrm").addEventListener("click", () => {
    $("#uvrmValorReais").value = "";
    $("#uvrmQuantidade").value = "";
    uvrmInputOrigin = "";
    clearUvrmResult();
});

$("#limparHistoricoUvrm").addEventListener("click", () => {
    localStorage.removeItem(UVRM_HISTORY_KEY);
    renderUvrmHistory();
    showToast("Histórico UVRM removido.");
});

$("#pesquisaHistoricoUvrm").addEventListener("input", renderUvrmHistory);

/* Percentual */

let percentageCurrentValue = "";
let percentageCurrentFullText = "";

const percentageModeSettings = {
    percentual: {
        label1: "Valor base",
        label2: "Percentual",
        placeholder1: "0,00",
        placeholder2: "0",
        help: "Informe o valor base e o percentual desejado.",
        operation: "Percentual do valor",
        secondaryLabel: "Valor do percentual",
        finalLabel: "Valor base"
    },
    acrescimo: {
        label1: "Valor base",
        label2: "Percentual de acréscimo",
        placeholder1: "0,00",
        placeholder2: "0",
        help: "Informe o valor original e o percentual que será acrescentado.",
        operation: "Acréscimo percentual",
        secondaryLabel: "Valor do acréscimo",
        finalLabel: "Valor com acréscimo"
    },
    desconto: {
        label1: "Valor base",
        label2: "Percentual de desconto",
        placeholder1: "0,00",
        placeholder2: "0",
        help: "Informe o valor original e o percentual que será descontado.",
        operation: "Desconto percentual",
        secondaryLabel: "Valor do desconto",
        finalLabel: "Valor com desconto"
    },
    proporcao: {
        label1: "Valor parcial",
        label2: "Valor total",
        placeholder1: "0,00",
        placeholder2: "0,00",
        help: "Informe o valor parcial e o valor total de referência.",
        operation: "Proporção percentual",
        secondaryLabel: "Valor parcial",
        finalLabel: "Valor total"
    },
    variacao: {
        label1: "Valor inicial",
        label2: "Valor final",
        placeholder1: "0,00",
        placeholder2: "0,00",
        help: "Informe o valor inicial e o valor final para medir a variação.",
        operation: "Variação percentual",
        secondaryLabel: "Diferença",
        finalLabel: "Classificação"
    }
};

function getPercentageHistory() {
    return getJson(PERCENTAGE_HISTORY_KEY, []);
}

function addPercentageHistory(fullText, resultValue) {
    const item = {
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
        fullText,
        resultValue,
        createdAt: new Date().toISOString()
    };

    const history = getPercentageHistory()
        .filter((entry) => entry.fullText !== fullText)
        .slice(0, 29);

    history.unshift(item);
    setJson(PERCENTAGE_HISTORY_KEY, history);
    renderPercentageHistory();
}

function renderPercentageHistory() {
    const list = $("#percentualHistorico");
    const query = ($("#pesquisaHistoricoPercentual").value || "")
        .trim()
        .toLocaleLowerCase("pt-BR");

    const history = getPercentageHistory().filter((item) =>
        item.fullText.toLocaleLowerCase("pt-BR").includes(query)
    );

    if (history.length === 0) {
        list.innerHTML =
            '<li class="empty-state">Nenhum cálculo encontrado.</li>';
        return;
    }

    list.innerHTML = "";

    history.forEach((item) => {
        const li = document.createElement("li");
        const text = document.createElement("span");
        const actions = document.createElement("div");
        const copyButton = document.createElement("button");

        text.textContent = item.fullText;
        actions.className = "list-actions";

        copyButton.textContent = "Copiar";
        copyButton.className = "secondary mini-button";
        copyButton.addEventListener("click", () => copyText(item.fullText));

        actions.append(copyButton);
        li.append(text, actions);
        list.appendChild(li);
    });
}

function resetPercentageResult(message) {
    const settings =
        percentageModeSettings[$("#percentualModo").value] ||
        percentageModeSettings.percentual;

    $("#percentualResultadoResumo").textContent = "—";
    $("#percentualStatus").textContent = "Aguardando";
    $("#percentualStatus").classList.remove("status-valid", "status-invalid");
    $("#percentualResultadoCompleto").textContent = "—";
    $("#percentualResultadoSecundario").textContent = "—";
    $("#percentualResultadoFinal").textContent = "—";
    $("#percentualAjuda").textContent = message || settings.help;
    $("#percentualAjuda").classList.remove("error", "success");

    percentageCurrentValue = "";
    percentageCurrentFullText = "";
}

function updatePercentageMode() {
    const settings =
        percentageModeSettings[$("#percentualModo").value] ||
        percentageModeSettings.percentual;

    $("#percentualRotuloValor1").textContent = settings.label1;
    $("#percentualRotuloValor2").textContent = settings.label2;
    $("#percentualValor1").placeholder = settings.placeholder1;
    $("#percentualValor2").placeholder = settings.placeholder2;
    $("#percentualOperacaoResumo").textContent = settings.operation;
    $("#percentualResultadoSecundarioRotulo").textContent =
        settings.secondaryLabel;
    $("#percentualResultadoFinalRotulo").textContent = settings.finalLabel;

    resetPercentageResult(settings.help);
    calculatePercentage();
    saveFormData();
}

function setPercentageValidResult({
    main,
    full,
    secondary,
    final
}) {
    $("#percentualResultadoResumo").textContent = main;
    $("#percentualResultadoCompleto").textContent = full;
    $("#percentualResultadoSecundario").textContent = secondary;
    $("#percentualResultadoFinal").textContent = final;
    $("#percentualStatus").textContent = "Calculado";
    $("#percentualStatus").classList.remove("status-invalid");
    $("#percentualStatus").classList.add("status-valid");
    $("#percentualAjuda").textContent = "Resultado atualizado automaticamente.";
    $("#percentualAjuda").classList.remove("error");
    $("#percentualAjuda").classList.add("success");

    percentageCurrentValue = main;
    percentageCurrentFullText = full;
}

function setPercentageError(message) {
    resetPercentageResult(message);
    $("#percentualStatus").textContent = "Inválido";
    $("#percentualStatus").classList.add("status-invalid");
    $("#percentualAjuda").classList.add("error");
}

function calculatePercentage() {
    const mode = $("#percentualModo").value;
    const value1Text = $("#percentualValor1").value.trim();
    const value2Text = $("#percentualValor2").value.trim();

    if (!value1Text || !value2Text) {
        resetPercentageResult();
        saveFormData();
        return;
    }

    const value1 = parseDecimal(value1Text);
    const value2 = parseDecimal(value2Text);

    if (
        !Number.isFinite(value1) ||
        !Number.isFinite(value2) ||
        value1 < 0 ||
        value2 < 0
    ) {
        setPercentageError("Informe valores numéricos válidos e não negativos.");
        return;
    }

    if (mode === "percentual") {
        const result = value1 * (value2 / 100);
        const main = formatCurrency(result);
        const base = formatCurrency(value1);
        const rate = formatDecimal(value2, 2);

        setPercentageValidResult({
            main,
            full: `${rate}% de ${base} = ${main}`,
            secondary: main,
            final: base
        });
    }

    if (mode === "acrescimo") {
        const addition = value1 * (value2 / 100);
        const finalValue = value1 + addition;
        const additionText = formatCurrency(addition);
        const finalText = formatCurrency(finalValue);
        const base = formatCurrency(value1);
        const rate = formatDecimal(value2, 2);

        setPercentageValidResult({
            main: finalText,
            full: `${base} + ${rate}% (${additionText}) = ${finalText}`,
            secondary: additionText,
            final: finalText
        });
    }

    if (mode === "desconto") {
        const discount = value1 * (value2 / 100);
        const finalValue = value1 - discount;
        const discountText = formatCurrency(discount);
        const finalText = formatCurrency(finalValue);
        const base = formatCurrency(value1);
        const rate = formatDecimal(value2, 2);

        setPercentageValidResult({
            main: finalText,
            full: `${base} - ${rate}% (${discountText}) = ${finalText}`,
            secondary: discountText,
            final: finalText
        });
    }

    if (mode === "proporcao") {
        if (value2 === 0) {
            setPercentageError("O valor total deve ser maior que zero.");
            return;
        }

        const rate = (value1 / value2) * 100;
        const rateText = `${formatDecimal(rate, 2)}%`;
        const partial = formatCurrency(value1);
        const total = formatCurrency(value2);

        setPercentageValidResult({
            main: rateText,
            full: `${partial} representa ${rateText} de ${total}`,
            secondary: partial,
            final: total
        });
    }

    if (mode === "variacao") {
        if (value1 === 0) {
            setPercentageError("O valor inicial deve ser maior que zero.");
            return;
        }

        const difference = value2 - value1;
        const variation = (difference / value1) * 100;
        const variationText = `${formatDecimal(variation, 2)}%`;
        const initial = formatCurrency(value1);
        const finalValue = formatCurrency(value2);
        const differenceText = formatCurrency(Math.abs(difference));
        const classification =
            difference > 0 ? "Aumento" :
            difference < 0 ? "Redução" :
            "Sem alteração";

        setPercentageValidResult({
            main: variationText,
            full: `${initial} para ${finalValue} = ${variationText} (${classification})`,
            secondary: differenceText,
            final: classification
        });
    }

    saveFormData();
}

$("#percentualModo").addEventListener("change", updatePercentageMode);
$("#percentualValor1").addEventListener("input", calculatePercentage);
$("#percentualValor2").addEventListener("input", calculatePercentage);

$("#copiarPercentualValor").addEventListener("click", async () => {
    if (!percentageCurrentValue) {
        showToast("Informe os valores para realizar o cálculo.");
        return;
    }

    const copied = await copyText(percentageCurrentValue);

    if (copied) {
        addPercentageHistory(
            percentageCurrentFullText,
            percentageCurrentValue
        );
    }
});

$("#copiarPercentualCompleto").addEventListener("click", async () => {
    if (!percentageCurrentFullText) {
        showToast("Informe os valores para realizar o cálculo.");
        return;
    }

    const copied = await copyText(percentageCurrentFullText);

    if (copied) {
        addPercentageHistory(
            percentageCurrentFullText,
            percentageCurrentValue
        );
    }
});

$("#limparPercentual").addEventListener("click", () => {
    $("#percentualValor1").value = "";
    $("#percentualValor2").value = "";
    resetPercentageResult();
    saveFormData();
});

$("#limparHistoricoPercentual").addEventListener("click", () => {
    localStorage.removeItem(PERCENTAGE_HISTORY_KEY);
    renderPercentageHistory();
    showToast("Histórico percentual removido.");
});

$("#pesquisaHistoricoPercentual").addEventListener(
    "input",
    renderPercentageHistory
);

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
    return {app:"Utilitários Municipais",version:"1.9",exportedAt:new Date().toISOString(),storagePrefix:STORAGE_PREFIX,data};
}

function validateBackupPayload(payload) {
    if (!payload || typeof payload !== "object") return "Estrutura de backup inválida.";
    if (payload.app !== "Utilitários Municipais") return "O arquivo não pertence ao aplicativo Utilitários Municipais.";
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

    activateTab(localStorage.getItem(ACTIVE_TAB_KEY) || "arquivo");
}

initializeApplication();
