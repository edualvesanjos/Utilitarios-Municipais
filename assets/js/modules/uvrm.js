/* Módulo: calculadora UVRM. */

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
