import { fetchJSON, fetchFormData } from "../core/api.js";
import { setButtonLoading } from "../ui/loader.js";

export function initEmailTool() {
  console.log("Email Tool Loaded");

  const btn = document.getElementById("emailGenerateBtn");
  if (!btn) return;

  const fileInput = document.getElementById("emailFile");
  const textInput = document.getElementById("emailOriginal");
  const keywordsInput = document.getElementById("emailKeywords");
  const styleSelect = document.getElementById("emailStyle");
  const output = document.getElementById("emailOutput");
  const filePreview = document.getElementById("emailFilePreview");
  const copyBtn = document.querySelector('.copy-btn[data-copy="emailOutput"]');

  const dropZone = textInput;

  /* ===============================
     GLOBAL DRAG SAFETY
  =============================== */

  document.addEventListener("dragover", (e) => {
    if (!e.target.closest(".drop-zone")) {
      e.preventDefault();
    }
  });

  document.addEventListener("drop", (e) => {
    if (!e.target.closest(".drop-zone")) {
      e.preventDefault();
    }
  });

  /* ===============================
     FILE PREVIEW
  =============================== */

  function showFilePreview(file) {
    if (!filePreview) return;

    filePreview.innerHTML = `
      <span>📎 ${file.name}</span>
      <button id="removeEmailFile">✖</button>
    `;

    filePreview.classList.remove("hidden");

    document.getElementById("removeEmailFile")
      .addEventListener("click", () => {
        fileInput.value = "";
        filePreview.classList.add("hidden");
        filePreview.innerHTML = "";
      });
  }

  /* ===============================
     DROP ZONE HANDLING
  =============================== */

  if (dropZone && fileInput) {

    ["dragenter", "dragover"].forEach(event => {
      dropZone.addEventListener(event, (e) => {
        e.preventDefault();
        dropZone.classList.add("drag-active");
      });
    });

    ["dragleave", "drop"].forEach(event => {
      dropZone.addEventListener(event, (e) => {
        e.preventDefault();
        dropZone.classList.remove("drag-active");
      });
    });

    dropZone.addEventListener("drop", (e) => {
      const files = e.dataTransfer.files;

      if (files.length > 0) {
        const dt = new DataTransfer();
        dt.items.add(files[0]);
        fileInput.files = dt.files;
        showFilePreview(files[0]);
      }
    });

    // Klick öffnet File Dialog
    dropZone.addEventListener("click", () => {
      fileInput.click();
    });

  }

  /* ===============================
     NORMAL FILE INPUT
  =============================== */

  fileInput?.addEventListener("change", () => {
    if (fileInput.files.length > 0) {
      showFilePreview(fileInput.files[0]);
    }
  });

  /* ===============================
     COPY BUTTON LOGIC
  =============================== */

  copyBtn?.addEventListener("click", async () => {
    if (!output.textContent.trim()) return;

    await navigator.clipboard.writeText(output.textContent);

    copyBtn.textContent = "Copied ✓";
    setTimeout(() => {
      copyBtn.textContent = "Copy";
    }, 1500);
  });

  /* ===============================
     GENERATE BUTTON
  =============================== */

  btn.addEventListener("click", async () => {

    const hasFile = fileInput?.files?.length > 0;
    const text = textInput?.value.trim();
    const keywords = keywordsInput?.value || "";
    const style = styleSelect?.value || "neutral";

    if (!hasFile && !text) {
      output.textContent = "❌ Text oder Datei fehlt.";
      return;
    }

    setButtonLoading(btn, true);
    output.textContent = "";
    copyBtn?.classList.remove("visible");

    try {

      let data;

      if (hasFile) {

        const fd = new FormData();
        fd.append("file", fileInput.files[0]);
        fd.append("keywords", keywords);
        fd.append("style", style);

        data = await fetchFormData("/email-reply-file", fd);

      } else {

        data = await fetchJSON("/email-reply", {
          original_email: text,
          keywords,
          style
        });

      }

      output.textContent = data.result || "❌ Keine Antwort.";

      if (data.result) {
        copyBtn?.classList.add("visible");
      }

    } catch (err) {
      console.error(err);
      output.textContent = "❌ Fehler bei der E-Mail-Erstellung.";
    } finally {
      setButtonLoading(btn, false);
    }

  });

}
