(function () {
  "use strict";

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var rupee = function (n) {
    return "₹" + Math.round(n).toLocaleString("en-IN");
  };

  var SCENE = { x: 262, y: 338 };
  var UNITS_PER_KM = 22;
  var DIR_WORD = { E: "East", N: "North", W: "West", S: "South" };

  function fmt(n) { return Math.round(n * 10) / 10; }

  var CORRIDORS = {
    E: { label: "East — Saswad road", nodes: [{ x: 400, y: 322 }, { x: 545, y: 352 }, { x: 700, y: 318 }] },
    N: { label: "North — Walhewari road", nodes: [{ x: 316, y: 250 }, { x: 404, y: 158 }, { x: 486, y: 92 }] },
    W: { label: "West — Karanji road", nodes: [{ x: 170, y: 300 }, { x: 92, y: 246 }] },
    S: { label: "South — Nimgaon road", nodes: [{ x: 296, y: 432 }, { x: 336, y: 546 }, { x: 380, y: 632 }] }
  };

  var VILLAGES = [
    { name: "Saswad", x: 430, y: 400 },
    { name: "Walhewadi", x: 400, y: 210 },
    { name: "Karanji", x: 150, y: 290 },
    { name: "Nimgaon", x: 320, y: 490 },
    { name: "Bhor", x: 610, y: 430 },
    { name: "Bhugaon", x: 170, y: 480 },
    { name: "Pashan", x: 440, y: 150 },
    { name: "Malegaon Bk", x: 820, y: 180 },
    { name: "Loni", x: 520, y: 545 },
    { name: "Sus", x: 110, y: 180 }
  ];

  var GARAGES = [
    {
      id: "G-04", name: "Sahyadri Auto Works", village: "Saswad approach", x: 468, y: 342,
      corridors: ["E"], phone: "98xxx x1140",
      obs: { type: "SUV", color: "White", damage: "Front-right", ageH: 71, plate: "…45K", job: "Bonnet repaint + bumper replace", photos: 6 }
    },
    {
      id: "G-08", name: "Kisan Auto Care", village: "Saswad", x: 640, y: 336,
      corridors: ["E"], phone: "97xxx x2208",
      obs: { type: "Tractor", color: "Red", damage: "Front-left", ageH: 20, plate: "full", job: "Headlight + grill work", photos: 4 }
    },
    {
      id: "G-12", name: "Ghorpade Garage", village: "Karanji road", x: 200, y: 330,
      corridors: ["W"], phone: "99xxx x7731",
      obs: { type: "Sedan", color: "White", damage: "Front-right", ageH: 92, plate: "…2103", job: "Panel repair + repaint", photos: 5 }
    },
    {
      id: "G-15", name: "Pashan Auto Works", village: "Pashan", x: 404, y: 166,
      corridors: ["N"], phone: "96xxx x5519",
      obs: { type: "Hatchback", color: "Red", damage: "Rear-right", ageH: 46, plate: "full", job: "Rear bumper + boot lid", photos: 5 }
    },
    {
      id: "G-19", name: "Nimgaon Motors", village: "Nimgaon", x: 342, y: 540,
      corridors: ["S"], phone: "95xxx x8824",
      obs: { type: "SUV", color: "White", damage: "Front-right", ageH: 55, plate: "…9907", job: "Accident repair — full paint", photos: 8 }
    },
    {
      id: "G-21", name: "Bombay Tyre & Body", village: "Bhugaon", x: 156, y: 546,
      corridors: ["S", "W"], phone: "94xxx x3367",
      obs: { type: "Tempo", color: "Blue", damage: "Left side", ageH: 31, plate: "full", job: "Side panel straighten", photos: 4 }
    },
    {
      id: "G-23", name: "Mauli Motors", village: "Bhor road", x: 700, y: 452,
      corridors: ["E"], phone: "93xxx x1176",
      obs: { type: "SUV", color: "Red", damage: "Rear-left", ageH: 62, plate: "…3321", job: "Tail lamp + quarter panel", photos: 5 }
    },
    {
      id: "G-26", name: "Patil Auto Clinic", village: "Bhor", x: 796, y: 330,
      corridors: ["E"], phone: "92xxx x6043",
      obs: { type: "Sedan", color: "White", damage: "Rear", ageH: 120, plate: "…7781", job: "Repaint, dent removal", photos: 5 }
    },
    {
      id: "G-28", name: "Dange Auto Works", village: "Loni", x: 556, y: 622,
      corridors: ["S", "E"], phone: "90xxx x4402",
      obs: { type: "Hatchback", color: "White", damage: "Front-right", ageH: 41, plate: "…1145", job: "Fender + headlamp", photos: 5 }
    },
    {
      id: "G-30", name: "Chakan Tyre & Auto", village: "Walhewari", x: 470, y: 106,
      corridors: ["N"], phone: "88xxx x9910",
      obs: { type: "SUV", color: "White", damage: "Front-right", ageH: 17, plate: "full", job: "Fresh accident job — 3 panels", photos: 7 }
    }
  ];

  var SIDE = {
    "Front-left": "left", "Rear-left": "left", "Left side": "left",
    "Front-right": "right", "Rear-right": "right", "Right side": "right",
    "Rear": "rear", "Unclear": "any"
  };
  var PANEL = {
    "Front-left": "front", "Front-right": "front",
    "Rear-left": "rear", "Rear-right": "rear",
    "Left side": "side", "Right side": "side",
    "Rear": "rear", "Unclear": "any"
  };

  function distKm(ax, ay, bx, by) {
    var dx = ax - bx, dy = ay - by;
    return Math.sqrt(dx * dx + dy * dy) / UNITS_PER_KM;
  }

  function nearScene(d) { return d <= 1.6; }
  function onProbableRoute(g, dir, d) {
    if (nearScene(d)) return true;
    return g.corridors.indexOf(dir) !== -1;
  }

  function routeScore(g, dir, d) {
    if (!onProbableRoute(g, dir, d)) {
      return { pts: 0, label: "off the probable route (" + d.toFixed(1) + " km out)" };
    }
    var prox = Math.max(0, 1 - d / 22);
    return {
      pts: 15 * (0.45 + 0.55 * prox),
      label: "on probable route, " + d.toFixed(1) + " km out"
    };
  }

  function timeScore(h) {
    if (h < 2) return { pts: 2, label: "arrived " + h + "h after — too soon for a body shop" };
    if (h <= 10) return { pts: 6 + (h - 2) * 0.5, label: "arrived " + h + "h after — prompt, plausible" };
    if (h <= 36) return { pts: 10, label: "arrived " + h + "h after — typical repair window" };
    if (h <= 96) return { pts: 10 - (h - 36) / 12, label: "arrived " + h + "h after — slightly late" };
    return { pts: Math.max(0, 5 - (h - 96) / 14), label: "arrived " + h + "h after — outside window" };
  }

  var zone = { dir: "E", radius: 10 };

  function zoneStats() {
    var inZone = GARAGES.filter(function (g) { return distKm(SCENE.x, SCENE.y, g.x, g.y) <= zone.radius; });
    var onRoute = inZone.filter(function (g) { return onProbableRoute(g, zone.dir, distKm(SCENE.x, SCENE.y, g.x, g.y)); });
    var villages = VILLAGES.filter(function (v) { return distKm(SCENE.x, SCENE.y, v.x, v.y) <= zone.radius; });
    var roadKm = Math.max(1, Math.round(zone.radius * 2.15));
    return { inZone: inZone, onRoute: onRoute, villages: villages, corridors: onRoute.length > 0 ? 2 : 1, roadKm: roadKm };
  }

  function svgEl(name, attrs) {
    var e = document.createElementNS("http://www.w3.org/2000/svg", name);
    for (var k in attrs) { if (attrs.hasOwnProperty(k)) e.setAttribute(k, attrs[k]); }
    return e;
  }

  function buildMap() {
    var host = $("#zoneMap");
    if (!host) return;
    var W = 1000, H = 660;
    var svg = svgEl("svg", { viewBox: "0 0 " + W + " " + H, preserveAspectRatio: "xMidYMid meet" });

    var defs = svgEl("defs", {});
    var grid = svgEl("pattern", { id: "mapgrid", width: "40", height: "40", patternUnits: "userSpaceOnUse" });
    grid.appendChild(svgEl("path", { d: "M 40 0 L 0 0 0 40", fill: "none", stroke: "#141b25", "stroke-width": "1" }));
    defs.appendChild(grid);
    var glow = svgEl("radialGradient", { id: "zoneglow" });
    glow.appendChild(svgEl("stop", { offset: "0%", "stop-color": "#f5a524", "stop-opacity": "0.2" }));
    glow.appendChild(svgEl("stop", { offset: "100%", "stop-color": "#f5a524", "stop-opacity": "0" }));
    defs.appendChild(glow);
    svg.appendChild(defs);

    svg.appendChild(svgEl("rect", { x: 0, y: 0, width: W, height: H, fill: "url(#mapgrid)" }));

    var gZone = svgEl("g", { class: "zone-layer" });
    var gRoads = svgEl("g", {});
    var gVillages = svgEl("g", {});
    var gGarages = svgEl("g", {});

    Object.keys(CORRIDORS).forEach(function (key) {
      var c = CORRIDORS[key];
      var d = "M " + SCENE.x + " " + SCENE.y + " " + c.nodes.map(function (n) { return "L " + n.x + " " + n.y; }).join(" ");
      var p = svgEl("path", { d: d, class: "mg-road", "data-corridor": key });
      gRoads.appendChild(p);
    });

    svg.appendChild(gZone);
    svg.appendChild(gRoads);
    svg.appendChild(gVillages);
    svg.appendChild(gGarages);

    VILLAGES.forEach(function (v) {
      var g = svgEl("g", { class: "mg-village" });
      g.appendChild(svgEl("circle", { cx: v.x, cy: v.y, r: 4, fill: "#22d3ee" }));
      g.appendChild(svgEl("circle", { cx: v.x, cy: v.y, r: 9, fill: "none", stroke: "rgba(34,211,238,.25)" }));
      var t = svgEl("text", { x: v.x + 11, y: v.y + 4, class: "mg-label" });
      t.textContent = v.name;
      g.appendChild(t);
      gVillages.appendChild(g);
    });

    GARAGES.forEach(function (gr) {
      var g = svgEl("g", { class: "mg-garage", "data-id": gr.id });
      g.appendChild(svgEl("rect", {
        x: gr.x - 6, y: gr.y - 6, width: 12, height: 12, rx: 3,
        class: "body", fill: "#34d399", stroke: "#04120d", "stroke-width": "1.5"
      }));
      var t = svgEl("text", { x: gr.x + 12, y: gr.y + 4, class: "mg-label" });
      t.textContent = gr.id;
      g.appendChild(t);
      var title = svgEl("title", {});
      title.textContent = gr.name + " — " + gr.village;
      g.appendChild(title);
      gGarages.appendChild(g);
    });

    var gScene = svgEl("g", {});
    gScene.appendChild(svgEl("circle", { cx: SCENE.x, cy: SCENE.y, r: 30, fill: "url(#zoneglow)" }));
    gScene.appendChild(svgEl("circle", { cx: SCENE.x, cy: SCENE.y, r: 9, fill: "#f87171" }));
    gScene.appendChild(svgEl("circle", { cx: SCENE.x, cy: SCENE.y, r: 15, fill: "none", stroke: "rgba(248,113,113,.45)", "stroke-dasharray": "3 3" }));
    var st = svgEl("text", { x: SCENE.x - 4, y: SCENE.y - 22, class: "mg-label on" });
    st.textContent = "INCIDENT";
    gScene.appendChild(st);
    svg.appendChild(gScene);

    host.appendChild(svg);

    var zoneCircle = svgEl("circle", { class: "mg-zone", cx: SCENE.x, cy: SCENE.y });
    gZone.appendChild(zoneCircle);

    host._parts = { zoneCircle: zoneCircle, gZone: gZone, gRoads: gRoads, gGarages: gGarages };
    renderMap();
  }

  function renderMap() {
    var host = $("#zoneMap");
    if (!host || !host._parts) return;
    var p = host._parts;
    p.zoneCircle.setAttribute("r", zone.radius * UNITS_PER_KM);

    $$(".mg-road", p.gRoads).forEach(function (el) {
      el.classList.toggle("on", el.getAttribute("data-corridor") === zone.dir);
    });

    GARAGES.forEach(function (gr) {
      var node = p.gGarages.querySelector('[data-id="' + gr.id + '"]');
      if (!node) return;
      var d = distKm(SCENE.x, SCENE.y, gr.x, gr.y);
      var inZone = d <= zone.radius;
      var onRoute = onProbableRoute(gr, zone.dir, d) && inZone;
      var body = node.querySelector(".body");
      var label = node.querySelector("text");
      body.setAttribute("fill", onRoute ? "#34d399" : inZone ? "#8a94a3" : "#39424f");
      body.setAttribute("opacity", inZone ? "1" : "0.4");
      label.classList.toggle("on", onRoute);
      label.setAttribute("opacity", inZone ? "1" : "0.35");
    });

    var s = zoneStats();
    $("#zrGarages").textContent = s.inZone.length;
    $("#zrOnRoute").textContent = s.onRoute.length;
    $("#zrVillages").textContent = s.villages.length;
    $("#zrRoad").textContent = s.roadKm + " km";
  }

  function initZone() {
    var dirWrap = $("#zoneDir");
    if (dirWrap) {
      dirWrap.addEventListener("click", function (e) {
        var b = e.target.closest("button[data-dir]");
        if (!b) return;
        $$("button", dirWrap).forEach(function (x) { x.classList.remove("is-on"); x.setAttribute("aria-checked", "false"); });
        b.classList.add("is-on");
        b.setAttribute("aria-checked", "true");
        zone.dir = b.getAttribute("data-dir");
        renderMap();
      });
    }
    var rad = $("#zoneRadius");
    if (rad) {
      rad.addEventListener("input", function () {
        zone.radius = parseInt(rad.value, 10);
        $("#zoneRadiusOut").textContent = zone.radius + " km";
        renderMap();
      });
    }
  }

  function scoreCase(v) {
    return GARAGES.map(function (g) {
      var d = distKm(SCENE.x, SCENE.y, g.x, g.y);
      var f = [];

      var typePts = g.obs.type === v.type ? 25 : 0;
      f.push({ k: "Category", got: typePts, max: 25, txt: typePts ? g.obs.type : g.obs.type + " (vs " + v.type + ")" });

      var colorPts = g.obs.color === v.color ? 20 : 0;
      f.push({ k: "Colour", got: colorPts, max: 20, txt: colorPts ? g.obs.color : g.obs.color + " (vs " + v.color + ")" });

      var dScore = 0, dTxt = g.obs.damage;
      if (g.obs.damage === v.damage) { dScore = 30; }
      else if (SIDE[g.obs.damage] === SIDE[v.damage] && SIDE[v.damage] !== "any") { dScore = 15; dTxt += " (opposite side)"; }
      else if (PANEL[g.obs.damage] === PANEL[v.damage] && PANEL[v.damage] !== "any") { dScore = 8; dTxt += " (same panel group)"; }
      else if (v.damage === "Unclear") { dScore = 6; dTxt += " (victim uncertain)"; }
      f.push({ k: "Damage", got: dScore, max: 30, txt: dTxt });

      var r = routeScore(g, v.dir, d);
      f.push({ k: "Route", got: r.pts, max: 15, txt: r.label });

      var t = timeScore(g.obs.ageH);
      f.push({ k: "Timing", got: t.pts, max: 10, txt: t.label });

      var total = typePts + colorPts + dScore + r.pts + t.pts;
      var appearance = typePts + colorPts + dScore;
      var corroborated = r.pts > 0 && t.pts >= 7;
      var conf = total >= 70 && corroborated ? "hi" : total >= 45 ? "md" : "lo";
      var note = "";
      if (appearance >= 60 && conf !== "hi") {
        note = "Appearance matches, but the geography and timing do not corroborate it. Worth a phone call, not a conclusion.";
      } else if (corroborated && appearance < 60) {
        note = "On the right road in the right window, but the vehicle description does not match well.";
      }
      return {
        g: g, dist: d, total: total, factors: f, conf: conf, note: note,
        confLabel: conf === "hi" ? "High" : conf === "md" ? "Medium" : "Low",
        dScore: dScore
      };
    }).sort(function (a, b) { return b.total - a.total; });
  }

  function runEngine() {
    var list = $("#resList");
    if (!list) return;
    var v = {
      type: $("#mType").value,
      color: $("#mColor").value,
      damage: $("#mDamage").value,
      dir: $("#mDir").value,
      hour: parseInt($("#mHour").value, 10)
    };
    var results = scoreCase(v);
    var high = results.filter(function (r) { return r.conf === "hi"; }).length;
    var viable = results.filter(function (r) { return r.total >= 30; }).length;

    list.innerHTML = "";
    results.forEach(function (r, i) {
      var el = document.createElement("article");
      el.className = "cand is-" + r.conf;
      var f = r.factors.map(function (x) {
        return '<div class="factor' + (x.got === 0 ? " zero" : "") + '"><b>' + x.k +
          '</b><span>' + x.txt + '</span><span class="fpts">' + fmt(x.got) + "/" + x.max + "</span></div>";
      }).join("");
      el.innerHTML =
        '<div class="cand-top"><div><div class="cand-name">' + (i + 1) + ". " + r.g.name +
        '</div><div class="cand-loc">' + r.g.id + " · " + r.g.village + " · " + r.dist.toFixed(1) + " km from scene · " +
        r.g.obs.job + " · plate " + r.g.obs.plate + " · " + r.g.obs.photos + " photos</div></div>" +
        '<div style="text-align:right;flex-shrink:0"><div class="cand-score">' + Math.round(r.total) +
        '<span style="font-size:.5em;color:var(--muted)">/100</span></div>' +
        '<div class="cand-conf ' + r.conf + '">' + r.confLabel + "</div></div></div>" +
        '<div class="cand-bar"><i style="width:' + fmt(Math.min(100, r.total)) + '%"></i></div>' +
        '<div class="factors">' + f + "</div>" +
        (r.note ? '<p class="cand-note">' + r.note + "</p>" : "");
      list.appendChild(el);
    });

    $("#resCount").textContent =
      "Case TB-1147 · " + v.color + " " + v.type + " · " + v.damage +
      " · heading " + (DIR_WORD[v.dir] || v.dir) + " · " + String(v.hour).padStart(2, "0") + ":00 · " +
      results.length + " observations scored · " + high + " high, " + viable + " worth a look";
  }

  function initEngine() {
    var run = $("#runEngine");
    if (run) run.addEventListener("click", runEngine);
    var reset = $("#resetEngine");
    if (reset) {
      reset.addEventListener("click", function () {
        $("#mType").value = "SUV";
        $("#mColor").value = "White";
        $("#mDamage").value = "Front-right";
        $("#mDir").value = "E";
        $("#mHour").value = 19;
        $("#mHourOut").textContent = "19:00";
        runEngine();
      });
    }
    var hour = $("#mHour");
    if (hour) {
      hour.addEventListener("input", function () {
        $("#mHourOut").textContent = String(hour.value).padStart(2, "0") + ":00";
      });
    }
    var hourOut = $("#mHourOut");
    if (hourOut && hour) hourOut.textContent = String(hour.value).padStart(2, "0") + ":00";
  }

  function initCalc() {
    var ids = { cases: "#cCases", cost: "#cCost", lead: "#cLead", pay: "#cPay", price: "#cPrice", mrr: "#cMrr" };
    if (!$(ids.cases)) return;

    function calc() {
      var cases = parseInt($(ids.cases).value, 10);
      var cost = parseInt($(ids.cost).value, 10);
      var lead = parseInt($(ids.lead).value, 10) / 100;
      var pay = parseInt($(ids.pay).value, 10) / 100;
      var price = parseInt($(ids.price).value, 10);
      var mrr = parseFloat($(ids.mrr).value) || 0;

      var revenue = cases * pay * price;
      var caseCost = cases * cost;
      var leads = cases * lead;
      var contribution = revenue - caseCost;

      var cplVar = leads > 0 ? caseCost / leads : 0;
      var cplFull = leads > 0 ? (caseCost + mrr) / leads : 0;
      var perCaseMargin = pay * price - cost;
      var unitCeiling = price * lead;
      var goodCeiling = price * 0.6 * lead;

      $("#cCasesOut").textContent = cases;
      $("#cCostOut").textContent = rupee(cost);
      $("#cLeadOut").textContent = Math.round(lead * 100) + "%";
      $("#cPayOut").textContent = Math.round(pay * 100) + "%";
      $("#oRev").textContent = rupee(revenue);
      $("#oCost").textContent = rupee(caseCost);
      $("#oMargin").textContent = rupee(contribution);
      $("#oMrr").textContent = rupee(mrr);
      $("#oLeads").textContent = Math.round(leads);
      $("#oCpl").textContent = leads > 0 ? rupee(cplFull) : "—";
      $("#oCplVar").textContent = leads > 0 ? rupee(cplVar) : "—";

      var v = $("#oVerdict");
      v.classList.remove("is-good", "is-thin", "is-bad");
      var title, body;

      if (leads <= 0) {
        v.classList.add("is-bad");
        title = "No lead, no business.";
        body = "At a " + Math.round(lead * 100) + "% useful-lead rate the search produces nothing worth charging for. More network density is the only fix — a better model is irrelevant here.";
      } else if (perCaseMargin <= 0) {
        v.classList.add("is-bad");
        title = "Every case loses money before the network cost.";
        body = "A paid case returns " + rupee(pay * price) + " and costs " + rupee(cost) + " to run, so the " + rupee(mrr) + " fixed cost is being funded entirely out of pocket. At a " + Math.round(lead * 100) + "% lead rate, a search would need to cost under " + rupee(unitCeiling) + " to break even on its own.";
      } else if (cplVar <= price * 0.6) {
        v.classList.add("is-good");
        title = "There may be a business here.";
        body = "A useful lead costs " + rupee(cplVar) + " to produce and the victim pays " + rupee(price) + ". That leaves real room. The only remaining job is density and garage compliance — and getting the cost of a search down from " + rupee(cost) + " towards " + rupee(goodCeiling) + " would widen it further.";
      } else if (cplVar <= price) {
        v.classList.add("is-thin");
        title = "Thin. It survives, barely.";
        body = "A lead costs " + rupee(cplVar) + " against a " + rupee(price) + " package. Any increase in investigator time, or a fall in the " + Math.round(lead * 100) + "% lead rate, puts this underwater. This is the scenario most likely to kill the business quietly.";
      } else {
        v.classList.add("is-bad");
        title = "Unviable as configured.";
        body = "A lead costs " + rupee(cplVar) + " but the victim pays " + rupee(price) + " — and only " + Math.round(pay * 100) + "% of cases pay at all. Model sophistication will not fix this. At a " + Math.round(lead * 100) + "% lead rate, a search has to cost under " + rupee(unitCeiling) + ", which is less than half the current " + rupee(cost) + ".";
      }

      v.querySelector("strong").textContent = title;
      v.querySelector("p").textContent = body;

      var fix;
      if (contribution >= mrr) {
        fix = "At " + cases + " cases a month the contribution of " + rupee(contribution) + " covers the " + rupee(mrr) + " fixed network cost. The network pays for itself — the question becomes whether the lead rate holds as volume grows.";
      } else {
        var need = perCaseMargin > 0 ? Math.ceil(mrr / perCaseMargin) : 0;
        fix = perCaseMargin > 0
          ? "Contribution of " + rupee(contribution) + " does not yet cover the " + rupee(mrr) + " fixed cost. Break-even is roughly " + need + " paid investigations a month at this margin — or a lower " + rupee(mrr) + " network cost."
          : "Contribution is negative, so no volume fixes this. Price, cost or lead rate has to change first.";
      }
      $("#oFix").textContent = fix;
    }

    ["#cCases", "#cCost", "#cLead", "#cPay"].forEach(function (sel) {
      $(sel).addEventListener("input", calc);
    });
    $(ids.price).addEventListener("change", calc);
    $(ids.mrr).addEventListener("input", calc);

    var presets = {
      base: { cases: 120, cost: 200, lead: 45, pay: 55, price: 499, mrr: 22000 },
      scaled: { cases: 400, cost: 90, lead: 55, pay: 65, price: 499, mrr: 60000 },
      thin: { cases: 45, cost: 320, lead: 22, pay: 40, price: 499, mrr: 30000 },
      bad: { cases: 60, cost: 420, lead: 8, pay: 35, price: 299, mrr: 25000 }
    };
    $$(".calc-presets button").forEach(function (b) {
      b.addEventListener("click", function () {
        var p = presets[b.getAttribute("data-preset")];
        if (!p) return;
        $("#cCases").value = p.cases;
        $("#cCost").value = p.cost;
        $("#cLead").value = p.lead;
        $("#cPay").value = p.pay;
        $("#cPrice").value = p.price;
        $("#cMrr").value = p.mrr;
        calc();
      });
    });

    calc();
  }

  function initNav() {
    var nav = $("#nav");
    var bar = $("#progressBar");
    var toggle = $("#navToggle");
    var list = $("#navList");

    if (toggle && list) {
      toggle.addEventListener("click", function () {
        var open = list.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
      list.addEventListener("click", function (e) {
        if (e.target.tagName === "A") {
          list.classList.remove("is-open");
          toggle.setAttribute("aria-expanded", "false");
        }
      });
    }

    var links = $$('.nav-list a[href^="#"]');
    var targets = links.map(function (a) { return document.getElementById(a.getAttribute("href").slice(1)); }).filter(Boolean);

    function onScroll() {
      var y = window.scrollY || document.documentElement.scrollTop;
      if (nav) nav.classList.toggle("is-stuck", y > 20);
      var h = document.documentElement.scrollHeight - window.innerHeight;
      if (bar) bar.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";

      var current = null;
      targets.forEach(function (sec) {
        if (sec.getBoundingClientRect().top <= 140) current = sec.id;
      });
      links.forEach(function (a) {
        a.classList.toggle("is-active", a.getAttribute("href") === "#" + current);
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  function initReveal() {
    var els = $$(".reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (e) { e.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    els.forEach(function (e) { io.observe(e); });
  }

  function initCounters() {
    var nums = $$(".count");
    if (!nums.length) return;
    function animate(el) {
      var to = parseFloat(el.getAttribute("data-to"));
      var pre = el.getAttribute("data-prefix") || "";
      var suf = el.getAttribute("data-suffix") || "";
      var start = performance.now();
      var dur = 1250;
      function step(t) {
        var p = Math.min(1, (t - start) / dur);
        var e = 1 - Math.pow(1 - p, 3);
        var v = to * e;
        el.textContent = pre + Math.round(v).toLocaleString("en-IN") + suf;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
    if (!("IntersectionObserver" in window)) { nums.forEach(animate); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { animate(en.target); io.unobserve(en.target); }
      });
    }, { threshold: 0.5 });
    nums.forEach(function (n) { io.observe(n); });
  }

  function initCapture() {
    var el = $("#cfTime");
    if (!el) return;
    el.textContent = "~45 seconds";
  }

  function boot() {
    initNav();
    buildMap();
    initZone();
    initEngine();
    initCalc();
    initReveal();
    initCounters();
    initCapture();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
