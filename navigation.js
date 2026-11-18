import { config } from "./config.js";

const journey = [{ id: "index", href: "index.html" }, ...config.pages];

export function renderNavigation(page) {
  const index = journey.findIndex((item) => item.id === page);
  const current = Math.max(index, 0);
  const previous = current > 0 ? journey[current - 1] : journey[0];
  const next = current < journey.length - 1 ? journey[current + 1] : journey[0];
  const links = config.pages.map((item) =>
    `<a href="${item.href}" ${item.id === page ? 'aria-current="page"' : ""}>${item.label}</a>`
  ).join("");
  return `
    <div class="progress-track" role="progressbar" aria-label="Birthday journey progress" aria-valuemin="1" aria-valuemax="${journey.length}" aria-valuenow="${current + 1}">
      <div class="progress-fill" style="--progress:${((current + 1) / journey.length) * 100}%"></div>
    </div>
    <nav class="site-nav" aria-label="Main navigation">
      <a class="brand" href="index.html"><span class="brand-mark" aria-hidden="true">♥</span> Alya's little world</a>
      <div class="nav-links">${links}</div>
      <div class="nav-tools">
        <a class="icon-button" href="${previous.href}" aria-label="Previous chapter" title="Previous chapter"><i data-lucide="arrow-left">←</i></a>
        <a class="icon-button" href="${next.href}" aria-label="Next chapter" title="Next chapter"><i data-lucide="arrow-right">→</i></a>
      </div>
    </nav>`;
}

export function renderMusicPlayer() {
  const tracks = config.musicTracks.map((track, index) =>
    `<option value="${index}">${escapeHtml(track.title)} · ${escapeHtml(track.artist)}</option>`
  ).join("");
  return `<aside class="shared-music-player" aria-label="Birthday soundtrack player">
    <div class="shared-player-top">
      <span class="player-orb" aria-hidden="true">♫</span>
      <div class="shared-player-track"><span class="player-label">ALYA'S SOUNDTRACK</span><strong data-track-title>${escapeHtml(config.musicTracks[0]?.title || "Choose a birthday song")}</strong><span class="shared-player-visualizer" aria-hidden="true">${Array.from({ length: 7 }, (_, index) => `<i style="--bar:${index}"></i>`).join("")}</span><small data-player-status>Press play when you're ready</small></div>
      <div class="shared-player-controls">
        <button class="player-button" type="button" data-action="previous-track" aria-label="Previous track">‹</button>
        <button class="player-button player-play" type="button" data-action="music" aria-label="Play birthday music" aria-pressed="false">▶</button>
        <button class="player-button" type="button" data-action="next-track" aria-label="Next track">›</button>
      </div>
    </div>
    <details class="shared-player-options">
      <summary>Playlist &amp; volume</summary>
      <label for="music-track-select">Choose a song</label>
      <select id="music-track-select" data-track-select>${tracks}</select>
      <label for="music-volume">Volume</label>
      <input id="music-volume" type="range" min="0" max="1" step="0.05" value="0.35" aria-label="Music volume">
      <p class="music-continuity-note">After changing pages, press play to resume the last track.</p>
    </details>
  </aside>`;
}

export function renderFooter(page) {
  const index = journey.findIndex((item) => item.id === page);
  const previous = index > 0 ? journey[index - 1] : journey[0];
  const next = index >= 0 && index < journey.length - 1 ? journey[index + 1] : journey[0];
  const nextLabel = page === "final" ? "Begin again ↻" : "Next chapter →";
  return `<footer class="chapter-footer"><a class="button button-secondary" href="${previous.href}">← Previous</a><span>Made with a little extra love <span aria-hidden="true">♡</span></span><a class="button" href="${next.href}">${nextLabel}</a></footer>`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
}
