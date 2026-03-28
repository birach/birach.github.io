---
title: Conway's Game of Life
date: 2026-03-27 16:00:00 -0400
categories: [Mathematics, Interactive]
tags: [cellular-automata, conway, simulation, javascript, education, emergent-behavior]
description: >-
  A gentle introduction to Conway's Game of Life — rules, classic patterns as illustrations,
  and a drawing board where you paint live cells and run the simulation in your browser.
---

**Conway's Game of Life** is not a game you "win" in the usual sense. It is a **zero‑player** cellular automaton: you set up a grid of **live** and **dead** cells, press play, and watch a handful of local rules produce surprisingly rich, sometimes chaotic, sometimes periodic behavior. John Horton Conway devised it in 1970; the beauty is how elaborate structures emerge from almost trivial arithmetic on a checkerboard.

This post walks through the rules with visual diagrams, showcases a few famous families of patterns, and ends with an **interactive board** — sketch your own seed, then step or animate the evolution.

## The grid and neighborhoods

The world is an infinite **2D grid** (in practice, we use a large finite canvas with fixed edges). Each cell has **eight neighbors** — the surrounding squares in all directions, including diagonals. Only these neighbors matter when applying the rules.

<figure class="gol-svg-fig">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 220" width="220" height="220" role="img" aria-labelledby="fig-neighborhood-title">
  <title id="fig-neighborhood-title">3x3 neighborhood with center cell and eight neighbors</title>
  <defs>
    <style><![CDATA[
      .gol-cell { stroke: var(--timeline-dot-border-color, #94a3b8); stroke-width: 2; }
      .gol-center { fill: #22c55e; }
      .gol-neighbor { fill: #3b82f6; opacity: 0.85; }
      .gol-empty { fill: color-mix(in srgb, var(--main-bg, #fff) 92%, #64748b); }
      .gol-label { font: 600 13px system-ui, sans-serif; fill: var(--text-color, #1e293b); }
    ]]></style>
  </defs>
  <rect class="gol-empty gol-cell" x="10" y="10" width="60" height="60" rx="4"/>
  <rect class="gol-neighbor gol-cell" x="80" y="10" width="60" height="60" rx="4"/>
  <rect class="gol-empty gol-cell" x="150" y="10" width="60" height="60" rx="4"/>
  <rect class="gol-neighbor gol-cell" x="10" y="80" width="60" height="60" rx="4"/>
  <rect class="gol-center gol-cell" x="80" y="80" width="60" height="60" rx="4"/>
  <rect class="gol-neighbor gol-cell" x="150" y="80" width="60" height="60" rx="4"/>
  <rect class="gol-empty gol-cell" x="10" y="150" width="60" height="60" rx="4"/>
  <rect class="gol-neighbor gol-cell" x="80" y="150" width="60" height="60" rx="4"/>
  <rect class="gol-empty gol-cell" x="150" y="150" width="60" height="60" rx="4"/>
  <text class="gol-label" x="110" y="205" text-anchor="middle">Center cell + 8 neighbors</text>
</svg>
<figcaption>Each cell "looks" at its eight adjacent cells (including diagonals) when updating.</figcaption>
</figure>

Time advances in **discrete generations**. All cells update **simultaneously** from the previous snapshot; there is no order-of-update bias.

## The rules (B3/S23)

Let \(n\) be the number of **live** neighbors of a cell.

| Situation | Condition | Result next generation |
|-----------|-----------|-------------------------|
| **Underpopulation** | Live cell, \(n &lt; 2\) | Dies |
| **Survival** | Live cell, \(n = 2\) or \(n = 3\) | Stays alive |
| **Overcrowding** | Live cell, \(n &gt; 3\) | Dies |
| **Birth** | Dead cell, \(n = 3\) | Becomes alive |

This is often summarized as **B3/S23**: **birth** on exactly 3, **survive** on 2 or 3.

<figure class="gol-svg-fig gol-rules-row">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 100" width="100%" height="100" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Rule survival on two or three neighbors">
  <rect x="2" y="2" width="96" height="96" rx="6" fill="color-mix(in srgb, #22c55e 18%, transparent)" stroke="#22c55e" stroke-width="2"/>
  <text x="50" y="30" text-anchor="middle" font="700 12px system-ui">Survive</text>
  <text x="50" y="52" text-anchor="middle" font="11px system-ui" fill="#64748b">Live + n=2,3</text>
</svg>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 100" width="100%" height="100" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Rule birth on three neighbors">
  <rect x="2" y="2" width="96" height="96" rx="6" fill="color-mix(in srgb, #3b82f6 18%, transparent)" stroke="#3b82f6" stroke-width="2"/>
  <text x="50" y="30" text-anchor="middle" font="700 12px system-ui">Birth</text>
  <text x="50" y="52" text-anchor="middle" font="11px system-ui" fill="#64748b">Dead + n=3</text>
</svg>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 100" width="100%" height="100" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Rule death from loneliness or crowding">
  <rect x="2" y="2" width="96" height="96" rx="6" fill="color-mix(in srgb, #ef4444 14%, transparent)" stroke="#ef4444" stroke-width="2"/>
  <text x="50" y="26" text-anchor="middle" font="700 11px system-ui">Dies</text>
  <text x="50" y="46" text-anchor="middle" font="10px system-ui" fill="#64748b">Live, n&lt;2 or n&gt;3</text>
</svg>
</figure>

That is the entire ruleset — yet it is **Turing complete**: you can (in principle) embed arbitrary computation in glider‑based circuits on an infinite board.

## A zoo of patterns

Patterns are often grouped by how they behave. Below, **teal** cells are live (each square is one cell).

### Still lifes (unchanged forever)

These repeat every **period 1**.

<figure class="gol-svg-fig">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 120" width="280" height="120" role="img" aria-label="Block still life 2x2">
  <text x="50" y="18" font="600 12px system-ui" fill="var(--text-color)">Block</text>
  <g transform="translate(14, 28)">
    <rect width="36" height="36" x="0" y="0" fill="#14b8a6" stroke="#0f766e" stroke-width="1.5" rx="2"/>
    <rect width="36" height="36" x="38" y="0" fill="#14b8a6" stroke="#0f766e" stroke-width="1.5" rx="2"/>
    <rect width="36" height="36" x="0" y="38" fill="#14b8a6" stroke="#0f766e" stroke-width="1.5" rx="2"/>
    <rect width="36" height="36" x="38" y="38" fill="#14b8a6" stroke="#0f766e" stroke-width="1.5" rx="2"/>
  </g>
  <text x="170" y="18" font="600 12px system-ui" fill="var(--text-color)">Beehive</text>
  <g transform="translate(118, 28)">
    <rect width="36" height="36" x="38" y="0" fill="#14b8a6" stroke="#0f766e" stroke-width="1.5" rx="2"/>
    <rect width="36" height="36" x="0" y="38" fill="#14b8a6" stroke="#0f766e" stroke-width="1.5" rx="2"/>
    <rect width="36" height="36" x="38" y="38" fill="#14b8a6" stroke="#0f766e" stroke-width="1.5" rx="2"/>
    <rect width="36" height="36" x="76" y="38" fill="#14b8a6" stroke="#0f766e" stroke-width="1.5" rx="2"/>
    <rect width="36" height="36" x="114" y="38" fill="#14b8a6" stroke="#0f766e" stroke-width="1.5" rx="2"/>
    <rect width="36" height="36" x="38" y="76" fill="#14b8a6" stroke="#0f766e" stroke-width="1.5" rx="2"/>
  </g>
</svg>
<figcaption><strong>Still lifes</strong> never change: every live cell has exactly two or three live neighbors, and no dead cell has exactly three.</figcaption>
</figure>

### Oscillators (repeat after a few steps)

The **blinker** has **period 2** — it alternates between a horizontal and vertical line of three.

<figure class="gol-svg-fig">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 100" width="320" height="100" role="img" aria-label="Blinker oscillator two phases">
  <text x="54" y="16" font="600 11px system-ui" fill="var(--text-color)">Phase A</text>
  <g transform="translate(10, 26)">
    <rect width="32" height="32" x="0" y="34" fill="#a78bfa" stroke="#7c3aed" stroke-width="1.5" rx="2"/>
    <rect width="32" height="32" x="34" y="34" fill="#a78bfa" stroke="#7c3aed" stroke-width="1.5" rx="2"/>
    <rect width="32" height="32" x="68" y="34" fill="#a78bfa" stroke="#7c3aed" stroke-width="1.5" rx="2"/>
  </g>
  <text x="220" y="16" font="600 11px system-ui" fill="var(--text-color)">Phase B</text>
  <g transform="translate(176, 26)">
    <rect width="32" height="32" x="34" y="0" fill="#a78bfa" stroke="#7c3aed" stroke-width="1.5" rx="2"/>
    <rect width="32" height="32" x="34" y="34" fill="#a78bfa" stroke="#7c3aed" stroke-width="1.5" rx="2"/>
    <rect width="32" height="32" x="34" y="68" fill="#a78bfa" stroke="#7c3aed" stroke-width="1.5" rx="2"/>
  </g>
</svg>
<figcaption>The <strong>blinker</strong> is the smallest non‑trivial oscillator.</figcaption>
</figure>

### Spaceships (drift across the grid)

The **glider** is the most iconic **period 4** spaceship: it translates diagonally one cell every four generations.

<figure class="gol-svg-fig">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200" width="300" height="200" role="img" aria-label="Glider spaceship four phases">
  <defs>
    <style><![CDATA[
      .gl { fill: #f97316; stroke: #c2410c; stroke-width: 1.5; rx: 2; }
      .ph { font: 600 11px system-ui; fill: var(--text-color); }
    ]]></style>
  </defs>
  <g transform="translate(8,8)">
    <text x="0" y="12" class="ph">t</text>
    <rect class="gl" width="22" height="22" x="44" y="44"/>
    <rect class="gl" width="22" height="22" x="66" y="66"/>
    <rect class="gl" width="22" height="22" x="88" y="66"/>
    <rect class="gl" width="22" height="22" x="44" y="66"/>
    <rect class="gl" width="22" height="22" x="66" y="88"/>
  </g>
  <g transform="translate(158,8)">
    <text x="0" y="12" class="ph">t+1</text>
    <rect class="gl" width="22" height="22" x="66" y="44"/>
    <rect class="gl" width="22" height="22" x="44" y="66"/>
    <rect class="gl" width="22" height="22" x="88" y="66"/>
    <rect class="gl" width="22" height="22" x="66" y="66"/>
    <rect class="gl" width="22" height="22" x="66" y="88"/>
  </g>
  <g transform="translate(8,108)">
    <text x="0" y="12" class="ph">t+2</text>
    <rect class="gl" width="22" height="22" x="66" y="44"/>
    <rect class="gl" width="22" height="22" x="44" y="66"/>
    <rect class="gl" width="22" height="22" x="88" y="66"/>
    <rect class="gl" width="22" height="22" x="88" y="88"/>
    <rect class="gl" width="22" height="22" x="66" y="88"/>
  </g>
  <g transform="translate(158,108)">
    <text x="0" y="12" class="ph">t+3</text>
    <rect class="gl" width="22" height="22" x="66" y="66"/>
    <rect class="gl" width="22" height="22" x="44" y="88"/>
    <rect class="gl" width="22" height="22" x="66" y="88"/>
    <rect class="gl" width="22" height="22" x="88" y="88"/>
    <rect class="gl" width="22" height="22" x="88" y="110"/>
  </g>
</svg>
<figcaption>Over four steps the <strong>glider</strong> returns to the same shape, shifted diagonally — hence a "spaceship."</figcaption>
</figure>

### Methuselahs (small seeds, long drama)

**Diehard** is a small configuration that vanishes only after **130** generations — a long life for seven cells. **Acorn** takes **5206** steps before settling into oscillators and gliders. These are fun to try on a large toroidal or open board so debris does not hit walls too early.

---

## Try it: draw your own universe

Below, **left‑drag** paints live cells (teal), **right‑drag** or **Erase mode** clears them. **Step** applies one generation; **Run** animates (toggle to pause). **Clear** wipes the board; **Glider** drops a classic seed so you can confirm the simulation matches the diagrams. Edges are **dead** (cells outside have no neighbors counted beyond the border — equivalent to a ring of dead cells).

<style>
  .gol-playground {
    margin: 1.75rem 0;
    padding: 1.25rem;
    border-radius: 12px;
    border: 1px solid var(--border-color, rgba(127,127,127,0.35));
    background: color-mix(in srgb, var(--main-bg) 88%, #6366f1 12%);
  }
  .gol-playground h3 { margin-top: 0; font-size: 1.1rem; }
  .gol-toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
    margin-bottom: 0.75rem;
  }
  .gol-toolbar button,
  .gol-toolbar label {
    font: inherit;
    cursor: pointer;
    padding: 0.35rem 0.75rem;
    border-radius: 8px;
    border: 1px solid var(--btn-border-color, #94a3b8);
    background: var(--button-bg, #f1f5f9);
    color: var(--text-color);
  }
  .gol-toolbar button.primary {
    background: linear-gradient(180deg, #6366f1, #4f46e5);
    color: #fff;
    border-color: #4338ca;
  }
  .gol-toolbar .gol-stats {
    margin-left: auto;
    font-variant-numeric: tabular-nums;
    opacity: 0.9;
    font-size: 0.95rem;
  }
  .gol-canvas-wrap {
    overflow: auto;
    max-width: 100%;
    border-radius: 8px;
    background: var(--main-bg);
    box-shadow: inset 0 0 0 1px var(--border-color);
  }
  #gol-canvas { display: block; touch-action: none; cursor: crosshair; }
  .gol-hint { margin: 0.5rem 0 0; font-size: 0.9rem; opacity: 0.85; }
  .gol-svg-fig { margin: 1.5rem 0; text-align: center; }
  .gol-svg-fig figcaption { margin-top: 0.5rem; font-size: 0.9rem; text-align: center; color: var(--text-muted-color, #64748b); }
  .gol-rules-row {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    justify-content: center;
  }
  .gol-rules-row svg { max-width: 100px; flex: 0 0 auto; }
</style>

<div class="gol-playground" id="gol-playground">
  <h3>Interactive Life board</h3>
  <div class="gol-toolbar">
    <button type="button" class="primary" id="gol-run" aria-pressed="false">Run</button>
    <button type="button" id="gol-step">Step</button>
    <button type="button" id="gol-clear">Clear</button>
    <button type="button" id="gol-glider">Glider</button>
    <button type="button" id="gol-random">Random fill</button>
    <label><input type="checkbox" id="gol-erase"/> Erase mode</label>
    <span class="gol-stats" id="gol-stats" aria-live="polite">Generation 0 · Living cells: 0</span>
  </div>
  <div class="gol-canvas-wrap">
    <canvas id="gol-canvas" width="640" height="400" aria-label="Game of Life grid"></canvas>
  </div>
  <p class="gol-hint">Tip: paint a line or random scribble, then hit <strong>Run</strong> — stable blocks, blinkers, and gliders often appear from noise near the border between order and chaos.</p>
</div>

<script>
(function () {
  var canvas = document.getElementById('gol-canvas');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');
  var COLS = 40;
  var ROWS = 25;
  var CELL = 16;
  var LINE = typeof getComputedStyle !== 'undefined'
    ? (getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim() || 'rgba(148,163,184,0.45)')
    : 'rgba(148,163,184,0.45)';

  var grid = new Uint8Array(COLS * ROWS);
  var generation = 0;
  var running = false;
  var timer = null;
  var isPointerDown = false;
  var lastCell = { c: -1, r: -1 };

  var LIVE_FILL = '#14b8a6';
  var LIVE_STROKE = '#0f766e';
  var DEAD_FILL = 'color-mix(in srgb, var(--main-bg, #fff) 94%, #64748b 6%)';

  function idx(c, r) { return r * COLS + c; }

  function countNeighbors(c, r) {
    var n = 0;
    for (var dr = -1; dr <= 1; dr++) {
      for (var dc = -1; dc <= 1; dc++) {
        if (dc === 0 && dr === 0) continue;
        var nc = c + dc;
        var nr = r + dr;
        if (nc >= 0 && nc < COLS && nr >= 0 && nr < ROWS && grid[idx(nc, nr)]) n++;
      }
    }
    return n;
  }

  function step() {
    var next = new Uint8Array(COLS * ROWS);
    var c, r, i, n, alive;
    for (r = 0; r < ROWS; r++) {
      for (c = 0; c < COLS; c++) {
        i = idx(c, r);
        n = countNeighbors(c, r);
        alive = grid[i];
        if (alive) next[i] = (n === 2 || n === 3) ? 1 : 0;
        else next[i] = n === 3 ? 1 : 0;
      }
    }
    grid = next;
    generation++;
    draw();
    updateStats();
  }

  function livingCount() {
    var s = 0, i;
    for (i = 0; i < grid.length; i++) if (grid[i]) s++;
    return s;
  }

  function updateStats() {
    var el = document.getElementById('gol-stats');
    if (el) el.textContent = 'Generation ' + generation + ' · Living cells: ' + livingCount();
  }

  function draw() {
    var w = COLS * CELL;
    var h = ROWS * CELL;
    var dpr = window.devicePixelRatio || 1;
    if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    var c, r, x, y;
    for (r = 0; r < ROWS; r++) {
      for (c = 0; c < COLS; c++) {
        x = c * CELL;
        y = r * CELL;
        if (grid[idx(c, r)]) {
          ctx.fillStyle = LIVE_FILL;
          ctx.strokeStyle = LIVE_STROKE;
          ctx.lineWidth = 1;
          roundRect(ctx, x + 0.5, y + 0.5, CELL - 1, CELL - 1, 3);
          ctx.fill();
          ctx.stroke();
        } else {
          ctx.fillStyle = resolveDeadFill();
          ctx.fillRect(x, y, CELL, CELL);
        }
      }
    }
    ctx.strokeStyle = LINE;
    ctx.lineWidth = 1;
    for (c = 0; c <= COLS; c++) {
      ctx.beginPath();
      ctx.moveTo(c * CELL + 0.5, 0);
      ctx.lineTo(c * CELL + 0.5, h);
      ctx.stroke();
    }
    for (r = 0; r <= ROWS; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * CELL + 0.5);
      ctx.lineTo(w, r * CELL + 0.5);
      ctx.stroke();
    }
  }

  function resolveDeadFill() {
    try {
      var st = getComputedStyle(document.documentElement);
      var bg = st.getPropertyValue('--main-bg').trim();
      if (bg) return bg;
    } catch (e) {}
    return '#f8fafc';
  }

  function roundRect(ctx2, rx, ry, rw, rh, rad) {
    ctx2.beginPath();
    ctx2.moveTo(rx + rad, ry);
    ctx2.arcTo(rx + rw, ry, rx + rw, ry + rh, rad);
    ctx2.arcTo(rx + rw, ry + rh, rx, ry + rh, rad);
    ctx2.arcTo(rx, ry + rh, rx, ry, rad);
    ctx2.arcTo(rx, ry, rx + rw, ry, rad);
    ctx2.closePath();
  }

  function cellFromClient(clientX, clientY) {
    var rect = canvas.getBoundingClientRect();
    var x = clientX - rect.left;
    var y = clientY - rect.top;
    var c = Math.floor(x / CELL);
    var r = Math.floor(y / CELL);
    if (c < 0 || c >= COLS || r < 0 || r >= ROWS) return null;
    return { c: c, r: r };
  }

  function paintAt(cell, value) {
    if (!cell) return;
    if (cell.c === lastCell.c && cell.r === lastCell.r && isPointerDown) return;
    lastCell = cell;
    grid[idx(cell.c, cell.r)] = value;
    if (!running) { draw(); updateStats(); }
  }

  function handleDown(ev) {
    var erase = document.getElementById('gol-erase') && document.getElementById('gol-erase').checked;
    var right = ev.button === 2;
    var cell = cellFromClient(ev.clientX, ev.clientY);
    isPointerDown = true;
    lastCell = { c: -1, r: -1 };
    if (!cell) return;
    if (right || erase) {
      grid[idx(cell.c, cell.r)] = 0;
    } else {
      grid[idx(cell.c, cell.r)] = 1;
    }
    if (!running) { draw(); updateStats(); }
  }

  function handleMove(ev) {
    if (!isPointerDown) return;
    var erase = document.getElementById('gol-erase') && document.getElementById('gol-erase').checked;
    var cell = cellFromClient(ev.clientX, ev.clientY);
    if (!cell) return;
    if (erase || ev.buttons === 2) paintAt(cell, 0);
    else if (ev.buttons === 1 || ev.pointerType === 'touch') paintAt(cell, 1);
  }

  function handleUp() {
    isPointerDown = false;
    lastCell = { c: -1, r: -1 };
  }

  canvas.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  canvas.addEventListener('mousedown', handleDown);
  window.addEventListener('mouseup', handleUp);
  canvas.addEventListener('mousemove', handleMove);

  canvas.addEventListener('touchstart', function (e) {
    e.preventDefault();
    if (e.touches.length !== 1) return;
    var t = e.touches[0];
    var fake = { clientX: t.clientX, clientY: t.clientY, button: 0, pointerType: 'touch' };
    handleDown(fake);
  }, { passive: false });
  canvas.addEventListener('touchmove', function (e) {
    e.preventDefault();
    if (e.touches.length !== 1) return;
    var t = e.touches[0];
    handleMove({ clientX: t.clientX, clientY: t.clientY, buttons: 1, pointerType: 'touch' });
  }, { passive: false });
  canvas.addEventListener('touchend', handleUp);
  canvas.addEventListener('touchcancel', handleUp);

  function clearBoard() {
    stop();
    generation = 0;
    grid = new Uint8Array(COLS * ROWS);
    draw();
    updateStats();
  }

  function placeGlider() {
    clearBoard();
    var g = [[1,0,0],[0,1,1],[1,1,0]];
    var ox = Math.floor(COLS / 2) - 2;
    var oy = Math.floor(ROWS / 2) - 2;
    var r, c;
    for (r = 0; r < 3; r++) {
      for (c = 0; c < 3; c++) {
        if (g[r][c]) grid[idx(ox + c, oy + r)] = 1;
      }
    }
    draw();
    updateStats();
  }

  function randomFill() {
    stop();
    generation = 0;
    var i;
    for (i = 0; i < grid.length; i++) grid[i] = Math.random() < 0.22 ? 1 : 0;
    draw();
    updateStats();
  }

  function stop() {
    running = false;
    var b = document.getElementById('gol-run');
    if (b) { b.textContent = 'Run'; b.setAttribute('aria-pressed', 'false'); }
    if (timer) { clearInterval(timer); timer = null; }
  }

  function toggleRun() {
    running = !running;
    var b = document.getElementById('gol-run');
    if (running) {
      if (b) { b.textContent = 'Pause'; b.setAttribute('aria-pressed', 'true'); }
      timer = setInterval(step, 110);
    } else {
      stop();
    }
  }

  var btnRun = document.getElementById('gol-run');
  var btnStep = document.getElementById('gol-step');
  var btnClear = document.getElementById('gol-clear');
  var btnGlider = document.getElementById('gol-glider');
  var btnRand = document.getElementById('gol-random');
  if (btnRun) btnRun.addEventListener('click', toggleRun);
  if (btnStep) btnStep.addEventListener('click', function () { if (!running) step(); });
  if (btnClear) btnClear.addEventListener('click', clearBoard);
  if (btnGlider) btnGlider.addEventListener('click', placeGlider);
  if (btnRand) btnRand.addEventListener('click', randomFill);

  draw();
  updateStats();

  document.addEventListener('visibilitychange', function () {
    if (document.hidden && timer) { clearInterval(timer); timer = null; }
    else if (!document.hidden && running && !timer) timer = setInterval(step, 110);
  });
})();
</script>

## Further reading

- Gardner, Martin — the **Scientific American** columns that popularized Life.
- [LifeWiki](https://conwaylife.com/wiki/) — pattern catalog and community discoveries.
- Berlekamp, Conway & Guy, *Winning Ways* — deeper mathematical connections.

---

*If something fails to animate, ensure JavaScript is enabled; the playground is entirely client‑side.*
