/* ==================================================
   I18N – STEP 1: TRANSLATIONS (SINGLE SOURCE)
================================================== */

const translations = {
    de: {
        "start.title": "DU BENÖTIGST HILFE BEI ARBEITSPROZESSEN?",
        "start.subtitle": "WÄHLE EIN TOOL UND STARTE DIREKT.",
        "tool.summary": "Zusammenfassen",
        "tool.email": "E-Mail Antwort",
        "summary.title": "Text zusammenfassen",
        "email.title": "E-Mail Antwort erstellen"
    },
    en: {
        "start.title": "DO YOU NEED HELP WITH WORK PROCESSES?",
        "start.subtitle": "CHOOSE A TOOL AND GET STARTED.",
        "tool.summary": "Summarize",
        "tool.email": "Email Reply",
        "summary.title": "Summarize text",
        "email.title": "Create email reply"
    },
    fr: {
        "start.title": "AVEZ-VOUS BESOIN D’AIDE POUR VOS PROCESSUS DE TRAVAIL ?",
        "start.subtitle": "CHOISISSEZ UN OUTIL ET COMMENCEZ.",
        "tool.summary": "Résumé",
        "tool.email": "Réponse e-mail",
        "summary.title": "Résumer un texte",
        "email.title": "Créer une réponse e-mail"
    }
};

/* ==================================================
   I18N – STEP 2: APPLY TRANSLATIONS
================================================== */

let currentLang = "de";

function applyTranslations() {
    document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.dataset.i18n;
        if (translations[currentLang]?.[key]) {
            el.textContent = translations[currentLang][key];
        }
    });
}

/* ==================================================
   MAIN APP LOGIC (UNTOUCHED)
================================================== */

document.addEventListener("DOMContentLoaded", () => {

    /* ---------- APPLY I18N ON LOAD ---------- */
    applyTranslations();

    /* ---------- DARK MODE ---------- */

    const themeToggle = document.getElementById("themeToggle");

    function updateThemeButton() {
        themeToggle.textContent =
            document.body.classList.contains("dark")
                ? "Dark Mode: ON"
                : "Dark Mode: OFF";
    }

    themeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark");
        updateThemeButton();
    });

    updateThemeButton();

    /* ---------- NAVIGATION ---------- */

    const featureCards = document.querySelectorAll(".feature-card");
    const toolSections = document.querySelectorAll(".tool-section");
    const backButtons = document.querySelectorAll(".back-to-start");

    function openTool(id) {
        document.body.classList.add("tool-active");
        toolSections.forEach(s =>
            s.classList.toggle("active", s.id === id)
        );
    }

    function goToStart() {
        document.body.classList.add("returning-to-start");

        setTimeout(() => {
            document.body.classList.remove("tool-active");
            document.body.classList.remove("returning-to-start");

            toolSections.forEach(s => s.classList.remove("active"));
        }, 250);
    }

    featureCards.forEach(card =>
        card.addEventListener("click", () => openTool(card.dataset.tool))
    );

    backButtons.forEach(btn =>
        btn.addEventListener("click", goToStart)
    );

    /* ---------- SUMMARY ---------- */

    document.getElementById("summarizeBtn").addEventListener("click", async () => {
        const input = document.getElementById("inputText").value.trim();
        const focus = document.getElementById("summaryFocus").value.trim();

        if (!input) return;

        const output = document.getElementById("output");
        output.textContent = "Zusammenfassung wird erstellt …";

        try {
            const res = await fetch("https://officio-ai-lybv.onrender.com/summarize", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: input, focus })
            });

            const data = await res.json();
            output.textContent = data.result ?? "Keine Antwort erhalten.";
        } catch (err) {
            output.textContent = "Fehler bei der Verarbeitung.";
            console.error(err);
        }
    });

    /* ---------- EMAIL ---------- */

    document.getElementById("emailGenerateBtn").addEventListener("click", async () => {
        const output = document.getElementById("emailOutput");
        output.textContent = "Antwort wird erstellt…";

        try {
            const res = await fetch("https://officio-ai-lybv.onrender.com/email-reply", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    original_email: document.getElementById("emailOriginal").value,
                    keywords: document.getElementById("emailKeywords").value,
                    style: document.getElementById("emailStyle").value
                })
            });

            const data = await res.json();
            output.textContent = data.result ?? "Keine Antwort erhalten.";
        } catch (err) {
            output.textContent = "Fehler bei der Verarbeitung.";
            console.error(err);
        }
    });

    /* ---------- HERO CANVAS ---------- */

    const canvas = document.getElementById("heroCanvas");
    const header = document.querySelector(".app-header");
    const ctx = canvas.getContext("2d");

    function resize() {
        canvas.width = header.offsetWidth;
        canvas.height = header.offsetHeight;
    }

    resize();
    window.addEventListener("resize", resize);

    const particles = Array.from({ length: 80 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4
    }));

    function colors() {
        return document.body.classList.contains("dark")
            ? { p: "rgba(180,210,255,0.95)", l: "rgba(180,210,255,0.35)" }
            : { p: "rgba(230,235,255,0.95)", l: "rgba(230,235,255,0.35)" };
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const c = colors();

        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

            ctx.beginPath();
            ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2);
            ctx.fillStyle = c.p;
            ctx.fill();
        });

        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                if (Math.hypot(
                    particles[i].x - particles[j].x,
                    particles[i].y - particles[j].y
                ) < 120) {
                    ctx.strokeStyle = c.l;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }

        requestAnimationFrame(animate);
    }

    animate();
});

/* ---------- DARK MODE DEFAULT ---------- */

document.addEventListener("DOMContentLoaded", () => {
    document.body.classList.add("dark");

    const toggle = document.getElementById("themeToggle");
    if (toggle) toggle.textContent = "Dark Mode: ON";
});
/* ---------- LANGUAGE SWITCHER ---------- */

const langButtons = document.querySelectorAll(".lang-btn");

langButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        currentLang = btn.dataset.lang;
        localStorage.setItem("officio-lang", currentLang);

        langButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        applyTranslations();
    });
});

/* Restore language on load */
const savedLang = localStorage.getItem("officio-lang");
if (savedLang && translations[savedLang]) {
    currentLang = savedLang;
    applyTranslations();

    langButtons.forEach(b =>
        b.classList.toggle("active", b.dataset.lang === savedLang)
    );
}
/* ==================================================
   LANGUAGE SYSTEM (append-only)
================================================== */

document.addEventListener("DOMContentLoaded", () => {
    const languageSelect = document.getElementById("languageSelect");

    if (!languageSelect) return;

    const translations = {
        de: {
            "header.subtitle": "DEIN BESTER FREUND, WENN ES UM VEREINFACHUNG VON ARBEITSPROZESSEN GEHT",
            "hero.title": "DU BENÖTIGST HILFE BEI ARBEITSPROZESSEN?",
            "hero.subtitle": "WÄHLE EIN TOOL UND STARTE DIREKT. KEINE ANMELDUNG NOTWENDIG, DIREKT STARTEN!",
            "info.title": "Wofür Officio AI entwickelt wurde",
            "info.text": "Officio AI wurde entwickelt, um tägliche Büroarbeit schneller, klarer und effizienter zu machen.",
            "info.list.summary": "📝 Klare Textzusammenfassungen",
            "info.list.email": "✉️ Professionelle E-Mail-Antworten",
            "info.list.effort": "⚡ Weniger manueller Aufwand",
            "info.list.assistant": "🧠 Digitale Büroassistenz",
            "info.focus": "Fokus: Zeitersparnis & Klarheit",
            "tool.summary": "📝 Dateien, Dokumente, E-Mails, etc. zusammenfassen",
            "tool.summary.desc": "Fasst Dateien so zusammen, wie du es dir wünschst.",
            "tool.email": "✉️ E-Mail Antwort",
            "tool.email.desc": "Automatisch passende Antworten erstellen.",
            "summary.title": "Text zusammenfassen",
            "summary.button": "Zusammenfassen",
            "summary.loading": "Zusammenfassung wird erstellt…",
            "email.title": "E-Mail Antwort erstellen",
            "email.button": "Antwort generieren",
            "nav.back": "← Zur Startseite"
        },

        en: {
            "header.subtitle": "YOUR BEST FRIEND FOR SIMPLIFYING WORK PROCESSES",
            "hero.title": "NEED HELP WITH WORK PROCESSES?",
            "hero.subtitle": "CHOOSE A TOOL AND GET STARTED. NO SIGN-UP REQUIRED.",
            "info.title": "What Officio AI was built for",
            "info.text": "Officio AI helps you complete daily office work faster and more efficiently.",
            "info.list.summary": "📝 Clear text summaries",
            "info.list.email": "✉️ Professional email replies",
            "info.list.effort": "⚡ Less manual effort",
            "info.list.assistant": "🧠 Digital office assistant",
            "info.focus": "Focus: Time saving & clarity",
            "tool.summary": "📝 Summarize",
            "tool.summary.desc": "Summarizes long texts the way you want.",
            "tool.email": "✉️ Email reply",
            "tool.email.desc": "Automatically generate tailored email responses.",
            "summary.title": "Summarize text",
            "summary.button": "Summarize",
            "summary.loading": "Creating summary…",
            "email.title": "Create email reply",
            "email.button": "Generate reply",
            "nav.back": "← Back to start"
        },

        fr: {
            "header.subtitle": "VOTRE MEILLEUR ALLIÉ POUR SIMPLIFIER LE TRAVAIL",
            "hero.title": "BESOIN D’AIDE POUR VOS PROCESSUS DE TRAVAIL ?",
            "hero.subtitle": "CHOISISSEZ UN OUTIL ET COMMENCEZ IMMÉDIATEMENT.",
            "info.title": "Pourquoi Officio AI a été créé",
            "info.text": "Officio AI vous aide à accomplir vos tâches de bureau plus rapidement.",
            "info.list.summary": "📝 Résumés clairs",
            "info.list.email": "✉️ Réponses e-mail professionnelles",
            "info.list.effort": "⚡ Moins de travail manuel",
            "info.list.assistant": "🧠 Assistant de bureau numérique",
            "info.focus": "Objectif : gain de temps et clarté",
            "tool.summary": "📝 Résumer",
            "tool.summary.desc": "Résume les textes comme vous le souhaitez.",
            "tool.email": "✉️ Réponse e-mail",
            "tool.email.desc": "Générer automatiquement des réponses adaptées.",
            "summary.title": "Résumer un texte",
            "summary.button": "Résumer",
            "summary.loading": "Création du résumé…",
            "email.title": "Créer une réponse e-mail",
            "email.button": "Générer la réponse",
            "nav.back": "← Retour à l’accueil"
        }
    };

    function applyLanguage(lang) {
        document.querySelectorAll("[data-i18n]").forEach(el => {
            const key = el.getAttribute("data-i18n");
            if (translations[lang]?.[key]) {
                el.textContent = translations[lang][key];
            }
        });

        document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
            const key = el.getAttribute("data-i18n-placeholder");
            if (translations[lang]?.[key]) {
                el.placeholder = translations[lang][key];
            }
        });
    }

    applyLanguage(languageSelect.value);

    languageSelect.addEventListener("change", () => {
        applyLanguage(languageSelect.value);
    });
});
/* ---------- TOOL LANGUAGE TRANSLATIONS ---------- */

(function () {
    const translations = {
        de: {
            summaryTitle: "Texte oder Dateien zusammenfassen",
            summaryBtn: "Zusammenfassen",
            summaryPlaceholder: "",
            summaryFocus: "Stichwörter / Vorgaben (z. B. kurz, Bulletpoints, max. 3 Sätze, Management)",

            emailTitle: "E-Mail Antwort erstellen",
            emailOriginal: "Original-E-Mail",
            emailKeywords: "Stichworte",
            emailStyle: "Stil",
            emailBtn: "Antwort generieren",

            back: "← Zur Startseite"
        },
        en: {
            summaryTitle: "Summarize text",
            summaryBtn: "Summarize",
            summaryPlaceholder: "Paste your text here...",
            summaryFocus: "Keywords / instructions (e.g. short, bullet points, max. 3 sentences)",

            emailTitle: "Create email reply",
            emailOriginal: "Original email",
            emailKeywords: "Keywords",
            emailStyle: "Style",
            emailBtn: "Generate reply",

            back: "← Back to start"
        },
        fr: {
            summaryTitle: "Résumer un texte",
            summaryBtn: "Résumer",
            summaryPlaceholder: "Collez votre texte ici...",
            summaryFocus: "Mots-clés / consignes (ex. court, points, max. 3 phrases)",

            emailTitle: "Créer une réponse e-mail",
            emailOriginal: "E-mail original",
            emailKeywords: "Mots-clés",
            emailStyle: "Style",
            emailBtn: "Générer la réponse",

            back: "← Retour à l’accueil"
        }
    };

    function applyToolLanguage(lang) {
        const t = translations[lang];
        if (!t) return;

        // SUMMARY TOOL
        const summarySection = document.getElementById("tool-summary");
        if (summarySection) {
            summarySection.querySelector("h2").textContent = t.summaryTitle;
            document.getElementById("summarizeBtn").textContent = t.summaryBtn;
            document.getElementById("inputText").placeholder = t.summaryPlaceholder;
            document.getElementById("summaryFocus").placeholder = t.summaryFocus;
        }

        // EMAIL TOOL
        const emailSection = document.getElementById("tool-email");
        if (emailSection) {
            emailSection.querySelector("h2").textContent = t.emailTitle;

            const labels = emailSection.querySelectorAll("label");
            if (labels.length >= 3) {
                labels[0].textContent = t.emailOriginal;
                labels[1].textContent = t.emailKeywords;
                labels[2].textContent = t.emailStyle;
            }

            document.getElementById("emailGenerateBtn").textContent = t.emailBtn;
        }

        // BACK BUTTONS
        document.querySelectorAll(".back-to-start").forEach(btn => {
            btn.textContent = t.back;
        });
    }

    // Reagiere auf Sprachwechsel
    const languageSelect = document.getElementById("languageSelect");
    if (languageSelect) {
        applyToolLanguage(languageSelect.value);

        languageSelect.addEventListener("change", () => {
            const lang = languageSelect.value;
            localStorage.setItem("language", lang);
            applyToolLanguage(lang);
        });
    }

    // Sprache beim Laden wiederherstellen
    const savedLang = localStorage.getItem("language");
    if (savedLang && languageSelect) {
        languageSelect.value = savedLang;
        applyToolLanguage(savedLang);
    }
})();
/* =========================
   CLEAN DRAG & DROP (FINAL)
========================= */

document.addEventListener("DOMContentLoaded", () => {
    const dropzone = document.getElementById("summaryDropzone");
    const textarea = document.getElementById("inputText");
    const fileInput = document.getElementById("summaryFile");
    const fileStatus = document.getElementById("fileStatus");

    if (!dropzone || !fileInput) return;

    // Browser-Default blockieren
    ["dragenter", "dragover", "dragleave", "drop"].forEach(evt => {
        dropzone.addEventListener(evt, e => e.preventDefault());
    });

    // Drag visuell
    dropzone.addEventListener("dragover", () => {
        dropzone.classList.add("dragover");
    });

    dropzone.addEventListener("dragleave", () => {
        dropzone.classList.remove("dragover");
    });

    // DROP
    dropzone.addEventListener("drop", (e) => {
        dropzone.classList.remove("dragover");

        const file = e.dataTransfer.files[0];
        if (!file) return;

        fileInput.files = e.dataTransfer.files;

        textarea.value = "";
        textarea.disabled = true;

        fileStatus.textContent = `📄 Datei geladen: ${file.name}`;
        fileStatus.classList.remove("hidden");
    });



    fileInput.addEventListener("change", () => {
        if (!fileInput.files.length) return;

        const file = fileInput.files[0];
        textarea.value = "";
        textarea.disabled = true;

        fileStatus.textContent = `📄 Datei geladen: ${file.name}`;
        fileStatus.classList.remove("hidden");
    });

    // Tippen → Datei verwerfen
    textarea.addEventListener("input", () => {
        if (textarea.value.trim().length > 0) {
            fileInput.value = "";
            textarea.disabled = false;
            fileStatus.classList.add("hidden");
        }
    });
});
/* ==================================================
   CLEAN SUMMARY INPUT LOGIC (FINAL)
================================================== */

(() => {
    const textInput = document.getElementById("inputText");
    const focusInput = document.getElementById("summaryFocus");
    const fileInput = document.getElementById("summaryFile");
    const pickBtn = document.getElementById("pickFileBtn");
    const status = document.getElementById("fileStatus");

    if (!textInput || !fileInput || !pickBtn) return;

    /* ---------- 1️⃣ KEINE LEERZEILEN ---------- */

    [textInput, focusInput].forEach(el => {
        if (!el) return;

        // beim Laden
        el.value = el.value.trim();

        // beim Tippen
        el.addEventListener("input", () => {
            if (el.value.startsWith("\n")) {
                el.value = el.value.replace(/^\n+/, "");
            }
        });

        // beim Paste
        el.addEventListener("paste", () => {
            setTimeout(() => {
                el.value = el.value.trimStart();
            }, 0);
        });
    });



    /* ---------- 3️⃣ DATEI SETZEN ---------- */

    fileInput.addEventListener("change", () => {
        if (!fileInput.files.length) return;

        const file = fileInput.files[0];

        // Text deaktivieren
        textInput.value = "";
        textInput.disabled = true;

        if (status) {
            status.textContent = `📄 Datei geladen: ${file.name}`;
            status.classList.remove("hidden");
        }
    });

    /* ---------- 4️⃣ TEXT ÜBERSCHREIBT DATEI ---------- */

    textInput.addEventListener("input", () => {
        if (!textInput.disabled) return;

        fileInput.value = "";
        textInput.disabled = false;

        if (status) {
            status.textContent = "";
            status.classList.add("hidden");
        }
    });

})();
/* ==================================================
   HARD FIX: NO FILE PICKER ON TEXTAREA CLICK
================================================== */

(() => {
    const textInput = document.getElementById("inputText");
    const fileInput = document.getElementById("summaryFile");
    const pickBtn = document.getElementById("pickFileBtn");

    if (!textInput || !fileInput || !pickBtn) return;

    // ❌ Textfeld DARF NIE Explorer öffnen
    textInput.addEventListener("click", e => {
        e.stopPropagation();
    });

    textInput.addEventListener("mousedown", e => {
        e.stopPropagation();
    });

})();
/* ==================================================
   SINGLE SOURCE FILE PICKER (FINAL)
================================================== */

(() => {
    const pickBtn = document.getElementById("pickFileBtn");
    const fileInput = document.getElementById("summaryFile");
    const textInput = document.getElementById("inputText");
    const fileStatus = document.getElementById("fileStatus");
    const dropzone = document.getElementById("summaryDropzone");

    if (!pickBtn || !fileInput) return;

    /* ❌ DROPZONE DARF KEINEN EXPLORER ÖFFNEN */
    if (dropzone) {
        ["click", "mousedown", "mouseup"].forEach(evt => {
            dropzone.addEventListener(evt, e => e.stopPropagation(), true);
        });
    }

    /* ❌ TEXTAREA DARF KEINEN EXPLORER ÖFFNEN */
    if (textInput) {
        ["click", "mousedown"].forEach(evt => {
            textInput.addEventListener(evt, e => e.stopPropagation(), true);
        });
    }

    /* ✅ EINZIGER EXPLORER-TRIGGER */
    pickBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        fileInput.value = "";
        fileInput.click();
    };

    /* 📄 DATEI STATUS */
    fileInput.onchange = () => {
        if (!fileInput.files.length) return;

        const file = fileInput.files[0];

        if (fileStatus) {
            fileStatus.textContent = `📄 Datei geladen: ${file.name}`;
            fileStatus.classList.remove("hidden");
        }

        if (textInput) {
            textInput.value = "";
            textInput.disabled = true;
        }
    };
})();
/* ==================================================
   FILE REMOVE + STATE RESET (FINAL)
================================================== */

(() => {
    const fileInput = document.getElementById("summaryFile");
    const textInput = document.getElementById("inputText");
    const fileStatus = document.getElementById("fileStatus");
    const fileName = document.getElementById("fileName");
    const removeBtn = document.getElementById("removeFileBtn");

    if (!fileInput || !removeBtn) return;

    /* 📄 Datei gesetzt */
    fileInput.addEventListener("change", () => {
        if (!fileInput.files.length) return;

        const file = fileInput.files[0];

        fileName.textContent = `📄 ${file.name}`;
        fileStatus.classList.remove("hidden");

        textInput.value = "";
        textInput.disabled = true;
    });

    /* ❌ Datei entfernen */
    removeBtn.addEventListener("click", () => {
        fileInput.value = "";
        fileStatus.classList.add("hidden");

        textInput.disabled = false;
        textInput.focus();
    });
})();
/* ================================
   CLEAN SUMMARY FILE LOGIC (FINAL)
================================ */

(() => {
    const dropzone = document.getElementById("summaryDropzone");
    const textInput = document.getElementById("inputText");
    const fileInput = document.getElementById("summaryFile");
    const pickBtn = document.getElementById("pickFileBtn");
    const fileBox = document.getElementById("fileBox");
    const fileName = document.getElementById("fileName");
    const removeBtn = document.getElementById("removeFileBtn");

    if (!dropzone || !fileInput) return;

    /* ---------- LEERZEILEN VERHINDERN ---------- */
    [textInput, document.getElementById("summaryFocus")].forEach(el => {
        if (!el) return;
        el.addEventListener("input", () => {
            el.value = el.value.replace(/^\s+/, "");
        });
    });

    /* ---------- DRAG EVENTS ---------- */
    ["dragenter", "dragover", "dragleave", "drop"].forEach(evt => {
        dropzone.addEventListener(evt, e => e.preventDefault());
    });

    dropzone.addEventListener("dragover", () => dropzone.classList.add("dragover"));
    dropzone.addEventListener("dragleave", () => dropzone.classList.remove("dragover"));

    dropzone.addEventListener("drop", e => {
        dropzone.classList.remove("dragover");
        if (!e.dataTransfer.files.length) return;
        setFile(e.dataTransfer.files[0]);
    });

    /* ---------- PICK BUTTON ---------- */
    pickBtn.addEventListener("click", e => {
        e.stopPropagation();
        fileInput.click();
    });

    fileInput.addEventListener("change", () => {
        if (!fileInput.files.length) return;
        setFile(fileInput.files[0]);
    });

    /* ---------- SET FILE ---------- */
    function setFile(file) {
        fileInput.files = createFileList(file);
        fileName.textContent = `📄 ${file.name}`;

        fileBox.classList.remove("hidden");
        dropzone.classList.add("hidden");

        textInput.value = "";
        textInput.disabled = true;
    }

    /* ---------- REMOVE FILE ---------- */
    removeBtn.addEventListener("click", () => {
        fileInput.value = "";
        fileBox.classList.add("hidden");
        dropzone.classList.remove("hidden");
        textInput.disabled = false;
    });

    /* ---------- UTILITY ---------- */
    function createFileList(file) {
        const dt = new DataTransfer();
        dt.items.add(file);
        return dt.files;
    }

})();
/* ==================================================
   FINAL FILE PICKER CONTROLLER (ONE SOURCE OF TRUTH)
   FIX: Explorer öffnet sich NUR 1x
================================================== */

(() => {
    const dropzone = document.getElementById("summaryDropzone");
    const textInput = document.getElementById("inputText");
    const fileInput = document.getElementById("summaryFile");
    const pickBtn   = document.getElementById("pickFileBtn");
    const statusBox = document.getElementById("fileStatus");
    const fileName  = document.getElementById("fileName");
    const removeBtn = document.getElementById("removeFileBtn");

    if (!dropzone || !fileInput || !pickBtn) return;

    /* ===============================
       HARD RESET – ALTE EVENTS BLOCKEN
    =============================== */

    const kill = e => {
        e.preventDefault();
        e.stopImmediatePropagation();
        return false;
    };

    // Dropzone darf NIEMALS Explorer öffnen
    ["click","mousedown","mouseup"].forEach(evt => {
        dropzone.addEventListener(evt, kill, true);
    });

    // Textfeld darf NIEMALS Explorer öffnen
    ["click","mousedown","mouseup"].forEach(evt => {
        textInput.addEventListener(evt, e => e.stopPropagation(), true);
    });

    /* ===============================
       EXPLORER: NUR ÜBER BUTTON
    =============================== */

    let opening = false;

    pickBtn.addEventListener("click", e => {
        e.preventDefault();
        e.stopPropagation();

        if (opening) return;
        opening = true;

        fileInput.value = "";
        fileInput.click();

        setTimeout(() => opening = false, 400);
    });

    /* ===============================
       DRAG & DROP (DATEI)
    =============================== */

    ["dragenter","dragover"].forEach(evt => {
        dropzone.addEventListener(evt, e => {
            e.preventDefault();
            dropzone.classList.add("dragover");
        });
    });

    ["dragleave","drop"].forEach(evt => {
        dropzone.addEventListener(evt, e => {
            e.preventDefault();
            dropzone.classList.remove("dragover");
        });
    });

    dropzone.addEventListener("drop", e => {
        const file = e.dataTransfer.files[0];
        if (!file) return;
        setFile(file);
    });

    /* ===============================
       FILE INPUT CHANGE
    =============================== */

    fileInput.addEventListener("change", () => {
        const file = fileInput.files[0];
        if (!file) return;
        setFile(file);
    });

    /* ===============================
       SET / REMOVE FILE
    =============================== */

    function setFile(file) {
        textInput.value = "";
        textInput.disabled = true;

        fileName.textContent = `📄 ${file.name}`;
        statusBox.classList.remove("hidden");
    }

    function clearFile() {
        fileInput.value = "";
        textInput.disabled = false;
        statusBox.classList.add("hidden");
        fileName.textContent = "";
    }

    removeBtn.addEventListener("click", e => {
        e.preventDefault();
        e.stopPropagation();
        clearFile();
    });

})();
/* ==================================================
   🔥 ABSOLUTE FINAL FIX – FILE PICKER
   Lösung: DOM NODE RESET (killt ALLE alten Listener)
================================================== */

(() => {
    const oldPickBtn = document.getElementById("pickFileBtn");
    const oldFileInp = document.getElementById("summaryFile");

    if (!oldPickBtn || !oldFileInp) return;

    /* ===============================
       1️⃣ BUTTON RESET (KLONEN)
    =============================== */

    const pickBtn = oldPickBtn.cloneNode(true);
    oldPickBtn.parentNode.replaceChild(pickBtn, oldPickBtn);

    /* ===============================
       2️⃣ FILE INPUT RESET (KLONEN)
    =============================== */

    const fileInput = oldFileInp.cloneNode(true);
    oldFileInp.parentNode.replaceChild(fileInput, oldFileInp);

    /* ===============================
       3️⃣ STATUS ELEMENTE
    =============================== */

    const textInput = document.getElementById("inputText");
    const statusBox = document.getElementById("fileStatus");
    const fileName  = document.getElementById("fileName");
    const removeBtn = document.getElementById("removeFileBtn");

    /* ===============================
       4️⃣ EXPLORER → NUR 1×
    =============================== */

    pickBtn.addEventListener("click", e => {
        e.preventDefault();
        e.stopPropagation();
        fileInput.value = "";
        fileInput.click();
    });

    /* ===============================
       5️⃣ DATEI GEWÄHLT
    =============================== */

    fileInput.addEventListener("change", () => {
        const file = fileInput.files[0];
        if (!file) return;

        textInput.value = "";
        textInput.disabled = true;

        fileName.textContent = `📄 ${file.name}`;
        statusBox.classList.remove("hidden");
    });

    /* ===============================
       6️⃣ DATEI ENTFERNEN
    =============================== */

    removeBtn.addEventListener("click", e => {
        e.preventDefault();
        e.stopPropagation();

        fileInput.value = "";
        textInput.disabled = false;
        statusBox.classList.add("hidden");
        fileName.textContent = "";
    });

})();
/* ==================================================
   GLOBAL DRAG HIGHLIGHT (PAGE LEVEL)
   Markiert Dropzone sobald Maus/Datei auf Seite ist
================================================== */

(() => {
    const dropzone = document.getElementById("summaryDropzone");
    if (!dropzone) return;

    let dragCounter = 0;

    // Sobald irgendwas in die Seite gezogen wird
    document.addEventListener("dragenter", e => {
        if (e.dataTransfer && e.dataTransfer.types.includes("Files")) {
            dragCounter++;
            dropzone.classList.add("global-drag");
        }
    });

    // Wenn Datei wieder rausgeht
    document.addEventListener("dragleave", e => {
        dragCounter--;
        if (dragCounter <= 0) {
            dropzone.classList.remove("global-drag");
            dragCounter = 0;
        }
    });

    // Nach Drop alles resetten
    document.addEventListener("drop", () => {
        dragCounter = 0;
        dropzone.classList.remove("global-drag");
    });
})();
/* ==================================================
   REMOVE UPLOADED FILE (FINAL)
================================================== */

(() => {
    const fileInput  = document.getElementById("summaryFile");
    const textInput  = document.getElementById("inputText");
    const statusBox  = document.getElementById("fileStatus");
    const fileName   = document.getElementById("fileName");
    const removeBtn  = document.getElementById("removeFileBtn");

    if (!fileInput || !textInput || !removeBtn) return;

    removeBtn.addEventListener("click", e => {
        e.preventDefault();
        e.stopPropagation();

        // Datei komplett entfernen
        fileInput.value = "";

        // Textfeld reaktivieren
        textInput.disabled = false;
        textInput.focus();

        // Status-Box ausblenden
        if (statusBox) statusBox.classList.add("hidden");
        if (fileName) fileName.textContent = "";
    });
})();
/* ==================================================
   TOOL → START TRANSITION HANDLER
================================================== */

(() => {
    const backButtons = document.querySelectorAll(".back-to-start");
    const toolSections = document.querySelectorAll(".tool-section");

    if (!backButtons.length) return;

    backButtons.forEach(btn => {
        btn.addEventListener("click", () => {

            document.body.classList.add("returning-to-start");

            // Nach Animation Tool schließen
            setTimeout(() => {
                document.body.classList.remove("tool-active");
                document.body.classList.remove("returning-to-start");

                toolSections.forEach(s => s.classList.remove("active"));
            }, 280); // muss zu CSS passen
        });
    });
})();
/* ==================================================
   EMAIL TOOL – FILE UPLOAD (MIRROR SUMMARY TOOL)
================================================== */

(() => {
    const dropzone = document.getElementById("emailDropzone");
    const textInput = document.getElementById("emailOriginal");
    const fileInput = document.getElementById("emailFile");
    const pickBtn   = document.getElementById("pickEmailFileBtn");
    const statusBox = document.getElementById("emailFileStatus");
    const fileName  = document.getElementById("emailFileName");
    const removeBtn = document.getElementById("removeEmailFileBtn");

    if (!dropzone || !fileInput || !pickBtn) return;

    /* ---------- Explorer nur über Button ---------- */
    pickBtn.addEventListener("click", e => {
        e.preventDefault();
        e.stopPropagation();
        fileInput.value = "";
        fileInput.click();
    });

    /* ---------- Drag Visual ---------- */
    ["dragenter", "dragover"].forEach(evt => {
        dropzone.addEventListener(evt, e => {
            e.preventDefault();
            dropzone.classList.add("dragover");
        });
    });

    ["dragleave", "drop"].forEach(evt => {
        dropzone.addEventListener(evt, e => {
            e.preventDefault();
            dropzone.classList.remove("dragover");
        });
    });

    /* ---------- Drop ---------- */
    dropzone.addEventListener("drop", e => {
        const file = e.dataTransfer.files[0];
        if (!file) return;
        setFile(file);
    });

    /* ---------- File Picker ---------- */
    fileInput.addEventListener("change", () => {
        const file = fileInput.files[0];
        if (!file) return;
        setFile(file);
    });

    /* ---------- Set / Remove ---------- */
    function setFile(file) {
        textInput.value = "";
        textInput.disabled = true;

        fileName.textContent = `📄 ${file.name}`;
        statusBox.classList.remove("hidden");
    }

    removeBtn.addEventListener("click", e => {
        e.preventDefault();
        e.stopPropagation();

        fileInput.value = "";
        textInput.disabled = false;
        textInput.focus();

        statusBox.classList.add("hidden");
        fileName.textContent = "";
    });

})();
/* ==================================================
   GLOBAL DRAG HIGHLIGHT – SUMMARY + EMAIL
================================================== */

(() => {
    const summaryDropzone = document.getElementById("summaryDropzone");
    const emailDropzone   = document.getElementById("emailDropzone");

    let dragCounter = 0;

    function getActiveDropzone() {
        // Nur das aktuell sichtbare Tool markieren
        if (document.getElementById("tool-summary")?.classList.contains("active")) {
            return summaryDropzone;
        }
        if (document.getElementById("tool-email")?.classList.contains("active")) {
            return emailDropzone;
        }
        return null;
    }

    document.addEventListener("dragenter", e => {
        if (!e.dataTransfer || !e.dataTransfer.types.includes("Files")) return;

        dragCounter++;
        const dz = getActiveDropzone();
        if (dz) dz.classList.add("global-drag");
    });

    document.addEventListener("dragleave", () => {
        dragCounter--;
        if (dragCounter <= 0) {
            const dz = getActiveDropzone();
            if (dz) dz.classList.remove("global-drag");
            dragCounter = 0;
        }
    });

    document.addEventListener("drop", () => {
        dragCounter = 0;
        const dz = getActiveDropzone();
        if (dz) dz.classList.remove("global-drag");
    });
})();
/* ==================================================
   GLOBAL DRAG HIGHLIGHT – SUMMARY + EMAIL
================================================== */

(() => {
    const summaryDropzone = document.getElementById("summaryDropzone");
    const emailDropzone   = document.getElementById("emailDropzone");

    let dragCounter = 0;

    function getActiveDropzone() {
        // Nur das aktuell sichtbare Tool markieren
        if (document.getElementById("tool-summary")?.classList.contains("active")) {
            return summaryDropzone;
        }
        if (document.getElementById("tool-email")?.classList.contains("active")) {
            return emailDropzone;
        }
        return null;
    }

    document.addEventListener("dragenter", e => {
        if (!e.dataTransfer || !e.dataTransfer.types.includes("Files")) return;

        dragCounter++;
        const dz = getActiveDropzone();
        if (dz) dz.classList.add("global-drag");
    });

    document.addEventListener("dragleave", () => {
        dragCounter--;
        if (dragCounter <= 0) {
            const dz = getActiveDropzone();
            if (dz) dz.classList.remove("global-drag");
            dragCounter = 0;
        }
    });

    document.addEventListener("drop", () => {
        dragCounter = 0;
        const dz = getActiveDropzone();
        if (dz) dz.classList.remove("global-drag");
    });
})();
/* ============================= */
/* OFFICIO ANNOUNCEMENT POPUP */
/* ============================= */

(function () {
    const overlay = document.getElementById("officio-popup-overlay");
    if (!overlay) return;

    const closeBtn = overlay.querySelector(".officio-popup-close");
    const continueBtn = overlay.querySelector(".officio-popup-button");

    const closePopup = () => {
        overlay.style.display = "none";
    };

    closeBtn.addEventListener("click", closePopup);
    continueBtn.addEventListener("click", closePopup);
})();
/* ============================= */
/* OFFICIO POPUP – BUTTON EVENT FIX */
/* ============================= */

document.addEventListener("DOMContentLoaded", () => {
    const overlay = document.getElementById("officio-popup-overlay");
    if (!overlay) return;

    overlay.style.display = "flex";

    const closeBtn = overlay.querySelector(".officio-popup-close");
    const continueBtn = overlay.querySelector(".officio-popup-button");

    // 🔥 Buttons dürfen NICHT von globalen Listenern blockiert werden
    [closeBtn, continueBtn].forEach(btn => {
        if (!btn) return;

        ["click","mousedown","pointerdown"].forEach(evt => {
            btn.addEventListener(evt, e => {
                e.stopPropagation();          // blockt globale Listener
                e.stopImmediatePropagation();// blockt harte Killer
            }, true);
        });
    });

    const closePopup = () => {
        overlay.style.display = "none";
    };

    closeBtn?.addEventListener("click", closePopup);
    continueBtn?.addEventListener("click", closePopup);
});
/* =========================================
   OFFICIO POPUP – ISOLATED SHADOW DOM
   (UNBLOCKABLE, FINAL)
========================================= */

(() => {
    const host = document.createElement("div");
    host.style.position = "fixed";
    host.style.inset = "0";
    host.style.zIndex = "2147483647";
    document.body.appendChild(host);

    const shadow = host.attachShadow({ mode: "open" });

    shadow.innerHTML = `
        <style>
            * { box-sizing: border-box; font-family: Inter, sans-serif; }

            .overlay {
                position: fixed;
                inset: 0;
                background: rgba(0,0,0,0.6);
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .popup {
                background: linear-gradient(135deg,#0f172a,#020617);
                color: white;
                padding: 32px;
                border-radius: 16px;
                width: 90%;
                max-width: 420px;
                text-align: center;
                position: relative;
            }

            button {
                margin-top: 20px;
                padding: 10px 18px;
                border-radius: 999px;
                border: none;
                background: #2563eb;
                color: white;
                font-weight: 600;
                cursor: pointer;
            }

            .close {
                position: absolute;
                top: 12px;
                right: 12px;
                background: none;
                border: none;
                color: white;
                font-size: 18px;
                cursor: pointer;
            }
        </style>

        <div class="overlay">
            <div class="popup">
                <button class="close">✕</button>
                <h3>🚀 Officio AI is evolving daily</h3>
                <p>
                    New improvements and tools are added continuously.<br>
                    You are using a live product in progress.
                </p>
                <button class="continue">Let’s get to work</button>
            </div>
        </div>
    `;

    const close = () => host.remove();

    shadow.querySelector(".close").onclick = close;
    shadow.querySelector(".continue").onclick = close;
})();
/* ==================================================
   FINAL OVERRIDE – SUMMARY BUTTON (TEXT vs FILE)
================================================== */

(() => {
    const btn = document.getElementById("summarizeBtn");
    const fileInput = document.getElementById("summaryFile");
    const textInput = document.getElementById("inputText");
    const focusInput = document.getElementById("summaryFocus");
    const output = document.getElementById("output");

    if (!btn) return;

    // 🔥 ALLE ALTEN HANDLER KILLEN
    const cleanBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(cleanBtn, btn);

    cleanBtn.addEventListener("click", async () => {

        const hasFile = fileInput?.files?.length > 0;
        const text = textInput?.value?.trim();
        const focus = focusInput?.value?.trim() || "";

        // ================= FILE MODE =================
        if (hasFile) {
            output.textContent = "📄 Datei wird gelesen…";

            const formData = new FormData();
            formData.append("file", fileInput.files[0]);
            formData.append("focus", focus);

            try {
                setTimeout(() => {
                    output.textContent = "🧠 Zusammenfassung wird erstellt…";
                }, 300);

                const res = await fetch(
                    "https://officio-ai-lybv.onrender.com/summarize-file",
                    {
                        method: "POST",
                        body: formData
                    }
                );

                const data = await res.json();
                output.textContent = data.result || "❌ Keine Antwort erhalten.";

            } catch (err) {
                console.error(err);
                output.textContent = "❌ Fehler bei der Datei-Verarbeitung.";
            }

            return;
        }

        // ================= TEXT MODE =================
        if (!text) {
            output.textContent = "❌ Bitte Text eingeben oder Datei auswählen.";
            return;
        }

        output.textContent = "🧠 Zusammenfassung wird erstellt…";

        try {
            const res = await fetch(
                "https://officio-ai-lybv.onrender.com/summarize",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ text, focus })
                }
            );

            const data = await res.json();
            output.textContent = data.result || "❌ Keine Antwort erhalten.";

        } catch (err) {
            console.error(err);
            output.textContent = "❌ Fehler bei der Verarbeitung.";
        }
    });
})();
document.getElementById("summarizeBtn").addEventListener("click", async () => {
    const output = document.getElementById("output");
    output.textContent = "Zusammenfassung wird erstellt…";

    const fileInput = document.getElementById("summaryFile");
    const textInput = document.getElementById("inputText");
    const focus = document.getElementById("summaryFocus").value || "";

    try {
        // 🔹 FALL 1: DATEI
        if (fileInput && fileInput.files.length > 0) {
            console.log("📤 FRONTEND → summarize-file");

            const formData = new FormData();
            formData.append("file", fileInput.files[0]);
            formData.append("focus", focus);

            const res = await fetch("http://127.0.0.1:8000/summarize-file", {
                method: "POST",
                body: formData
            });

            const data = await res.json();
            output.textContent = data.result ?? "❌ Keine Antwort erhalten.";
            return;
        }

        // 🔹 FALL 2: TEXT
        const text = textInput.value.trim();
        if (!text) {
            output.textContent = "❌ Kein Text oder Datei vorhanden.";
            return;
        }

        console.log("📤 FRONTEND → summarize (TEXT)");

        const res = await fetch("http://127.0.0.1:8000/summarize", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text, focus })
        });

        const data = await res.json();
        output.textContent = data.result ?? "❌ Keine Antwort erhalten.";

    } catch (err) {
        console.error("❌ Frontend Fehler:", err);
        output.textContent = "❌ Fehler bei der Anfrage.";
    }
});
/* ===============================
   FORCE DARK MODE (OFFICIO)
   Light Mode deaktiviert
=============================== */

document.addEventListener("DOMContentLoaded", () => {
    document.body.classList.add("dark");

    // Theme Toggle deaktivieren
    const themeToggle = document.getElementById("themeToggle");
    if (themeToggle) {
        themeToggle.disabled = true;
        themeToggle.classList.add("disabled");
        themeToggle.textContent = "Dark Mode";
    }
});
/* ===============================
   TEXT SUMMARY – OUTPUT FIX
=============================== */

document.getElementById("textSummaryBtn")?.addEventListener("click", async () => {
    const input = document.getElementById("textSummaryInput").value.trim();
    const focus = document.getElementById("textSummaryFocus").value.trim();
    const output = document.getElementById("textSummaryOutput");

    if (!input) {
        output.textContent = "❌ Bitte Text eingeben.";
        return;
    }

    output.textContent = "⏳ Zusammenfassung wird erstellt …";

    try {
        const res = await fetch("https://officio-ai-lybv.onrender.com/summarize", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: input, focus })
        });

        const data = await res.json();
        output.textContent = data.result || "❌ Keine Antwort erhalten.";

    } catch (err) {
        console.error(err);
        output.textContent = "❌ Fehler bei der Verarbeitung.";
    }
});
/* === OFFICIO | TEXT SUMMARY I18N – APPEND START === */
(function () {
  const TEXT_SUMMARY_I18N = {
    de: {
      back: "← Zur Startseite",
      title: "Texte zusammenfassen",
      input: "Text hier einfügen…",
      focus: "Stichwörter / Vorgaben (optional)",
      button: "Zusammenfassen"
    },
    en: {
      back: "← Back to start",
      title: "Summarize text",
      input: "Paste your text here…",
      focus: "Keywords / instructions (optional)",
      button: "Summarize"
    },
    fr: {
      back: "← Retour à l’accueil",
      title: "Résumer un texte",
      input: "Collez votre texte ici…",
      focus: "Mots-clés / instructions (facultatif)",
      button: "Résumer"
    }
  };

  function applyTextSummaryLang(lang) {
    const t = TEXT_SUMMARY_I18N[lang];
    if (!t) return;

    const section = document.getElementById("tool-summary-text");
    if (!section) return;

    section.querySelector('[data-i18n-key="back"]').textContent = t.back;
    section.querySelector('[data-i18n-key="title"]').textContent = t.title;
    section.querySelector('[data-i18n-key="button"]').textContent = t.button;

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute("data-i18n-placeholder");
      if (t[key]) el.placeholder = t[key];
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    const langSelect = document.getElementById("languageSelect");
    if (!langSelect) return;

    applyTextSummaryLang(langSelect.value);

    langSelect.addEventListener("change", e => {
      applyTextSummaryLang(e.target.value);
    });
  });
})();
/* === OFFICIO | TEXT SUMMARY I18N – APPEND END === */
/* === OFFICIO | APPEND TEXT SUMMARY (TEXT ONLY) TRANSLATIONS === */

// Deutsch
translations.de["text.summary.title"] = "Texte zusammenfassen";
translations.de["text.summary.input"] = "Text hier einfügen…";
translations.de["text.summary.focus"] = "Stichwörter / Vorgaben (optional)";
translations.de["text.summary.button"] = "Zusammenfassen";

// Englisch
translations.en["text.summary.title"] = "Summarize text";
translations.en["text.summary.input"] = "Paste your text here…";
translations.en["text.summary.focus"] = "Keywords / instructions (optional)";
translations.en["text.summary.button"] = "Summarize";

// Französisch
translations.fr["text.summary.title"] = "Résumer un texte";
translations.fr["text.summary.input"] = "Collez votre texte ici…";
translations.fr["text.summary.focus"] = "Mots-clés / instructions (facultatif)";
translations.fr["text.summary.button"] = "Résumer";

/* === OFFICIO | APPEND TEXT SUMMARY TRANSLATIONS END === */
/* === OFFICIO | FORCE I18N REAPPLY – APPEND === */
document.addEventListener("DOMContentLoaded", () => {
  const langSelect = document.getElementById("languageSelect");
  if (!langSelect) return;

  // erzwingt Neuübersetzung
  function reapplyI18n(lang) {
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      if (translations[lang] && translations[lang][key]) {
        el.textContent = translations[lang][key];
      }
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
      const key = el.getAttribute("data-i18n-placeholder");
      if (translations[lang] && translations[lang][key]) {
        el.placeholder = translations[lang][key];
      }
    });
  }

  // initial
  reapplyI18n(langSelect.value);

  // on change
  langSelect.addEventListener("change", e => {
    reapplyI18n(e.target.value);
  });
});
/* === OFFICIO | FORCE I18N REAPPLY – END === */
/* =====================================================
   === OFFICIO | FINAL I18N APPLY (DO NOT MOVE) ===
   ===================================================== */
window.addEventListener("load", () => {
  const select = document.getElementById("languageSelect");
  if (!select) return;

  const lang = select.value;

  // Text nodes
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (translations[lang] && translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });

  // Placeholders
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (translations[lang] && translations[lang][key]) {
      el.placeholder = translations[lang][key];
    }
  });

  // On language change
  select.addEventListener("change", e => {
    const l = e.target.value;

    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      if (translations[l] && translations[l][key]) {
        el.textContent = translations[l][key];
      }
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
      const key = el.getAttribute("data-i18n-placeholder");
      if (translations[l] && translations[l][key]) {
        el.placeholder = translations[l][key];
      }
    });
  });
});
/* ================== END FINAL I18N ================== */
/* === OFFICIO | TEXT SUMMARY TOOL CARD I18N – APPEND === */

translations.de["tool.text.summary.title"] = "📝 Texte zusammenfassen";
translations.de["tool.text.summary.desc"] =
  "Fasse Texte nach deinen Wünschen zusammen.";

translations.en["tool.text.summary.title"] = "📝 Summarize text";
translations.en["tool.text.summary.desc"] =
  "Summarize texts however you want.";

translations.fr["tool.text.summary.title"] = "📝 Résumer un texte";
translations.fr["tool.text.summary.desc"] =
  "Résumé de texte comme tu veux.";

/* === END TEXT SUMMARY TOOL CARD I18N === */
/* =====================================================
   === OFFICIO | FEATURE CARD TITLE NORMALIZATION ===
   ===================================================== */
(function () {
  function normalizeFeatureCards(lang) {
    const map = {
      de: {
        text: "Texte zusammenfassen",
        file: "Dateien, PDF, Dokumente, Bücher etc. zusammenfassen",
        email: "E-Mail Antwort"
      },
      en: {
        text: "Summarize text",
        file: "Summarize files, documents, PDFs, books, etc.",
        email: "Email reply"
      },
      fr: {
        text: "Résumer un texte",
        file: "Résumer des fichiers, documents, PDF, livres, etc.",
        email: "Réponse e-mail"
      }
    };

    const labels = map[lang] || map.de;

    const textCard = document.querySelector(
      '.feature-card[data-tool="tool-summary-text"] h3'
    );
    const fileCard = document.querySelector(
      '.feature-card[data-tool="tool-summary"] h3'
    );
    const emailCard = document.querySelector(
      '.feature-card[data-tool="tool-email"] h3'
    );

    if (textCard) textCard.textContent = "📝 " + labels.text;
    if (fileCard) fileCard.textContent = "📄 " + labels.file;
    if (emailCard) emailCard.textContent = "✉️ " + labels.email;
  }

  window.addEventListener("load", () => {
    const langSelect = document.getElementById("languageSelect");
    if (!langSelect) return;

    // initial
    normalizeFeatureCards(langSelect.value);

    // on language change
    langSelect.addEventListener("change", e => {
      normalizeFeatureCards(e.target.value);
    });
  });
})();
 /* ================= END FEATURE CARD NORMALIZATION ================= */
/* =====================================================
   OFFICIO | LANGUAGE SELECT LABEL NORMALIZATION
   ===================================================== */
(function () {
  const labelMap = {
    de: "Sprache",
    en: "Language",
    fr: "Langue"
  };

  function updateLanguageLabel(lang) {
    const select = document.getElementById("languageSelect");
    if (!select) return;

    Array.from(select.options).forEach(opt => {
      const code = opt.value.toUpperCase();
      const label = labelMap[lang] || "Language";
      opt.textContent = `${label}: ${code}`;
    });
  }

  window.addEventListener("load", () => {
    const select = document.getElementById("languageSelect");
    if (!select) return;

    // initial
    updateLanguageLabel(select.value);

    // on change
    select.addEventListener("change", e => {
      updateLanguageLabel(e.target.value);
    });
  });
})();
 /* ================= END LANGUAGE LABEL ================= */
/* ==================================================
   SUMMARY TOOL – FORCE FILE STATUS VISIBILITY (FINAL)
================================================== */
(() => {
  const fileInput  = document.getElementById("summaryFile");
  const textInput  = document.getElementById("inputText");
  const fileStatus = document.getElementById("fileStatus");
  const fileName   = document.getElementById("fileName");
  const removeBtn  = document.getElementById("removeFileBtn");

  if (!fileInput || !fileStatus || !fileName || !removeBtn) return;

  // 🔥 Datei gewählt → Status + X IMMER anzeigen
  fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (!file) return;

    fileName.textContent = `📄 ${file.name}`;
    fileStatus.classList.remove("hidden"); // ← DAS war der fehlende Punkt

    textInput.value = "";
    textInput.disabled = true;
  });

  // ❌ Datei entfernen
  removeBtn.addEventListener("click", e => {
    e.preventDefault();
    e.stopPropagation();

    fileInput.value = "";
    fileStatus.classList.add("hidden");
    fileName.textContent = "";

    textInput.disabled = false;
    textInput.focus();
  });
})();
/* ==================================================
   SUMMARY TOOL – FORCE FILE STATUS RENDER (FINAL)
================================================== */
(() => {
  const fileInput  = document.getElementById("summaryFile");
  const textInput  = document.getElementById("inputText");
  const fileStatus = document.getElementById("fileStatus");

  if (!fileInput || !fileStatus) return;

  function renderFile(file) {
    fileStatus.innerHTML = `
      <span id="fileName">📄 ${file.name}</span>
      <button
        type="button"
        id="removeFileBtn"
        aria-label="Datei entfernen"
        title="Datei entfernen"
      >✕</button>
    `;

    fileStatus.classList.remove("hidden");

    const removeBtn = document.getElementById("removeFileBtn");

    removeBtn.addEventListener("click", e => {
      e.preventDefault();
      e.stopPropagation();

      fileInput.value = "";
      fileStatus.classList.add("hidden");
      fileStatus.innerHTML = "";

      if (textInput) {
        textInput.disabled = false;
        textInput.focus();
      }
    });

    if (textInput) {
      textInput.value = "";
      textInput.disabled = true;
    }
  }

  // Datei über Picker
  fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (!file) return;
    renderFile(file);
  });

})();
/* ==================================================
   🔥 HARD RESET – SUMMARY FILE STATUS (FINAL FINAL)
================================================== */
(() => {
  const oldStatus = document.getElementById("fileStatus");
  const fileInput = document.getElementById("summaryFile");
  const textInput = document.getElementById("inputText");

  if (!oldStatus || !fileInput) return;

  // 🔥 KILL ALL OLD LISTENERS BY CLONING NODE
  const status = oldStatus.cloneNode(false);
  oldStatus.parentNode.replaceChild(status, oldStatus);

  status.className = "file-box hidden";

  function render(file) {
    status.innerHTML = `
      <span>📄 ${file.name}</span>
      <button type="button" aria-label="Remove file">✕</button>
    `;

    status.classList.remove("hidden");

    const btn = status.querySelector("button");
    btn.onclick = e => {
      e.preventDefault();
      e.stopPropagation();

      fileInput.value = "";
      status.classList.add("hidden");
      status.innerHTML = "";

      if (textInput) {
        textInput.disabled = false;
        textInput.focus();
      }
    };

    if (textInput) {
      textInput.value = "";
      textInput.disabled = true;
    }
  }

  fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (!file) return;
    render(file);
  });
})();
/* =========================================
   OFFICIO – FILE STATE FIX (SUMMARY TOOL)
========================================= */

(function () {
  const fileInput = document.getElementById("summaryFile");
  const fileStatus = document.getElementById("fileStatus");
  const fileName = document.getElementById("fileName");
  const removeBtn = document.getElementById("removeFileBtn");
  const textInput = document.getElementById("inputText");

  if (!fileInput || !fileStatus || !removeBtn) return;

  function resetFileState() {
    fileInput.value = "";
    fileStatus.classList.add("hidden");
    fileName.textContent = "";
    textInput.disabled = false;
    textInput.value = "";
  }

  fileInput.addEventListener("change", () => {
    if (!fileInput.files.length) return;

    const file = fileInput.files[0];
    fileName.textContent = `📄 ${file.name}`;
    fileStatus.classList.remove("hidden");

    // Text deaktivieren, damit kein Mischzustand entsteht
    textInput.value = "";
    textInput.disabled = true;
  });

  removeBtn.addEventListener("click", resetFileState);
})();
/* =========================================
   OFFICIO – LOADING STATE HANDLER
========================================= */

function setLoading(button, isLoading) {
  if (!button) return;

  button.disabled = isLoading;
  button.dataset.originalText ??= button.textContent;

  if (isLoading) {
    button.textContent = "Processing…";
    button.classList.add("loading");
  } else {
    button.textContent = button.dataset.originalText;
    button.classList.remove("loading");
  }
}
function showOutput(el, text) {
  if (!el) return;
  el.textContent = text;
  el.style.display = text ? "block" : "none";
}
document.querySelectorAll(".feature-card").forEach(card => {
  card.addEventListener("click", () => {
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 50);
  });
});
/* =========================================
   OFFICIO – HARD FILE REMOVE FIX (DELEGATION)
========================================= */

document.addEventListener("click", function (e) {
  if (e.target.id !== "removeFileBtn") return;

  const fileInput = document.getElementById("summaryFile");
  const fileStatus = document.getElementById("fileStatus");
  const fileName = document.getElementById("fileName");
  const textInput = document.getElementById("inputText");

  // Reset file input
  if (fileInput) fileInput.value = "";

  // Hide file box
  if (fileStatus) fileStatus.classList.add("hidden");

  // Clear filename
  if (fileName) fileName.textContent = "";

  // Re-enable text input
  if (textInput) {
    textInput.disabled = false;
    textInput.focus();
  }

  e.preventDefault();
});
/* =========================================
   OFFICIO – INPUT VALIDATION
========================================= */

function hasValidSummaryInput() {
  const text = document.getElementById("inputText")?.value.trim();
  const file = document.getElementById("summaryFile")?.files.length;
  return Boolean(text || file);
}

document.getElementById("summarizeBtn")?.addEventListener("click", (e) => {
  if (!hasValidSummaryInput()) {
    e.preventDefault();
    alert("Bitte Text eingeben oder eine Datei hochladen.");
    return;
  }
});
/* =========================================
   OFFICIO – ERROR HANDLER
========================================= */

function showError(outputEl, message) {
  if (!outputEl) return;
  outputEl.textContent = message;
  outputEl.style.display = "block";
  outputEl.style.color = "#ff6b6b";
}
/* =========================================
   OFFICIO – LOCK INPUTS WHILE LOADING
========================================= */

function setInputsDisabled(disabled) {
  document
    .querySelectorAll("textarea, input[type='file'], select")
    .forEach(el => el.disabled = disabled);
}
/* =========================================
   OFFICIO – AUTO SCROLL TO OUTPUT
========================================= */

function scrollToOutput(el) {
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}
/* =========================================
   OFFICIO – RESET TOOL STATE
========================================= */

document.querySelectorAll(".back-to-start").forEach(btn => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll("textarea")
      .forEach(t => t.value = "");

    document
      .querySelectorAll(".file-box")
      .forEach(b => b.classList.add("hidden"));

    document
      .querySelectorAll("#output, #emailOutput, #textSummaryOutput")
      .forEach(o => o.textContent = "");
  });
});
/* =========================================
   OFFICIO – INPUT VALIDATION
========================================= */

function hasValidSummaryInput() {
  const text = document.getElementById("inputText")?.value.trim();
  const file = document.getElementById("summaryFile")?.files?.length;
  return Boolean(text || file);
}
/* =========================================
   OFFICIO – ERROR HANDLER
========================================= */

function showError(outputEl, message) {
  if (!outputEl) return;
  outputEl.textContent = message;
  outputEl.style.display = "block";
  outputEl.style.color = "#ff6b6b";
}
/* =========================================
   OFFICIO – AUTO SCROLL TO OUTPUT
========================================= */

function scrollToOutput(el) {
  if (!el) return;
  el.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}
/* =========================================
   OFFICIO – COPY OUTPUT BUTTON
========================================= */

document.addEventListener("click", async (e) => {
  if (!e.target.classList.contains("copy-output-btn")) return;

  const targetId = e.target.dataset.target;
  const output = document.getElementById(targetId);
  if (!output || !output.textContent.trim()) return;

  try {
    await navigator.clipboard.writeText(output.textContent);
    e.target.textContent = "Copied ✓";
    setTimeout(() => (e.target.textContent = "Copy"), 1200);
  } catch {
    alert("Copy failed");
  }
});
/* =========================================
   OFFICIO – COPY FEEDBACK (FINAL)
========================================= */

document.addEventListener("click", async (e) => {
  if (!e.target.classList.contains("copy-output-btn")) return;

  const btn = e.target;
  const targetId = btn.dataset.target;
  const output = document.getElementById(targetId);

  if (!output || !output.textContent.trim()) return;

  try {
    await navigator.clipboard.writeText(output.textContent);

    const originalText = btn.textContent;
    btn.textContent = "Copied ✓";
    btn.classList.add("copied");

    setTimeout(() => {
      btn.textContent = originalText;
      btn.classList.remove("copied");
    }, 1200);

  } catch (err) {
    btn.textContent = "Failed";
    setTimeout(() => (btn.textContent = "Copy"), 1200);
  }
});
/* =========================================
   OFFICIO – OUTPUT HIGHLIGHT TRIGGER
========================================= */

function highlightOutput(el) {
  if (!el) return;

  el.classList.remove("output-highlight"); // reset
  void el.offsetWidth; // reflow erzwingen
  el.classList.add("output-highlight");
}
/* =========================================
   OFFICIO – ENTER TO EXECUTE (FINAL)
========================================= */

document.addEventListener("keydown", (e) => {
  // Shift+Enter = neue Zeile erlauben
  if (e.key !== "Enter" || e.shiftKey) return;

  const activeTool = document.querySelector(".tool-section.active");
  if (!activeTool) return;

  const tag = document.activeElement.tagName.toLowerCase();
  if (tag !== "textarea") return;

  e.preventDefault();

  // TEXT SUMMARY TOOL
  if (activeTool.id === "tool-summary-text") {
    document.getElementById("textSummaryBtn")?.click();
    return;
  }

  // FILE / TEXT SUMMARY TOOL
  if (activeTool.id === "tool-summary") {
    document.getElementById("summarizeBtn")?.click();
    return;
  }

  // EMAIL TOOL
  if (activeTool.id === "tool-email") {
    document.getElementById("emailGenerateBtn")?.click();
    return;
  }
});
/* =========================================
   OFFICIO – AUTO FOCUS FIRST FIELD (FINAL)
========================================= */

function officioAutoFocus(toolId) {
  const tool = document.getElementById(toolId);
  if (!tool) return;

  // Erstes aktives Textfeld finden
  const field = tool.querySelector(
    "textarea:not([disabled]), input[type='text']:not([disabled])"
  );

  if (field) {
    // kleiner Delay wegen Transitionen
    setTimeout(() => {
      field.focus();
    }, 180);
  }
}
function openTool(id) {
    document.body.classList.add("tool-active");
    toolSections.forEach(s =>
        s.classList.toggle("active", s.id === id)
    );

    officioAutoFocus(id); // 👈 AUTO-FOCUS
}
/* =========================================
   OFFICIO – AUTO SCROLL TO OUTPUT (FINAL)
========================================= */

function officioScrollToOutput(outputEl) {
  if (!outputEl) return;

  const rect = outputEl.getBoundingClientRect();
  const isVisible =
    rect.top >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight);

  // Nur scrollen, wenn Output NICHT sichtbar ist
  if (!isVisible) {
    setTimeout(() => {
      outputEl.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }, 120);
  }
}
