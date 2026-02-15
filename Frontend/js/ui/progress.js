/* =========================================
   OFFICIO – PROGRESS BAR
========================================= */

let progressInterval = null;

export function startProgress() {
    const bar = document.getElementById("progress-bar");
    if (!bar) return;

    let width = 10;
    bar.style.width = width + "%";

    progressInterval = setInterval(() => {
        if (width < 90) {
            width += Math.random() * 8;
            bar.style.width = width + "%";
        }
    }, 300);
}

export function finishProgress() {
    const bar = document.getElementById("progress-bar");
    if (!bar) return;

    clearInterval(progressInterval);
    bar.style.width = "100%";

    setTimeout(() => {
        bar.style.width = "0%";
    }, 400);
}
