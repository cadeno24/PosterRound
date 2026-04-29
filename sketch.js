var PINK   = '#FF3F7F';
var YELLOW = '#FFC400';
var BLACK  = '#111111';
var WHITE  = '#ffffff';

var posterData = [
  [200,  200, 260, 340, -0.18, BLACK,  PINK],
  [450,  150, 300, 220,  0.08, PINK,   YELLOW],
  [760,  180, 200, 280, -0.05, YELLOW, BLACK],
  [1050, 160, 340, 260,  0.12, BLACK,  PINK],
  [1380, 210, 200, 300, -0.10, PINK,   BLACK],
  [150,  620, 280, 200,  0.07, YELLOW, PINK],
  [500,  680, 220, 180, -0.14, BLACK,  YELLOW],
  [900,  700, 260, 200,  0.09, PINK,   YELLOW],
  [1200, 660, 300, 220, -0.06, BLACK,  PINK],
  [1480, 680, 220, 260,  0.16, YELLOW, BLACK],
  [300,  450, 180, 240,  0.05, PINK,   BLACK],
  [1300, 440, 200, 200, -0.12, YELLOW, PINK],
  [700,  490, 160, 180,  0.22, BLACK,  YELLOW],
];

var tapeData = [
  [200,  190, 90, -0.18, YELLOW],
  [450,  148, 80,  0.08, PINK],
  [760,  175, 70, -0.05, PINK],
  [1050, 158, 100, 0.12, YELLOW],
  [1380, 205, 75, -0.10, YELLOW],
  [150,  615, 90,  0.07, PINK],
  [500,  675, 80, -0.14, YELLOW],
  [900,  695, 85,  0.09, PINK],
  [1200, 658, 95, -0.06, YELLOW],
  [1480, 675, 75,  0.16, PINK],
];

var posterLabels = ['JOIN US','GA TECH','INSTA','GAMING CLUB','OPEN','BUZZ','\u2192','VGDEV','ARIAL','insta \u2197','YOUR C','out \u2192'];
var floatChars   = ['FONT','\u2197','\u2726','\u2731','\u2192','#','\u2605','QR'];

// Seeded random arrays so scene stays stable each draw
var noiseSeeds = [];
var scribbles  = [];
var floaters   = [];
var specks     = [];

function setup() {
  createCanvas(1600, 900);
  noLoop(); // draw once — static background

  // Pre-generate random elements with stable seeds
  randomSeed(42);

  for (var i = 0; i < 180; i++) {
    specks.push({
      x: random(0, 1600),
      y: random(0, 900),
      w: random(2, 8),
      h: random(2, 8),
      a: random(0.03, 0.12),
      col: random([PINK, YELLOW]),
    });
  }

  for (var i = 0; i < 30; i++) {
    var pts = [];
    for (var j = 0; j < 6; j++) pts.push([random(-25,25), random(-25,25)]);
    scribbles.push({
      x: random(50, 1550),
      y: random(50, 850),
      col: random([PINK, YELLOW, WHITE]),
      pts: pts,
    });
  }

  for (var i = 0; i < 20; i++) {
    floaters.push({
      x:    random(80, 1520),
      y:    random(80, 820),
      col:  random([PINK, YELLOW, WHITE]),
      size: floor(random(14, 38)),
      rot:  random(-0.4, 0.4),
      ch:   random(floatChars),
    });
  }

  // Poster-level noise seeds (one per poster)
  for (var i = 0; i < posterData.length; i++) {
    noiseSeeds.push({
      showLabel: random() > 0.35,
      label:     random(posterLabels),
      labelY:    floor(random(-posterData[i][3]/4, posterData[i][3]/4)),
      labelSize: floor(random(13, 26)),
      showQR:    random() > 0.45,
      qxFrac:    random(0.15, 0.55),
      qyFrac:    random(0.15, 0.55),
      qs:        floor(random(22, 48)),
      qrGrid:    Array.from({length:9}, function() { return random() > 0.45; }),
      showCirc:  random() > 0.6,
      circX:     random(-1, 1),
      circY:     random(-1, 1),
      circR:     random(8, 30),
      showDash:  random() > 0.65,
      dashX1:    random(0.1, 0.4),
      dashY1:    random(0.1, 0.4),
      dashX2:    random(0.5, 0.9),
      dashY2:    random(0.5, 0.9),
    });
  }
}

function draw() {
  // Base background
  background('#1a0a0f');

  // Noise specks
  noStroke();
  for (var si = 0; si < specks.length; si++) {
    var s = specks[si];
    fill(s.col);
    drawingContext.globalAlpha = s.a;
    rect(s.x, s.y, s.w, s.h);
  }
  drawingContext.globalAlpha = 1;

  // Posters
  for (var i = 0; i < posterData.length; i++) {
    drawPoster(posterData[i], noiseSeeds[i]);
  }

  // Tape strips
  for (var ti = 0; ti < tapeData.length; ti++) {
    drawTape(tapeData[ti]);
  }

  // Scribbles
  for (var sci = 0; sci < scribbles.length; sci++) {
    drawScribble(scribbles[sci]);
  }

  // Floating chars
  for (var fi = 0; fi < floaters.length; fi++) {
    drawFloater(floaters[fi]);
  }

  // Vignette
  drawVignette();
}

// ─── DRAW HELPERS ────────────────────────────────────────────────

function drawPoster(pd, seed) {
  var px     = pd[0];
  var py     = pd[1];
  var pw     = pd[2];
  var ph     = pd[3];
  var pAngle = pd[4];
  var bg     = pd[5];
  var accent = pd[6];

  push();
  translate(px, py);
  rotate(pAngle);

  // Body
  fill(bg);
  stroke(accent);
  strokeWeight(3);
  rect(-pw/2, -ph/2, pw, ph);

  // Label
  if (seed.showLabel) {
    fill(accent);
    noStroke();
    textFont('Space Mono');
    textSize(seed.labelSize);
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    text(seed.label, 0, seed.labelY);
  }

  // QR code block
  if (seed.showQR) {
    var qx   = -pw/2 + seed.qxFrac * pw;
    var qy   = -ph/2 + seed.qyFrac * ph;
    var qs   = seed.qs;
    var cell = (qs - 4) / 3;

    fill(accent);
    noStroke();
    rect(qx, qy, qs, qs);

    fill(bg);
    for (var i = 0; i < 3; i++) {
      for (var j = 0; j < 3; j++) {
        if (seed.qrGrid[i * 3 + j]) {
          rect(qx + 2 + i * cell, qy + 2 + j * cell, cell - 1, cell - 1);
        }
      }
    }

    stroke(bg === BLACK ? WHITE : BLACK);
    strokeWeight(1);
    noFill();
    rect(qx, qy, qs, qs);
  }

  // Circle blot — convert 6-char hex + 'aa' alpha to rgba
  if (seed.showCirc) {
    noStroke();
    // Parse hex accent to rgba with 0.67 alpha (0xaa/0xff ≈ 0.667)
    var r = parseInt(accent.slice(1,3), 16);
    var g = parseInt(accent.slice(3,5), 16);
    var b = parseInt(accent.slice(5,7), 16);
    fill('rgba(' + r + ',' + g + ',' + b + ',0.667)');
    var halfW = pw / 2;
    var halfH = ph / 2;
    ellipse(seed.circX * halfW, seed.circY * halfH, seed.circR * 2);
  }

  // Dashed line
  if (seed.showDash) {
    stroke(accent);
    strokeWeight(2);
    drawingContext.setLineDash([4, 5]);
    line(
      -pw/2 + seed.dashX1 * pw, -ph/2 + seed.dashY1 * ph,
      -pw/2 + seed.dashX2 * pw, -ph/2 + seed.dashY2 * ph
    );
    drawingContext.setLineDash([]);
  }

  pop();
}

function drawTape(t) {
  var tx     = t[0];
  var ty     = t[1];
  var tw     = t[2];
  var tAngle = t[3];
  var col    = t[4];

  push();
  translate(tx, ty);
  rotate(tAngle);
  drawingContext.globalAlpha = 0.68;
  fill(col);
  noStroke();
  rect(-tw/2, -6, tw, 12);
  drawingContext.globalAlpha = 1;
  pop();
}

function drawScribble(s) {
  push();
  translate(s.x, s.y);
  stroke(s.col);
  strokeWeight(2.5);
  noFill();
  beginShape();
  for (var i = 0; i < s.pts.length; i++) {
    vertex(s.pts[i][0], s.pts[i][1]);
  }
  endShape();
  pop();
}

function drawFloater(f) {
  push();
  translate(f.x, f.y);
  rotate(f.rot);
  fill(f.col);
  noStroke();
  textFont('Space Mono');
  textSize(f.size);
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
  text(f.ch, 0, 0);
  pop();
}

function drawVignette() {
  var grad = drawingContext.createRadialGradient(800, 450, 180, 800, 450, 920);
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(1, 'rgba(0,0,0,0.75)');
  drawingContext.fillStyle = grad;
  drawingContext.fillRect(0, 0, 1600, 900);
}