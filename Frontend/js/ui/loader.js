/* =========================================
   OFFICIO – UI LOADER
========================================= */

/* =========================================
   BUTTON LOADING STATE
========================================= */

export function setButtonLoading(btn, isLoading, text = "Wird verarbeitet…") {
    if (!btn) return;

    if (isLoading) {
        btn.dataset.originalText = btn.innerHTML;
        btn.disabled = true;
        btn.classList.add("loading-active");

        btn.innerHTML = `
            <span class="loading-spinner"></span>
            ${text}
        `;
    } else {
        btn.disabled = false;
        btn.classList.remove("loading-active");
        btn.innerHTML = btn.dataset.originalText || btn.innerHTML;
    }
}

/* =========================================
   GLOBAL LOADER OVERLAY
========================================= */

export function showGlobalLoader() {
    const loader = document.getElementById("global-loader");
    if (!loader) return;
    loader.classList.add("active");
}

export function hideGlobalLoader() {
    const loader = document.getElementById("global-loader");
    if (!loader) return;
    loader.classList.remove("active");
}
