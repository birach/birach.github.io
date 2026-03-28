/**
 * Auto-playing demos + neighborhood diagram (needs conway-life-common.js).
 */
(function () {
  var CL = window.ConwayLife;
  if (!CL) return;

  var LIVE = "#14b8a6";
  var LIVE_STROKE = "#0f766e";
  var RULE_GRID = 9;
  var DEMO_BOX_CSS = 300;

  function patternExtent(lines) {
    var h = lines.length;
    var w = 0;
    for (var i = 0; i < h; i++) w = Math.max(w, lines[i].length);
    return { w: w, h: h };
  }

  function deadFill() {
    var dead = "#f1f5f9";
    try {
      var v = getComputedStyle(document.documentElement)
        .getPropertyValue("--main-bg")
        .trim();
      if (v) dead = v;
    } catch (e) {}
    return dead;
  }

  function roundRectPath(ctx, x, y, rw, rh, rad) {
    ctx.beginPath();
    ctx.moveTo(x + rad, y);
    ctx.arcTo(x + rw, y, x + rw, y + rh, rad);
    ctx.arcTo(x + rw, y + rh, x, y + rh, rad);
    ctx.arcTo(x, y + rh, x, y, rad);
    ctx.arcTo(x, y, x + rw, y, rad);
    ctx.closePath();
  }

  function drawMini(canvas, grid, cols, rows, cs) {
    cs = cs || 8;
    var w = cols * cs;
    var h = rows * cs;
    var dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    canvas.style.maxWidth = "100%";
    canvas.style.maxHeight = "100%";
    var ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    var dead = deadFill();
    var r, c, rad;
    for (r = 0; r < rows; r++) {
      for (c = 0; c < cols; c++) {
        var x = c * cs;
        var y = r * cs;
        rad = Math.max(1, cs * 0.2);
        if (grid[CL.idx(c, r, cols)]) {
          ctx.globalAlpha = 1;
          ctx.fillStyle = LIVE;
          ctx.strokeStyle = LIVE_STROKE;
          ctx.lineWidth = 1;
          roundRectPath(ctx, x + 0.5, y + 0.5, cs - 1, cs - 1, rad);
          ctx.fill();
          ctx.stroke();
        } else {
          ctx.globalAlpha = 1;
          ctx.fillStyle = dead;
          ctx.fillRect(x, y, cs, cs);
        }
      }
    }
    ctx.globalAlpha = 1;
    ctx.strokeStyle = "rgba(148,163,184,0.35)";
    for (c = 0; c <= cols; c++) {
      ctx.beginPath();
      ctx.moveTo(c * cs + 0.5, 0);
      ctx.lineTo(c * cs + 0.5, h);
      ctx.stroke();
    }
    for (r = 0; r <= rows; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * cs + 0.5);
      ctx.lineTo(w, r * cs + 0.5);
      ctx.stroke();
    }
  }

  function drawSparseMini(canvas, live, viewCX, viewCY, cols, rows, cs) {
    cs = cs || 8;
    var w = cols * cs;
    var h = rows * cs;
    var dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    canvas.style.maxWidth = "100%";
    canvas.style.maxHeight = "100%";
    var ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    var dead = deadFill();
    var halfC = Math.floor(cols / 2);
    var halfR = Math.floor(rows / 2);
    var r, c, rad, wx, wy, k;
    for (r = 0; r < rows; r++) {
      for (c = 0; c < cols; c++) {
        wx = viewCX + c - halfC;
        wy = viewCY + r - halfR;
        k = CL.cellKey(wx, wy);
        var x = c * cs;
        var y = r * cs;
        rad = Math.max(1, cs * 0.2);
        if (live.has(k)) {
          ctx.globalAlpha = 1;
          ctx.fillStyle = LIVE;
          ctx.strokeStyle = LIVE_STROKE;
          ctx.lineWidth = 1;
          roundRectPath(ctx, x + 0.5, y + 0.5, cs - 1, cs - 1, rad);
          ctx.fill();
          ctx.stroke();
        } else {
          ctx.globalAlpha = 1;
          ctx.fillStyle = dead;
          ctx.fillRect(x, y, cs, cs);
        }
      }
    }
    ctx.globalAlpha = 1;
    ctx.strokeStyle = "rgba(148,163,184,0.35)";
    for (c = 0; c <= cols; c++) {
      ctx.beginPath();
      ctx.moveTo(c * cs + 0.5, 0);
      ctx.lineTo(c * cs + 0.5, h);
      ctx.stroke();
    }
    for (r = 0; r <= rows; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * cs + 0.5);
      ctx.lineTo(w, r * cs + 0.5);
      ctx.stroke();
    }
  }

  /** Rule diagram: same grid, cells fade out (die) or fade in teal (birth). */
  function drawRuleMorph(canvas, gridA, gridB, cols, rows, cs, tMorph) {
    cs = cs || 14;
    var w = cols * cs;
    var h = rows * cs;
    var dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    canvas.style.maxWidth = "100%";
    canvas.style.display = "block";
    canvas.style.margin = "0 auto";
    var ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    var dead = deadFill();
    var smooth = tMorph * tMorph * (3 - 2 * tMorph);
    var r, c, aOn, bOn, x, y, rad;
    for (r = 0; r < rows; r++) {
      for (c = 0; c < cols; c++) {
        var i = CL.idx(c, r, cols);
        aOn = !!gridA[i];
        bOn = !!gridB[i];
        x = c * cs;
        y = r * cs;
        rad = Math.max(1, cs * 0.2);
        if (aOn === bOn) {
          if (aOn) {
            ctx.globalAlpha = 1;
            ctx.fillStyle = LIVE;
            ctx.strokeStyle = LIVE_STROKE;
            ctx.lineWidth = 1;
            roundRectPath(ctx, x + 0.5, y + 0.5, cs - 1, cs - 1, rad);
            ctx.fill();
            ctx.stroke();
          } else {
            ctx.globalAlpha = 1;
            ctx.fillStyle = dead;
            ctx.fillRect(x, y, cs, cs);
          }
        } else if (aOn && !bOn) {
          ctx.fillStyle = dead;
          ctx.fillRect(x, y, cs, cs);
          ctx.globalAlpha = 1 - smooth;
          ctx.fillStyle = LIVE;
          ctx.strokeStyle = LIVE_STROKE;
          ctx.lineWidth = 1;
          roundRectPath(ctx, x + 0.5, y + 0.5, cs - 1, cs - 1, rad);
          ctx.fill();
          ctx.stroke();
          ctx.globalAlpha = 1;
        } else {
          ctx.fillStyle = dead;
          ctx.fillRect(x, y, cs, cs);
          ctx.globalAlpha = smooth;
          ctx.fillStyle = LIVE;
          ctx.strokeStyle = LIVE_STROKE;
          ctx.lineWidth = 1;
          roundRectPath(ctx, x + 0.5, y + 0.5, cs - 1, cs - 1, rad);
          ctx.fill();
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }
    }
    ctx.strokeStyle = "rgba(148,163,184,0.35)";
    for (c = 0; c <= cols; c++) {
      ctx.beginPath();
      ctx.moveTo(c * cs + 0.5, 0);
      ctx.lineTo(c * cs + 0.5, h);
      ctx.stroke();
    }
    for (r = 0; r <= rows; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * cs + 0.5);
      ctx.lineTo(w, r * cs + 0.5);
      ctx.stroke();
    }
  }

  /** 3×3 neighborhood: center + eight neighbors, dashboard-style (matches main board). */
  function mountNeighborhoodViz() {
    var canvas = document.getElementById("gol-neighborhood-viz");
    if (!canvas || !canvas.getContext) return;
    var cols = 3;
    var rows = 3;
    var cs = 44;
    var w = cols * cs;
    var h = rows * cs;
    var dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    canvas.style.maxWidth = "100%";
    canvas.style.margin = "0 auto";
    canvas.style.display = "block";
    var ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var dead = deadFill();

    var cr, cc;
    for (cr = 0; cr < 3; cr++) {
      for (cc = 0; cc < 3; cc++) {
        var x = cc * cs;
        var y = cr * cs;
        var rad = Math.max(2, cs * 0.22);
        if (cr === 1 && cc === 1) {
          ctx.fillStyle = LIVE;
          ctx.strokeStyle = LIVE_STROKE;
          ctx.lineWidth = 1.5;
          roundRectPath(ctx, x + 1, y + 1, cs - 2, cs - 2, rad);
          ctx.fill();
          ctx.stroke();
        } else {
          ctx.fillStyle = dead;
          ctx.fillRect(x, y, cs, cs);
          ctx.fillStyle = "rgba(20,184,166,0.28)";
          ctx.strokeStyle = "rgba(13,148,136,0.55)";
          ctx.lineWidth = 1.5;
          roundRectPath(ctx, x + 1, y + 1, cs - 2, cs - 2, rad);
          ctx.fill();
          ctx.stroke();
        }
      }
    }
    ctx.strokeStyle = "rgba(148,163,184,0.45)";
    ctx.lineWidth = 1;
    for (cc = 0; cc <= 3; cc++) {
      ctx.beginPath();
      ctx.moveTo(cc * cs + 0.5, 0);
      ctx.lineTo(cc * cs + 0.5, h);
      ctx.stroke();
    }
    for (cr = 0; cr <= 3; cr++) {
      ctx.beginPath();
      ctx.moveTo(0, cr * cs + 0.5);
      ctx.lineTo(w, cr * cs + 0.5);
      ctx.stroke();
    }
  }

  function mountRuleFlows() {
    document.querySelectorAll("[data-gol-rule-key]").forEach(function (wrap) {
      var key = wrap.getAttribute("data-gol-rule-key");
      var d = CL.RULE_DEMOS[key];
      if (!d) return;
      var cell =
        parseInt(wrap.getAttribute("data-cell"), 10) || Math.floor(280 / RULE_GRID);

      var beforePadded = CL.padLinesCentered(d.before, RULE_GRID, RULE_GRID);
      var G = CL.gridFromLines(beforePadded);
      var next = CL.stepFinite(G.grid, RULE_GRID, RULE_GRID);
      var gridA = G.grid;
      var gridB = next;

      wrap.innerHTML = "";
      wrap.classList.add("gol-rule-flow-active");
      var cnv = document.createElement("canvas");
      cnv.className = "gol-rule-anim-canvas";
      cnv.setAttribute("role", "img");
      wrap.appendChild(cnv);

      var HOLD = 1100;
      var MORPH = 1000;
      var CYCLE = HOLD + MORPH + HOLD;
      var start = performance.now();

      function tick(now) {
        var elapsed = (now - start) % CYCLE;
        var tMorph;
        if (elapsed < HOLD) tMorph = 0;
        else if (elapsed < HOLD + MORPH)
          tMorph = (elapsed - HOLD) / MORPH;
        else tMorph = 1;
        drawRuleMorph(cnv, gridA, gridB, RULE_GRID, RULE_GRID, cell, tMorph);
        requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }

  function mountAutoplays() {
    document.querySelectorAll("[data-gol-autoplay]").forEach(function (el) {
      var key = el.getAttribute("data-gol-autoplay");
      var canvas = el.querySelector("canvas");
      if (!canvas || !key) return;
      var lines = CL.PATTERNS[key];
      if (!lines) return;

      var cols = parseInt(el.getAttribute("data-cols"), 10);
      var rows = parseInt(el.getAttribute("data-rows"), 10);
      if (isNaN(cols) || isNaN(rows)) {
        var pad = parseInt(el.getAttribute("data-pad"), 10);
        if (isNaN(pad)) pad = 8;
        var ex = patternExtent(lines);
        cols = ex.w + 2 * pad;
        rows = ex.h + 2 * pad;
      }
      cols = Math.max(cols, 8);
      rows = Math.max(rows, 8);

      var box = DEMO_BOX_CSS;
      var targetPx = parseInt(el.getAttribute("data-target-px"), 10);
      if (!isNaN(targetPx)) box = Math.min(box, targetPx);
      try {
        var rect = el.getBoundingClientRect();
        if (rect.width > 40) box = Math.min(box, Math.floor(rect.width));
      } catch (e) {}

      var nmax = Math.max(cols, rows);
      var cell = Math.max(2, Math.floor(box / nmax));
      var overrideCell = parseInt(el.getAttribute("data-cell"), 10);
      if (!isNaN(overrideCell)) cell = overrideCell;

      var interval = parseInt(el.getAttribute("data-interval"), 10) || 170;

      var live = new Set();
      var ex2 = patternExtent(lines);
      CL.addPatternToLive(
        live,
        lines,
        -Math.floor(ex2.w / 2),
        -Math.floor(ex2.h / 2)
      );
      var viewCX = 0;
      var viewCY = 0;
      if (live.size) {
        var ce0 = CL.centroidOfLive(live);
        viewCX = Math.round(ce0.x);
        viewCY = Math.round(ce0.y);
      }

      function tick() {
        live = CL.stepSparse(live);
        if (live.size) {
          var ce = CL.centroidOfLive(live);
          viewCX = Math.round(ce.x);
          viewCY = Math.round(ce.y);
        }
        drawSparseMini(canvas, live, viewCX, viewCY, cols, rows, cell);
      }

      drawSparseMini(canvas, live, viewCX, viewCY, cols, rows, cell);
      var id = setInterval(tick, interval);
      el.setAttribute("data-timer-id", String(id));
    });
  }

  function init() {
    mountNeighborhoodViz();
    mountRuleFlows();
    mountAutoplays();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
