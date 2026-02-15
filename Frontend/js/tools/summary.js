import { fetchJSON, fetchFormData } from "../core/api.js";
import { setButtonLoading } from "../ui/loader.js";

export function initSummaryTool() {

  const btn = document.getElementById("summarizeBtn");
  if (!btn) return;

  const fileInput = document.getElementById("summaryFile");
  const textInput = document.getElementById("inputText");
  const focusInput = document.getElementById("summaryFocus");
  const output = document.getElementById("output");

  btn.addEventListener("click", async () => {

    const hasFile = fileInput?.files?.length > 0;
    const text = textInput?.value.trim();
    const focus = focusInput?.value || "";

    if (!hasFile && !text) {
      output.textContent = "❌ Text oder Datei fehlt.";
      return;
    }

    setButtonLoading(btn, true);
    output.textContent = "";

    try {

      let data;

      if (hasFile) {

        const fd = new FormData();
        fd.append("file", fileInput.files[0]);
        fd.append("focus", focus);

        data = await fetchFormData("/summarize-file", fd);

      } else {

        data = await fetchJSON("/summarize", { text, focus });

      }

      output.textContent = data.result || "❌ Keine Antwort.";

    } catch (err) {
      console.error(err);
      output.textContent = "❌ Fehler bei der Verarbeitung.";
    } finally {
      setButtonLoading(btn, false);
    }

  });
}
