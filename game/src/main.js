// Lantern Town — Spot the Difference.
// A complete spot-the-difference game: two near-identical hand-drawn scenes
// side by side, 7 differences per round, 3 rounds. Click a difference on
// either panel to mark it. Keyboard: H hint, R restart, Enter advance.
// ?shot=start|play|play2|end&seed=N renders a fixed state for screenshots.

import { SCENES } from './scenes.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const W = 1280;
const H = 720;
canvas.width = W;
canvas.height = H;

const PANELS = [
  { x: 24, y: 92, w: 600, h: 520 },
  { x: 656, y: 92, w: 600, h: 520 },
];
const DIFF_TOTAL = 7;
const HINTS_PER_ROUND = 3;

const params = new URLSearchParams(location.search);
const shot = params.get('shot');

const state = {
  screen: 'title', // title | play | roundClear | win
  round: 0,
  found: new Set(),
  mistakes: 0,
  hintsLeft: HINTS_PER_ROUND,
  hintsUsed: 0,
  startedAt: 0,
  elapsed: 0, // seconds, frozen when a round clears
  totalMistakes: 0,
  totalHints: 0,
  totalTime: 0,
  wrongFlash: null, // { x, y, until }
  hintPulse: null, // { diff, until }
  best: null,
};

try {
  const saved = localStorage.getItem('lantern-town-best');
  if (saved) state.best = Number(saved);
} catch { /* storage unavailable: best time just stays hidden */ }

const $ = (id) => document.getElementById(id);
const overlay = $('overlay');
const overlayTitle = $('overlay-title');
const overlayText = $('overlay-text');
const overlayBtn = $('overlay-btn');
// The HUD is drawn on the canvas; these strings feed it.
const hud = { found: '', round: '', mistakes: '' };
const hintBtn = $('hint-btn');
const restartBtn = $('restart-btn');
const menuBtn = $('menu-btn');
const statusEl = $('status');

function fmt(t) {
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}

function scene() {
  return SCENES[state.round];
}

function nowSeconds() {
  return state.screen === 'play' ? (performance.now() - state.startedAt) / 1000 : state.elapsed;
}

// ------------------------------------------------------------ audio (WebAudio, no files)
let audioCtx = null;
function tone(freq, dur, type, when = 0) {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const t0 = audioCtx.currentTime + when;
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.12, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    o.connect(g);
    g.connect(audioCtx.destination);
    o.start(t0);
    o.stop(t0 + dur);
  } catch { /* sound is decoration; silence never breaks the game */ }
}
function chime() { tone(880, 0.12, 'sine'); tone(1318, 0.2, 'sine', 0.09); }
function buzz() { tone(160, 0.18, 'sawtooth'); }
function fanfare() { [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.22, 'triangle', i * 0.11)); }

// ------------------------------------------------------------ flow
function showOverlay(title, text, btnLabel, onBtn) {
  overlayTitle.textContent = title;
  overlayText.textContent = text;
  overlayBtn.textContent = btnLabel;
  overlay.style.display = 'flex';
  overlayBtn.onclick = onBtn;
}

function hideOverlay() {
  overlay.style.display = 'none';
}

function startRound(r, presetFound = []) {
  state.round = r;
  state.found = new Set(presetFound);
  state.mistakes = 0;
  state.hintsLeft = HINTS_PER_ROUND;
  state.hintPulse = null;
  state.wrongFlash = null;
  state.startedAt = performance.now();
  state.elapsed = 0;
  state.screen = 'play';
  hideOverlay();
  updateHud();
}

function startGame() {
  state.totalMistakes = 0;
  state.totalHints = 0;
  state.totalTime = 0;
  startRound(0);
}

function roundClear() {
  state.elapsed = nowSeconds();
  state.totalTime += state.elapsed;
  state.totalMistakes += state.mistakes;
  state.totalHints += state.hintsUsed;
  state.screen = 'roundClear';
  fanfare();
  const last = state.round === SCENES.length - 1;
  if (last) {
    const best = state.best === null || state.totalTime < state.best;
    if (best) {
      state.best = state.totalTime;
      try { localStorage.setItem('lantern-town-best', String(state.best)); } catch { /* ignore */ }
    }
    showOverlay(
      'You found them all!',
      `Three rounds clear in ${fmt(state.totalTime)} · ${state.totalMistakes} mistakes · ${state.totalHints} hints used.` +
        (best ? ' A new best time!' : ` Best time: ${fmt(state.best)}.`),
      'Play again',
      startGame,
    );
    state.screen = 'win';
  } else {
    showOverlay(
      `Round ${state.round + 1} clear!`,
      `All 7 differences found in ${fmt(state.elapsed)} with ${state.mistakes} mistake${state.mistakes === 1 ? '' : 's'}. Next up: ${SCENES[state.round + 1].name}.`,
      'Next round',
      () => startRound(state.round + 1),
    );
  }
  updateHud();
}

function useHint() {
  if (state.screen !== 'play' || state.hintsLeft <= 0) return;
  const remaining = scene().diffs.filter((_, i) => !state.found.has(i));
  if (!remaining.length) return;
  const pick = remaining[Math.floor(Math.random() * remaining.length)];
  const idx = scene().diffs.indexOf(pick);
  state.hintsLeft -= 1;
  state.hintsUsed += 1;
  state.hintPulse = { diff: idx, until: performance.now() + 1400 };
  tone(660, 0.15, 'sine');
  updateHud();
}

function updateHud() {
  hud.round = `Round ${state.round + 1} of ${SCENES.length} · ${scene().name}`;
  hud.found = `Found ${state.found.size} / ${DIFF_TOTAL}`;
  hud.mistakes = `Mistakes ${state.mistakes}`;
  hintBtn.textContent = `Hint (${state.hintsLeft})`;
  hintBtn.disabled = state.screen !== 'play' || state.hintsLeft <= 0;
}

// ------------------------------------------------------------ input
function canvasPoint(ev) {
  const r = canvas.getBoundingClientRect();
  return {
    x: ((ev.clientX - r.left) / r.width) * W,
    y: ((ev.clientY - r.top) / r.height) * H,
  };
}

canvas.addEventListener('pointerdown', (ev) => {
  if (state.screen !== 'play') return;
  const p = canvasPoint(ev);
  for (let pi = 0; pi < PANELS.length; pi++) {
    const panel = PANELS[pi];
    if (p.x < panel.x || p.x > panel.x + panel.w || p.y < panel.y || p.y > panel.y + panel.h) continue;
    const lx = p.x - panel.x;
    const ly = p.y - panel.y;
    for (let i = 0; i < scene().diffs.length; i++) {
      if (state.found.has(i)) continue;
      const d = scene().diffs[i];
      const dist = Math.hypot(lx - d.x, ly - d.y);
      if (dist <= d.r + 10) {
        state.found.add(i);
        state.hintPulse = null;
        chime();
        statusEl.textContent = `Found a difference: ${d.label}. ${state.found.size} of ${DIFF_TOTAL} found.`;
        if (state.found.size === DIFF_TOTAL) roundClear();
        updateHud();
        return;
      }
    }
    // Clicked inside a panel but on nothing: a mistake.
    state.mistakes += 1;
    state.wrongFlash = { x: p.x, y: p.y, until: performance.now() + 500 };
    buzz();
    statusEl.textContent = 'Nothing different there. Try again.';
    updateHud();
    return;
  }
});

hintBtn.addEventListener('click', useHint);
restartBtn.addEventListener('click', () => startRound(state.round));
menuBtn.addEventListener('click', () => {
  state.screen = 'title';
  showTitle();
});

document.addEventListener('keydown', (ev) => {
  if (ev.key === 'h' || ev.key === 'H') useHint();
  else if (ev.key === 'r' || ev.key === 'R') { if (state.screen === 'play') startRound(state.round); }
  else if (ev.key === 'Enter' && state.screen !== 'play') overlayBtn.click();
});

// ------------------------------------------------------------ drawing
function drawPanel(panel, applied) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(panel.x, panel.y, panel.w, panel.h);
  ctx.clip();
  ctx.translate(panel.x, panel.y);
  scene().draw(ctx, applied);
  ctx.restore();
  ctx.strokeStyle = '#3a4a6b';
  ctx.lineWidth = 3;
  ctx.strokeRect(panel.x, panel.y, panel.w, panel.h);
}

function drawMarker(panel, d) {
  const cx = panel.x + d.x;
  const cy = panel.y + d.y;
  ctx.strokeStyle = '#ff3b30';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(cx, cy, d.r + 6, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - 7, cy);
  ctx.lineTo(cx - 1, cy + 6);
  ctx.lineTo(cx + 8, cy - 6);
  ctx.stroke();
}

function drawFrame() {
  // Backdrop.
  ctx.fillStyle = '#10182e';
  ctx.fillRect(0, 0, W, H);
  // Header.
  ctx.fillStyle = '#f5f0e1';
  ctx.font = 'bold 30px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('Lantern Town', 24, 32);
  ctx.font = '16px Georgia, serif';
  ctx.fillStyle = '#9fb3d8';
  ctx.fillText('Spot the Difference', 24, 62);
  ctx.textAlign = 'center';
  ctx.font = 'bold 22px Georgia, serif';
  ctx.fillStyle = '#ffd23f';
  ctx.fillText(hud.found, 640, 34);
  ctx.fillStyle = '#f5f0e1';
  ctx.font = '18px Georgia, serif';
  ctx.fillText(hud.round, 640, 62);
  ctx.textAlign = 'right';
  ctx.fillText(`Time ${fmt(nowSeconds())}`, 1256, 34);
  ctx.fillStyle = state.mistakes > 0 ? '#ff8fa3' : '#9fb3d8';
  ctx.fillText(hud.mistakes, 1256, 62);
  ctx.textAlign = 'left';
  // Panels.
  const appliedAll = new Set(scene().diffs.map((_, i) => i));
  drawPanel(PANELS[0], new Set());
  drawPanel(PANELS[1], appliedAll);
  // Panel labels.
  ctx.font = 'bold 20px Georgia, serif';
  ctx.fillStyle = '#f5f0e1';
  ctx.textAlign = 'center';
  ctx.fillText('A', PANELS[0].x + PANELS[0].w / 2, PANELS[0].y - 12);
  ctx.fillText('B', PANELS[1].x + PANELS[1].w / 2, PANELS[1].y - 12);
  ctx.textAlign = 'left';
  // Found markers on both panels.
  for (const i of state.found) {
    drawMarker(PANELS[0], scene().diffs[i]);
    drawMarker(PANELS[1], scene().diffs[i]);
  }
  // Hint pulse.
  if (state.hintPulse && performance.now() < state.hintPulse.until) {
    const d = scene().diffs[state.hintPulse.diff];
    const pulse = 1 + 0.15 * Math.sin(performance.now() / 90);
    ctx.save();
    ctx.strokeStyle = '#ffd23f';
    ctx.lineWidth = 5;
    for (const panel of PANELS) {
      ctx.beginPath();
      ctx.arc(panel.x + d.x, panel.y + d.y, (d.r + 10) * pulse, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }
  // Wrong-click flash.
  if (state.wrongFlash && performance.now() < state.wrongFlash.until) {
    ctx.strokeStyle = '#ff3b30';
    ctx.lineWidth = 4;
    const f = state.wrongFlash;
    ctx.beginPath();
    ctx.moveTo(f.x - 12, f.y - 12); ctx.lineTo(f.x + 12, f.y + 12);
    ctx.moveTo(f.x + 12, f.y - 12); ctx.lineTo(f.x - 12, f.y + 12);
    ctx.stroke();
  }
  // Footer hint.
  ctx.fillStyle = '#9fb3d8';
  ctx.font = '15px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('Click a difference on either picture · H for a hint · R to restart the round', 640, 648);
  ctx.textAlign = 'left';
}

function loop() {
  drawFrame();
  requestAnimationFrame(loop);
}

// ------------------------------------------------------------ title + shots
function showTitle() {
  state.screen = 'title';
  state.round = 0;
  state.found = new Set();
  state.mistakes = 0;
  state.hintsLeft = HINTS_PER_ROUND;
  state.elapsed = 0;
  updateHud();
  showOverlay(
    'Lantern Town',
    'Two pictures, seven differences. Find them all across three rounds — a lantern festival, a harbour morning, and a forest picnic.' +
      (state.best !== null ? ` Best time: ${fmt(state.best)}.` : ''),
    'Play',
    startGame,
  );
}

// Fixed states for screenshots: ?shot=start|play|play2|end
if (shot === 'start') {
  showTitle();
} else if (shot === 'play') {
  startRound(0, [0, 1, 2]);
  state.elapsed = 72;
  state.startedAt = performance.now() - 72000;
  state.mistakes = 1;
  updateHud();
} else if (shot === 'play2') {
  startRound(1, [0, 3]);
  state.elapsed = 48;
  state.startedAt = performance.now() - 48000;
  updateHud();
} else if (shot === 'end') {
  state.totalTime = 245;
  state.elapsed = 245;
  state.totalMistakes = 2;
  state.totalHints = 1;
  state.best = 245;
  state.round = 2;
  state.found = new Set([0, 1, 2, 3, 4, 5, 6]);
  state.screen = 'win';
  updateHud();
  showOverlay(
    'You found them all!',
    'Three rounds clear in 04:05 · 2 mistakes · 1 hint used. A new best time!',
    'Play again',
    startGame,
  );
} else {
  showTitle();
}

updateHud();
// Debug/testing handle (read-only state inspection from the console).
window.__lanternTown = state;
requestAnimationFrame(loop);
