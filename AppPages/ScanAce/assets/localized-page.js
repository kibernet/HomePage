(function () {
  const languages = [
    { code: "en", htmlLang: "en", label: "English", dir: "ltr" },
    { code: "zh-Hans", htmlLang: "zh-CN", label: "简体中文", dir: "ltr" },
    { code: "zh-Hant", htmlLang: "zh-TW", label: "繁體中文", dir: "ltr" },
    { code: "ja", htmlLang: "ja", label: "日本語", dir: "ltr" },
    { code: "ko", htmlLang: "ko", label: "한국어", dir: "ltr" },
    { code: "fr", htmlLang: "fr", label: "Français", dir: "ltr" },
    { code: "de", htmlLang: "de", label: "Deutsch", dir: "ltr" },
    { code: "es", htmlLang: "es", label: "Español", dir: "ltr" },
    { code: "it", htmlLang: "it", label: "Italiano", dir: "ltr" },
    { code: "pt-BR", htmlLang: "pt-BR", label: "Português (Brasil)", dir: "ltr" },
    { code: "ru", htmlLang: "ru", label: "Русский", dir: "ltr" },
    { code: "ar", htmlLang: "ar", label: "العربية", dir: "rtl" },
    { code: "hi", htmlLang: "hi", label: "हिन्दी", dir: "ltr" },
    { code: "id", htmlLang: "id", label: "Bahasa Indonesia", dir: "ltr" },
    { code: "vi", htmlLang: "vi", label: "Tiếng Việt", dir: "ltr" },
    { code: "th", htmlLang: "th", label: "ไทย", dir: "ltr" }
  ];

  const uiLabels = {
    en: { language: "Language", chooseLanguage: "Choose language", privacy: "Privacy", support: "Support", age: "Age Rating" },
    "zh-Hans": { language: "语言", chooseLanguage: "选择语言", privacy: "隐私", support: "支持", age: "适龄" },
    "zh-Hant": { language: "語言", chooseLanguage: "選擇語言", privacy: "隱私", support: "支援", age: "適齡" },
    ja: { language: "言語", chooseLanguage: "言語を選択", privacy: "プライバシー", support: "サポート", age: "年齢制限" },
    ko: { language: "언어", chooseLanguage: "언어 선택", privacy: "개인정보", support: "지원", age: "연령 등급" },
    fr: { language: "Langue", chooseLanguage: "Choisir la langue", privacy: "Confidentialité", support: "Assistance", age: "Âge" },
    de: { language: "Sprache", chooseLanguage: "Sprache auswählen", privacy: "Datenschutz", support: "Support", age: "Alter" },
    es: { language: "Idioma", chooseLanguage: "Elegir idioma", privacy: "Privacidad", support: "Soporte", age: "Edad" },
    it: { language: "Lingua", chooseLanguage: "Scegli lingua", privacy: "Privacy", support: "Supporto", age: "Età" },
    "pt-BR": { language: "Idioma", chooseLanguage: "Escolher idioma", privacy: "Privacidade", support: "Suporte", age: "Idade" },
    ru: { language: "Язык", chooseLanguage: "Выбрать язык", privacy: "Конфиденциальность", support: "Поддержка", age: "Возраст" },
    ar: { language: "اللغة", chooseLanguage: "اختر اللغة", privacy: "الخصوصية", support: "الدعم", age: "التصنيف العمري" },
    hi: { language: "भाषा", chooseLanguage: "भाषा चुनें", privacy: "गोपनीयता", support: "समर्थन", age: "आयु रेटिंग" },
    id: { language: "Bahasa", chooseLanguage: "Pilih bahasa", privacy: "Privasi", support: "Dukungan", age: "Usia" },
    vi: { language: "Ngôn ngữ", chooseLanguage: "Chọn ngôn ngữ", privacy: "Quyền riêng tư", support: "Hỗ trợ", age: "Độ tuổi" },
    th: { language: "ภาษา", chooseLanguage: "เลือกภาษา", privacy: "ความเป็นส่วนตัว", support: "การสนับสนุน", age: "อายุ" }
  };

  const data = window.SCANACE_PAGE;
  const storageKey = "scanace-page-language";
  const selector = document.getElementById("language-select");
  const label = document.getElementById("language-label");
  const content = document.getElementById("localized-content");
  const metaDescription = document.querySelector('meta[name="description"]');
  const navPrivacy = document.querySelector('[data-nav="privacy"]');
  const navSupport = document.querySelector('[data-nav="support"]');
  const navAge = document.querySelector('[data-nav="age"]');

  if (!data || !selector || !content) return;

  function normalizeLanguage(value) {
    if (!value) return "";
    const lowered = value.toLowerCase();
    if (lowered === "zh-cn" || lowered === "zh-hans" || lowered.startsWith("zh-cn")) return "zh-Hans";
    if (lowered === "zh-tw" || lowered === "zh-hant" || lowered.startsWith("zh-tw") || lowered.startsWith("zh-hk")) return "zh-Hant";
    if (lowered.startsWith("pt")) return "pt-BR";
    const exact = languages.find((language) => language.code.toLowerCase() === lowered);
    if (exact) return exact.code;
    const prefix = languages.find((language) => lowered.startsWith(language.code.toLowerCase().split("-")[0]));
    return prefix ? prefix.code : "";
  }

  function requestedLanguage() {
    const hash = normalizeLanguage(window.location.hash.replace(/^#/, ""));
    if (hash) return hash;
    try {
      const stored = normalizeLanguage(localStorage.getItem(storageKey));
      if (stored) return stored;
    } catch (_) {}
    for (const language of navigator.languages || [navigator.language]) {
      const normalized = normalizeLanguage(language);
      if (normalized) return normalized;
    }
    return data.defaultLanguage || "en";
  }

  function appendText(tagName, className, text, parent) {
    if (!text) return null;
    const element = document.createElement(tagName);
    if (className) element.className = className;
    element.textContent = text;
    parent.appendChild(element);
    return element;
  }

  function appendList(items, parent) {
    if (!items || !items.length) return;
    const list = document.createElement("ul");
    items.forEach((item) => appendText("li", "", item, list));
    parent.appendChild(list);
  }

  function appendCards(cards, parent) {
    if (!cards || !cards.length) return;
    const grid = document.createElement("div");
    grid.className = "cards";
    cards.forEach((card) => {
      const item = document.createElement("div");
      item.className = "card";
      appendText("strong", "", card.title, item);
      if (card.href) {
        const link = document.createElement("a");
        link.href = card.href;
        link.textContent = card.value;
        item.appendChild(link);
      } else {
        appendText("span", "", card.value, item);
      }
      grid.appendChild(item);
    });
    parent.appendChild(grid);
  }

  function appendTable(table, parent) {
    if (!table || !table.rows || !table.rows.length) return;
    const element = document.createElement("table");
    const header = document.createElement("tr");
    table.headers.forEach((cell) => appendText("th", "", cell, header));
    element.appendChild(header);
    table.rows.forEach((row) => {
      const tr = document.createElement("tr");
      row.forEach((cell) => appendText("td", "", cell, tr));
      element.appendChild(tr);
    });
    parent.appendChild(element);
  }

  function appendLinks(links, parent) {
    if (!links || !links.length) return;
    const row = document.createElement("div");
    row.className = "link-row";
    links.forEach((item) => {
      const link = document.createElement("a");
      link.className = "pill";
      link.href = item.href;
      link.textContent = item.label;
      row.appendChild(link);
    });
    parent.appendChild(row);
  }

  function localizedNavUrl(path, languageCode) {
    return `${path}${languageCode === "en" ? "" : `#${languageCode}`}`;
  }

  function render(languageCode) {
    const language = languages.find((item) => item.code === languageCode) || languages[0];
    const page = data.content[language.code] || data.content.en;
    const labels = uiLabels[language.code] || uiLabels.en;

    document.documentElement.lang = language.htmlLang;
    document.documentElement.dir = language.dir;
    document.title = page.metaTitle || data.fallbackTitle;
    if (metaDescription) metaDescription.setAttribute("content", page.description || data.fallbackDescription || "");
    if (label) label.textContent = labels.language;
    selector.setAttribute("aria-label", labels.chooseLanguage);
    selector.value = language.code;
    if (navPrivacy) navPrivacy.textContent = labels.privacy;
    if (navSupport) navSupport.textContent = labels.support;
    if (navAge) navAge.textContent = labels.age;
    if (navPrivacy) navPrivacy.href = localizedNavUrl("../Privacy/index.html", language.code);
    if (navSupport) navSupport.href = localizedNavUrl("../Support/index.html", language.code);
    if (navAge) navAge.href = localizedNavUrl("../AgeRating/index.html", language.code);

    content.replaceChildren();
    appendText("p", "eyebrow", page.eyebrow, content);
    appendText("h1", "", page.title, content);
    appendText("p", "updated", page.updated, content);
    appendText("p", "intro", page.intro, content);

    if (page.rating) appendText("div", "rating", page.rating, content);
    if (page.notice) {
      const notice = document.createElement("div");
      notice.className = "notice";
      appendText("p", "", page.notice, notice);
      content.appendChild(notice);
    }
    appendCards(page.cards, content);

    (page.sections || []).forEach((section) => {
      const block = document.createElement("section");
      block.className = "section";
      appendText("h2", "", section.heading, block);
      (section.paragraphs || []).forEach((paragraph) => appendText("p", "", paragraph, block));
      appendList(section.bullets, block);
      appendTable(section.table, block);
      (section.faq || []).forEach((item) => {
        appendText("h3", "", item.question, block);
        appendText("p", "", item.answer, block);
      });
      content.appendChild(block);
    });

    appendLinks(page.links, content);

    try {
      localStorage.setItem(storageKey, language.code);
    } catch (_) {}
  }

  languages.forEach((language) => {
    const option = document.createElement("option");
    option.value = language.code;
    option.textContent = language.label;
    selector.appendChild(option);
  });

  selector.addEventListener("change", () => {
    const languageCode = normalizeLanguage(selector.value) || "en";
    if (languageCode === "en") {
      history.replaceState(null, "", window.location.pathname);
    } else {
      history.replaceState(null, "", `#${languageCode}`);
    }
    render(languageCode);
  });

  window.addEventListener("hashchange", () => render(requestedLanguage()));
  render(requestedLanguage());
})();
