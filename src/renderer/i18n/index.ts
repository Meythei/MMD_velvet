import ja from "./ja.lang";
import en from "./en.lang";

export type UiLocale = "ja" | "en";

type TranslationTable = Record<string, string>;

const STORAGE_KEY = "mmd.ui.locale";
const DEFAULT_LOCALE: UiLocale = "ja";

const translations: Record<UiLocale, TranslationTable> = {
    ja,
    en,
};

let currentLocale: UiLocale = DEFAULT_LOCALE;

const isLocale = (value: string | null | undefined): value is UiLocale => {
    return value === "ja" || value === "en";
};

const replaceParams = (template: string, params?: Record<string, string | number>): string => {
    if (!params) return template;
    let result = template;
    for (const [name, value] of Object.entries(params)) {
        result = result.replaceAll(`{${name}}`, String(value));
    }
    return result;
};

const resolveLocaleFromEnvironment = (): UiLocale => {
    const stored = typeof localStorage !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (isLocale(stored)) return stored;
    const nav = typeof navigator !== "undefined" ? navigator.language.toLowerCase() : "";
    return nav.startsWith("ja") ? "ja" : DEFAULT_LOCALE;
};

const applyKeyToAttribute = (
    root: ParentNode,
    dataAttr: string,
    targetAttr: string,
): void => {
    const selector = `[${dataAttr}]`;
    root.querySelectorAll<HTMLElement>(selector).forEach((element) => {
        const key = element.getAttribute(dataAttr);
        if (!key) return;
        element.setAttribute(targetAttr, t(key));
    });
};

export const t = (key: string, params?: Record<string, string | number>): string => {
    const table = translations[currentLocale];
    const fallback = translations[DEFAULT_LOCALE];
    const template = table[key] ?? fallback[key] ?? key;
    return replaceParams(template, params);
};

export const getLocale = (): UiLocale => currentLocale;

export const applyI18nToDom = (root: ParentNode = document): void => {
    root.querySelectorAll<HTMLElement>("[data-i18n]").forEach((element) => {
        const key = element.dataset.i18n;
        if (!key) return;
        element.textContent = t(key);
    });
    applyKeyToAttribute(root, "data-i18n-title", "title");
    applyKeyToAttribute(root, "data-i18n-aria-label", "aria-label");
    applyKeyToAttribute(root, "data-i18n-placeholder", "placeholder");
};

export const setLocale = (
    locale: UiLocale,
    options?: {
        persist?: boolean;
        applyToDom?: boolean;
        root?: ParentNode;
        emitEvent?: boolean;
    },
): void => {
    if (!isLocale(locale)) return;
    const persist = options?.persist ?? true;
    const applyToDom = options?.applyToDom ?? true;
    const emitEvent = options?.emitEvent ?? true;

    currentLocale = locale;
    if (persist && typeof localStorage !== "undefined") {
        localStorage.setItem(STORAGE_KEY, locale);
    }
    if (applyToDom) {
        applyI18nToDom(options?.root ?? document);
    }
    if (emitEvent && typeof document !== "undefined") {
        document.dispatchEvent(
            new CustomEvent("app:locale-changed", {
                detail: { locale },
            }),
        );
    }
};

export const initializeI18n = (root: ParentNode = document): UiLocale => {
    const initialLocale = resolveLocaleFromEnvironment();
    setLocale(initialLocale, {
        persist: false,
        applyToDom: true,
        root,
        emitEvent: false,
    });
    return initialLocale;
};
