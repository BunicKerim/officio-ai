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
            "tool.summary": "📝 Zusammenfassen",
            "tool.summary.desc": "Fasst lange Texte so zusammen, wie du es dir wünschst.",
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
            summaryTitle: "Text zusammenfassen",
            summaryBtn: "Zusammenfassen",
            summaryPlaceholder: "Text hier einfügen...",
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
