/* Módulo: calculadora percentual. */

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
