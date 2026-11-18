import { burstConfetti, launchFireworks } from "./animation-engine.js";

export function initCake() {
  const blowButton = document.querySelector('[data-action="blow-candles"]');
  const resetButton = document.querySelector('[data-action="reset-cake"]');
  const cake = document.querySelector(".interactive-cake");
  const message = document.querySelector(".celebration-message");
  if (!blowButton || !resetButton || !cake || !message) return;

  blowButton.addEventListener("click", () => {
    if (cake.classList.contains("is-blown")) return;
    cake.classList.add("is-blown");
    message.classList.add("is-visible");
    blowButton.disabled = true;
    blowButton.textContent = "Wish sent ✨";
    burstConfetti(window.innerWidth / 2, window.innerHeight * .45, 80);
    launchFireworks(4);
  });
  resetButton.addEventListener("click", () => {
    cake.classList.remove("is-blown");
    message.classList.remove("is-visible");
    blowButton.disabled = false;
    blowButton.textContent = "Blow the Candles 💨";
  });
}
