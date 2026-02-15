/* ================= TOOL PAGE NAVIGATION ================= */

const cards = document.querySelectorAll(".feature-card");
const pages = document.querySelectorAll(".tool-page");
const backBtns = document.querySelectorAll(".back-to-start");
const featureGrid = document.getElementById("featureGrid");

/* ---------- OPEN TOOL ---------- */

cards.forEach(card => {
  card.addEventListener("click", () => {

    const toolId = card.dataset.tool;
    const selected = document.getElementById(toolId);
    if (!selected) return;

    pages.forEach(p => p.classList.remove("active"));

    selected.classList.add("active");
    document.body.classList.add("tool-open");

    // History State setzen
    history.pushState({ tool: toolId }, "", `#${toolId}`);

    // Scroll exakt zum Tool
    setTimeout(() => {
      const wrapper = selected.querySelector(".tool-wrapper");
      if (!wrapper) return;

      const yOffset = -40;
      const y = wrapper.getBoundingClientRect().top + window.pageYOffset + yOffset;

      window.scrollTo({
        top: y,
        behavior: "smooth"
      });
    }, 50);

  });
});


/* ---------- BACK BUTTON ---------- */

backBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    closeTool();
    history.pushState({}, "", "app.html");
  });
});


/* ---------- BROWSER BACK HANDLING ---------- */

window.addEventListener("popstate", (event) => {

  if (event.state && event.state.tool) {
    // Wenn Tool-State vorhanden → Tool anzeigen
    const selected = document.getElementById(event.state.tool);
    if (!selected) return;

    pages.forEach(p => p.classList.remove("active"));
    selected.classList.add("active");
    document.body.classList.add("tool-open");

  } else {
    // Wenn kein Tool-State → zurück zur Startansicht
    closeTool();
  }

});


/* ---------- CLOSE TOOL FUNCTION ---------- */

function closeTool() {
  pages.forEach(p => p.classList.remove("active"));
  document.body.classList.remove("tool-open");
  window.scrollTo({ top: 0, behavior: "smooth" });
}
