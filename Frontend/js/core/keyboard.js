/* =========================================
   OFFICIO – KEYBOARD HANDLER
========================================= */

export function initKeyboard() {

  function triggerActiveToolSubmit() {
    const activeSection = document.querySelector(".tool-section.active");
    if (!activeSection) return;

    const btn = activeSection.querySelector("button[id$='Btn']");
    if (btn) btn.click();
  }

  document.addEventListener("keydown", function (e) {
    if (e.ctrlKey && e.key === "Enter") {
      e.preventDefault();
      triggerActiveToolSubmit();
    }
  });
}
