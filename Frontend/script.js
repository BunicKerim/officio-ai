document.addEventListener("DOMContentLoaded", () => {

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

    // ⬅️ MIT RÜCKKEHR-EFFEKT
    function goToStart() {
        document.body.classList.add("returning-to-start");

        setTimeout(() => {
            document.body.classList.remove("tool-active");
            document.body.classList.remove("returning-to-start");

            toolSections.forEach(s => s.classList.remove("active"));
        }, 250); // exakt auf CSS-Transition abgestimmt
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
                body: JSON.stringify({
                    text: input,
                    focus: focus
                })
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
            ? {
                p: "rgba(180,210,255,0.95)",
                l: "rgba(180,210,255,0.35)"
            }
            : {
                p: "rgba(230,235,255,0.95)",
                l: "rgba(230,235,255,0.35)"
            };
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
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                if (Math.hypot(dx, dy) < 120) {
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
    if (toggle) {
        toggle.textContent = "Dark Mode: ON";
    }
});
