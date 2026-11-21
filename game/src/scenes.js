// Lantern Town — three hand-drawn scenes for a spot-the-difference game.
// Every scene is drawn twice: once plain (left panel) and once with its
// seven differences applied (right panel). Panel space is 600 x 520.
// A difference is { x, y, r } in panel coordinates, plus a short label.

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}

function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function ellipse(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function star4(ctx, x, y, r) {
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.quadraticCurveTo(x, y, x, y + r);
  ctx.quadraticCurveTo(x, y, x - r, y);
  ctx.quadraticCurveTo(x, y, x, y - r);
  ctx.fill();
}

function lantern(ctx, x, y, color) {
  ctx.strokeStyle = '#3a2c22';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y - 34);
  ctx.lineTo(x, y - 18);
  ctx.stroke();
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = 18;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, 22, 28, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = '#f7c948';
  rr(ctx, x - 12, y - 32, 24, 8, 3);
  rr(ctx, x - 12, y + 24, 24, 8, 3);
  ctx.fillStyle = '#f7c948';
  ctx.fillRect(x - 1, y + 32, 2, 12);
  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - 14, y - 8);
  ctx.quadraticCurveTo(x - 20, y + 6, x - 12, y + 16);
  ctx.stroke();
}

function fishShape(ctx, x, y, s, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, 14 * s, 7 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x - 12 * s, y);
  ctx.lineTo(x - 22 * s, y - 8 * s);
  ctx.lineTo(x - 22 * s, y + 8 * s);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#10182e';
  circle(ctx, x + 6 * s, y - 2 * s, 1.6 * s);
}

// ---------------------------------------------------------------- scene 1
function drawLanternFestival(ctx, applied) {
  // Night sky.
  const sky = ctx.createLinearGradient(0, 0, 0, 520);
  sky.addColorStop(0, '#141d3d');
  sky.addColorStop(1, '#2c3a6b');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 600, 520);
  // Stars (difference 4 removes the one at 90,120).
  ctx.fillStyle = '#f5f0c8';
  const stars = [[90, 120], [150, 70], [220, 140], [330, 60], [420, 110], [520, 60], [560, 150], [40, 200], [300, 180]];
  for (const [sx, sy] of stars) {
    if (applied.has(4) && sx === 90 && sy === 120) continue;
    star4(ctx, sx, sy, 5);
  }
  // Fireworks.
  ctx.strokeStyle = '#ffd166';
  ctx.lineWidth = 2;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(500 + Math.cos(a) * 8, 210 + Math.sin(a) * 8);
    ctx.lineTo(500 + Math.cos(a) * 26, 210 + Math.sin(a) * 26);
    ctx.stroke();
  }
  ctx.strokeStyle = '#ff8fa3';
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.4;
    ctx.beginPath();
    ctx.moveTo(120 + Math.cos(a) * 6, 180 + Math.sin(a) * 6);
    ctx.lineTo(120 + Math.cos(a) * 18, 180 + Math.sin(a) * 18);
    ctx.stroke();
  }
  // Moon with craters (difference 0 removes the crater at 495,100).
  ctx.fillStyle = '#f7e8a0';
  circle(ctx, 480, 90, 55);
  ctx.fillStyle = '#e0cf85';
  circle(ctx, 465, 75, 8);
  if (!applied.has(0)) circle(ctx, 495, 100, 6);
  circle(ctx, 470, 110, 5);
  // Lantern string.
  ctx.strokeStyle = '#3a2c22';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 55);
  ctx.quadraticCurveTo(300, 95, 600, 55);
  ctx.stroke();
  const lx = [70, 180, 290, 400, 510];
  lx.forEach((x, i) => {
    const y = 55 + Math.sin((x / 600) * Math.PI) * 34 + 22;
    lantern(ctx, x, y, applied.has(1) && i === 2 ? '#2e9e5b' : '#d9382b');
  });
  // Food stall.
  ctx.fillStyle = '#8a5a33';
  ctx.fillRect(40, 394, 260, 76);
  ctx.fillStyle = '#6e4525';
  ctx.fillRect(40, 394, 260, 10);
  // Awning stripes (difference 5 turns one stripe blue).
  const stripeColors = ['#c0392b', '#f5f0e1'];
  for (let i = 0; i < 6; i++) {
    ctx.fillStyle = applied.has(5) && i === 2 ? '#2b6cb0' : stripeColors[i % 2];
    ctx.fillRect(40 + i * 44, 350, 44, 44);
  }
  ctx.fillStyle = '#3a2c22';
  ctx.fillRect(40, 350, 260, 6);
  // Stall sign (difference 2 changes the character).
  ctx.fillStyle = '#2c2118';
  rr(ctx, 120, 300, 90, 40, 6);
  ctx.fillStyle = '#f7c948';
  ctx.font = 'bold 28px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(applied.has(2) ? '茶' : '祭', 165, 321);
  // Cat on the stall roof (difference 3 drops its tail).
  ctx.fillStyle = '#e8e0d0';
  ellipse(ctx, 258, 338, 26, 14);
  circle(ctx, 272, 318, 16);
  ctx.beginPath();
  ctx.moveTo(260, 308); ctx.lineTo(264, 292); ctx.lineTo(270, 306); ctx.closePath(); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(276, 306); ctx.lineTo(284, 292); ctx.lineTo(286, 308); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#e8e0d0';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(234, 336);
  if (applied.has(3)) ctx.quadraticCurveTo(222, 350, 228, 362);
  else ctx.quadraticCurveTo(218, 322, 228, 306);
  ctx.stroke();
  ctx.fillStyle = '#10182e';
  circle(ctx, 276, 316, 2);
  // Fish on the counter (difference 6: only on the right panel).
  if (applied.has(6)) fishShape(ctx, 240, 432, 1, '#7fb3d5');
  // Street.
  ctx.fillStyle = '#232838';
  ctx.fillRect(0, 470, 600, 50);
  ctx.fillStyle = '#2e3550';
  for (let x = 20; x < 600; x += 90) ctx.fillRect(x, 492, 46, 4);
}

// ---------------------------------------------------------------- scene 2
function drawHarborMorning(ctx, applied) {
  const sky = ctx.createLinearGradient(0, 0, 0, 300);
  sky.addColorStop(0, '#bfe3f2');
  sky.addColorStop(1, '#e8f6ff');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 600, 300);
  // Sun with rays (difference 4 drops two rays).
  ctx.fillStyle = '#ffd23f';
  circle(ctx, 90, 80, 45);
  ctx.strokeStyle = '#ffd23f';
  ctx.lineWidth = 5;
  const rayCount = applied.has(4) ? 6 : 8;
  for (let i = 0; i < rayCount; i++) {
    const a = (i / rayCount) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(90 + Math.cos(a) * 55, 80 + Math.sin(a) * 55);
    ctx.lineTo(90 + Math.cos(a) * 70, 80 + Math.sin(a) * 70);
    ctx.stroke();
  }
  // Clouds.
  ctx.fillStyle = '#ffffff';
  ellipse(ctx, 300, 70, 60, 18);
  ellipse(ctx, 340, 78, 46, 14);
  ellipse(ctx, 480, 50, 50, 15);
  // Seagulls (difference 2 removes the middle one).
  ctx.strokeStyle = '#3a4a5a';
  ctx.lineWidth = 3;
  const gulls = [[200, 120], [260, 90], [330, 130]];
  gulls.forEach(([gx, gy], i) => {
    if (applied.has(2) && i === 1) return;
    ctx.beginPath();
    ctx.moveTo(gx - 12, gy);
    ctx.quadraticCurveTo(gx - 4, gy - 8, gx, gy);
    ctx.quadraticCurveTo(gx + 4, gy - 8, gx + 12, gy);
    ctx.stroke();
  });
  // Sea.
  const sea = ctx.createLinearGradient(0, 300, 0, 520);
  sea.addColorStop(0, '#2e7fa8');
  sea.addColorStop(1, '#1d5f86');
  ctx.fillStyle = sea;
  ctx.fillRect(0, 300, 600, 220);
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = 3;
  for (const [wx, wy, wl] of [[60, 340, 70], [220, 380, 90], [420, 350, 80], [120, 450, 90], [330, 470, 80], [500, 430, 70]]) {
    ctx.beginPath();
    ctx.moveTo(wx, wy);
    ctx.quadraticCurveTo(wx + wl / 2, wy - 8, wx + wl, wy);
    ctx.stroke();
  }
  // Lighthouse.
  ctx.fillStyle = '#f5f0e1';
  ctx.beginPath();
  ctx.moveTo(455, 300); ctx.lineTo(465, 140); ctx.lineTo(505, 140); ctx.lineTo(515, 300); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#c0392b';
  ctx.fillRect(458, 190, 54, 26);
  ctx.fillRect(462, 245, 46, 26);
  // Lamp room + beam (difference 0 turns the beam off).
  ctx.fillStyle = '#2c3a4a';
  ctx.fillRect(460, 95, 50, 26);
  ctx.fillStyle = applied.has(5) ? '#2c3a4a' : '#ffd23f';
  ctx.fillRect(468, 100, 34, 16);
  ctx.fillStyle = '#2c3a4a';
  ctx.fillRect(445, 120, 80, 20);
  if (!applied.has(0)) {
    ctx.fillStyle = 'rgba(255, 210, 63, 0.28)';
    ctx.beginPath();
    ctx.moveTo(510, 108);
    ctx.lineTo(600, 84);
    ctx.lineTo(600, 132);
    ctx.closePath();
    ctx.fill();
  }
  // Lighthouse window (difference 5: lit vs dark).
  ctx.fillStyle = applied.has(5) ? '#2c3a4a' : '#ffd23f';
  rr(ctx, 476, 155, 18, 24, 4);
  // Sailboat (difference 1 turns the sail yellow).
  ctx.fillStyle = '#6e4525';
  ctx.beginPath();
  ctx.moveTo(80, 345); ctx.lineTo(170, 345); ctx.lineTo(150, 365); ctx.lineTo(100, 365); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#4a2f18';
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(125, 345); ctx.lineTo(125, 270); ctx.stroke();
  ctx.fillStyle = applied.has(1) ? '#ffd23f' : '#ffffff';
  ctx.beginPath();
  ctx.moveTo(125, 272); ctx.lineTo(125, 340); ctx.lineTo(165, 340); ctx.closePath(); ctx.fill();
  // Rowboat.
  ctx.fillStyle = '#8a5a33';
  ctx.beginPath();
  ctx.moveTo(280, 395); ctx.lineTo(340, 395); ctx.lineTo(325, 410); ctx.lineTo(295, 410); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#4a2f18';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(330, 388); ctx.lineTo(352, 372); ctx.stroke();
  // Buoy (difference 3 swaps its stripes).
  ctx.fillStyle = applied.has(3) ? '#f5f0e1' : '#c0392b';
  circle(ctx, 200, 420, 18);
  ctx.fillStyle = applied.has(3) ? '#c0392b' : '#f5f0e1';
  ctx.fillRect(182, 414, 36, 12);
  ctx.fillStyle = '#2c3a4a';
  ctx.fillRect(198, 396, 4, 10);
  // Jumping fish (difference 6: only on the right panel).
  if (applied.has(6)) {
    ctx.save();
    ctx.translate(380, 360);
    ctx.rotate(-0.5);
    fishShape(ctx, 0, 0, 1.1, '#9fd8ef');
    ctx.restore();
  }
}

// ---------------------------------------------------------------- scene 3
function drawForestPicnic(ctx, applied) {
  const sky = ctx.createLinearGradient(0, 0, 0, 380);
  sky.addColorStop(0, '#dff3d8');
  sky.addColorStop(1, '#f2fbe9');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 600, 380);
  // Sun.
  ctx.fillStyle = '#ffd23f';
  circle(ctx, 520, 70, 40);
  // Clouds (difference 6 removes the middle one).
  ctx.fillStyle = '#ffffff';
  ellipse(ctx, 120, 70, 55, 16);
  ellipse(ctx, 160, 78, 40, 12);
  if (!applied.has(6)) {
    ellipse(ctx, 300, 80, 60, 17);
    ellipse(ctx, 340, 88, 44, 13);
  }
  ellipse(ctx, 470, 150, 48, 14);
  // Bird in the right-hand tree (difference 5: only on the right panel).
  // Trees.
  ctx.fillStyle = '#6e4525';
  ctx.fillRect(80, 240, 26, 150);
  ctx.fillStyle = '#4e9e4e';
  circle(ctx, 93, 210, 62);
  circle(ctx, 55, 240, 42);
  circle(ctx, 130, 240, 44);
  ctx.fillStyle = '#6e4525';
  ctx.fillRect(505, 230, 26, 160);
  ctx.fillStyle = '#57ab57';
  circle(ctx, 518, 200, 58);
  circle(ctx, 482, 230, 40);
  circle(ctx, 552, 228, 42);
  if (applied.has(5)) {
    ctx.fillStyle = '#3a6ea5';
    ellipse(ctx, 518, 150, 14, 9);
    circle(ctx, 530, 144, 6);
    ctx.fillStyle = '#f7c948';
    ctx.beginPath(); ctx.moveTo(536, 144); ctx.lineTo(544, 142); ctx.lineTo(536, 148); ctx.closePath(); ctx.fill();
  }
  // Grass.
  ctx.fillStyle = '#7cbf5a';
  ctx.fillRect(0, 380, 600, 140);
  ctx.fillStyle = '#68ad4a';
  for (let x = 16; x < 600; x += 46) {
    ctx.beginPath();
    ctx.moveTo(x, 500); ctx.lineTo(x + 5, 486); ctx.lineTo(x + 10, 500);
    ctx.closePath(); ctx.fill();
  }
  // Picnic blanket: checker (difference 3 makes it striped).
  const bx = 210, by = 410, bw = 180, bh = 60;
  if (applied.has(3)) {
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = i % 2 ? '#f5f0e1' : '#c0392b';
      ctx.fillRect(bx, by + i * 10, bw, 10);
    }
  } else {
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 6; c++) {
        ctx.fillStyle = (r + c) % 2 ? '#f5f0e1' : '#c0392b';
        ctx.fillRect(bx + c * 30, by + r * 30, 30, 30);
      }
    }
  }
  ctx.strokeStyle = '#8a2f24';
  ctx.lineWidth = 3;
  ctx.strokeRect(bx, by, bw, bh);
  // Apple on the blanket (difference 4: only on the right panel).
  if (applied.has(4)) {
    ctx.fillStyle = '#d9382b';
    circle(ctx, 300, 428, 11);
    ctx.strokeStyle = '#4e9e4e';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(300, 418); ctx.quadraticCurveTo(306, 408, 312, 408); ctx.stroke();
  }
  // Mushrooms (difference 0 drops two spots).
  ctx.fillStyle = '#f5f0e1';
  ctx.fillRect(74, 438, 12, 22);
  ctx.fillStyle = '#d9382b';
  ctx.beginPath();
  ctx.arc(80, 440, 22, Math.PI, 0);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#ffffff';
  const spots = applied.has(0) ? [[72, 432], [88, 428], [80, 436]] : [[70, 430], [80, 424], [90, 430], [74, 436], [86, 436]];
  for (const [sx, sy] of spots) circle(ctx, sx, sy, 3.5);
  // Fox (difference 1 turns one ear brown).
  ctx.fillStyle = '#e07b39';
  ellipse(ctx, 480, 440, 34, 24);
  circle(ctx, 492, 408, 20);
  ctx.beginPath();
  ctx.moveTo(478, 396); ctx.lineTo(482, 378); ctx.lineTo(490, 392); ctx.closePath(); ctx.fill();
  ctx.fillStyle = applied.has(1) ? '#6e4525' : '#e07b39';
  ctx.beginPath();
  ctx.moveTo(498, 392); ctx.lineTo(506, 376); ctx.lineTo(512, 392); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#ffffff';
  ellipse(ctx, 500, 448, 14, 10);
  ctx.fillStyle = '#e07b39';
  ctx.beginPath();
  ctx.moveTo(452, 452);
  ctx.quadraticCurveTo(420, 460, 428, 432);
  ctx.quadraticCurveTo(440, 448, 456, 440);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(428, 432);
  ctx.quadraticCurveTo(420, 446, 430, 452);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#10182e';
  circle(ctx, 498, 404, 2.5);
  // Butterflies (difference 2 removes the one at 350,200).
  const flies = [[150, 250, '#ff8fa3'], [350, 200, '#8fa3ff']];
  flies.forEach(([fx, fy, col], i) => {
    if (applied.has(2) && i === 1) return;
    ctx.fillStyle = col;
    ellipse(ctx, fx - 7, fy, 8, 11);
    ellipse(ctx, fx + 7, fy, 8, 11);
    ctx.strokeStyle = '#3a2c22';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(fx, fy - 10); ctx.lineTo(fx, fy + 10); ctx.stroke();
  });
}

export const SCENES = [
  {
    name: 'Lantern Festival',
    draw: drawLanternFestival,
    diffs: [
      { x: 495, y: 100, r: 20, label: 'moon crater' },
      { x: 290, y: 110, r: 35, label: 'green lantern' },
      { x: 165, y: 320, r: 30, label: 'stall sign' },
      { x: 275, y: 320, r: 30, label: 'cat tail' },
      { x: 90, y: 120, r: 18, label: 'missing star' },
      { x: 140, y: 372, r: 25, label: 'awning stripe' },
      { x: 240, y: 432, r: 25, label: 'fish on the counter' },
    ],
  },
  {
    name: 'Harbor Morning',
    draw: drawHarborMorning,
    diffs: [
      { x: 560, y: 108, r: 30, label: 'lighthouse beam' },
      { x: 125, y: 305, r: 35, label: 'sail colour' },
      { x: 260, y: 90, r: 20, label: 'missing gull' },
      { x: 200, y: 420, r: 25, label: 'buoy stripes' },
      { x: 90, y: 80, r: 50, label: 'sun rays' },
      { x: 485, y: 167, r: 20, label: 'lighthouse window' },
      { x: 380, y: 360, r: 25, label: 'jumping fish' },
    ],
  },
  {
    name: 'Forest Picnic',
    draw: drawForestPicnic,
    diffs: [
      { x: 80, y: 436, r: 25, label: 'mushroom spots' },
      { x: 504, y: 386, r: 22, label: 'fox ear' },
      { x: 350, y: 200, r: 22, label: 'missing butterfly' },
      { x: 300, y: 440, r: 35, label: 'blanket pattern' },
      { x: 300, y: 428, r: 18, label: 'apple on the blanket' },
      { x: 518, y: 148, r: 20, label: 'bird in the tree' },
      { x: 320, y: 84, r: 30, label: 'missing cloud' },
    ],
  },
];
