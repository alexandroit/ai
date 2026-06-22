import "@stackline/ai-ui";
import "./style.css";

const studio = document.querySelector("stackline-ai-studio");

studio?.addEventListener("stackline-error", (event) => {
  console.error("Stackline AI error", event.detail);
});

studio?.addEventListener("stackline-response", (event) => {
  console.info("Stackline AI response", event.detail);
});
