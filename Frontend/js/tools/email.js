import { fetchJSON, fetchFormData } from "../core/api.js";
import { setButtonLoading } from "../ui/loader.js";

export function initEmailTool() {

  const btn = document.getElementById("emailGenerateBtn");
  if (!btn) return;

  const fileInput = document.getElementById("emailFile");
  const textInput = document.getElementById("emailOriginal");
  const keywordsInput = document.getElementById("emailKeywords");
  const styleSelect = document.getElementById("emailStyle");
  const output = document.getElementById("emailOutput");

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

    } catch (err) {
      console.error(err);
      output.textContent = "❌ Fehler bei der E-Mail-Erstellung.";
    } finally {
      setButtonLoading(btn, false);
    }

  });
}
