/* Núcleo: armazenamento, formatação, área de transferência e utilidades. */

const $ = (selector) => document.querySelector(selector);

const STORAGE_PREFIX = APP_CONFIG.storagePrefix;
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
const FILE_REMOVE_POINTS_KEY = `${STORAGE_PREFIX}fileRemovePoints`;

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
