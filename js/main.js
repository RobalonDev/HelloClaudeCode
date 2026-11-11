(() => {
  "use strict";

  const P = window.PROFILE;
  const I18N = window.I18N;
  if (!P || !I18N) {
    console.error("Faltan js/data.js o js/i18n.js");
    return;
  }

  const LANGS = ["es", "en"];
  const $ = (selector, root = document) => root.querySelector(selector);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Idioma ---------- */

  let lang = initialLang();

  function initialLang() {
    try {
      const saved = localStorage.getItem("lang");
      if (LANGS.includes(saved)) return saved;
    } catch {
      /* almacenamiento no disponible */
    }
    return (navigator.language || "es").toLowerCase().startsWith("en") ? "en" : "es";
  }

  function saveLang() {
    try {
      localStorage.setItem("lang", lang);
    } catch {
      /* almacenamiento no disponible */
    }
  }

  /** Texto de contenido: si es { es, en } devuelve el del idioma activo. */
  const tr = (value) => (value && typeof value === "object" && !Array.isArray(value) ? value[lang] : value);
  /** Texto de interfaz desde I18N. */
  const ui = (key) => I18N[lang][key] ?? key;

  /* ---------- Utilidades DOM ---------- */

  /** Crea un elemento. Usa textContent para no inyectar HTML desde los datos. */
  function el(tag, props = {}, children = []) {
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(props)) {
      if (value == null || value === false) continue;
      if (key === "class") node.className = value;
      else if (key === "text") node.textContent = value;
      else node.setAttribute(key, value);
    }
    for (const child of [].concat(children)) if (child != null) node.append(child);
    return node;
  }

  const names = (items) => el("ul", { class: "names" }, items.map((i) => el("li", { text: tr(i) })));

  /** Valor de un par: un array se pinta como una línea por elemento. */
  const pairValue = (value) => {
    const v = tr(value);
    return Array.isArray(v) ? el("dd", {}, v.map((line) => el("span", { text: line }))) : el("dd", { text: v });
  };

  /* ---------- Render ---------- */

  function renderStatic() {
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-i18n]").forEach((node) => (node.textContent = ui(node.dataset.i18n)));
    document
      .querySelectorAll("[data-i18n-aria]")
      .forEach((node) => node.setAttribute("aria-label", ui(node.dataset.i18nAria)));

    const toggle = $("#lang-toggle");
    toggle.textContent = lang === "es" ? "EN" : "ES";
    toggle.setAttribute("aria-label", ui("lang_switch"));
  }

  function renderContent() {
    document.title = `${P.name} — ${tr(P.role)}`;
    $('meta[name="description"]')?.setAttribute("content", tr(P.tagline));
    $("#footer-name").textContent = P.name;
    $("#year").textContent = new Date().getFullYear();

    // Portada: el nombre se parte en dos líneas.
    const words = P.name.split(" ");
    const half = Math.ceil(words.length / 2);
    $("#hero-name").replaceChildren(
      el("span", { text: words.slice(0, half).join(" ") }),
      el("span", { text: words.slice(half).join(" ") }),
    );
    $("#hero-role").textContent = tr(P.role);
    $("#hero-tagline").textContent = tr(P.tagline);

    // Sobre mí
    $("#about-text").replaceChildren(...tr(P.about).map((p) => el("p", { text: p })));
    $("#about-facts").replaceChildren(...P.facts.flatMap((f) => [el("dt", { text: tr(f.label) }), pairValue(f.value)]));

    // Stack
    $("#stack-list").replaceChildren(
      ...P.stack.flatMap((g) => [el("dt", { text: tr(g.group) }), el("dd", { text: g.items.map(tr).join(", ") })]),
    );

    // Experiencia
    $("#experience-list").replaceChildren(
      ...P.experience.map((job) =>
        el("li", { class: "job" }, [
          el("div", { class: "job-head" }, [
            el("h3", { text: job.company }),
            job.sector ? el("span", { class: "job-sector", text: tr(job.sector) }) : null,
          ]),
          el("p", { text: tr(job.description) }),
          job.integrations?.length
            ? el("div", {}, [el("p", { class: "job-sub", text: ui("exp_integrations") }), names(job.integrations)])
            : null,
        ]),
      ),
    );

    // Contacto
    const mail = $("#contact-email");
    mail.href = `mailto:${P.email}`;
    mail.textContent = P.email;
  }

  /* ---------- Sistema en vivo (canvas de la portada) ---------- */

  function initFlow() {
    const canvas = $("#flow-canvas");
    if (!canvas?.getContext) return { redraw() {} };
    const ctx = canvas.getContext("2d");

    const css = getComputedStyle(document.documentElement);
    const token = (name) => css.getPropertyValue(name).trim();
    const COLORS = {
      line: token("--brote"),
      text: token("--papel"),
      node: token("--nodo"),
      cache: token("--coral"),
      request: token("--brote"),
      event: token("--ambar"),
    };

    // Coordenadas relativas (0..1): x/y para el diagrama horizontal, v para el vertical (pantallas estrechas).
    // label: texto fijo; labelKey: clave de I18N.
    const NODES = {
      client: { x: 0.04, y: 0.5, v: { x: 0.5, y: 0.04 }, labelKey: "node_client" },
      api: { x: 0.25, y: 0.5, v: { x: 0.5, y: 0.2 }, label: "API NestJS" },
      redis: { x: 0.4, y: 0.12, v: { x: 0.1, y: 0.35 }, label: "Redis" },
      bus: { x: 0.5, y: 0.5, v: { x: 0.5, y: 0.45 }, labelKey: "node_events" },
      queue: { x: 0.72, y: 0.5, v: { x: 0.5, y: 0.72 }, labelKey: "node_queue" },
      worker: { x: 0.96, y: 0.5, v: { x: 0.5, y: 0.96 }, label: "Worker" },
      db: { x: 0.6, y: 0.88, v: { x: 0.98, y: 0.575 }, label: "PostgreSQL (Prisma)" },
    };
    const labelOf = (node) => node.label ?? ui(node.labelKey);

    const EDGES = [
      ["client", "api"],
      ["api", "redis"],
      ["api", "db"],
      ["api", "bus"],
      ["bus", "queue"],
      ["queue", "worker"],
      ["worker", "db"],
    ];
    const FLOWS = [
      { kind: "cache", path: ["client", "api", "redis"], weight: 3 },
      { kind: "request", path: ["client", "api", "db"], weight: 2 },
      { kind: "event", path: ["client", "api", "bus", "queue", "worker", "db"], weight: 3 },
    ];
    const totalWeight = FLOWS.reduce((sum, f) => sum + f.weight, 0);
    const pickFlow = () => {
      let r = Math.random() * totalWeight;
      for (const flow of FLOWS) if ((r -= flow.weight) < 0) return flow;
      return FLOWS[0];
    };

    const SPEED = 170; // px/s
    const FONT = 'condensed 600 15px "Archivo", system-ui, sans-serif';
    const NODE_H = 38;
    const pos = {};
    const pulse = {};
    const pulseColor = {};
    const counts = { cache: 0, request: 0, event: 0 };
    const counterEls = { cache: $("#count-cache"), request: $("#count-request"), event: $("#count-event") };
    let W = 0;
    let H = 0;
    let packets = [];
    let spawnIn = 0;
    let lastTs = 0;
    let running = false;
    let rafId = 0;

    if (reduceMotion) Object.values(counterEls).forEach((c) => c?.remove());

    function layout() {
      const rect = canvas.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = FONT;

      const vertical = W < 640;
      const padY = 32;
      for (const [key, node] of Object.entries(NODES)) {
        const { x: nx, y: ny } = vertical ? node.v : node;
        // Margen horizontal suficiente para que la caja del nodo no se corte.
        const padX = ctx.measureText(labelOf(node)).width / 2 + 20;
        pos[key] = { x: padX + nx * (W - 2 * padX), y: padY + ny * (H - 2 * padY) };
      }
    }

    function roundRect(x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);

      // Conexiones
      ctx.save();
      ctx.globalAlpha = 0.45;
      ctx.lineWidth = 1.25;
      ctx.strokeStyle = COLORS.line;
      for (const [a, b] of EDGES) {
        ctx.beginPath();
        ctx.moveTo(pos[a].x, pos[a].y);
        ctx.lineTo(pos[b].x, pos[b].y);
        ctx.stroke();
      }
      ctx.restore();

      // Mensajes en tránsito
      for (const p of packets) {
        const a = pos[p.flow.path[p.seg]];
        const b = pos[p.flow.path[p.seg + 1]];
        const color = COLORS[p.flow.kind];
        ctx.save();
        ctx.shadowColor = color;
        ctx.shadowBlur = 10;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(a.x + (b.x - a.x) * p.t, a.y + (b.y - a.y) * p.t, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Nodos
      ctx.font = FONT;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (const [key, node] of Object.entries(NODES)) {
        const { x, y } = pos[key];
        const label = labelOf(node);
        const w = ctx.measureText(label).width + 28;
        const h = NODE_H;
        const pv = pulse[key] || 0;

        if (pv > 0) {
          const grow = (1 - pv) * 9;
          ctx.save();
          ctx.globalAlpha = pv;
          ctx.strokeStyle = pulseColor[key];
          ctx.lineWidth = 1.5;
          roundRect(x - w / 2 - grow, y - h / 2 - grow, w + grow * 2, h + grow * 2, 4 + grow);
          ctx.stroke();
          ctx.restore();
        }

        roundRect(x - w / 2, y - h / 2, w, h, 4);
        ctx.fillStyle = COLORS.node;
        ctx.fill();
        ctx.save();
        ctx.lineWidth = 1;
        ctx.globalAlpha = pv > 0.2 ? 1 : 0.65;
        ctx.strokeStyle = pv > 0.2 ? pulseColor[key] : COLORS.line;
        ctx.stroke();
        ctx.restore();
        ctx.fillStyle = COLORS.text;
        ctx.fillText(label, x, y + 0.5);
      }
    }

    function update(dt) {
      spawnIn -= dt;
      if (spawnIn <= 0) {
        packets.push({ flow: pickFlow(), seg: 0, t: 0 });
        spawnIn = 0.5 + Math.random() * 0.6;
      }

      for (const p of packets) {
        const a = pos[p.flow.path[p.seg]];
        const b = pos[p.flow.path[p.seg + 1]];
        p.t += (dt * SPEED) / (Math.hypot(b.x - a.x, b.y - a.y) || 1);
        if (p.t < 1) continue;

        const reached = p.flow.path[p.seg + 1];
        pulse[reached] = 1;
        pulseColor[reached] = COLORS[p.flow.kind];
        p.seg += 1;
        p.t = 0;
        if (p.seg >= p.flow.path.length - 1) {
          p.done = true;
          counts[p.flow.kind] += 1;
          const counter = counterEls[p.flow.kind];
          if (counter) counter.textContent = counts[p.flow.kind].toLocaleString(lang);
        }
      }
      packets = packets.filter((p) => !p.done);

      for (const key in pulse) pulse[key] = Math.max(0, pulse[key] - dt * 2.2);
    }

    function frame(ts) {
      if (!running) return;
      const dt = Math.min((ts - (lastTs || ts)) / 1000, 0.05);
      lastTs = ts;
      update(dt);
      draw();
      rafId = requestAnimationFrame(frame);
    }

    function start() {
      if (running) return;
      running = true;
      lastTs = 0;
      rafId = requestAnimationFrame(frame);
    }

    function stop() {
      running = false;
      cancelAnimationFrame(rafId);
    }

    const redraw = () => {
      layout();
      draw();
    };
    redraw();
    document.fonts?.ready.then(redraw);

    // Redibuja en cuanto cambia el tamaño del canvas (también por media queries),
    // para que el bitmap nunca se vea estirado.
    if ("ResizeObserver" in window) new ResizeObserver(redraw).observe(canvas);
    else window.addEventListener("resize", redraw);

    if (!reduceMotion) {
      // Solo anima cuando el diagrama está en pantalla y la pestaña está visible.
      let onScreen = false;
      const sync = () => (onScreen && !document.hidden ? start() : stop());
      new IntersectionObserver(([entry]) => {
        onScreen = entry.isIntersecting;
        sync();
      }).observe(canvas);
      document.addEventListener("visibilitychange", sync);
    }

    return { redraw };
  }

  /* ---------- Interacciones ---------- */

  function initCopyEmail() {
    const feedback = $("#copy-feedback");
    let timer;
    $("#copy-email").addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(P.email);
        feedback.textContent = ui("copied");
      } catch {
        feedback.textContent = `${ui("copy_failed")}: ${P.email}`;
      }
      clearTimeout(timer);
      timer = setTimeout(() => (feedback.textContent = ""), 2500);
    });
  }

  /* ---------- Arranque ---------- */

  renderStatic();
  renderContent();
  initCopyEmail();
  const flow = initFlow();

  $("#lang-toggle").addEventListener("click", () => {
    lang = lang === "es" ? "en" : "es";
    saveLang();
    renderStatic();
    renderContent();
    flow.redraw();
  });
})();
