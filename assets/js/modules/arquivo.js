/* Módulo: gerador de nome de arquivo. */

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


function applyFileNumberPointRule(value) {
    const checkbox = document.getElementById("arquivoRemoverPontos");

    if (!checkbox || !checkbox.checked) {
        return value;
    }

    return value.replace(/(?<=\d)\.(?=\d)/g, "");
}

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

    const fileName = fileBuilderState.order
        .filter((id) => fileBuilderState.enabled.includes(id))
        .map((id) => fileBlocks[id].getValue())
        .filter(Boolean)
        .join(separator);

    return applyFileNumberPointRule(fileName);
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


const arquivoRemoverPontos = document.getElementById("arquivoRemoverPontos");

if (arquivoRemoverPontos) {
    arquivoRemoverPontos.checked =
        localStorage.getItem(FILE_REMOVE_POINTS_KEY) !== "false";

    arquivoRemoverPontos.addEventListener("change", () => {
        localStorage.setItem(
            FILE_REMOVE_POINTS_KEY,
            String(arquivoRemoverPontos.checked)
        );
        updateFilePreview();
    });
}
