import { initKeyboard } from "./core/keyboard.js";
import { initAutoResize } from "./core/autoResize.js";

import { initSummaryTool } from "./tools/summary.js";
import { initEmailTool } from "./tools/email.js";
import { initTranslateTool } from "./tools/translate.js";

import { initHeaderNetwork } from "./ui/headerNetwork.js";

document.addEventListener("DOMContentLoaded", () => {

  /* ================= INIT ================= */

  initKeyboard();
  initAutoResize();

  initSummaryTool();
  initEmailTool();
  initTranslateTool();

  // GLOBAL NETWORK (läuft über ganze Seite)
  initHeaderNetwork("globalNetwork");

  console.log("🚀 Officio AI gestartet");


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

      // URL ändern ohne Reload
      history.pushState({ tool: toolId }, "", `#${toolId}`);

      // Landing weich ausblenden
      featureGrid.classList.add("fade-out");

      // Alle Tools deaktivieren
      pages.forEach(p => p.classList.remove("active"));

      // Tool aktivieren
      selected.classList.add("active");
      document.body.classList.add("tool-open");

      // Smooth Scroll exakt zum Tool
      setTimeout(() => {
        const wrapper = selected.querySelector(".tool-wrapper");
        if (!wrapper) return;

        const yOffset = -60; // Abstand vom oberen Rand
        const y = wrapper.getBoundingClientRect().top + window.pageYOffset + yOffset;

        window.scrollTo({
          top: y,
          behavior: "smooth"
        });

      }, 80);

    });
  });


  /* ---------- BACK TO START BUTTON ---------- */

  backBtns.forEach(btn => {
    btn.addEventListener("click", () => {

      history.pushState({}, "", "app.html");

      pages.forEach(p => p.classList.remove("active"));
      document.body.classList.remove("tool-open");
      featureGrid.classList.remove("fade-out");

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });

    });
  });


  /* ---------- BROWSER BACK BUTTON SUPPORT ---------- */

  window.addEventListener("popstate", () => {

    const hash = window.location.hash.replace("#", "");

    if (!hash) {
      // Zurück zur Startseite
      pages.forEach(p => p.classList.remove("active"));
      document.body.classList.remove("tool-open");
      featureGrid.classList.remove("fade-out");

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });

    } else {
      // Direktes Öffnen per Hash
      const selected = document.getElementById(hash);
      if (!selected) return;

      featureGrid.classList.add("fade-out");
      pages.forEach(p => p.classList.remove("active"));

      selected.classList.add("active");
      document.body.classList.add("tool-open");

      setTimeout(() => {
        const wrapper = selected.querySelector(".tool-wrapper");
        if (!wrapper) return;

        const yOffset = -60;
        const y = wrapper.getBoundingClientRect().top + window.pageYOffset + yOffset;

        window.scrollTo({
          top: y,
          behavior: "smooth"
        });

      }, 80);
    }

  });


  /* ---------- DIRECT LOAD VIA HASH ---------- */

  const initialHash = window.location.hash.replace("#", "");
  if (initialHash) {
    const selected = document.getElementById(initialHash);
    if (selected) {
      featureGrid.classList.add("fade-out");
      pages.forEach(p => p.classList.remove("active"));

      selected.classList.add("active");
      document.body.classList.add("tool-open");

      setTimeout(() => {
        const wrapper = selected.querySelector(".tool-wrapper");
        if (!wrapper) return;

        const yOffset = -60;
        const y = wrapper.getBoundingClientRect().top + window.pageYOffset + yOffset;

        window.scrollTo({
          top: y,
          behavior: "smooth"
        });

      }, 80);
    }
  }

});
