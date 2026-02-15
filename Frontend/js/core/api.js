/* =========================================
   OFFICIO – API CONFIG
========================================= */

export const OFFICIO_API =
  location.hostname === "localhost"
    ? "http://127.0.0.1:8000"
    : "https://officio-ai-2-t5cu.onrender.com";

export async function fetchJSON(endpoint, body) {
  const response = await fetch(`${OFFICIO_API}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

export async function fetchFormData(endpoint, formData) {
  const response = await fetch(`${OFFICIO_API}${endpoint}`, {
    method: "POST",
    body: formData
  });

  if (!response.ok) throw new Error(await response.text());
  return response.json();
}
