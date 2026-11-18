import { config } from "./config.js";

const SESSION_KEY = "alya-birthday-music-session";
const VOLUME_KEY = "alya-music-volume";

function localTrackSource(track) {
  const source = String(track?.src || "").trim();
  return source.startsWith("assets/audio/") && !source.split(/[\\/]/).includes("..") ? source : "";
}

function showMessage(message) {
  const toast = document.querySelector(".toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.setTimeout(() => toast.classList.remove("is-visible"), 3200);
}

export function initMusic() {
  const player = document.querySelector(".shared-music-player");
  if (!player) return;

  const tracks = config.musicTracks.filter((track) => track?.title && localTrackSource(track));
  const title = player.querySelector("[data-track-title]");
  const status = player.querySelector("[data-player-status]");
  const trackSelect = player.querySelector("[data-track-select]");
  const volumeControl = player.querySelector("#music-volume");
  const playButtons = [...document.querySelectorAll('[data-action="music"]')];
  const previousButtons = [...player.querySelectorAll('[data-action="previous-track"]')];
  const nextButtons = [...player.querySelectorAll('[data-action="next-track"]')];
  let audio;
  let currentIndex = 0;
  let volume = 0.35;
  let resumeTime = 0;
  let resumePrompt = false;

  try {
    const savedVolume = Number(localStorage.getItem(VOLUME_KEY));
    if (Number.isFinite(savedVolume)) volume = Math.min(1, Math.max(0, savedVolume));
  } catch (error) {
    console.info("The music volume preference could not be read.", error);
  }
  try {
    const saved = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
    if (saved && Number.isInteger(saved.index) && saved.index >= 0 && saved.index < tracks.length) {
      currentIndex = saved.index;
      resumeTime = Number.isFinite(saved.time) ? Math.max(0, saved.time) : 0;
      resumePrompt = Boolean(saved.wasPlaying);
    }
  } catch (error) {
    console.info("The previous music position could not be restored.", error);
  }

  function setStatus(message) {
    status.textContent = message;
  }

  function updateTrackLabel(message) {
    const track = tracks[currentIndex];
    title.textContent = track ? `${track.title} · ${track.artist}` : "No local songs configured";
    if (trackSelect) trackSelect.value = String(currentIndex);
    if (message) setStatus(message);
  }

  function updatePlaybackState(playing) {
    player.classList.toggle("is-playing", playing);
    playButtons.forEach((button) => {
      button.setAttribute("aria-pressed", String(playing));
      button.setAttribute("aria-label", playing ? "Pause birthday music" : "Play birthday music");
      button.title = playing ? "Pause birthday music" : "Play birthday music";
      button.textContent = playing ? "Ⅱ" : "♫";
    });
  }

  function createAudio() {
    const track = tracks[currentIndex];
    if (!track) return null;
    audio?.pause();
    audio = new Audio(localTrackSource(track));
    audio.preload = "none";
    audio.volume = volume;
    audio.addEventListener("loadedmetadata", () => {
      if (resumeTime > 0 && resumeTime < audio.duration) audio.currentTime = resumeTime;
      resumeTime = 0;
    }, { once: true });
    audio.addEventListener("ended", () => {
      if (tracks.length > 1) changeTrack(currentIndex + 1, true);
      else {
        updatePlaybackState(false);
        setStatus("Track finished — press play to listen again.");
      }
    });
    audio.addEventListener("error", () => {
      updatePlaybackState(false);
      setStatus("This song could not be loaded. Check its local file in js/config.js.");
      showMessage("A local song is missing or could not be played. Check assets/audio.");
    }, { once: true });
    return audio;
  }

  async function play() {
    if (!tracks.length) {
      setStatus("Add local MP3 files under assets/audio and list them in js/config.js.");
      return;
    }
    if (!audio) createAudio();
    try {
      await audio.play();
      updatePlaybackState(true);
      resumePrompt = false;
      setStatus(`Now playing · ${tracks[currentIndex].title}`);
    } catch (error) {
      updatePlaybackState(false);
      setStatus("This song could not be played. Check the local file path.");
      showMessage("The selected birthday song could not be played. Check its file in assets/audio.");
      console.info("The selected local birthday song could not be played.", error);
    }
  }

  function pause() {
    if (!audio) return;
    audio.pause();
    updatePlaybackState(false);
    setStatus(`Paused · ${tracks[currentIndex].title}`);
  }

  function changeTrack(index, continuePlaying = false) {
    const wasPlaying = continuePlaying || Boolean(audio && !audio.paused);
    currentIndex = (index + tracks.length) % tracks.length;
    audio?.pause();
    audio = null;
    resumeTime = 0;
    resumePrompt = false;
    updatePlaybackState(false);
    updateTrackLabel(wasPlaying ? "Loading the next song…" : "Ready when you are — press play.");
    if (wasPlaying) play();
  }

  function saveSession() {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({
        index: currentIndex,
        time: audio?.currentTime || 0,
        wasPlaying: Boolean(audio && !audio.paused)
      }));
    } catch (error) {
      console.info("The music position could not be saved for the next page.", error);
    }
  }

  playButtons.forEach((button) => button.addEventListener("click", () => {
    if (audio && !audio.paused) pause();
    else play();
  }));
  previousButtons.forEach((button) => button.addEventListener("click", () => changeTrack(currentIndex - 1)));
  nextButtons.forEach((button) => button.addEventListener("click", () => changeTrack(currentIndex + 1)));
  trackSelect?.addEventListener("change", () => changeTrack(Number(trackSelect.value)));
  volumeControl.value = String(volume);
  volumeControl.addEventListener("input", () => {
    volume = Number(volumeControl.value);
    if (audio) audio.volume = volume;
    try {
      localStorage.setItem(VOLUME_KEY, String(volume));
    } catch (error) {
      console.info("The music volume preference could not be saved.", error);
    }
  });
  [...previousButtons, ...nextButtons].forEach((button) => { button.disabled = tracks.length < 2; });
  if (trackSelect) trackSelect.disabled = tracks.length === 0;
  updateTrackLabel();
  updatePlaybackState(false);
  if (resumePrompt) setStatus(`Ready to resume · ${tracks[currentIndex].title} · press play`);
  else if (!tracks.length) setStatus("Add local MP3 files under assets/audio.");
  window.addEventListener("pagehide", saveSession, { once: true });
}
