/* =========================================
   OFFICIO – COPY TO CLIPBOARD
========================================= */

export function copyText(content, button) {
    if (!content) return;

    navigator.clipboard.writeText(content)
        .then(() => {
            if (button) {
                button.classList.add("copied");
                button.textContent = "Kopiert ✓";

                setTimeout(() => {
                    button.classList.remove("copied");
                    button.textContent = "Kopieren";
                }, 2000);
            }
        })
        .catch(err => {
            console.error("Copy failed:", err);
        });
}

/* =========================================
   AUTO COPY BINDING
   (Buttons mit data-copy-target)
========================================= */

export function initCopyButtons() {
    const buttons = document.querySelectorAll("[data-copy-target]");

    buttons.forEach(btn => {
        btn.addEventListener("click", () => {
            const targetId = btn.dataset.copyTarget;
            const target = document.getElementById(targetId);
            if (!target) return;

            const text = target.value || target.textContent;
            copyText(text, btn);
        });
    });
}
