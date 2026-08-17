/* Versão 4.3.0: Central de Documentos com ordenação persistente e biblioteca padrão revisada. */
(() => {
    "use strict";
    const $ = (s) => document.querySelector(s);
    const CUSTOM_KEY = "utilitariosMunicipais:documentTemplates";
    const SORT_KEY = "utilitariosMunicipais:documentSort";
    const BUILT_INS = [
        { id: "despacho-zoneamento", title: "Despacho — atividade proibida pelo zoneamento", category: "Despachos", content: "Prezado(a)(s),\n\nConsiderando o Anexo VII da Lei Complementar nº 952/2025, informamos que a atividade {cnae} é PROIBIDA no endereço {endereco}, conforme o zoneamento {zoneamento}.\n\nDiante do exposto, fica inviabilizado o prosseguimento do pedido referente ao processo {processo}.\n\nAtenciosamente,\n{assinatura}\n{cargo}" }
    ];
    let selectedId = null;
    let variableValues = {};
    const loadCustom = () => { try { return JSON.parse(localStorage.getItem(CUSTOM_KEY) || "[]") } catch { return [] } };
    const allTemplates = () => [...BUILT_INS, ...loadCustom()];
    const escapeHtml = (v) => String(v ?? "").replace(/[&<>\"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    function setFeedback(msg, type = "") { const el = $("#documentFeedback"); if (!el) return; el.textContent = msg || ""; el.className = `feedback-message ${type}`; }
    function getSortOrder() {
        const saved = localStorage.getItem(SORT_KEY);
        return saved === "categoria" ? "categoria" : "titulo";
    }
    function setSortOrder(value) {
        localStorage.setItem(SORT_KEY, value === "categoria" ? "categoria" : "titulo");
    }
    function filtered() {
        const q = ($("#documentSearch")?.value || "").toLocaleLowerCase("pt-BR");
        const c = $("#documentCategory")?.value || "todos";
        const order = $("#documentOrder")?.value || getSortOrder();
        const collator = new Intl.Collator("pt-BR", { sensitivity: "base", numeric: true });
        return allTemplates()
            .filter(x => (c === "todos" || x.category === c) && (!q || `${x.title} ${x.category} ${x.content}`.toLocaleLowerCase("pt-BR").includes(q)))
            .sort((a, b) => {
                if (order === "categoria") {
                    const categoryCompare = collator.compare(a.category, b.category);
                    return categoryCompare || collator.compare(a.title, b.title);
                }
                return collator.compare(a.title, b.title) || collator.compare(a.category, b.category);
            });
    }
    function renderList() { const host = $("#documentTemplateList"); if (!host) return; const items = filtered(); host.innerHTML = items.length ? items.map(x => `<button type="button" class="document-template-item ${x.id === selectedId ? "active" : ""}" data-document-id="${escapeHtml(x.id)}"><span><strong>${escapeHtml(x.title)}</strong><small>${escapeHtml(x.category)}</small></span><span aria-hidden="true">›</span></button>`).join("") : '<p class="empty-state">Nenhum modelo encontrado.</p>'; host.querySelectorAll("[data-document-id]").forEach(b => b.addEventListener("click", () => selectTemplate(b.dataset.documentId))); }
    function selectTemplate(id) { const x = allTemplates().find(t => t.id === id); if (!x) return; selectedId = id; variableValues = {}; $("#documentTitle").value = x.title; $("#documentEditorCategory").value = x.category; $("#documentTemplate").value = x.content; renderVariables(); renderList(); }
    function variables() { return [...new Set((($("#documentTemplate")?.value || "").match(/\{[^{}]+\}/g) || []).map(v => v.slice(1, -1).trim()).filter(Boolean))]; }
    function renderVariables() { const host = $("#documentVariables"); if (!host) return; const vars = variables(); host.innerHTML = vars.length ? vars.map(v => `<label>${escapeHtml(v)}<input data-document-variable="${escapeHtml(v)}" value="${escapeHtml(variableValues[v] || defaultValue(v))}" placeholder="${escapeHtml(v)}"></label>`).join("") : '<p class="empty-state">Nenhuma variável encontrada.</p>'; host.querySelectorAll("[data-document-variable]").forEach(i => i.addEventListener("input", () => { variableValues[i.dataset.documentVariable] = i.value; renderPreview(); })); vars.forEach(v => { const input = host.querySelector(`[data-document-variable="${CSS.escape(v)}"]`); if (input) variableValues[v] = input.value; }); renderPreview(); }
    function defaultValue(v) { if (v.toLowerCase() === "data") return new Intl.DateTimeFormat("pt-BR").format(new Date()); return ""; }
    function renderPreview() { let text = $("#documentTemplate")?.value || ""; for (const v of variables()) text = text.split(`{${v}}`).join(variableValues[v] || `{${v}}`); $("#documentPreview").value = text; }
    function clearEditor() { selectedId = null; variableValues = {}; $("#documentTitle").value = ""; $("#documentEditorCategory").value = "Personalizados"; $("#documentTemplate").value = ""; renderVariables(); renderList(); setFeedback(); }
    function saveModel() { const title = $("#documentTitle").value.trim(), content = $("#documentTemplate").value.trim(), category = $("#documentEditorCategory").value; if (!title || !content) { setFeedback("Informe o título e o conteúdo do modelo.", "error"); return; } let list = loadCustom(); let id = selectedId && selectedId.startsWith("custom-") ? selectedId : `custom-${Date.now()}`; const item = { id, title, category, content }; const idx = list.findIndex(x => x.id === id); idx >= 0 ? list.splice(idx, 1, item) : list.unshift(item); localStorage.setItem(CUSTOM_KEY, JSON.stringify(list)); selectedId = id; renderList(); setFeedback("Modelo salvo.", "success"); if (typeof showToast === "function") showToast("Modelo salvo."); }
    function deleteModel() { if (!selectedId?.startsWith("custom-")) { setFeedback("Somente modelos personalizados podem ser excluídos.", "error"); return; } localStorage.setItem(CUSTOM_KEY, JSON.stringify(loadCustom().filter(x => x.id !== selectedId))); clearEditor(); setFeedback("Modelo excluído.", "success"); }
    async function copyPreview() { const text = $("#documentPreview").value.trim(); if (!text) { setFeedback("Não há texto para copiar.", "error"); return; } if (typeof copyText === "function") await copyText(text); else await navigator.clipboard.writeText(text); setFeedback("Texto copiado.", "success"); }
    function exportTxt() { const text = $("#documentPreview").value.trim(); if (!text) { setFeedback("Não há texto para exportar.", "error"); return; } const blob = new Blob([text], { type: "text/plain;charset=utf-8" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = ($("#documentTitle").value || "documento").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase() + ".txt"; a.click(); URL.revokeObjectURL(a.href); }
    function refreshFromStorage() {
        const templates = allTemplates();
        const selected = templates.find((item) => item.id === selectedId);
        renderList();
        if (selected) {
            $("#documentTitle").value = selected.title;
            $("#documentEditorCategory").value = selected.category;
            $("#documentTemplate").value = selected.content;
            variableValues = {};
            renderVariables();
        } else if (BUILT_INS.length) {
            selectTemplate(BUILT_INS[0].id);
        }
    }
    window.refreshDocumentTemplates = refreshFromStorage;
    window.DocumentosModule = Object.freeze({ refresh: refreshFromStorage });
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
        $("#documentTemplate").addEventListener("input", renderVariables);
        $("#documentTitle").addEventListener("input", renderPreview);
        $("#documentNewModel").addEventListener("click", clearEditor);
        $("#documentClear").addEventListener("click", () => { variableValues = {}; renderVariables(); setFeedback("Campos de variáveis limpos.", "success"); });
        $("#documentSave").addEventListener("click", saveModel);
        $("#documentDelete").addEventListener("click", deleteModel);
        $("#documentCopy").addEventListener("click", copyPreview);
        $("#documentExportTxt").addEventListener("click", exportTxt);
        renderList();
        if (BUILT_INS.length) selectTemplate(BUILT_INS[0].id);
    }
    document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", init) : init();
})();