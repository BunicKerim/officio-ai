/* ================= TOOL PAGE NAVIGATION ================= */

const cards = document.querySelectorAll(".feature-card");
const pages = document.querySelectorAll(".tool-page");
const backBtns = document.querySelectorAll(".back-to-start");

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

    // Smooth Scroll exakt zum Tool
    setTimeout(() => {
      const wrapper = selected.querySelector(".tool-wrapper");
      if (!wrapper) return;

      const headerOffset = 60; // Abstand vom oberen Rand
      const y = wrapper.getBoundingClientRect().top + window.scrollY - headerOffset;

      window.scrollTo({
        top: y,
        behavior: "smooth"
      });

    }, 80);

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

    const selected = document.getElementById(event.state.tool);
    if (!selected) return;

    pages.forEach(p => p.classList.remove("active"));
    selected.classList.add("active");
    document.body.classList.add("tool-open");

    // Scroll auch beim Browser-Back korrekt
    setTimeout(() => {
      const wrapper = selected.querySelector(".tool-wrapper");
      if (!wrapper) return;

      const headerOffset = 60;
      const y = wrapper.getBoundingClientRect().top + window.scrollY - headerOffset;

      window.scrollTo({
        top: y,
        behavior: "smooth"
      });

    }, 80);

  } else {
    closeTool();
  }

});


/* ---------- CLOSE TOOL FUNCTION ---------- */

function closeTool() {
  pages.forEach(p => p.classList.remove("active"));
  document.body.classList.remove("tool-open");

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}
