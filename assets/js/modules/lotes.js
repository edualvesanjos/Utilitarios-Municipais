/* Módulo: gerador de lotes. */

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
