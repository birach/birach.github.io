---
title: Conway's Game of Life
date: 2026-03-27 16:00:00 -0400
categories: [Mathematics, Interactive]
tags: [cellular-automata, conway, simulation, javascript, education, emergent-behavior]
description: >-
  A gentle introduction to Conway's Game of Life — rules, classic patterns as illustrations,
  and a drawing board where you paint live cells and run the simulation in your browser.
---

> **Why the board might look “missing” in the editor:** The **Interactive Life board** block below is drawn by JavaScript. **Markdown preview** (Cursor / VS Code) and **GitHub’s raw `.md` page** do not run that code. To use the playground, serve or open the **generated HTML**: run `bundle exec jekyll serve` and visit this post, or after `jekyll build` open `_site/posts/conways-game-of-life/index.html` in your browser. The **SVG illustrations** in this file work everywhere.

<style>
  /* Figures & SVGs — scroll instead of clipping wide diagrams */
  .gol-figure-wrap {
    overflow-x: auto;
    overflow-y: visible;
    margin: 1.5rem 0;
    padding: 0.25rem 0;
    -webkit-overflow-scrolling: touch;
  }
  .gol-svg-fig { margin: 1.5rem 0; text-align: center; overflow: visible; }
  .gol-svg-fig svg {
    display: block;
    margin-left: auto;
    margin-right: auto;
    max-width: 100%;
    width: auto;
    height: auto;
  }
  .gol-svg-fig figcaption {
    margin-top: 0.5rem;
    font-size: 0.9rem;
    color: var(--text-muted-color, #64748b);
  }
  .gol-rule-figures { margin: 1.75rem 0; }
  .gol-rule-figures figcaption { margin-bottom: 0.65rem; text-align: center; font-size: 0.95rem; }
  .gol-rule-flow {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 0.75rem 1rem;
    padding: 0.5rem 0;
    background: transparent;
    border: none;
    overflow: visible;
  }
  .gol-rule-flow-active {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0;
    padding: 0.5rem 0;
    background: transparent;
    border: none;
  }
  .gol-demo-row {
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: center;
    align-items: flex-start;
    margin: 1.5rem 0;
    overflow: visible;
  }
  .gol-demo-card {
    flex: 1 1 180px;
    max-width: 100%;
    margin: 0;
    overflow: visible;
  }
  .gol-demo-card figcaption {
    margin-top: 0.4rem;
    font-size: 0.85rem;
    color: var(--text-muted-color, #64748b);
    line-height: 1.35;
  }
  /* Same on-screen footprint per tile; canvas is centered inside */
  .gol-demo-card > div[data-gol-autoplay] {
    width: 100%;
    max-width: 300px;
    height: 300px;
    margin-inline: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    border-radius: 8px;
    background: color-mix(in srgb, var(--main-bg) 94%, #6366f1 6%);
    box-shadow: inset 0 0 0 1px var(--border-color, rgba(127,127,127,0.2));
    overflow: hidden;
  }
  .gol-demo-card > div[data-gol-autoplay] canvas {
    display: block;
    max-width: 100%;
    max-height: 100%;
    width: auto !important;
    height: auto !important;
  }
  .gol-demo-wide { flex: 1 1 260px; min-width: min(100%, 240px); }
  /* Three-up: oscillators & spaceships */
  .gol-demo-row.gol-demo-ships,
  .gol-demo-row.gol-demo-osc {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.25rem;
    align-items: start;
    justify-items: center;
  }
  @media (min-width: 720px) {
    .gol-demo-row.gol-demo-ships,
    .gol-demo-row.gol-demo-osc { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  }
  .gol-demo-row.gol-demo-still {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1.25rem;
  }
  @media (max-width: 720px) {
    .gol-demo-row.gol-demo-still { grid-template-columns: 1fr; }
  }
  .gol-demo-row.gol-demo-meth {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }
  @media (min-width: 720px) {
    .gol-demo-row.gol-demo-meth { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
  .gol-neighborhood-fig { margin: 1.25rem auto; text-align: center; max-width: 100%; }
  .gol-neighborhood-fig figcaption { margin-top: 0.5rem; font-size: 0.9rem; color: var(--text-muted-color, #64748b); }
</style>

I’ve wanted to put something out here for ages; procrastination only just lost a fair fight, so—Conway’s Game of Life. Talk me through it if I’m skipping a step you care about.

The rules are almost rude in how short they are; what happens next is less “three bullet points in a deck,” more “three lines on a chalkboard and suddenly you’re arguing about spaceships.” I’m writing this with genuine respect for Conway and for the math he helped popularize; the rest is allowed to be a little silly.

**Conway's Game of Life** is not a game you "win" in the usual sense. It is a **zero‑player** cellular automaton: you set up a grid of **live** and **dead** cells, press play, and watch a handful of local rules produce surprisingly rich, sometimes chaotic, sometimes periodic behavior. John Horton Conway devised it in 1970; the beauty is how elaborate structures emerge from almost trivial arithmetic on a checkerboard.

This post walks through the rules with visual diagrams, showcases a few famous families of patterns, and ends with an **interactive board** — sketch your own seed, then step or animate the evolution.

## The grid and neighborhoods

In theory the world is an **infinite** 2D grid. **On this page** the **animated demos** use an open-plane simulation and **recenter the tile** on the pattern when things move. The **interactive board** uses the same open plane but keeps the **viewport fixed** in world space so the grid does not drift step to step (spaceships can leave the window). The **rule illustrations** below use a small **fixed** patch with dead space around them (same grid size in each figure); there, cells beyond that patch are treated as dead.

Each cell has **eight neighbors** — the surrounding squares in all directions, including diagonals. Only those positions count toward \(n\).

<figure class="gol-neighborhood-fig gol-figure-wrap">
  <canvas id="gol-neighborhood-viz" width="132" height="132" role="img" aria-label="3 by 3 grid: solid teal center cell and eight lighter neighbor cells"></canvas>
  <figcaption><strong>Center cell</strong> (solid teal) and the <strong>eight neighbors</strong> (lighter teal) that it “sees” each step — styled like the interactive board below.</figcaption>
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

Each row below is **one update** on the same **9×9** patch of dead border around the little motif. The animation holds the **before** board, then **morphs**: **dying** cells **fade out** and **new** ones **ease in** as teal, then holds the **after** board.

<figure class="gol-rule-figures">
  <figcaption><strong>Loneliness</strong> — a single live cell has no neighbors; it vanishes next step.</figcaption>
  <div class="gol-rule-flow" data-gol-rule-key="lonely" data-cell="11"></div>
</figure>

<figure class="gol-rule-figures">
  <figcaption><strong>Birth</strong> — an empty cell with exactly three live neighbors becomes alive (here an L-corner fills the missing cell of a 2×2).</figcaption>
  <div class="gol-rule-flow" data-gol-rule-key="birth" data-cell="18"></div>
</figure>

<figure class="gol-rule-figures">
  <figcaption><strong>Survival</strong> — every live cell in a 2×2 block has exactly three neighbors, and no dead cell has three; the pattern is unchanged.</figcaption>
  <div class="gol-rule-flow" data-gol-rule-key="survival" data-cell="18"></div>
</figure>

<figure class="gol-rule-figures">
  <figcaption><strong>Overcrowding</strong> — the center of a solid 3×3 has eight neighbors and dies; corners have three and survive, producing a hollow ring after one step.</figcaption>
  <div class="gol-rule-flow" data-gol-rule-key="overcrowd" data-cell="14"></div>
</figure>

That is the entire ruleset — yet it is **Turing complete**: you can (in principle) embed arbitrary computation in glider‑based circuits on an infinite board.

## A zoo of patterns

Patterns are grouped by how they behave. **Teal** cells are alive. Each tile is the same on-screen size; inside, the simulation is an **open** plane (only what fits in the tile is drawn, while spaceships and debris keep moving in the “full” universe). *Spaceships here use [LifeWiki](https://conwaylife.com/wiki/) phases from `lwss.rle` and `hwss.rle`; the pulsar matches the standard **13×13** `pulsar.rle` body.*

### Still lifes (period 1)

<div class="gol-demo-row gol-demo-still">
  <figure class="gol-demo-card">
    <div data-gol-autoplay="block" data-cols="14" data-rows="14" data-target-px="300" data-interval="240"><canvas></canvas></div>
    <figcaption><strong>Block</strong></figcaption>
  </figure>
  <figure class="gol-demo-card">
    <div data-gol-autoplay="beehive" data-cols="14" data-rows="14" data-target-px="300" data-interval="240"><canvas></canvas></div>
    <figcaption><strong>Beehive</strong></figcaption>
  </figure>
  <figure class="gol-demo-card">
    <div data-gol-autoplay="loaf" data-cols="14" data-rows="14" data-target-px="300" data-interval="240"><canvas></canvas></div>
    <figcaption><strong>Loaf</strong></figcaption>
  </figure>
</div>

### Oscillators

<div class="gol-demo-row gol-demo-osc">
  <figure class="gol-demo-card">
    <div data-gol-autoplay="blinker" data-cols="16" data-rows="16" data-target-px="300" data-interval="200"><canvas></canvas></div>
    <figcaption><strong>Blinker</strong> (period 2)</figcaption>
  </figure>
  <figure class="gol-demo-card">
    <div data-gol-autoplay="toad" data-cols="16" data-rows="16" data-target-px="300" data-interval="200"><canvas></canvas></div>
    <figcaption><strong>Toad</strong> (period 2)</figcaption>
  </figure>
  <figure class="gol-demo-card">
    <div data-gol-autoplay="pulsar" data-cols="16" data-rows="16" data-target-px="300" data-interval="220"><canvas></canvas></div>
    <figcaption><strong>Pulsar</strong> (period 3, LifeWiki 13×13)</figcaption>
  </figure>
</div>

### Spaceships

<div class="gol-demo-row gol-demo-ships">
  <figure class="gol-demo-card">
    <div data-gol-autoplay="glider" data-cols="14" data-rows="14" data-target-px="300" data-interval="160"><canvas></canvas></div>
    <figcaption><strong>Glider</strong></figcaption>
  </figure>
  <figure class="gol-demo-card">
    <div data-gol-autoplay="lwss" data-cols="14" data-rows="14" data-target-px="300" data-interval="140"><canvas></canvas></div>
    <figcaption><strong>LWSS</strong> (lightweight, period 4)</figcaption>
  </figure>
  <figure class="gol-demo-card">
    <div data-gol-autoplay="hwss" data-cols="14" data-rows="14" data-target-px="300" data-interval="140"><canvas></canvas></div>
    <figcaption><strong>HWSS</strong> (heavyweight)</figcaption>
  </figure>
</div>

### Acorn and R‑pentomino

Two tiny seeds that run for a long time on an open plane. The tile **follows the center of mass** so you keep seeing the action; cells are **larger** here than in the tiny-universe demos so the **R‑pentomino** doesn’t look like static noise—watch past the first ~hundred steps and it starts throwing structured junk everywhere.

<div class="gol-demo-row gol-demo-meth">
  <figure class="gol-demo-card gol-demo-wide">
    <div data-gol-autoplay="acorn" data-cols="36" data-rows="36" data-target-px="300" data-interval="72"><canvas></canvas></div>
    <figcaption><strong>Acorn</strong> — small seed, long burn.</figcaption>
  </figure>
  <figure class="gol-demo-card gol-demo-wide">
    <div data-gol-autoplay="r_pentomino" data-cols="36" data-rows="36" data-target-px="300" data-interval="60"><canvas></canvas></div>
    <figcaption><strong>R‑pentomino</strong> — five cells, then a long messy expansion (give it time; the early ticks look deceptively tame).</figcaption>
  </figure>
</div>

---

## Try it: draw your own universe

**Open plane (infinite in code):** the simulation is **sparse** — only live cells matter — and the **viewport stays anchored** in world space (loading a preset recenters once). Patterns can travel through the plane and leave the visible window, like a fixed window on an infinite board.

**Left‑drag** paints live cells (teal), **right‑drag** or **Erase mode** erases. **Step** advances one generation; **Run** toggles **Pause**. Use **Speed** while running to change the step interval. **Presets** use the same verified RLEs as the demos where they overlap (LWSS, HWSS, pulsar from LifeWiki files).

The grid **fills the width** of the purple panel below and rescales when you resize the window.

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
  .gol-toolbar-patterns {
    width: 100%;
    margin-bottom: 0.35rem;
  }
  .gol-pattern-picker {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
    width: 100%;
  }
  .gol-pattern-picker select {
    flex: 1 1 14rem;
    min-width: 12rem;
    font: inherit;
    padding: 0.35rem 0.5rem;
    border-radius: 8px;
    border: 1px solid var(--btn-border-color, #94a3b8);
    background: var(--main-bg);
    color: var(--text-color);
  }
  .gol-speed-wrap {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.9rem;
  }
  .gol-speed-wrap input[type="range"] { width: 7rem; }
  .gol-canvas-wrap {
    width: 100%;
    min-height: min(420px, 58vw);
    aspect-ratio: 16 /10;
    border-radius: 8px;
    background: var(--main-bg);
    box-shadow: inset 0 0 0 1px var(--border-color);
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
  }
  #gol-canvas { touch-action: none; cursor: crosshair; vertical-align: middle; }
  .gol-hint { margin: 0.5rem 0 0; font-size: 0.9rem; opacity: 0.85; }
</style>

<div class="gol-playground" id="gol-playground">
  <h3>Interactive Life board</h3>
  <div class="gol-toolbar gol-toolbar-patterns">
    <div class="gol-pattern-picker">
      <label for="gol-patterns">Preset</label>
      <select id="gol-patterns" aria-label="Load preset pattern">
        <option value="" selected>— draw or choose —</option>
        <optgroup label="Still lifes">
          <option value="block">Block</option>
          <option value="beehive">Beehive</option>
          <option value="loaf">Loaf</option>
        </optgroup>
        <optgroup label="Oscillators">
          <option value="blinker">Blinker</option>
          <option value="toad">Toad</option>
          <option value="pulsar">Pulsar</option>
        </optgroup>
        <optgroup label="Spaceships">
          <option value="glider">Glider</option>
          <option value="lwss">LWSS</option>
          <option value="hwss">HWSS</option>
        </optgroup>
        <optgroup label="Long runs">
          <option value="r_pentomino">R‑pentomino</option>
          <option value="acorn">Acorn</option>
          <option value="b_heptomino">B‑heptomino</option>
          <option value="rabbits">Rabbits</option>
        </optgroup>
        <optgroup label="Guns">
          <option value="gosper_gun">Gosper glider gun</option>
        </optgroup>
        <optgroup label="Soups">
          <option value="__random__">Random soup (~22%)</option>
          <option value="__dense__">Dense soup (~40%)</option>
        </optgroup>
      </select>
    </div>
  </div>
  <div class="gol-toolbar">
    <button type="button" class="primary" id="gol-run" aria-pressed="false">Run</button>
    <button type="button" id="gol-step">Step</button>
    <button type="button" id="gol-clear">Clear</button>
    <label class="gol-speed-wrap">
      Speed <input type="range" id="gol-speed" min="10" max="100" value="78" title="Faster to the right" />
    </label>
    <label><input type="checkbox" id="gol-erase"/> Erase mode</label>
    <span class="gol-stats" id="gol-stats" aria-live="polite">Generation 0 · Living cells: 0</span>
  </div>
  <div class="gol-canvas-wrap">
    <canvas id="gol-canvas" width="640" height="400" aria-label="Game of Life grid (viewport on an infinite plane)"></canvas>
  </div>
  <p class="gol-hint">Try <strong>Gosper glider gun</strong>: gliders stream out across the plane. The window stays put, so pick the preset again from the menu if you want to jump back and re-center on the gun.</p>
</div>

<script src="/assets/js/conway-life-common.js" defer></script>
<script src="/assets/js/conway-demos.js" defer></script>
<script src="/assets/js/conway-life-board.js" defer></script>

## Further reading

- Gardner, Martin — the **Scientific American** columns that popularized Life.
- [LifeWiki](https://conwaylife.com/wiki/) — pattern catalog and community discoveries.
- Berlekamp, Conway & Guy, *Winning Ways* — deeper mathematical connections.

---

*If animations fail on the **built** page, ensure JavaScript is allowed and these load in order: `assets/js/conway-life-common.js`, `conway-demos.js`, `conway-life-board.js`.*
