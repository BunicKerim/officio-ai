/* =========================================
   OFFICIO – AUTO RESIZE TEXTAREAS
========================================= */

function autoResizeTextarea(el) {
  if (!el) return;
  el.style.height = "auto";
  el.style.height = el.scrollHeight + "px";
}

export function initAutoResize() {

  const areas = document.querySelectorAll("textarea");

  areas.forEach(area => {

    autoResizeTextarea(area);

    area.addEventListener("input", () => {
      autoResizeTextarea(area);
    });

    area.addEventListener("paste", () => {
      setTimeout(() => autoResizeTextarea(area), 0);
    });

  });
}
