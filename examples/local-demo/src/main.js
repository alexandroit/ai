import "./styles.css";
import { installLocalStacklineAIDemoApi } from "./demo-api.js";

installLocalStacklineAIDemoApi();

await import("@stackline/ai-ui");

const studio = document.querySelector("stackline-ai-studio");

studio.addEventListener("stackline-response", (event) => {
  console.info("Stackline AI response", event.detail);
});

studio.addEventListener("stackline-error", (event) => {
  console.error("Stackline AI error", event.detail);
});

studio.addEventListener("stackline-language-change", (event) => {
  document.documentElement.lang = event.detail.language;
});

if (new URLSearchParams(window.location.search).has("stackline-demo-check")) {
  const result = document.createElement("pre");
  result.id = "stackline-demo-check-result";
  result.textContent = "running";
  result.style.cssText =
    "position:fixed;right:8px;bottom:8px;max-width:calc(100vw - 16px);margin:0;border:1px solid #cbd5e1;border-radius:8px;padding:8px;background:#fff;color:#0f172a;font:11px/1.35 ui-monospace,monospace;white-space:pre-wrap;z-index:9999;";
  document.body.append(result);

  await customElements.whenDefined("stackline-ai-studio");
  await new Promise((resolve) => setTimeout(resolve, 300));
  await studio.send("How does Stackline AI keep API keys safe?");
  await new Promise((resolve) => setTimeout(resolve, 250));

  const shadow = studio.shadowRoot;
  const assistant = shadow?.querySelector(".message.assistant");
  const rag = shadow?.querySelector(".rag-evidence");
  const modelButton = shadow?.querySelector(".model-picker .c-btn");
  const languagePicker = shadow?.querySelector(".language-picker");
  const state = {
    ok: Boolean(assistant && rag && modelButton && languagePicker),
    hasAssistant: Boolean(assistant),
    hasRagEvidence: Boolean(rag),
    selectedModel: modelButton?.textContent?.trim() || "",
    languageWidth: languagePicker ? Math.round(languagePicker.getBoundingClientRect().width) : 0,
  };

  window.__stacklineAIDemoCheck = state;
  result.textContent = JSON.stringify(state, null, 2);
}
