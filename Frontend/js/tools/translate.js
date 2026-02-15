import { fetchJSON } from "../core/api.js";
import { setButtonLoading } from "../ui/loader.js";

export function initTranslateTool() {

  const btn = document.getElementById("translateBtn");
  if (!btn) return;

  const input = document.getElementById("translateInput");
  const targetLang = document.getElementById("translateTargetLang");
  const style = document.getElementById("translateStyle");
  const output = document.getElementById("translateOutput");

  btn.addEventListener("click", async () => {

    const text = input?.value.trim();
    if (!text) {
      output.value = "❌ Bitte Text eingeben.";
      return;
    }

    setButtonLoading(btn, true);
    output.value = "";

    try {

      const data = await fetchJSON("/translate", {
        text,
        target_lang: targetLang.value,
        style: style.value,
        context: ""
      });

      output.value = data.result || "❌ Keine Antwort.";

    } catch (err) {
      console.error(err);
      output.value = "❌ Fehler bei der Übersetzung.";
    } finally {
      setButtonLoading(btn, false);
    }

  });
}
