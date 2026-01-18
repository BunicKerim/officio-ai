document.addEventListener("DOMContentLoaded", () => {
    function autoResize(el) {
        el.style.height = "auto";
        el.style.height = el.scrollHeight + "px";
    }

    document.querySelectorAll("textarea").forEach(t => {
        autoResize(t);
        t.addEventListener("input", () => autoResize(t));
    });
});
