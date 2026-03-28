/**
 * Interactive Life board: infinite plane (sparse) with a viewport window (requires conway-life-common.js).
 */
(function () {
  function init() {
    var CL = window.ConwayLife;
    var canvas = document.getElementById("gol-canvas");
    var wrap = canvas && canvas.parentElement;
    if (!CL || !canvas || !canvas.getContext || !wrap) return;

    var ctx = canvas.getContext("2d");
    var COLS = 64;
    var ROWS = 40;
    var dimensionsReady = false;

    var live = new Set();
    var viewCX = 0;
    var viewCY = 0;

    var LINE =
      typeof getComputedStyle !== "undefined"
        ? getComputedStyle(document.documentElement)
            .getPropertyValue("--border-color")
            .trim() || "rgba(148,163,184,0.45)"
        : "rgba(148,163,184,0.45)";

    var generation = 0;
    var running = false;
    var timer = null;
    var isPointerDown = false;
    var lastCell = { c: -1, r: -1 };

    var LIVE_FILL = "#14b8a6";
    var LIVE_STROKE = "#0f766e";

    var speedEl = document.getElementById("gol-speed");
    var patternSelect = document.getElementById("gol-patterns");

    function ensureDimensions() {
      if (dimensionsReady) return;
      var w = Math.max(280, wrap.clientWidth);
      var h = Math.max(320, wrap.clientHeight);
      var t = 8.5;
      COLS = Math.floor(w / t);
      ROWS = Math.floor(h / t);
      COLS = Math.max(52, Math.min(96, COLS));
      ROWS = Math.max(34, Math.min(60, ROWS));
      dimensionsReady = true;
    }

    function halfC() {
      return Math.floor(COLS / 2);
    }
    function halfR() {
      return Math.floor(ROWS / 2);
    }

    function worldAtScreen(sc, sr) {
      return {
        wx: viewCX + sc - halfC(),
        wy: viewCY + sr - halfR(),
      };
    }

    function centerCameraOnLive() {
      if (!live.size) return;
      var ce = CL.centroidOfLive(live);
      viewCX = Math.round(ce.x);
      viewCY = Math.round(ce.y);
    }

    function step() {
      ensureDimensions();
      live = CL.stepSparse(live);
      generation++;
      draw();
      updateStats();
    }

    function msFromSpeedSlider() {
      if (!speedEl) return 110;
      var v = parseInt(speedEl.value, 10);
      if (isNaN(v)) v = 78;
      v = Math.max(10, Math.min(100, v));
      return Math.round(520 - v * 5);
    }

    function restartTimer() {
      if (!running || !timer) return;
      clearInterval(timer);
      timer = setInterval(step, msFromSpeedSlider());
    }

    function livingCount() {
      return live.size;
    }

    function updateStats() {
      var el = document.getElementById("gol-stats");
      if (el)
        el.textContent =
          "Generation " + generation + " · Living cells: " + livingCount();
    }

    function readWrapSize() {
      var W = Math.max(260, wrap.clientWidth);
      var H = wrap.clientHeight;
      if (H < 80) H = Math.max(340, Math.floor(W * 0.58));
      return { W: W, H: H };
    }

    function layoutMetrics() {
      ensureDimensions();
      var R = readWrapSize();
      var W = R.W;
      var H = R.H;
      var s = Math.min(W / COLS, H / ROWS);
      var ox = (W - COLS * s) / 2;
      var oy = (H - ROWS * s) / 2;
      return { W: W, H: H, s: s, ox: ox, oy: oy };
    }

    function resolveDeadFill() {
      try {
        var st = getComputedStyle(document.documentElement);
        var bg = st.getPropertyValue("--main-bg").trim();
        if (bg) return bg;
      } catch (e) {}
      return "#f8fafc";
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

    function draw() {
      ensureDimensions();
      var m = layoutMetrics();
      var W = m.W;
      var H = m.H;
      var s = m.s;
      var ox = m.ox;
      var oy = m.oy;
      var dpr = window.devicePixelRatio || 1;

      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      canvas.style.display = "block";
      canvas.style.margin = "0 auto";

      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      var hc = halfC();
      var hr = halfR();
      var r, c, x, y, wx, wy, k;
      var rad = Math.max(1.2, s * 0.18);
      var deadFill = resolveDeadFill();

      for (r = 0; r < ROWS; r++) {
        for (c = 0; c < COLS; c++) {
          wx = viewCX + c - hc;
          wy = viewCY + r - hr;
          k = CL.cellKey(wx, wy);
          x = ox + c * s;
          y = oy + r * s;
          if (live.has(k)) {
            ctx.fillStyle = LIVE_FILL;
            ctx.strokeStyle = LIVE_STROKE;
            ctx.lineWidth = 1;
            roundRect(ctx, x + 0.5, y + 0.5, s - 1, s - 1, rad);
            ctx.fill();
            ctx.stroke();
          } else {
            ctx.fillStyle = deadFill;
            ctx.fillRect(x, y, s, s);
          }
        }
      }

      ctx.strokeStyle = LINE;
      ctx.lineWidth = 1;
      for (c = 0; c <= COLS; c++) {
        ctx.beginPath();
        ctx.moveTo(ox + c * s + 0.5, oy);
        ctx.lineTo(ox + c * s + 0.5, oy + ROWS * s);
        ctx.stroke();
      }
      for (r = 0; r <= ROWS; r++) {
        ctx.beginPath();
        ctx.moveTo(ox, oy + r * s + 0.5);
        ctx.lineTo(ox + COLS * s, oy + r * s + 0.5);
        ctx.stroke();
      }
    }

    function cellFromClient(clientX, clientY) {
      ensureDimensions();
      var rect = canvas.getBoundingClientRect();
      var m = layoutMetrics();
      var px = clientX - rect.left;
      var py = clientY - rect.top;
      if (rect.width < 2 || rect.height < 2) return null;
      var c = Math.floor((px - m.ox) / m.s);
      var r = Math.floor((py - m.oy) / m.s);
      if (c < 0 || c >= COLS || r < 0 || r >= ROWS) return null;
      return { c: c, r: r };
    }

    function paintAt(cell, value) {
      if (!cell) return;
      if (cell.c === lastCell.c && cell.r === lastCell.r && isPointerDown)
        return;
      lastCell = cell;
      var w = worldAtScreen(cell.c, cell.r);
      var k = CL.cellKey(w.wx, w.wy);
      if (value) live.add(k);
      else live.delete(k);
      if (!running) {
        draw();
        updateStats();
      }
    }

    function handleDown(ev) {
      ensureDimensions();
      var eraseEl = document.getElementById("gol-erase");
      var erase = eraseEl && eraseEl.checked;
      var cell = cellFromClient(ev.clientX, ev.clientY);
      isPointerDown = true;
      lastCell = { c: -1, r: -1 };
      if (!cell) return;
      var w = worldAtScreen(cell.c, cell.r);
      var k = CL.cellKey(w.wx, w.wy);
      if (ev.button === 2 || erase) live.delete(k);
      else live.add(k);
      if (!running) {
        draw();
        updateStats();
      }
    }

    function handleMove(ev) {
      if (!isPointerDown) return;
      var eraseEl = document.getElementById("gol-erase");
      var erase = eraseEl && eraseEl.checked;
      var cell = cellFromClient(ev.clientX, ev.clientY);
      if (!cell) return;
      if (erase || ev.buttons === 2) paintAt(cell, 0);
      else if (ev.buttons === 1 || ev.pointerType === "touch") paintAt(cell, 1);
    }

    function handleUp() {
      isPointerDown = false;
      lastCell = { c: -1, r: -1 };
    }

    canvas.addEventListener("contextmenu", function (e) {
      e.preventDefault();
    });
    canvas.addEventListener("mousedown", handleDown);
    window.addEventListener("mouseup", handleUp);
    canvas.addEventListener("mousemove", handleMove);

    canvas.addEventListener(
      "touchstart",
      function (e) {
        e.preventDefault();
        if (e.touches.length !== 1) return;
        var t = e.touches[0];
        handleDown({
          clientX: t.clientX,
          clientY: t.clientY,
          button: 0,
          pointerType: "touch",
        });
      },
      { passive: false }
    );
    canvas.addEventListener(
      "touchmove",
      function (e) {
        e.preventDefault();
        if (e.touches.length !== 1) return;
        var t = e.touches[0];
        handleMove({
          clientX: t.clientX,
          clientY: t.clientY,
          buttons: 1,
          pointerType: "touch",
        });
      },
      { passive: false }
    );
    canvas.addEventListener("touchend", handleUp);
    canvas.addEventListener("touchcancel", handleUp);

    function stop() {
      running = false;
      var b = document.getElementById("gol-run");
      if (b) {
        b.textContent = "Run";
        b.setAttribute("aria-pressed", "false");
      }
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    function clearBoard() {
      stop();
      ensureDimensions();
      generation = 0;
      live.clear();
      viewCX = 0;
      viewCY = 0;
      draw();
      updateStats();
    }

    function patternExtent(lines) {
      var h = lines.length;
      var w = 0;
      for (var i = 0; i < h; i++) w = Math.max(w, lines[i].length);
      return { w: w, h: h };
    }

    function fillViewRandom(p) {
      live.clear();
      viewCX = 0;
      viewCY = 0;
      ensureDimensions();
      var sr, sc, wcell;
      for (sr = 0; sr < ROWS; sr++) {
        for (sc = 0; sc < COLS; sc++) {
          if (Math.random() < p) {
            wcell = worldAtScreen(sc, sr);
            live.add(CL.cellKey(wcell.wx, wcell.wy));
          }
        }
      }
    }

    function loadPattern(key) {
      ensureDimensions();
      stop();
      generation = 0;
      live.clear();
      viewCX = 0;
      viewCY = 0;

      if (key === "__random__") {
        fillViewRandom(0.22);
        centerCameraOnLive();
        draw();
        updateStats();
        return;
      }
      if (key === "__dense__") {
        fillViewRandom(0.4);
        centerCameraOnLive();
        draw();
        updateStats();
        return;
      }
      var lines = CL.PATTERNS[key];
      if (!lines) return;
      var ex = patternExtent(lines);
      var ox = -Math.floor(ex.w / 2);
      var oy = -Math.floor(ex.h / 2);
      CL.addPatternToLive(live, lines, ox, oy);
      centerCameraOnLive();
      draw();
      updateStats();
    }

    function toggleRun() {
      ensureDimensions();
      running = !running;
      var b = document.getElementById("gol-run");
      if (running) {
        if (b) {
          b.textContent = "Pause";
          b.setAttribute("aria-pressed", "true");
        }
        timer = setInterval(step, msFromSpeedSlider());
      } else {
        stop();
      }
    }

    var btnRun = document.getElementById("gol-run");
    var btnStep = document.getElementById("gol-step");
    var btnClear = document.getElementById("gol-clear");
    if (btnRun) btnRun.addEventListener("click", toggleRun);
    if (btnStep)
      btnStep.addEventListener("click", function () {
        if (!running) step();
      });
    if (btnClear) btnClear.addEventListener("click", clearBoard);

    if (speedEl) {
      speedEl.addEventListener("input", restartTimer);
      speedEl.addEventListener("change", restartTimer);
    }

    if (patternSelect) {
      patternSelect.addEventListener("change", function () {
        var v = patternSelect.value;
        if (v) loadPattern(v);
      });
    }

    function onResize() {
      if (!dimensionsReady) return;
      draw();
    }

    if (typeof ResizeObserver !== "undefined") {
      var ro = new ResizeObserver(onResize);
      ro.observe(wrap);
    } else {
      window.addEventListener("resize", onResize);
    }

    ensureDimensions();
    draw();
    updateStats();

    document.addEventListener("visibilitychange", function () {
      if (document.hidden && timer) {
        clearInterval(timer);
        timer = null;
      } else if (!document.hidden && running && !timer)
        timer = setInterval(step, msFromSpeedSlider());
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
