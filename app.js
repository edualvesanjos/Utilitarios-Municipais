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

    setFeedback($("#percentualMensagem"), "Cálculo realizado.", "success");
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
        version: "1.5",
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

    $("#inscricaoCopiaAutomatica").checked =
        localStorage.getItem(REGISTRATION_AUTO_COPY_KEY) === "true";

    renderRegistrationHistory();
    updateRegistrationField();
    updateLastLotDisplay();

    activateTab(localStorage.getItem(ACTIVE_TAB_KEY) || "arquivo");
}

initializeApplication();
