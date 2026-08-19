/* Módulo Datas — v4.3.5 */

(function () {
    const $ = (selector) => document.querySelector(selector);
    const operation = $("#datasOperacao");
    const start = $("#datasInicio");
    const end = $("#datasFinal");
    const quantity = $("#datasQuantidade");
    const endField = $("#datasFinalCampo");
    const quantityField = $("#datasQuantidadeCampo");
    const feedback = $("#datasFeedback");
    const resultLabel = $("#datasResultadoRotulo");
    const result = $("#datasResultado");
    const detail = $("#datasResultadoDetalhe");
    const copyButton = $("#copiarDatasResultado");
    const calculateButton = $("#calcularDatas");
    const clearButton = $("#limparDatas");

    if (!operation || !start || !end || !quantity || !result) return;

    let copyValue = "";

    function parseDate(value) {
        if (!value) return null;
        const parts = value.split("-").map(Number);
        if (parts.length !== 3) return null;
        const [year, month, day] = parts;
        const date = new Date(Date.UTC(year, month - 1, day));
        if (
            date.getUTCFullYear() !== year ||
            date.getUTCMonth() !== month - 1 ||
            date.getUTCDate() !== day
        ) return null;
        return date;
    }

    function formatDate(date) {
        return new Intl.DateTimeFormat("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            timeZone: "UTC"
        }).format(date);
    }

    function setFeedback(message = "", type = "") {
        feedback.textContent = message;
        feedback.className = `feedback-message${type ? ` ${type}` : ""}`;
    }

    function resetResult() {
        copyValue = "";
        resultLabel.textContent = "RESULTADO";
        result.textContent = "—";
        detail.textContent = "Informe os dados para calcular.";
        copyButton.disabled = true;
    }

    function updateInterface({ clearDependentFields = false } = {}) {
        const between = operation.value === "entre";
        if (clearDependentFields) {
            end.value = "";
            quantity.value = "";
        }
        endField.hidden = !between;
        quantityField.hidden = between;
        end.disabled = !between;
        quantity.disabled = between;
        setFeedback();
        resetResult();
    }

    function validate() {
        const initial = parseDate(start.value);
        if (!initial) {
            setFeedback("Informe uma data inicial válida.", "error");
            return null;
        }

        if (operation.value === "entre") {
            const finalDate = parseDate(end.value);
            if (!finalDate) {
                setFeedback("Informe uma data final válida.", "error");
                return null;
            }
            if (finalDate < initial) {
                setFeedback("A data final não pode ser anterior à data inicial.", "error");
                return null;
            }
            return { initial, finalDate };
        }

        const days = Number(quantity.value);
        if (!Number.isInteger(days) || days < 0) {
            setFeedback("Informe uma quantidade inteira de dias igual ou maior que zero.", "error");
            return null;
        }
        return { initial, days };
    }

    function calculate() {
        const values = validate();
        if (!values) {
            resetResult();
            return;
        }

        setFeedback();

        if (operation.value === "entre") {
            const days = Math.floor((values.finalDate.getTime() - values.initial.getTime()) / 86400000);
            const weeks = Math.floor(days / 7);
            const remainder = days % 7;

            resultLabel.textContent = "DIAS ENTRE AS DATAS";
            result.textContent = `${days} ${days === 1 ? "dia" : "dias"}`;
            detail.textContent =
                `De ${formatDate(values.initial)} até ${formatDate(values.finalDate)} — ` +
                `${weeks} ${weeks === 1 ? "semana" : "semanas"} e ` +
                `${remainder} ${remainder === 1 ? "dia" : "dias"}.`;
            copyValue = result.textContent;
        } else {
            const direction = operation.value === "somar" ? 1 : -1;
            const calculated = new Date(values.initial.getTime());
            calculated.setUTCDate(calculated.getUTCDate() + direction * values.days);

            const sign = direction === 1 ? "+" : "−";
            resultLabel.textContent = "DATA RESULTANTE";
            result.textContent = formatDate(calculated);
            detail.textContent =
                `${formatDate(values.initial)} ${sign} ${values.days} ` +
                `${values.days === 1 ? "dia" : "dias"}.`;
            copyValue = result.textContent;
        }

        copyButton.disabled = false;
    }

    function clearAll() {
        operation.value = "entre";
        start.value = "";
        end.value = "";
        quantity.value = "";
        updateInterface();
        start.focus();
    }

    operation.addEventListener("change", () => updateInterface({ clearDependentFields: true }));
    calculateButton.addEventListener("click", calculate);
    clearButton.addEventListener("click", clearAll);

    copyButton.addEventListener("click", async () => {
        if (!copyValue) return;
        if (typeof copyText === "function") {
            await copyText(copyValue);
        } else if (navigator.clipboard) {
            await navigator.clipboard.writeText(copyValue);
        }
    });

    [start, end, quantity].forEach((field) => {
        field.addEventListener("input", () => {
            if (feedback.textContent) setFeedback();
        });
        field.addEventListener("keydown", (event) => {
            if (event.key === "Enter") calculate();
        });
    });

    updateInterface();
})();
