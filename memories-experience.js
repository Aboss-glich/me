import { config } from "./config.js";
import { burstConfetti } from "./animation-engine.js";

function announce(message) {
  const toast = document.querySelector(".toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.setTimeout(() => toast.classList.remove("is-visible"), 3600);
}

function initScrollMotion() {
  if (!window.gsap || !window.ScrollTrigger || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  window.gsap.registerPlugin(window.ScrollTrigger);
  window.gsap.utils.toArray(".memory-section, .surprise-section, .friendship-ending, .time-capsule").forEach((section) => {
    window.gsap.fromTo(section, { autoAlpha: 0, y: 22 }, {
      autoAlpha: 1,
      y: 0,
      duration: .7,
      ease: "power2.out",
      scrollTrigger: { trigger: section, start: "top 86%", once: true }
    });
  });
}

function initExternalLinks() {
  document.querySelector('[data-action="play-together"]')?.addEventListener("click", () => {
    const message = document.querySelector("[data-game-message]");
    message.textContent = config.gamingLinks.playTogetherMessage || "Add a real game invite link in js/config.js.";
    message.classList.add("is-visible");
  });
}

function initMemoryCards() {
  document.querySelectorAll(".game-memory-toggle, .friend-wish-toggle").forEach((button) => {
    button.addEventListener("click", () => {
      const card = button.closest(".game-memory, .friend-wish");
      const detail = card.querySelector(".game-note, .friend-hidden-message");
      const expanded = button.getAttribute("aria-expanded") !== "true";
      button.setAttribute("aria-expanded", String(expanded));
      detail.hidden = !expanded;
      card.classList.toggle("is-expanded", expanded);
      const label = button.querySelector(".friend-reveal-label");
      if (label) label.textContent = expanded ? "A little wish, just for you ♡" : "Tap to open ✨";
    });
  });
}

function initCardTilt() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  document.querySelectorAll(".game-memory, .friend-wish, .timeline-card").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      if (event.pointerType === "touch") return;
      const bounds = card.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - .5;
      const y = (event.clientY - bounds.top) / bounds.height - .5;
      card.style.setProperty("--tilt-x", `${y * -4}deg`);
      card.style.setProperty("--tilt-y", `${x * 5}deg`);
      card.classList.add("is-tilting");
    });
    card.addEventListener("pointerleave", () => {
      card.classList.remove("is-tilting");
      card.style.removeProperty("--tilt-x");
      card.style.removeProperty("--tilt-y");
    });
  });
}

function initSurpriseBox() {
  const button = document.querySelector('[data-action="open-memory-box"]');
  const reveal = document.querySelector("[data-surprise-reveal]");
  if (!button || !reveal) return;
  button.addEventListener("click", () => {
    const opened = button.getAttribute("aria-expanded") !== "true";
    button.setAttribute("aria-expanded", String(opened));
    button.setAttribute("aria-label", opened ? "Close the surprise memory box" : "Open the surprise memory box");
    reveal.hidden = !opened;
    button.classList.toggle("is-open", opened);
    if (opened) burstConfetti(window.innerWidth / 2, window.innerHeight * .55, 48);
  });
}

function initFriendshipUniverse() {
  const dialog = document.querySelector("[data-memory-dialog]");
  if (!dialog) return;
  const title = dialog.querySelector("[data-dialog-title]");
  const date = dialog.querySelector("[data-dialog-date]");
  const description = dialog.querySelector("[data-dialog-description]");
  document.querySelectorAll("[data-memory-id]").forEach((star) => {
    star.addEventListener("click", () => {
      const memory = config.friendshipMemories.find((item) => item.id === star.dataset.memoryId);
      if (!memory) return;
      title.textContent = memory.title;
      date.textContent = memory.date;
      description.textContent = memory.description;
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
    });
  });
  dialog.querySelector('[data-action="close-memory-dialog"]')?.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
}

function initRandomMemory() {
  const trigger = document.querySelector('[data-action="random-memory"]');
  const image = document.querySelector("[data-random-image]");
  if (!trigger || !image) return;
  const items = config.randomMemoryItems;
  const display = document.querySelector("[data-random-display]");
  const title = document.querySelector("[data-random-title]");
  const caption = document.querySelector("[data-random-caption]");
  const status = document.querySelector("[data-random-status]");
  const favoriteButton = document.querySelector('[data-action="favorite-memory"]');
  let activeItem;
  let previousIndex = -1;

  image.addEventListener("error", () => {
    image.hidden = true;
    display.classList.remove("has-image");
    status.textContent = "This memory's photo is unavailable. Check its image path in js/config.js.";
  });

  function readFavorites() {
    try {
      const saved = JSON.parse(localStorage.getItem("alya-favorite-memories") || "[]");
      return Array.isArray(saved) ? saved : [];
    } catch (error) {
      console.info("Favorite memories could not be read.", error);
      return [];
    }
  }

  function memoryKey(item) {
    return item.memoryId || item.image || item.title;
  }

  trigger.addEventListener("click", () => {
    if (!items.length) {
      status.textContent = "Add real photos or memories in js/config.js.";
      return;
    }
    let index = Math.floor(Math.random() * items.length);
    if (items.length > 1 && index === previousIndex) index = (index + 1 + Math.floor(Math.random() * (items.length - 1))) % items.length;
    previousIndex = index;
    activeItem = items[index];
    title.textContent = activeItem.title;
    caption.textContent = activeItem.caption;
    if (activeItem.image) {
      image.src = activeItem.image;
      image.alt = activeItem.title;
      image.hidden = false;
      display.classList.add("has-image");
    } else {
      image.removeAttribute("src");
      image.alt = "";
      image.hidden = true;
      display.classList.remove("has-image");
    }
    favoriteButton.disabled = false;
    favoriteButton.setAttribute("aria-pressed", String(readFavorites().includes(memoryKey(activeItem))));
    favoriteButton.textContent = favoriteButton.getAttribute("aria-pressed") === "true" ? "♥ Saved" : "♡ Save favorite";
    status.textContent = "A real photo or friendship memory, picked just for you.";
  });

  favoriteButton?.addEventListener("click", () => {
    if (!activeItem) return;
    const favorites = readFavorites();
    const key = memoryKey(activeItem);
    const alreadySaved = favorites.includes(key);
    const updated = alreadySaved ? favorites.filter((item) => item !== key) : [...favorites, key];
    try {
      localStorage.setItem("alya-favorite-memories", JSON.stringify(updated));
      favoriteButton.setAttribute("aria-pressed", String(!alreadySaved));
      favoriteButton.textContent = alreadySaved ? "♡ Save favorite" : "♥ Saved";
      status.textContent = alreadySaved ? "Removed from your saved memories." : "Saved in this browser's favorites.";
    } catch (error) {
      console.info("The favorite memory could not be saved.", error);
      status.textContent = "Favorites could not be saved in this browser.";
    }
  });
}

function initFriendshipQuiz() {
  const quiz = document.querySelector("[data-quiz]");
  if (!quiz) return;
  const questions = [...quiz.querySelectorAll("[data-quiz-question]")];
  const startButton = quiz.querySelector('[data-action="quiz-start"]');
  const nextButton = quiz.querySelector('[data-action="quiz-next"]');
  const replayButton = quiz.querySelector('[data-action="quiz-replay"]');
  const progressText = quiz.querySelector("[data-quiz-progress-text]");
  const progressBar = quiz.querySelector("[data-quiz-progress-bar]");
  const feedback = quiz.querySelector("[data-quiz-feedback]");
  let current = 0;
  let score = 0;
  let answered = false;

  function showQuestion(index) {
    questions.forEach((question, questionIndex) => { question.hidden = questionIndex !== index; });
    progressText.textContent = `Question ${index + 1} of ${questions.length}`;
    progressBar.style.width = `${(index / questions.length) * 100}%`;
    feedback.textContent = "";
    nextButton.hidden = true;
    answered = false;
  }

  startButton.addEventListener("click", () => {
    current = 0;
    score = 0;
    startButton.hidden = true;
    replayButton.hidden = true;
    showQuestion(current);
  });

  questions.forEach((question) => {
    question.addEventListener("change", (event) => {
      if (!event.target.matches("input[type=radio]")) return;
      nextButton.hidden = false;
    });
  });

  nextButton.addEventListener("click", () => {
    if (answered) return;
    const selected = questions[current].querySelector("input:checked");
    if (!selected) {
      feedback.textContent = "Choose one answer to keep going.";
      return;
    }
    answered = true;
    if (selected.value === config.friendshipQuizQuestions[current].answer) {
      score += 1;
      feedback.textContent = "Correct — memory unlocked! ✨";
    } else {
      feedback.textContent = `The real memory: ${config.friendshipQuizQuestions[current].answer}.`;
    }
    questions[current].querySelectorAll("input").forEach((input) => { input.disabled = true; });
    nextButton.textContent = current === questions.length - 1 ? "See your result" : "Next question";
    window.setTimeout(() => {
      if (!answered) return;
      current += 1;
      if (current < questions.length) {
        questions[current - 1].querySelectorAll("input").forEach((input) => { input.disabled = false; input.checked = false; });
        showQuestion(current);
        nextButton.textContent = current === questions.length - 1 ? "Finish quiz" : "Next question";
        return;
      }
      questions[current - 1].hidden = true;
      progressText.textContent = `Quiz complete · ${score} / ${questions.length}`;
      progressBar.style.width = "100%";
      feedback.textContent = score === questions.length
        ? "Perfect memory! GC lore expert unlocked. 👽"
        : "Friendship lore refreshed — now you know the real story even better. 💗";
      nextButton.hidden = true;
      replayButton.hidden = false;
    }, 750);
  });

  replayButton.addEventListener("click", () => {
    questions.forEach((question) => {
      question.hidden = true;
      question.querySelectorAll("input").forEach((input) => { input.disabled = false; input.checked = false; });
    });
    nextButton.textContent = "Next question";
    nextButton.hidden = true;
    replayButton.hidden = true;
    startButton.hidden = false;
    progressText.textContent = "Ready when you are";
    progressBar.style.width = "0";
    feedback.textContent = "";
  });
}

function initMemoryBook() {
  const book = document.querySelector("[data-memory-book]");
  if (!book) return;
  const pages = [...book.querySelectorAll("[data-book-page]")];
  const previous = book.querySelector('[data-action="book-previous"]');
  const next = book.querySelector('[data-action="book-next"]');
  const indicator = book.querySelector("[data-book-indicator]");
  const spread = book.querySelector(".memory-book-spread");
  const turnDuration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 220;
  let current = 0;
  let pointerStart;
  let turning = false;

  function turnPage(direction) {
    const target = Math.min(pages.length - 1, Math.max(0, current + direction));
    if (turning || target === current) return;
    turning = true;
    spread.classList.toggle("is-turning-back", direction < 0);
    spread.classList.toggle("is-turning-forward", direction > 0);
    window.setTimeout(() => {
      pages[current].hidden = true;
      current = target;
      pages[current].hidden = false;
      indicator.textContent = `Page ${current + 1} of ${pages.length}`;
      previous.disabled = current === 0;
      next.disabled = current === pages.length - 1;
      spread.classList.remove("is-turning-back", "is-turning-forward");
      turning = false;
    }, turnDuration);
  }

  previous.addEventListener("click", () => turnPage(-1));
  next.addEventListener("click", () => turnPage(1));
  book.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      turnPage(-1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      turnPage(1);
    }
  });
  book.addEventListener("pointerdown", (event) => { pointerStart = event.clientX; });
  book.addEventListener("pointerup", (event) => {
    if (pointerStart === undefined) return;
    const distance = event.clientX - pointerStart;
    pointerStart = undefined;
    if (Math.abs(distance) > 48) turnPage(distance < 0 ? 1 : -1);
  });
}

export function initTimeCapsule() {
  const button = document.querySelector('[data-action="open-capsule"]');
  const message = document.querySelector("[data-capsule-message]");
  if (!button || !message) return;
  const countdown = document.querySelector("[data-capsule-countdown]");
  const disclaimer = document.querySelector("[data-capsule-disclaimer]");
  const unlockTime = config.timeCapsuleUnlockDate ? Date.parse(config.timeCapsuleUnlockDate) : 0;
  let timer;

  function updateCountdown() {
    const remaining = unlockTime - Date.now();
    if (remaining <= 0) {
      button.disabled = false;
      button.textContent = "Your time capsule is ready ✨";
      countdown.textContent = "Unlocked — open your birthday letter.";
      window.clearInterval(timer);
      return;
    }
    button.disabled = true;
    countdown.hidden = false;
    disclaimer.hidden = false;
    const days = Math.floor(remaining / 86400000);
    const hours = Math.floor((remaining % 86400000) / 3600000);
    const minutes = Math.floor((remaining % 3600000) / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    countdown.textContent = `Unlocks in ${days}d ${hours}h ${minutes}m ${seconds}s`;
  }

  if (config.timeCapsuleUnlockDate) {
    if (!Number.isFinite(unlockTime)) {
      countdown.hidden = false;
      countdown.textContent = "The configured unlock date is invalid. Check js/config.js.";
    } else if (unlockTime > Date.now()) {
      updateCountdown();
      timer = window.setInterval(updateCountdown, 1000);
    }
  }

  button.addEventListener("click", () => {
    if (button.disabled) return;
    const open = button.getAttribute("aria-expanded") !== "true";
    button.setAttribute("aria-expanded", String(open));
    message.hidden = !open;
    button.textContent = open ? "Close your time capsule ✕" : "Open your time capsule ✨";
  });
}

export function initEasterEggs() {
  const page = document.querySelector("#app")?.dataset.page || "index";
  const pageIds = ["index", ...config.pages.map((item) => item.id)];
  const key = `alya-easter-egg-${page}`;
  const pageIndex = Math.max(0, pageIds.indexOf(page));
  const button = document.createElement("button");
  button.className = `easter-egg easter-egg-${pageIndex % 4}`;
  button.type = "button";
  button.textContent = ["✦", "♡", "👽", "✧"][pageIndex % 4];
  button.setAttribute("aria-label", "Find a tiny birthday easter egg");
  button.title = "There's a tiny secret here";
  const counter = document.createElement("span");
  counter.className = "easter-egg-counter";
  counter.setAttribute("aria-live", "polite");
  counter.hidden = true;
  document.body.append(button, counter);

  function readProgress() {
    try {
      const saved = JSON.parse(localStorage.getItem("alya-easter-eggs") || "[]");
      return Array.isArray(saved) ? saved : [];
    } catch (error) {
      console.info("Easter egg progress could not be read.", error);
      return [];
    }
  }

  button.addEventListener("click", () => {
    const progress = readProgress();
    if (!progress.includes(key)) progress.push(key);
    try {
      localStorage.setItem("alya-easter-eggs", JSON.stringify(progress));
    } catch (error) {
      console.info("Easter egg progress could not be saved.", error);
    }
    counter.hidden = false;
    counter.textContent = `${progress.length} / ${pageIds.length} secrets found`;
    announce(config.easterEggs[pageIndex % config.easterEggs.length] || "A little birthday secret for Alya 💗");
    button.classList.add("is-found");
  });
}

export function initMemoriesExperience() {
  document.body.classList.add("memories-page");
  initScrollMotion();
  initExternalLinks();
  initMemoryCards();
  initCardTilt();
  initSurpriseBox();
  initFriendshipUniverse();
  initRandomMemory();
  initFriendshipQuiz();
  initMemoryBook();
  document.querySelector('[data-action="replay-memories"]')?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  });
}
