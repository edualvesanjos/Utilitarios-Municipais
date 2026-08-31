/* Versão 4.4.6.1: Central de Documentos com correção do estado vazio ao selecionar um modelo. */
(() => {
    "use strict";

    const $ = (selector) => document.querySelector(selector);

    const CUSTOM_KEY = "utilitariosMunicipais:documentTemplates";
    const SORT_KEY = "utilitariosMunicipais:documentSort";

    let selectedId = null;
    let variableValues = {};

    function loadTemplates() {
        try {
            const stored = JSON.parse(localStorage.getItem(CUSTOM_KEY) || "[]");
            return Array.isArray(stored) ? stored : [];
        } catch {
            return [];
        }
    }

    function saveTemplates(templates) {
        localStorage.setItem(CUSTOM_KEY, JSON.stringify(templates));
    }

    function allTemplates() {
        return loadTemplates();
    }

    function escapeHtml(value) {
        return String(value ?? "").replace(/[&<>"]/g, (char) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;"
        }[char]));
    }

    function setFeedback(message, type = "") {
        const element = $("#documentFeedback");
        if (!element) return;

        element.textContent = message || "";
        element.className = `feedback-message ${type}`;
    }

    function getSortOrder() {
        const saved = localStorage.getItem(SORT_KEY);
        return saved === "categoria" ? "categoria" : "titulo";
    }

    function setSortOrder(value) {
        localStorage.setItem(SORT_KEY, value === "categoria" ? "categoria" : "titulo");
    }

    function setEditorVisible(visible) {
        const emptyState = $("#documentEmptyState");
        const editorContent = $("#documentEditorContent");

        if (emptyState) emptyState.hidden = visible;
        if (editorContent) editorContent.hidden = !visible;
    }

    function updateEditorHeading() {
        const heading = $("#documentEditorHeading");
        if (!heading) return;

        const title = $("#documentTitle")?.value.trim();
        heading.textContent = title || (selectedId ? "Editar modelo" : "Novo modelo");
    }

    function filtered() {
        const query = ($("#documentSearch")?.value || "").toLocaleLowerCase("pt-BR");
        const category = $("#documentCategory")?.value || "todos";
        const order = $("#documentOrder")?.value || getSortOrder();
        const collator = new Intl.Collator("pt-BR", {
            sensitivity: "base",
            numeric: true
        });

        return allTemplates()
            .filter((template) => {
                const matchesCategory = category === "todos" || template.category === category;
                const searchable = `${template.title} ${template.category} ${template.content}`
                    .toLocaleLowerCase("pt-BR");
                return matchesCategory && (!query || searchable.includes(query));
            })
            .sort((a, b) => {
                if (order === "categoria") {
                    const categoryCompare = collator.compare(a.category, b.category);
                    return categoryCompare || collator.compare(a.title, b.title);
                }

                return collator.compare(a.title, b.title) || collator.compare(a.category, b.category);
            });
    }

    function renderList() {
        const host = $("#documentTemplateList");
        if (!host) return;

        const items = filtered();

        host.innerHTML = items.length
            ? items.map((template) => `
                <button
                    type="button"
                    class="document-template-item ${template.id === selectedId ? "active" : ""}"
                    data-document-id="${escapeHtml(template.id)}"
                >
                    <span class="document-template-main">
                        <strong>${escapeHtml(template.title)}</strong>
                        <small>${escapeHtml(template.category)}</small>
                    </span>
                    <span class="document-template-chevron" aria-hidden="true">›</span>
                </button>
            `).join("")
            : `
                <div class="document-list-empty">
                    <strong>Nenhum modelo encontrado.</strong>
                    <span>Crie um novo modelo ou altere os filtros.</span>
                </div>
            `;

        host.querySelectorAll("[data-document-id]").forEach((button) => {
            button.addEventListener("click", () => selectTemplate(button.dataset.documentId));
        });
    }

    function selectTemplate(id) {
        const template = allTemplates().find((item) => item.id === id);
        if (!template) return;

        selectedId = id;
        variableValues = {};

        $("#documentTitle").value = template.title;
        $("#documentEditorCategory").value = template.category;
        $("#documentTemplate").value = template.content;

        setEditorVisible(true);
        updateEditorHeading();
        renderVariables();
        renderList();
        setFeedback();
    }

    function variables() {
        return [...new Set(
            (($("#documentTemplate")?.value || "").match(/\{[^{}]+\}/g) || [])
                .map((value) => value.slice(1, -1).trim())
                .filter(Boolean)
        )];
    }

    function defaultValue(variable) {
        if (variable.toLowerCase() === "data") {
            return new Intl.DateTimeFormat("pt-BR").format(new Date());
        }

        return "";
    }

    function renderVariables() {
        const host = $("#documentVariables");
        if (!host) return;

        const vars = variables();

        host.innerHTML = vars.length
            ? vars.map((variable) => `
                <label>
                    <span>${escapeHtml(variable)}</span>
                    <input
                        data-document-variable="${escapeHtml(variable)}"
                        value="${escapeHtml(variableValues[variable] || defaultValue(variable))}"
                        placeholder="${escapeHtml(variable)}"
                    >
                </label>
            `).join("")
            : '<p class="empty-state">Nenhuma variável encontrada neste modelo.</p>';

        host.querySelectorAll("[data-document-variable]").forEach((input) => {
            input.addEventListener("input", () => {
                variableValues[input.dataset.documentVariable] = input.value;
                renderPreview();
            });
        });

        vars.forEach((variable) => {
            const input = host.querySelector(
                `[data-document-variable="${CSS.escape(variable)}"]`
            );
            if (input) variableValues[variable] = input.value;
        });

        renderPreview();
    }

    function renderPreview() {
        let text = $("#documentTemplate")?.value || "";

        for (const variable of variables()) {
            text = text
                .split(`{${variable}}`)
                .join(variableValues[variable] || `{${variable}}`);
        }

        const preview = $("#documentPreview");
        if (preview) preview.value = text;
    }

    function newModel() {
        selectedId = null;
        variableValues = {};

        $("#documentTitle").value = "";
        $("#documentEditorCategory").value = "Personalizados";
        $("#documentTemplate").value = "";

        setEditorVisible(true);
        updateEditorHeading();
        renderVariables();
        renderList();
        setFeedback();

        window.setTimeout(() => $("#documentTitle")?.focus(), 0);
    }

    function saveModel() {
        const title = $("#documentTitle").value.trim();
        const content = $("#documentTemplate").value.trim();
        const category = $("#documentEditorCategory").value;

        if (!title || !content) {
            setFeedback("Informe o título e o conteúdo do modelo.", "error");
            return;
        }

        const list = loadTemplates();
        const id = selectedId || `custom-${Date.now()}`;
        const item = { id, title, category, content };
        const index = list.findIndex((template) => template.id === id);

        if (index >= 0) {
            list.splice(index, 1, item);
        } else {
            list.unshift(item);
        }

        saveTemplates(list);
        selectedId = id;

        renderList();
        updateEditorHeading();
        setFeedback("Modelo salvo.", "success");

        if (typeof showToast === "function") {
            showToast("Modelo salvo.");
        }
    }

    function deleteModel() {
        if (!selectedId) {
            setFeedback("Selecione um modelo para excluir.", "error");
            return;
        }

        const template = allTemplates().find((item) => item.id === selectedId);
        if (!template) {
            setFeedback("Modelo não encontrado.", "error");
            return;
        }

        const confirmed = window.confirm(
            `Excluir o modelo “${template.title}”? Esta ação removerá o modelo deste dispositivo.`
        );

        if (!confirmed) return;

        saveTemplates(loadTemplates().filter((item) => item.id !== selectedId));

        selectedId = null;
        variableValues = {};

        $("#documentTitle").value = "";
        $("#documentEditorCategory").value = "Personalizados";
        $("#documentTemplate").value = "";
        $("#documentPreview").value = "";
        $("#documentVariables").innerHTML = "";

        setEditorVisible(false);
        renderList();
        setFeedback();

        if (typeof showToast === "function") {
            showToast("Modelo excluído.");
        }
    }

    function clearVariables() {
        variableValues = {};
        renderVariables();
        setFeedback("Campos de variáveis limpos.", "success");
    }

    async function copyPreview() {
        const text = $("#documentPreview").value.trim();

        if (!text) {
            setFeedback("Não há texto para copiar.", "error");
            return;
        }

        if (typeof copyText === "function") {
            await copyText(text);
        } else {
            await navigator.clipboard.writeText(text);
        }

        setFeedback("Texto copiado.", "success");
    }

    function exportTxt() {
        const text = $("#documentPreview").value.trim();

        if (!text) {
            setFeedback("Não há texto para exportar.", "error");
            return;
        }

        const blob = new Blob([text], {
            type: "text/plain;charset=utf-8"
        });
        const link = document.createElement("a");

        link.href = URL.createObjectURL(blob);
        link.download = ($("#documentTitle").value || "documento")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-zA-Z0-9]+/g, "-")
            .replace(/^-|-$/g, "")
            .toLowerCase() + ".txt";

        link.click();
        URL.revokeObjectURL(link.href);
    }

    function refreshFromStorage() {
        const templates = allTemplates();
        const selected = templates.find((item) => item.id === selectedId);

        renderList();

        if (selected) {
            $("#documentTitle").value = selected.title;
            $("#documentEditorCategory").value = selected.category;
            $("#documentTemplate").value = selected.content;
            variableValues = {};
            setEditorVisible(true);
            updateEditorHeading();
            renderVariables();
            return;
        }

        selectedId = null;
        setEditorVisible(false);
    }

    window.refreshDocumentTemplates = refreshFromStorage;
    window.DocumentosModule = Object.freeze({
        refresh: refreshFromStorage
    });

    function init() {
        if (!$("#central-documentos")) return;

        $("#documentSearch").addEventListener("input", renderList);
        $("#documentCategory").addEventListener("change", renderList);

        const order = $("#documentOrder");
        if (order) {
            order.value = getSortOrder();
            order.addEventListener("change", () => {
                setSortOrder(order.value);
                renderList();
            });
        }

        $("#documentTemplate").addEventListener("input", () => {
            renderVariables();
            updateEditorHeading();
        });
        $("#documentTitle").addEventListener("input", updateEditorHeading);
        $("#documentNewModel").addEventListener("click", newModel);
        $("#documentClear").addEventListener("click", clearVariables);
        $("#documentSave").addEventListener("click", saveModel);
        $("#documentDelete").addEventListener("click", deleteModel);
        $("#documentCopy").addEventListener("click", copyPreview);
        $("#documentExportTxt").addEventListener("click", exportTxt);

        renderList();
        setEditorVisible(false);
    }

    document.readyState === "loading"
        ? document.addEventListener("DOMContentLoaded", init)
        : init();
})();
