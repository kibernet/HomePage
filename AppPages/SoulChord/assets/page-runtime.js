(function () {
  const languages = [
    ["en", "en", "English", "ltr"],
    ["zh-Hans", "zh-CN", "简体中文", "ltr"],
    ["zh-Hant", "zh-TW", "繁體中文", "ltr"],
    ["ja", "ja", "日本語", "ltr"],
    ["ko", "ko", "한국어", "ltr"],
    ["fr", "fr", "Français", "ltr"],
    ["de", "de", "Deutsch", "ltr"],
    ["es", "es", "Español", "ltr"],
    ["it", "it", "Italiano", "ltr"],
    ["pt-BR", "pt-BR", "Português (Brasil)", "ltr"],
    ["ru", "ru", "Русский", "ltr"],
    ["ar", "ar", "العربية", "rtl"],
    ["hi", "hi", "हिन्दी", "ltr"],
    ["id", "id", "Bahasa Indonesia", "ltr"],
    ["vi", "vi", "Tiếng Việt", "ltr"],
    ["th", "th", "ไทย", "ltr"]
  ].map(([code, htmlLang, label, dir]) => ({ code, htmlLang, label, dir }));

  function getStored(key) {
    try {
      return localStorage.getItem(key);
    } catch (_) {
      return null;
    }
  }

  function setStored(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (_) {
      // Ignore storage restrictions in private browsing or local previews.
    }
  }

  function normalizeLanguage(value, content) {
    if (!value) return null;
    const lower = value.toLowerCase();
    if (content[value]) return value;
    if (lower.startsWith("zh")) {
      return lower.includes("hant") || lower.includes("tw") || lower.includes("hk") ? "zh-Hant" : "zh-Hans";
    }
    if (lower.startsWith("pt")) return content["pt-BR"] ? "pt-BR" : null;
    const base = lower.split(/[-_]/)[0];
    const match = languages.find((language) => language.code.toLowerCase() === base);
    return match && content[match.code] ? match.code : null;
  }

  function pickLanguage(page) {
    const params = new URLSearchParams(window.location.search);
    const fromQuery = normalizeLanguage(params.get("lang"), page.content);
    if (fromQuery) return fromQuery;

    const fromStorage = normalizeLanguage(getStored(page.storageKey), page.content);
    if (fromStorage) return fromStorage;

    const browserLanguages = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || "en"];
    for (const candidate of browserLanguages) {
      const normalized = normalizeLanguage(candidate, page.content);
      if (normalized) return normalized;
    }
    return "en";
  }

  function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value || "";
  }

  function setHTML(id, value) {
    const element = document.getElementById(id);
    if (element) element.innerHTML = value || "";
  }

  function clear(id) {
    const element = document.getElementById(id);
    if (element) element.replaceChildren();
    return element;
  }

  function renderSections(id, sections) {
    const container = clear(id);
    if (!container) return;
    for (const [title, body] of sections || []) {
      const heading = document.createElement("h2");
      heading.textContent = title;
      const paragraph = document.createElement("p");
      paragraph.textContent = body;
      container.append(heading, paragraph);
    }
  }

  function renderList(id, items) {
    const list = clear(id);
    if (!list) return;
    for (const item of items || []) {
      const li = document.createElement("li");
      li.textContent = item;
      list.append(li);
    }
  }

  function renderFaqs(id, faqs) {
    const container = clear(id);
    if (!container) return;
    for (const [question, answer] of faqs || []) {
      const heading = document.createElement("h3");
      heading.textContent = question;
      const paragraph = document.createElement("p");
      paragraph.textContent = answer;
      container.append(heading, paragraph);
    }
  }

  function renderTable(id, rows) {
    const tbody = clear(id);
    if (!tbody) return;
    for (const [category, status] of rows || []) {
      const tr = document.createElement("tr");
      const categoryCell = document.createElement("td");
      categoryCell.textContent = category;
      const statusCell = document.createElement("td");
      statusCell.textContent = status;
      tr.append(categoryCell, statusCell);
      tbody.append(tr);
    }
  }

  function withLanguage(url, lang) {
    const resolved = new URL(url, window.location.href);
    resolved.searchParams.set("lang", lang);
    return resolved.href;
  }

  function updateLinks(lang) {
    document.querySelectorAll("[data-localized-link]").forEach((link) => {
      const base = link.getAttribute("data-base-href") || link.getAttribute("href");
      link.setAttribute("data-base-href", base);
      link.href = withLanguage(base, lang);
    });
  }

  function setupLanguageControl(page, activeCode) {
    const select = document.getElementById("language-select");
    if (!select) return;
    select.replaceChildren();
    for (const language of languages) {
      if (!page.content[language.code]) continue;
      const option = document.createElement("option");
      option.value = language.code;
      option.textContent = language.label;
      select.append(option);
    }
    select.value = activeCode;
    select.addEventListener("change", () => {
      setStored(page.storageKey, select.value);
      render(page, select.value);
    });
  }

  function render(page, code) {
    const language = languages.find((candidate) => candidate.code === code) || languages[0];
    const data = page.content[code] || page.content.en;
    document.documentElement.lang = language.htmlLang;
    document.documentElement.dir = language.dir;
    document.title = data.docTitle || "";
    const description = document.querySelector("meta[name='description']");
    if (description) description.content = data.docDescription || "";
    setText("language-label", data.language || "Language");
    const select = document.getElementById("language-select");
    if (select) {
      select.setAttribute("aria-label", data.chooseLanguage || data.language || "Choose language");
      select.value = code;
    }
    updateLinks(code);
    page.render(data, {
      setText,
      setHTML,
      renderSections,
      renderList,
      renderFaqs,
      renderTable
    }, code);
  }

  const page = window.SoulMetronomePage;
  if (!page || !page.content || !page.render) return;
  const activeCode = pickLanguage(page);
  setStored(page.storageKey, activeCode);
  setupLanguageControl(page, activeCode);
  render(page, activeCode);
})();
