const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function revealOnScroll() {
  const items = document.querySelectorAll(".reveal");
  if (reducedMotion || !("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("is-in-view"));
    return;
  }
  const observer = new IntersectionObserver((entries, instance) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-in-view");
        instance.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  items.forEach((item) => observer.observe(item));
}

export function startAmbientDecor() {
  const page = document.querySelector(".ambient-page");
  if (!page || reducedMotion) return;
  const decor = document.createElement("div");
  decor.className = "ambient-decor";
  decor.setAttribute("aria-hidden", "true");
  decor.innerHTML = '<span class="orb orb-a"></span><span class="orb orb-b"></span><span class="orb orb-c"></span><span class="butterfly butterfly-a">🦋</span><span class="butterfly butterfly-b">🦋</span><span class="petal petal-a">✿</span><span class="petal petal-b">❀</span><span class="petal petal-c">✿</span><span class="ambient-heart heart-a">♡</span>';
  page.prepend(decor);
}

export function launchFireworks(count = 3) {
  if (reducedMotion) return;
  for (let index = 0; index < Math.min(count, 5); index += 1) {
    const burst = document.createElement("span");
    burst.className = "firework-burst";
    burst.setAttribute("aria-hidden", "true");
    burst.style.left = `${18 + Math.random() * 64}%`;
    burst.style.top = `${16 + Math.random() * 45}%`;
    burst.style.animationDelay = `${index * .18}s`;
    document.body.append(burst);
    window.setTimeout(() => burst.remove(), 1500 + index * 180);
  }
}

export function burstConfetti(originX = window.innerWidth / 2, originY = window.innerHeight * .42, count = 64) {
  if (reducedMotion) return;
  const palette = ["#ef7fae", "#d5c4ff", "#e8c98c", "#ffc9de", "#ffffff"];
  const total = Math.min(count, 100);
  for (let index = 0; index < total; index += 1) {
    const piece = document.createElement("span");
    const angle = (Math.PI * 2 * index) / total;
    const drift = `${Math.cos(angle) * (80 + Math.random() * 180)}px`;
    piece.className = "particle";
    piece.style.left = `${originX}px`;
    piece.style.top = `${originY}px`;
    piece.style.background = palette[index % palette.length];
    piece.style.setProperty("--drift", drift);
    piece.style.animationDelay = `${Math.random() * .28}s`;
    document.body.append(piece);
    window.setTimeout(() => piece.remove(), 3900);
  }
}

export function animateEnter() {
  if (window.gsap && !reducedMotion) {
    window.gsap.from(".site-nav, .chapter-intro, .welcome-copy, .welcome-art, .letter-paper, .special-card, .cake-stage, .gift-stage", {
      opacity: 0, y: 18, duration: .8, stagger: .08, ease: "power2.out", clearProps: "all"
    });
  }
  if (window.gsap && window.ScrollTrigger) window.gsap.registerPlugin(window.ScrollTrigger);
}
