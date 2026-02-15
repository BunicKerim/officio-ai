import { initHeroLines } from "./ui/heroLines.js";

document.addEventListener("DOMContentLoaded", () => {

  /* ================= HERO LINES ================= */

  initHeroLines("heroLines");


  /* ================= CTA BUTTON ================= */

  const btn = document.getElementById("enterAppBtn");

  if (btn) {
    btn.addEventListener("click", (e) => {

      e.preventDefault();

      // Smooth Fade-Out
      document.body.classList.add("page-leaving");

      setTimeout(() => {
        window.location.href = "app.html";
      }, 300);

    });
  }

});
