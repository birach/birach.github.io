/**
 * Shared finite-grid Life engine + pattern library (LifeWiki RLEs where noted).
 */
(function () {
  function idx(c, r, cols) {
    return r * cols + c;
  }

  function countNeighborsFinite(grid, c, r, cols, rows) {
    var n = 0;
    for (var dr = -1; dr <= 1; dr++) {
      for (var dc = -1; dc <= 1; dc++) {
        if (dc === 0 && dr === 0) continue;
        var nc = c + dc;
        var nr = r + dr;
        if (nc < 0 || nc >= cols || nr < 0 || nr >= rows) continue;
        if (grid[idx(nc, nr, cols)]) n++;
      }
    }
    return n;
  }

  function stepFinite(grid, cols, rows) {
    var next = new Uint8Array(cols * rows);
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var i = idx(c, r, cols);
        var n = countNeighborsFinite(grid, c, r, cols, rows);
        if (grid[i]) next[i] = n === 2 || n === 3 ? 1 : 0;
        else next[i] = n === 3 ? 1 : 0;
      }
    }
    return next;
  }

  function parseRLEBody(body) {
    var rows = [];
    var row = "";
    body = body.replace(/\s/g, "");
    var i = 0;
    while (i < body.length) {
      var ch = body[i];
      if (ch === "!") {
        rows.push(row);
        break;
      }
      var num = 0;
      while (i < body.length && body[i] >= "0" && body[i] <= "9") {
        num = num * 10 + parseInt(body[i], 10);
        i++;
      }
      if (num === 0) num = 1;
      ch = body[i++];
      if (ch === "b") row += ".".repeat(num);
      else if (ch === "o") row += "O".repeat(num);
      else if (ch === "$") {
        rows.push(row);
        row = "";
        for (var k = 1; k < num; k++) rows.push("");
      }
    }
    var maxW = 0;
    for (var r = 0; r < rows.length; r++)
      maxW = Math.max(maxW, rows[r].length);
    for (var r2 = 0; r2 < rows.length; r2++)
      rows[r2] = rows[r2] + ".".repeat(maxW - rows[r2].length);
    return rows;
  }

  function parseRLE(str) {
    var lines = str.split(/\r?\n/);
    var body = "";
    for (var li = 0; li < lines.length; li++) {
      var line = lines[li].trim();
      if (!line || line[0] === "#") continue;
      if (/^x\s*=/i.test(line)) continue;
      body += line;
    }
    return parseRLEBody(body);
  }

  function linesFromStrings(arr) {
    var maxW = 0;
    for (var i = 0; i < arr.length; i++)
      maxW = Math.max(maxW, arr[i].replace(/\s/g, "").length);
    return arr.map(function (line) {
      var s = line.replace(/\s/g, "");
      return s + ".".repeat(maxW - s.length);
    });
  }

  function clearGrid(grid) {
    for (var i = 0; i < grid.length; i++) grid[i] = 0;
  }

  /** Paste pattern; cells outside the board are clipped (no wrap). */
  function placeLines(grid, cols, rows, patternLines, ox, oy) {
    for (var pr = 0; pr < patternLines.length; pr++) {
      var line = patternLines[pr];
      for (var pc = 0; pc < line.length; pc++) {
        var ch = line[pc];
        if (ch === "O" || ch === "*" || ch === "1") {
          var cc = ox + pc;
          var rr = oy + pr;
          if (cc >= 0 && cc < cols && rr >= 0 && rr < rows)
            grid[idx(cc, rr, cols)] = 1;
        }
      }
    }
  }

  function gridFromLines(patternLines) {
    var lines = patternLines.slice();
    var h = lines.length;
    var w = 0;
    for (var r = 0; r < h; r++) w = Math.max(w, lines[r].length);
    var g = new Uint8Array(w * h);
    placeLines(g, w, h, lines, 0, 0);
    return { grid: g, cols: w, rows: h };
  }

  function linesFromGrid(grid, cols, rows) {
    var out = [];
    for (var r = 0; r < rows; r++) {
      var row = "";
      for (var c = 0; c < cols; c++)
        row += grid[idx(c, r, cols)] ? "O" : ".";
      out.push(row);
    }
    return out;
  }

  /** Stable key for sparse sets (infinite plane). */
  function cellKey(x, y) {
    return x + "," + y;
  }

  function parseCellKey(k) {
    var p = k.split(",");
    return { x: +p[0], y: +p[1] };
  }

  /**
   * One generation on an infinite plane (only live cells + neighbors considered).
   * @param {Set<string>} live — keys "x,y"
   */
  function stepSparse(live) {
    var counts = new Map();
    live.forEach(function (key) {
      var p = parseCellKey(key);
      var x = p.x;
      var y = p.y;
      for (var dr = -1; dr <= 1; dr++) {
        for (var dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          var nk = cellKey(x + dc, y + dr);
          counts.set(nk, (counts.get(nk) || 0) + 1);
        }
      }
    });
    var next = new Set();
    counts.forEach(function (n, key) {
      var alive = live.has(key);
      if (alive && (n === 2 || n === 3)) next.add(key);
      else if (!alive && n === 3) next.add(key);
    });
    return next;
  }

  /** Add live cells from ASCII pattern lines at world origin (ox, oy). */
  function addPatternToLive(live, patternLines, ox, oy) {
    for (var pr = 0; pr < patternLines.length; pr++) {
      var line = patternLines[pr];
      for (var pc = 0; pc < line.length; pc++) {
        var ch = line[pc];
        if (ch === "O" || ch === "*" || ch === "1")
          live.add(cellKey(ox + pc, oy + pr));
      }
    }
  }

  function centroidOfLive(live) {
    if (!live.size) return { x: 0, y: 0 };
    var sx = 0;
    var sy = 0;
    live.forEach(function (key) {
      var p = parseCellKey(key);
      sx += p.x;
      sy += p.y;
    });
    var n = live.size;
    return { x: sx / n, y: sy / n };
  }

  /** Pad with dead cells so pattern sits centered in a tw×th rectangle. */
  function padLinesCentered(lines, tw, th) {
    var h = lines.length;
    var w = 0;
    for (var i = 0; i < h; i++) w = Math.max(w, lines[i].length);
    var oy = Math.max(0, Math.floor((th - h) / 2));
    var ox = Math.max(0, Math.floor((tw - w) / 2));
    var out = [];
    var r;
    for (r = 0; r < th; r++) {
      if (r < oy || r >= oy + h) {
        out.push(".".repeat(tw));
        continue;
      }
      var row = lines[r - oy];
      var seg = row.length <= tw - ox ? row : row.slice(0, tw - ox);
      out.push(".".repeat(ox) + seg + ".".repeat(tw - ox - seg.length));
    }
    return out;
  }

  /** Gosper glider gun — LifeWiki. */
  var RLE_GOSPER =
    "24bo$22bobo$12b2o6b2o12b2o$11bo3bo4b2o12b2o$2o8bo5bo3b2o$2o8bo3bob2o4bobo$10bo5bo7bo$11bo3bo$12b2o!";

  /** Pulsar — period 3, LifeWiki patterns/pulsar.rle (13×13) */
  var RLE_PULSAR =
    "2b3o3b3o2b2$o4bobo4bo$o4bobo4bo$o4bobo4bo$2b3o3b3o2b2$2b3o3b3o2b$o4bobo4bo$o4bobo4bo$o4bobo4bo2$2b3o3b3o!";

  /** xWSS — LifeWiki patterns lwss.rle, mwss.rle, hwss.rle */
  var RLE_LWSS = "bo2bo$o4b$o3bo$4o!";
  var RLE_MWSS = "3bo2b$bo3bo$o5b$o4bo$5o!";
  var RLE_HWSS = "3b2o2b$bo4bo$o6b$o5bo$6o!";

  var PATTERNS = {
    block: linesFromStrings(["OO", "OO"]),
    /** Beehive — 6 cells, strict still life (canonical shape) */
    beehive: linesFromStrings([".OO.", "O..O", ".OO."]),
    loaf: linesFromStrings(["..OO.", ".O..O", ".O.O.", "..O.."]),
    blinker: linesFromStrings(["OOO"]),
    toad: linesFromStrings([".OOO", "OOO."]),
    beacon: linesFromStrings(["OO..", "O...", "..O.", "..OO"]),
    pulsar: parseRLE(RLE_PULSAR),
    glider: linesFromStrings([".O..", "..O.", "OOO."]),
    lwss: parseRLE(RLE_LWSS),
    mwss: parseRLE(RLE_MWSS),
    hwss: parseRLE(RLE_HWSS),
    r_pentomino: linesFromStrings([".OO", "OO.", ".O."]),
    diehard: linesFromStrings(["......O.", "OO......", ".O...OOO"]),
    acorn: linesFromStrings([".O.....", "...O...", "OO..OOO"]),
    gosper_gun: parseRLE(RLE_GOSPER),
    rabbits: parseRLE("o3bo$2o2bo$2o2b2o!"),
    b_heptomino: linesFromStrings(["OO...", ".OO..", "..OO."]),
  };

  var RULE_DEMOS = {
    lonely: (function () {
      var lines = [
        ".....",
        ".....",
        "..O..",
        ".....",
        ".....",
      ];
      var G = gridFromLines(lines);
      var n = stepFinite(G.grid, G.cols, G.rows);
      return { before: lines, after: linesFromGrid(n, G.cols, G.rows) };
    })(),
    birth: (function () {
      var lines = ["OO.", "O..", "..."];
      var G = gridFromLines(lines);
      var n = stepFinite(G.grid, G.cols, G.rows);
      return { before: lines, after: linesFromGrid(n, G.cols, G.rows) };
    })(),
    survival: (function () {
      var b = ["OO", "OO"];
      var G = gridFromLines(b);
      var n = stepFinite(G.grid, G.cols, G.rows);
      return { before: b, after: linesFromGrid(n, G.cols, G.rows) };
    })(),
    overcrowd: (function () {
      var lines = ["OOO", "OOO", "OOO"];
      var G = gridFromLines(lines);
      var n = stepFinite(G.grid, G.cols, G.rows);
      return { before: lines, after: linesFromGrid(n, G.cols, G.rows) };
    })(),
  };

  window.ConwayLife = {
    idx: idx,
    stepFinite: stepFinite,
    stepToroidal: stepFinite,
    countNeighborsFinite: countNeighborsFinite,
    countNeighborsToroidal: countNeighborsFinite,
    placeLines: placeLines,
    clearGrid: clearGrid,
    gridFromLines: gridFromLines,
    linesFromGrid: linesFromGrid,
    parseRLE: parseRLE,
    cellKey: cellKey,
    parseCellKey: parseCellKey,
    stepSparse: stepSparse,
    addPatternToLive: addPatternToLive,
    centroidOfLive: centroidOfLive,
    padLinesCentered: padLinesCentered,
    PATTERNS: PATTERNS,
    RULE_DEMOS: RULE_DEMOS,
  };
})();
