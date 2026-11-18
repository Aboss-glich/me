import { burstConfetti, launchFireworks } from "./animation-engine.js";

export function initGift() {
  const button = document.querySelector('[data-action="open-gift"]');
  const stage = document.querySelector(".gift-stage");
  if (!button || !stage) return;
  button.addEventListener("click", () => {
    const isOpen = stage.classList.toggle("is-open");
    button.textContent = isOpen ? "A little love, unwrapped 💗" : "Unwrap Your Gift 🎁";
    button.setAttribute("aria-expanded", String(isOpen));
    if (isOpen) {
      burstConfetti(window.innerWidth / 2, window.innerHeight * .4, 56);
      launchFireworks(3);
    }
  });
}
