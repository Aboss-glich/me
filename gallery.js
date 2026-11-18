export function initGallery() {
  const lightbox = document.querySelector(".lightbox");
  if (!lightbox) return;
  const image = lightbox.querySelector("img");
  const caption = lightbox.querySelector("figcaption");
  const cards = [...document.querySelectorAll(".polaroid")];
  let activeIndex = 0;
  let opener;

  function show(index) {
    activeIndex = (index + cards.length) % cards.length;
    const active = cards[activeIndex];
    const cardImage = active.querySelector("img");
    if (!cardImage) {
      image.removeAttribute("src");
      image.alt = "Photo unavailable";
      caption.textContent = `${active.dataset.caption} · Photo unavailable. Check its image path in js/config.js.`;
      return;
    }
    image.src = cardImage.src;
    image.alt = cardImage.alt;
    caption.textContent = active.dataset.caption;
    image.addEventListener("error", () => {
      image.removeAttribute("src");
      image.alt = "Photo unavailable";
      caption.textContent = `${active.dataset.caption} · Photo unavailable. Check its image path in js/config.js.`;
    }, { once: true });
  }
  function close() {
    lightbox.hidden = true;
    document.body.classList.remove("lightbox-open");
    opener?.focus();
  }
  cards.forEach((card, index) => card.addEventListener("click", () => {
    opener = card;
    show(index);
    lightbox.hidden = false;
    document.body.classList.add("lightbox-open");
    lightbox.querySelector("[data-action='close-lightbox']").focus();
  }));
  cards.forEach((card, index) => card.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    card.click();
    activeIndex = index;
  }));
  lightbox.querySelector("[data-action='close-lightbox']").addEventListener("click", close);
  lightbox.querySelector("[data-action='previous-photo']").addEventListener("click", () => show(activeIndex - 1));
  lightbox.querySelector("[data-action='next-photo']").addEventListener("click", () => show(activeIndex + 1));
  lightbox.addEventListener("click", (event) => { if (event.target === lightbox) close(); });
  document.addEventListener("keydown", (event) => {
    if (lightbox.hidden) return;
    if (event.key === "Escape") close();
    if (event.key === "ArrowLeft") show(activeIndex - 1);
    if (event.key === "ArrowRight") show(activeIndex + 1);
    if (event.key === "Tab") {
      const controls = [...lightbox.querySelectorAll("button")];
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
}
