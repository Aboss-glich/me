import { config } from "./config.js";
import { renderNavigation, renderFooter, renderMusicPlayer } from "./navigation.js";
import { animateEnter, burstConfetti, launchFireworks, revealOnScroll, startAmbientDecor } from "./animation-engine.js";
import { initGallery } from "./gallery.js";
import { initCake } from "./cake.js";
import { initGift } from "./gift.js";
import { initMusic } from "./music.js";
import { initEasterEggs, initMemoriesExperience, initTimeCapsule } from "./memories-experience.js";

const app = document.querySelector("#app");
const page = app?.dataset.page || "index";
const name = config.recipientName;
const THEME_KEY = "alya-birthday-theme";

function savedTheme() {
  try {
    return localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

function applyTheme(theme) {
  const nextTheme = theme === "dark" ? "dark" : "light";
  document.documentElement.dataset.theme = nextTheme;
  document.querySelectorAll("[data-theme-choice]").forEach((button) => {
    const active = button.dataset.themeChoice === nextTheme;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  try {
    localStorage.setItem(THEME_KEY, nextTheme);
  } catch {}
}

applyTheme(savedTheme());

function chapter(pageTitle, eyebrow, copy, content, options = {}) {
  const theme = options.theme || "";
  const nav = page === "index" ? "" : renderNavigation(page);
  const footer = page === "index" || page === "final" ? "" : renderFooter(page);
  return `${nav}${renderMusicPlayer()}<div class="site-main ambient-page ${theme}">
    ${content}
  </div>${footer}`;
}

function welcomePage() {
  const copy = `Happy Birthday, ${config.recipientNickname}! 🎂

Around 27 May 2025, Anime Girls and Boys GC mein apni pehli mulaqat hui thi. Pehle enemies-and-friends wali funny vibe thi, phir 1.5 years+ ki dosti, late-night talks, random masti aur Free Fire custom matches.

Tum funny, caring, naughty, supportive aur full all-rounder ho. Aaj ka din tumhare liye laughter, sukoon aur bohot saari khushiyan laaye.

From your friend Anmol — chalo, is chhoti si birthday universe ko explore karte hain. 💗`;
  return chapter("Birthday", "", "", `
    <section class="page-container welcome-hero">
      <div class="welcome-copy">
        <span class="eyebrow">${escapeHtml(config.birthdayDisplay)} · a day as lovely as you</span>
        <h1 class="gradient-text">Happiest<br>Birthday,<br>${escapeHtml(config.recipientNickname)}!</h1>
        <p class="script" style="font-size:1.75rem;color:var(--lavender-500)">Today, the universe celebrates YOU. 🌷</p>
        <p class="prose">${copy}</p>
        <a class="button" href="letter.html">Let's Explore Your Surprise <span aria-hidden="true">→</span></a>
      </div>
      <div class="birthday-art welcome-art" aria-label="Illustration of a birthday cake, balloons and flowers">
        <div class="art-orbit"></div><span class="art-sun">✦</span>
        <span class="balloon one"></span><span class="balloon two"></span><span class="balloon three"></span>
        <div class="cake-illustration floaty" aria-hidden="true"><div class="layer bottom"></div><div class="layer top"></div><span class="candle"></span><span class="flame"></span><span class="berry">🍓</span><span class="berry b2">🍓</span></div>
        <span class="floating-decor" style="top:72%;left:10%">✿</span><span class="floating-decor" style="right:9%;bottom:16%;animation-delay:-2s">♡</span>
      </div>
    </section>
  `);
}

function letterPage() {
  const fullLetter = config.letterContent;
  return chapter("Letter", "", "", `
    <section class="page-container">
      <header class="chapter-intro"><span class="eyebrow">Chapter two · a few words from the heart</span><h1>A Little Letter For You <span class="gradient-text">💌</span></h1><p>Some feelings are better written than spoken.</p></header>
      <div class="letter-actions"><button class="button button-secondary" data-action="reveal-letter" aria-expanded="false">Read the letter ✨</button></div>
      <article class="letter-paper reveal" aria-label="Birthday letter">
        <div class="letter-body" data-letter>${escapeHtml(fullLetter)}</div>
        <div class="letter-signature">With lots of good wishes,<br>${escapeHtml(config.senderName)}.</div>
      </article>
      <section class="time-capsule reveal" aria-labelledby="capsule-heading">
        <div class="capsule-art" aria-hidden="true"><span>✉</span><i>♡</i></div>
        <div class="capsule-copy"><span class="eyebrow">A note saved for your future self</span><h2 id="capsule-heading">Digital Time Capsule ⏳</h2><p>A sealed little letter with birthday wishes and real friendship memories.</p>
          <p class="capsule-countdown" data-capsule-countdown hidden></p>
          <button class="button" type="button" data-action="open-capsule" aria-expanded="false">Open your time capsule ✨</button>
          <p class="capsule-disclaimer" data-capsule-disclaimer hidden>A local countdown for fun only; it is not secure or server-enforced.</p>
        </div>
        <div class="capsule-letter" data-capsule-message hidden>${escapeHtml(config.timeCapsuleMessages[0] || "")}</div>
      </section>
    </section>`);
}

function memoriesPage() {
  const photos = config.galleryPhotos.map((source, index) => `
    <figure class="polaroid memory-photo reveal" tabindex="0" role="button" aria-label="Open memory photo ${index + 1}" data-caption="${escapeHtml(`${config.galleryCaptions[index] || "Alya's photo"} · ${config.galleryDates[index] || ""}`)}">
      <span class="tape" aria-hidden="true"></span><span class="memory-heart" aria-hidden="true">♡</span>
      <img src="${escapeHtml(source)}" alt="${escapeHtml(config.galleryCaptions[index] || "Alya's photo")}" loading="lazy" width="600" height="650">
      <figcaption>${escapeHtml(config.galleryCaptions[index] || "A little memory")}<small>${escapeHtml(config.galleryDates[index] || "")}</small></figcaption>
    </figure>`).join("");
  const gameCards = config.gamingMemories.map((item, index) => `
    <article class="game-memory reveal">
      <button class="game-memory-toggle" type="button" aria-expanded="false">
        <span class="game-screen">${item.image ? `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.caption)}" loading="lazy">` : `<span class="game-placeholder" aria-hidden="true"><span>✦</span><strong>FREE FIRE</strong><small>REAL MOMENT · NO SCREENSHOT</small></span>`}</span>
        <span class="game-card-copy"><span class="game-index">REAL MEMORY 0${index + 1}</span><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.caption)}</span><span class="game-open">Tap to reveal <span aria-hidden="true">↗</span></span></span>
      </button>
      <p class="game-note" hidden>${escapeHtml(item.description)}</p>
    </article>`).join("");
  const friends = config.groupMembers.map((friend, index) => {
    const wish = friend.birthdayWish || config.groupBirthdayMessages.find((item) => item.member === friend.name)?.message || "";
    return `
    <article class="friend-wish reveal">
      <button class="friend-wish-toggle" type="button" aria-expanded="false">
        <span class="anime-avatar member-monogram avatar-${index + 1}" aria-hidden="true">${friend.image ? `<img src="${escapeHtml(friend.image)}" alt="">` : escapeHtml(friend.name.slice(0, 1).toUpperCase())}</span>
        <span class="friend-wish-copy"><span class="friend-label">${friend.badge ? `${escapeHtml(friend.badge)} · ` : ""}Birthday note from</span><strong>${escapeHtml(friend.name)}</strong><span class="friend-reveal-label">Tap to open ✨</span></span>
        <span class="wish-heart" aria-hidden="true">♡</span>
      </button>
      <p class="friend-hidden-message" hidden>${escapeHtml(wish || "No birthday wish has been added yet. Add a real message in js/config.js.")}</p>
    </article>`;
  }).join("");
  const groupPhoto = config.groupPhoto;
  const groupMessages = config.groupMessages.map((message, index) => `<p class="chat-memory chat-memory-${index + 1} reveal"><span class="chat-dot" aria-hidden="true">♡</span>${escapeHtml(message)}</p>`).join("");
  const timeline = config.memoryTimeline.map((item, index) => `
    <article class="timeline-item reveal">
      <span class="timeline-dot" aria-hidden="true">${["♡", "✦", "✿", "🎂", "✨"][index % 5]}</span>
      <div class="timeline-card">
        <span class="timeline-meta">${escapeHtml(item.category)} <i>·</i> ${escapeHtml(item.date)}</span>
        ${item.image ? `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" loading="lazy">` : `<span class="timeline-placeholder" aria-hidden="true">✧</span>`}
        <h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.description)}</p>
      </div>
    </article>`).join("");
  const universeStars = config.friendshipMemories.map((memory, index) => `
    <button class="universe-star universe-star-${index + 1}" type="button" data-memory-id="${escapeHtml(memory.id)}" aria-label="Reveal memory: ${escapeHtml(memory.title)}">
      <span aria-hidden="true">✦</span><small>${escapeHtml(memory.title)}</small>
    </button>`).join("");
  const quizQuestions = config.friendshipQuizQuestions.map((item, index) => `
    <fieldset class="quiz-question" data-quiz-question="${index}" hidden>
      <legend>${escapeHtml(item.question)}</legend>
      ${item.options.map((option, optionIndex) => `<label class="quiz-option"><input type="radio" name="quiz-${index}" value="${escapeHtml(option)}"><span>${escapeHtml(option)}</span></label>`).join("")}
    </fieldset>`).join("");
  const bookPages = config.memoryBookPages.map((item, index) => `
    <article class="memory-book-page" data-book-page="${index}" ${index ? "hidden" : ""}>
      <span class="book-page-number">0${index + 1} / 0${config.memoryBookPages.length}</span>
      <span class="book-page-date">${escapeHtml(item.date)}</span>
      <h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.text)}</p>
    </article>`).join("");
  const instagramUrl = safeExternalUrl(config.recipientInstagram);
  const senderUrl = safeExternalUrl(config.senderInstagram);
  const gamingUrl = safeExternalUrl(config.gamingLinks.playTogetherURL);
  const playTogether = gamingUrl
    ? `<a class="button game-invite-button" href="${gamingUrl}" target="_blank" rel="noopener noreferrer">Play Together Again <span aria-hidden="true">↗</span></a>`
    : `<button class="button game-invite-button" type="button" data-action="play-together">Play Together Again <span aria-hidden="true">♡</span></button>`;
  const surpriseText = config.surpriseMessages[0] || "Add a friendship message for Alya here.";
  return chapter("Memories", "", "", `
    <section class="page-container memory-world">
      <header class="memory-hero">
        <div class="memory-hero-copy"><span class="eyebrow">Chapter three · photos, pixels & people</span><h1>A Little World Full of Beautiful <span class="gradient-text">Memories</span> 💗</h1><p>From our first GC hello around 27 May 2025 to late-night talks, Free Fire customs and all the group masti — this little world is for you, Alya 👽.</p><a class="button" href="#instagram-memories">Start Exploring <span aria-hidden="true">↓</span></a></div>
        <div class="memory-hero-art" aria-hidden="true">
          <span class="hero-orbit"></span><span class="hero-photo hero-photo-one"><img src="${escapeHtml(config.galleryPhotos[0])}" alt="" loading="lazy"></span><span class="hero-photo hero-photo-two"><img src="${escapeHtml(config.galleryPhotos[1] || config.galleryPhotos[0])}" alt="" loading="lazy"></span><span class="hero-photo hero-photo-three"><img src="${escapeHtml(config.galleryPhotos[2] || config.galleryPhotos[0])}" alt="" loading="lazy"></span>
          <span class="hero-butterfly">🦋</span><span class="hero-star hero-star-one">✦</span><span class="hero-star hero-star-two">✧</span><span class="hero-heart">♡</span>
        </div>
      </header>
      <nav class="memory-jump" aria-label="Memories page sections">
        <a href="#instagram-memories"><span>♡</span> Instagram</a><a href="#freefire-memories"><span>✦</span> Free Fire</a><a href="#friends-memories"><span>✿</span> GC</a><a href="#friendship-universe"><span>☄</span> Universe</a><a href="#memory-timeline"><span>⌁</span> Timeline</a><a href="#memory-book"><span>▤</span> Memory book</a>
      </nav>
      <section class="memory-section instagram-section" id="instagram-memories" aria-labelledby="instagram-heading">
        <header class="memory-section-heading"><span class="section-kicker">01 · little squares of joy</span><h2 id="instagram-heading">Alya on <span class="gradient-text">Instagram</span> 📸</h2><p>A few lovely snapshots, collected like little notes from Alya's photo album.</p>
          <div class="instagram-profiles">
            <div class="instagram-profile"><span class="instagram-avatar" aria-hidden="true">◎</span><span class="instagram-profile-copy"><strong>@${escapeHtml(config.recipientInstagramUsername)}</strong><small>Alya's Instagram</small></span><a class="button button-secondary social-button" href="${instagramUrl}" target="_blank" rel="noopener noreferrer">Visit Alya <span aria-hidden="true">↗</span></a></div>
            <div class="instagram-profile"><span class="instagram-avatar sender-avatar" aria-hidden="true">A</span><span class="instagram-profile-copy"><strong>@${escapeHtml(config.senderInstagramUsername)}</strong><small>Anmol · your friend</small></span><a class="button button-secondary social-button" href="${senderUrl}" target="_blank" rel="noopener noreferrer">Visit Anmol <span aria-hidden="true">↗</span></a></div>
          </div>
        </header>
        <div class="gallery-grid memory-gallery" aria-label="Instagram-inspired scrapbook gallery">${photos}</div>
        <span class="section-doodle doodle-heart" aria-hidden="true">♡</span><span class="section-doodle doodle-flower" aria-hidden="true">✿</span>
      </section>
      <section class="memory-section freefire-section" id="freefire-memories" aria-labelledby="freefire-heading">
        <header class="memory-section-heading"><span class="section-kicker">02 · one more round?</span><h2 id="freefire-heading">Free Fire <span class="gradient-text">Memories</span> 🎮</h2><p>Gaming partners, custom matches and all the fun — shown as a playful game-inspired scrapbook, not fake gameplay screenshots or stats.</p></header>
        <div class="game-memory-grid">${gameCards}</div>
        <div class="squad-note"><span class="squad-note-icon" aria-hidden="true">✧</span><p><strong>Gaming partners: Anmol + Alya</strong><br>Custom matches were especially fun. Real screenshots can be added later; no IDs, scores or ranks are made up.</p><span class="squad-note-icon" aria-hidden="true">♡</span></div>
        <div class="game-invite">${playTogether}<p data-game-message role="status" aria-live="polite"></p></div>
      </section>
      <section class="memory-section friends-section" id="friends-memories" aria-labelledby="friends-heading">
        <header class="memory-section-heading"><span class="section-kicker">03 · our little corner of the world</span><h2 id="friends-heading">${escapeHtml(config.groupName)} <span>💬</span></h2><p>The GC where we first met — with only clearly readable names from the supplied screenshots. These are memory notes, not copied chat messages.</p></header>
        <div class="group-scrapbook">
          <div class="group-photo-card">
            <span class="group-tape" aria-hidden="true"></span>
            ${groupPhoto ? `<img src="${escapeHtml(groupPhoto)}" alt="Anime Girls and Boys GC header, cropped from the supplied screenshot" loading="lazy">` : `<div class="group-photo-placeholder"><span aria-hidden="true">✿</span><strong>Our group photo goes here</strong><small>Add a photo of your group in js/config.js.</small></div>`}
            <span class="group-photo-caption">our gc · where the story began ♡</span>
          </div>
          <div class="group-chat-note"><span class="chat-note-sparkle" aria-hidden="true">✧</span><p>Real friendship memories · no private chat quotes</p><div class="chat-memory-list">${groupMessages}</div></div>
        </div>
        <h3 class="hall-of-fame-heading">GC Hall of Fame 🏆</h3>
        <div class="friend-wishes" aria-label="Group members and editable birthday wishes">${friends}</div>
        <blockquote class="group-appreciation">${escapeHtml(config.groupAppreciation)} <span>💗</span></blockquote>
        <p class="memory-edit-hint">Unreadable names were left out. Add real profile images and birthday wishes in <code>js/config.js</code>.</p>
      </section>
      <section class="memory-section timeline-section" id="memory-timeline" aria-labelledby="timeline-heading">
        <header class="memory-section-heading"><span class="section-kicker">04 · little moments, along the way</span><h2 id="timeline-heading">Our Memory <span class="gradient-text">Timeline</span> ✨</h2><p>From our approximate first meeting to the real moments we still enjoy together.</p></header>
        <div class="memory-timeline">${timeline}</div>
      </section>
      <section class="memory-section universe-section" id="friendship-universe" aria-labelledby="universe-heading">
        <header class="memory-section-heading"><span class="section-kicker">05 · tap a star, revisit a real moment</span><h2 id="universe-heading">Friendship <span class="gradient-text">Universe</span> 🌌</h2><p>Four little stars for the first GC hello, late-night talks, Free Fire customs and group masti.</p></header>
        <div class="universe-sky" role="group" aria-label="Clickable friendship memories">${universeStars}<span class="universe-center" aria-hidden="true">A + A<br><small>friends</small></span></div>
        <dialog class="memory-dialog" data-memory-dialog aria-labelledby="memory-dialog-title">
          <button class="dialog-close" type="button" data-action="close-memory-dialog" aria-label="Close memory">×</button>
          <span class="section-kicker" data-dialog-date></span><h3 id="memory-dialog-title" data-dialog-title></h3><p data-dialog-description></p>
        </dialog>
      </section>
      <section class="memory-section random-memory-section" id="random-memory" aria-labelledby="random-heading">
        <header class="memory-section-heading"><span class="section-kicker">06 · a little surprise from the scrapbook</span><h2 id="random-heading">Surprise Me <span class="gradient-text">📸</span></h2><p>Pick a real photo or friendship memory. The same item won't appear twice in a row.</p></header>
        <div class="random-memory-display" data-random-display aria-live="polite">
          <img data-random-image alt="" hidden>
          <div class="random-memory-copy"><span class="section-kicker" data-random-title>A little memory is waiting</span><p data-random-caption>Tap the button to reveal one.</p></div>
        </div>
        <div class="random-memory-actions"><button class="button" type="button" data-action="random-memory">Surprise me ✨</button><button class="button button-secondary" type="button" data-action="favorite-memory" aria-pressed="false" disabled>♡ Save favorite</button><span data-random-status role="status" aria-live="polite"></span></div>
      </section>
      <section class="memory-section quiz-section" id="friendship-quiz" aria-labelledby="quiz-heading">
        <header class="memory-section-heading"><span class="section-kicker">07 · dosti ka pop quiz</span><h2 id="quiz-heading">Friendship <span class="gradient-text">Quiz</span> 🎮</h2><p>Only facts from our story — ready to test your memory?</p></header>
        <div class="friendship-quiz" data-quiz>
          <div class="quiz-progress"><span data-quiz-progress-text>Ready when you are</span><div><i data-quiz-progress-bar></i></div></div>
          ${quizQuestions}
          <p class="quiz-feedback" data-quiz-feedback role="status" aria-live="polite"></p>
          <div class="quiz-actions"><button class="button" type="button" data-action="quiz-start">Start the quiz</button><button class="button button-secondary" type="button" data-action="quiz-next" hidden>Next question</button><button class="button button-secondary" type="button" data-action="quiz-replay" hidden>Play again ↻</button></div>
        </div>
      </section>
      <section class="memory-section memory-book-section" id="memory-book" aria-labelledby="book-heading">
        <header class="memory-section-heading"><span class="section-kicker">08 · turn the pages of our friendship</span><h2 id="book-heading">Interactive <span class="gradient-text">Memory Book</span> 📖</h2><p>Use the buttons, arrow keys or a swipe to turn through five real chapters.</p></header>
        <div class="memory-book" data-memory-book tabindex="0" aria-label="Interactive friendship memory book">
          <div class="memory-book-spread">${bookPages}</div>
          <div class="memory-book-controls"><button class="icon-button" type="button" data-action="book-previous" aria-label="Previous page" disabled>←</button><span data-book-indicator>Page 1 of ${config.memoryBookPages.length}</span><button class="icon-button" type="button" data-action="book-next" aria-label="Next page">→</button></div>
        </div>
      </section>
      <section class="surprise-section" aria-labelledby="surprise-heading">
        <div class="surprise-copy"><span class="section-kicker">A tiny keepsake, tucked away</span><h2 id="surprise-heading">Surprise Memory Box 🎁</h2><p>There's a little note waiting inside. Open it when you're ready.</p></div>
        <button class="surprise-box" type="button" data-action="open-memory-box" aria-expanded="false" aria-label="Open the surprise memory box">
          <span class="surprise-lid"><i></i></span><span class="surprise-body"><i></i><b>♡</b></span><span class="surprise-bow" aria-hidden="true">✿</span>
        </button>
        <div class="surprise-reveal" data-surprise-reveal hidden><p>${escapeHtml(surpriseText)}</p>${config.memoryTimeline[0]?.image ? `<img src="${escapeHtml(config.memoryTimeline[0].image)}" alt="A memory tucked inside the box" loading="lazy">` : ""}</div>
      </section>
      <section class="friendship-ending" aria-labelledby="ending-heading">
        <span class="ending-moon" aria-hidden="true">☾</span><span class="ending-spark ending-spark-one" aria-hidden="true">✦</span><span class="ending-spark ending-spark-two" aria-hidden="true">✧</span>
        <span class="section-kicker">From Anmol · your friend</span><h2 id="ending-heading">Our Little World, Always</h2>
        <p>${escapeHtml(config.finalMessage)}</p>
        <button class="button replay-memories" type="button" data-action="replay-memories">Replay Our Memories <span aria-hidden="true">↑</span></button>
      </section>
      <div class="lightbox" role="dialog" aria-modal="true" aria-label="Instagram memory photo viewer" hidden>
        <button class="icon-button" data-action="previous-photo" aria-label="Previous photo"><i data-lucide="chevron-left">‹</i></button>
        <figure><img alt=""><figcaption></figcaption></figure>
        <button class="icon-button" data-action="next-photo" aria-label="Next photo"><i data-lucide="chevron-right">›</i></button>
        <button class="icon-button lightbox-close" data-action="close-lightbox" aria-label="Close photo viewer"><i data-lucide="x">×</i></button>
      </div>
    </section>`);
}

function safeExternalUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? escapeHtml(url.href) : "";
  } catch {
    return "";
  }
}

function specialPage() {
  const paragraph = `Alya, you're funny, caring, naughty, supportive and a total all-rounder — dosti mein roast bhi, support bhi, aur masti toh full. From our first GC meeting ${config.firstMeetingDate} to late-night talks, Free Fire custom matches and group memories, you've made this ${config.friendshipDuration} friendship genuinely special. 💗`;
  const cards = config.specialMessages.map((item, index) => `<article class="special-card card reveal" tabindex="0" style="--delay:${index * 70}ms"><span class="card-icon" aria-hidden="true">${item.icon}</span><h2>${item.title}</h2><p>${item.message}</p></article>`).join("");
  return chapter("You", "", "", `
    <section class="page-container">
      <header class="chapter-intro"><span class="eyebrow">Chapter four · a little reminder from Anmol</span><h1>Things That Make <span class="gradient-text">You, You!</span> 🌸</h1><p>${escapeHtml(paragraph)}</p></header>
      <div class="special-grid">${cards}</div>
      <blockquote class="quote-panel reveal">“Alya: all-rounder mode, always on. 💗”</blockquote>
    </section>`);
}

function cakePage() {
  const copy = `Aaj cake time hai, Alya 👽! Imagine Free Fire customs ke baad ek birthday cake — no match stats, bas candles, dosti aur full celebration. 🥳

Make a wish for yourself and blow out the candles when you're ready. I hope the year ahead brings you happiness, laughter and lovely new memories.`;
  return chapter("Cake", "", "", `
    <section class="page-container cake-layout">
      <div class="cake-stage"><div class="interactive-cake" role="img" aria-label="Three-layer pink and lavender birthday cake with three candles">
        <div class="cake-plate"></div><div class="cake-tier bottom"></div><div class="cake-tier middle"></div><div class="cake-tier top"></div>
        <div class="candle-set"><span class="candle"><i class="flame"></i></span><span class="candle"><i class="flame"></i></span><span class="candle"><i class="flame"></i></span></div>
      </div></div>
      <div class="cake-copy"><span class="eyebrow">Chapter five · make a wish</span><h1>Now It's <span class="gradient-text">Cake Time!</span> 🎂</h1>
        <p>${copy}</p>
        <button class="button" data-action="blow-candles">Blow the Candles 💨</button>
        <button class="button button-quiet" data-action="reset-cake" style="margin-left:.5rem">Reset cake ↻</button>
        <div class="celebration-message" role="status" aria-live="polite">YAYYY! 🥳<br><br>May every beautiful wish of yours come true.<br>Stay happy, stay blessed and keep shining!</div>
      </div>
    </section>`);
}

function giftPage() {
  const copy = `One small birthday gift from your friend Anmol — made with dosti, a little extra effort and all the real memories we have collected so far.

From our GC hello to late-night talks and Free Fire customs, here's a tiny reminder that you're a genuinely special friend. 💗`;
  const message = `Happy Birthday, Alya 👽!

Funny, caring, naughty, supportive, all-rounder — tum apni iconic energy aise hi rakhna. Wishing you a year full of laughter, good people and happy moments.

Lots of dosti,
Anmol 💗`;
  return chapter("Gift", "", "", `
    <section class="page-container gift-layout">
      <div class="gift-stage" aria-label="A wrapped birthday gift">
        <div class="gift-message" role="status" aria-live="polite"><p>${message}</p></div>
        <div class="gift-box" aria-hidden="true"><div class="gift-base"></div><div class="gift-lid"></div><div class="gift-bow"></div><span class="gift-heart">♥</span></div>
      </div>
      <div class="gift-copy"><span class="eyebrow">Chapter six · just one more thing</span><h1>One Last Little <span class="gradient-text">Surprise...</span></h1>
        <p>${copy}</p><button class="button" data-action="open-gift" aria-expanded="false">Unwrap Your Gift 🎁</button>
      </div>
    </section>`);
}

function finalPage() {
  const copy = config.finaleMessages[0] || `${config.finalMessage}\n\nWith lots of dosti,\n${config.senderName}`;
  return chapter("The End", "", "", `
    <section class="page-container final-page-content">
      <div class="star-field" aria-hidden="true">${Array.from({ length: 28 }, (_, i) => `<span style="left:${(i * 37 + 8) % 97}%;top:${(i * 53 + 7) % 83}%;animation-delay:${(i % 7) * .34}s">✦</span>`).join("")}</div>
      <span class="moon" aria-hidden="true"></span>
      <header class="chapter-intro finale-title"><span class="eyebrow">The grand finale · from Anmol, your friend</span><h1>Happiest Birthday, <span class="gradient-text">${escapeHtml(config.recipientNickname)}</span>! <span>🎆</span></h1></header>
      <p class="final-copy">${escapeHtml(copy)}</p>
      <div class="final-signature">Made with lots of dosti, just for you.<br><br>${escapeHtml(config.senderName)} 💗</div>
      <div class="finale-actions"><button class="button" type="button" data-action="replay-finale">Replay the finale 🎆</button><a class="button button-secondary" href="index.html" data-action="replay">Start the birthday journey again ↻</a></div>
      <footer class="chapter-footer final-footer"><span>Some people deserve their own little universe. ✨</span></footer>
    </section>`, { theme: "final-page" });
}

function invitationPage() {
  return `<section class="invitation ambient-page">
    <div class="theme-picker" role="group" aria-label="Choose website theme">
      <button type="button" data-theme-choice="light" aria-label="Use light theme">☀️ <span>Light</span></button>
      <button type="button" data-theme-choice="dark" aria-label="Use dark theme">🌙 <span>Dark</span></button>
    </div>
    <span class="floating-decor" style="top:14%;left:14%">✦</span><span class="floating-decor" style="top:24%;right:17%;animation-delay:-2s">♡</span>
    <span class="floating-decor" style="bottom:16%;left:18%;animation-delay:-1s">✿</span><span class="floating-decor" style="bottom:22%;right:14%;animation-delay:-3s">✧</span>
    <div class="orb" style="top:8%;left:4%"></div><div class="orb" style="right:5%;bottom:5%;animation-delay:-3s"></div>
    <div class="invitation-copy"><span class="eyebrow">18 November 2026 · a little secret, just for you</span><h1 class="script gradient-text">pssst... ${escapeHtml(config.recipientNickname)}! 💗</h1>
      <p>Ek chhoti si surprise hai tumhare liye.</p><p>Anmol made a little birthday world for a very special friend.</p>
    </div>
    <div class="envelope-scene" aria-label="A sealed birthday invitation"><div class="envelope">
      <div class="envelope-letter"><span>For you, ${name} ♡</span></div><span class="wax-seal" aria-hidden="true">♥</span>
    </div></div>
    <button class="button" data-action="open-envelope">Open Your Surprise ✨</button>
    <div class="toast" role="status" aria-live="polite"></div>
  </section>${renderMusicPlayer()}`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
}

const renderers = {
  index: invitationPage,
  welcome: welcomePage,
  letter: letterPage,
  memories: memoriesPage,
  special: specialPage,
  cake: cakePage,
  gift: giftPage,
  final: finalPage
};

if (app) {
  app.innerHTML = renderers[page] ? renderers[page]() : invitationPage();
  applyTheme(savedTheme());
  document.querySelectorAll("[data-theme-choice]").forEach((button) => {
    button.addEventListener("click", () => applyTheme(button.dataset.themeChoice));
  });
  app.querySelectorAll("img:not(.lightbox img):not([data-random-image])").forEach((image) => {
    image.addEventListener("error", () => {
      const fallback = document.createElement("span");
      fallback.className = "image-fallback";
      fallback.textContent = image.alt
        ? `${image.alt} is unavailable. Check its image path in js/config.js.`
        : "A local photo is unavailable.";
      if (!image.alt) fallback.setAttribute("aria-hidden", "true");
      else fallback.setAttribute("role", "img");
      image.replaceWith(fallback);
    }, { once: true });
  });
  if (page !== "index") {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    document.body.append(toast);
  }
  startAmbientDecor();
  revealOnScroll();
  animateEnter();
  initMusic();
  initEasterEggs();
  initTimeCapsule();
  if (page === "memories") {
    initGallery();
    initMemoriesExperience();
  }
  if (page === "cake") initCake();
  if (page === "gift") initGift();
  if (page === "final") launchFireworks(4);
  document.querySelector('[data-action="replay-finale"]')?.addEventListener("click", () => launchFireworks(5));
  if (window.lucide) window.lucide.createIcons();
  document.querySelectorAll(".special-card").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      if (event.pointerType === "touch" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const bounds = card.getBoundingClientRect();
      const rotateX = ((event.clientY - bounds.top) / bounds.height - .5) * -8;
      const rotateY = ((event.clientX - bounds.left) / bounds.width - .5) * 8;
      card.style.transform = `perspective(700px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });
    card.addEventListener("pointerleave", () => { card.style.transform = ""; });
  });
  const revealButton = document.querySelector('[data-action="reveal-letter"]');
  if (revealButton) {
    const letter = document.querySelector("[data-letter]");
    const fullText = letter.textContent;
    letter.textContent = "";
    let timer;
    const revealFull = () => {
      window.clearInterval(timer);
      letter.textContent = fullText;
      revealButton.setAttribute("aria-expanded", "true");
      revealButton.textContent = "The whole letter, just for you 💗";
    };
    const startTyping = () => {
      let cursor = 0;
      timer = window.setInterval(() => {
        cursor = Math.min(cursor + 7, fullText.length);
        letter.textContent = fullText.slice(0, cursor);
        if (cursor >= fullText.length) window.clearInterval(timer);
      }, 18);
    };
    revealButton.addEventListener("click", revealFull);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) revealFull();
    else window.setTimeout(startTyping, 450);
  }

  document.querySelector('[data-action="open-envelope"]')?.addEventListener("click", (event) => {
    const button = event.currentTarget;
    const envelope = document.querySelector(".envelope");
    if (button.disabled) return;
    button.disabled = true;
    button.textContent = "A little magic is on its way…";
    envelope.classList.add("is-open");
    burstConfetti(window.innerWidth / 2, window.innerHeight / 2, 48);
    window.setTimeout(() => { window.location.href = "welcome.html"; }, 1150);
  });

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href$='.html']");
    if (!link || link.target || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.dataset.action === "replay") return;
    const curtain = document.querySelector(".transition-curtain");
    if (!curtain || page === "index") return;
    event.preventDefault();
    const destination = link.href;
    if (window.gsap && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      window.gsap.to(curtain, { scaleY: 1, opacity: 1, transformOrigin: "bottom", duration: .38, ease: "power2.in", onComplete: () => { window.location.href = destination; } });
    } else window.location.href = destination;
  });
}
