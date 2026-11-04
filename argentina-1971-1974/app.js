/* =========================================================
   Argentina 1971–1974 · Lógica de la página
   El contenido está en data.js. Este archivo lo dibuja
   y maneja la interacción.
   ========================================================= */

const CATEGORY_LABELS = {
  politica: "Política",
  economia: "Economía",
  sociedad: "Movilización",
  violencia: "Violencia política",
};

/* Ilustraciones vectoriales originales (trazos simples, 64×64) */
const ICONS = {
  document: '<rect x="16" y="8" width="32" height="44" rx="2"/><path d="M23 18h18M23 25h18M23 32h12"/><circle cx="38" cy="44" r="6"/><path d="M35 49l-2 8 5-3 5 3-2-8"/>',
  plane: '<path d="M6 34l10-2 8 6 30-14c3-1 5 2 3 4L36 42l-18 6-6-4 6-4-12-6z"/><path d="M28 30L22 16l6-1 14 11"/><path d="M8 56h48" stroke-dasharray="3 5"/>',
  ballot: '<path d="M12 30h40v24H12z"/><path d="M24 30h16"/><path d="M26 34V10h14l6 6v18"/><path d="M40 10v6h6"/><path d="M30 22l3 3 6-7"/>',
  crowd: '<circle cx="16" cy="26" r="5"/><circle cx="32" cy="22" r="6"/><circle cx="48" cy="26" r="5"/><path d="M6 48c0-8 5-13 10-13s8 3 9 6M58 48c0-8-5-13-10-13s-8 3-9 6M20 52c0-10 5-17 12-17s12 7 12 17"/><path d="M32 4v10M27 8l5-4 5 4"/>',
  handshake: '<path d="M4 26l12-8 10 4 8-4 12 2 14 8"/><path d="M14 36l10 10c2 2 5 2 6 0l2-2 2 2c2 2 5 1 6-1l8-9"/><path d="M26 22l-6 8c-1 2 0 4 2 4 3 0 6-4 8-5l8 6"/><path d="M4 26v14M60 28v14"/>',
  clash: '<path d="M10 54L30 34M54 54L34 34"/><path d="M30 34l4-4M24 28l12 12M40 28L28 40"/><path d="M32 6l3 9 9-3-5 8 8 5-10 1 1 9-6-7"/>',
  door: '<path d="M14 56V8h26v48"/><path d="M40 12l12 4v40l-12-4"/><circle cx="35" cy="34" r="1.5"/><path d="M8 56h50"/>',
  ribbon: '<path d="M32 10c-8 0-10 10-6 18l-10 26 8-4 4 8 6-18 6 18 4-8 8 4-10-26c4-8 2-18-6-18z"/><path d="M26 28c3 3 9 3 12 0"/>',
  sash: '<circle cx="32" cy="14" r="8"/><path d="M14 58V36c0-7 8-12 18-12s18 5 18 12v22"/><path d="M20 28l26 30"/><path d="M24 30l24 26" opacity=".5"/>',
  shadow: '<path d="M32 6l26 46H6z"/><path d="M32 22v14"/><circle cx="32" cy="43" r="1.8"/>',
  split: '<circle cx="18" cy="16" r="6"/><circle cx="46" cy="16" r="6"/><path d="M6 46c0-10 5-16 12-16s12 6 12 16M34 46c0-10 5-16 12-16s12 6 12 16"/><path d="M32 4v56" stroke-dasharray="4 4"/>',
  balcony: '<path d="M6 26h52M10 26V14l22-8 22 8v12"/><path d="M12 40h40M12 40v14M20 40v14M28 40v14M36 40v14M44 40v14M52 40v14M8 54h48"/><circle cx="32" cy="32" r="4"/><path d="M42 30c3 2 3 6 0 8M47 27c5 4 5 10 0 14"/>',
  candle: '<rect x="24" y="26" width="16" height="30" rx="2"/><path d="M32 26v-5"/><path d="M32 6c5 5 5 10 0 13-5-3-5-8 0-13z"/><path d="M14 56h36"/>',
};

/* ---------- Utilidades ---------- */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const scrollBehavior = () => (prefersReducedMotion ? "auto" : "smooth");

function esc(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
const fmtPct = (n) => n.toLocaleString("es-AR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + " %";
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

/* =========================================================
   Capítulo 1 · Contexto
   ========================================================= */
function renderBackground() {
  $("#backgroundList").innerHTML = BACKGROUND.map(
    (b) => `
      <li class="strip__item reveal">
        <time>${esc(b.date)}</time>
        <h3>${esc(b.title)}</h3>
        <p>${esc(b.text)}</p>
      </li>`
  ).join("");
}

/* =========================================================
   Capítulo 2 · Presidencias (barra de tiempo)
   ========================================================= */
function renderGantt() {
  const start = new Date("1971-01-01").getTime();
  const end = new Date("1975-01-01").getTime();
  const pos = (d) => ((new Date(d).getTime() - start) / (end - start)) * 100;
  const years = [1971, 1972, 1973, 1974];

  const ticks = years
    .map((y) => `<span class="gantt__tick" style="left:${pos(`${y}-01-01`)}%">${y}</span>`)
    .join("");
  const grid = years
    .map((y) => `<span class="gantt__grid" style="left:${pos(`${y}-01-01`)}%"></span>`)
    .join("");

  const rows = PRESIDENTS.map((p) => {
    const left = pos(p.from);
    const width = Math.max(pos(p.to) - left, 1.2);
    return `
      <div class="gantt__row">
        <div class="gantt__who">
          <strong>${esc(p.name)}</strong>
          <span>${esc(p.type)} · ${esc(p.label)}</span>
        </div>
        <div class="gantt__track">
          ${grid}
          <span class="gantt__bar gantt__bar--${p.tone}${p.open ? " gantt__bar--open" : ""}"
                style="left:${left}%;width:${width}%"
                tabindex="0"
                data-tip="${esc(`${p.name} · ${p.label}`)}"></span>
        </div>
      </div>`;
  }).join("");

  $("#gantt").innerHTML = `
    <div class="gantt__rows">${rows}</div>
    <div class="gantt__axis"><div class="gantt__who" aria-hidden="true"></div><div class="gantt__ticks">${ticks}</div></div>
    <figcaption class="gantt__legend">
      <span><i class="gantt__key gantt__key--militar"></i>Gobierno militar</span>
      <span><i class="gantt__key gantt__key--electo"></i>Gobierno constitucional</span>
      <span><i class="gantt__key gantt__key--interino"></i>Presidencia interina</span>
    </figcaption>`;
}

/* =========================================================
   Capítulo 3 · Línea de tiempo
   ========================================================= */
function plateHTML(ev, number) {
  if (ev.image) {
    return `
      <figure class="plate plate--photo">
        <img src="${esc(ev.image)}" alt="${esc(ev.title)}" loading="lazy" />
        ${ev.credit ? `<figcaption>${esc(ev.credit)}</figcaption>` : ""}
      </figure>`;
  }
  const big = ev.stat || String(ev.year).slice(2);
  return `
    <div class="plate plate--${ev.category}" aria-hidden="true">
      <span class="plate__big">${esc(big)}</span>
      <svg class="plate__icon" viewBox="0 0 64 64">${ICONS[ev.icon] || ""}</svg>
      <span class="plate__num">N.º ${String(number).padStart(2, "0")}</span>
      <span class="plate__tag">Ilustración</span>
    </div>`;
}

function moreHTML(ev, id) {
  const block = (label, text) => (text ? `<h4>${label}</h4><p>${esc(text)}</p>` : "");
  const quote = ev.quote
    ? `<blockquote class="quote"><p>“${esc(ev.quote.text)}”</p><cite>${esc(ev.quote.by)}</cite></blockquote>`
    : "";
  const note = ev.note ? `<p class="note"><strong>Dato:</strong> ${esc(ev.note)}</p>` : "";
  const people = ev.people?.length
    ? `<h4>Protagonistas</h4><ul class="people">${ev.people.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>`
    : "";
  const link = ev.link ? `<a class="card__link" href="${esc(ev.link.href)}">${esc(ev.link.label)} →</a>` : "";
  return `
    <div class="card__more" id="${id}-more" role="region" aria-label="Más información sobre ${esc(ev.title)}">
      <div class="card__more-inner">
        ${block("Contexto", ev.context)}
        ${block("Qué pasó", ev.detail)}
        ${block("Consecuencias", ev.impact)}
        ${quote}
        ${note}
        ${people}
        ${link}
      </div>
    </div>`;
}

function mainCardHTML(ev, number, id) {
  return `
    <article class="event event--main reveal" data-year="${ev.year}" data-kind="main" data-category="${ev.category}" id="${id}">
      <span class="event__node" aria-hidden="true"></span>
      <div class="card">
        ${plateHTML(ev, number)}
        <div class="card__body">
          <div class="card__meta">
            <time class="card__date">${esc(ev.date)}</time>
            <span class="chip chip--${ev.category}">${CATEGORY_LABELS[ev.category]}</span>
          </div>
          <h3 class="card__title">${esc(ev.title)}</h3>
          <p class="card__text">${esc(ev.text)}</p>
          ${moreHTML(ev, id)}
          <button class="card__toggle" type="button" aria-expanded="false" aria-controls="${id}-more">
            <span>Ver más</span>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
          </button>
        </div>
      </div>
    </article>`;
}

function contextCardHTML(ev, id) {
  return `
    <article class="event event--context reveal" data-year="${ev.year}" data-kind="context" data-category="${ev.category}" id="${id}">
      <span class="event__node" aria-hidden="true"></span>
      <div class="card card--context">
        <div class="card__body">
          <div class="card__meta">
            <span class="card__kicker">Hecho complementario</span>
            <time class="card__date">${esc(ev.date)}</time>
          </div>
          <h3 class="card__title">${esc(ev.title)}</h3>
          <p class="card__text">${esc(ev.text)}</p>
        </div>
      </div>
    </article>`;
}

function renderTimeline() {
  let html = "";
  let currentYear = null;
  let mainNumber = 0;
  EVENTS.forEach((ev, i) => {
    if (ev.year !== currentYear) {
      currentYear = ev.year;
      const main = EVENTS.filter((e) => e.year === ev.year && e.kind === "main").length;
      html += `
        <div class="year-marker reveal" id="anio-${ev.year}" data-year="${ev.year}">
          <span class="year-marker__label">${ev.year}</span>
          <span class="year-marker__count">${plural(main, "acontecimiento", "acontecimientos")}</span>
        </div>`;
    }
    const id = `ev-${i + 1}`;
    if (ev.kind === "main") {
      mainNumber += 1;
      html += mainCardHTML(ev, mainNumber, id);
    } else {
      html += contextCardHTML(ev, id);
    }
  });
  $("#timeline").insertAdjacentHTML("beforeend", html);
}

/* Tarjetas expandibles */
function setCardOpen(btn, open) {
  btn.setAttribute("aria-expanded", String(open));
  btn.closest(".card").classList.toggle("is-open", open);
  btn.querySelector("span").textContent = open ? "Ver menos" : "Ver más";
}

function setupToggles() {
  $("#timeline").addEventListener("click", (e) => {
    const btn = e.target.closest(".card__toggle");
    if (!btn) return;
    setCardOpen(btn, btn.getAttribute("aria-expanded") !== "true");
    syncExpandAllLabel();
  });

  $("#expandAll").addEventListener("click", () => {
    const btns = $$(".card__toggle");
    const openAll = btns.some((b) => b.getAttribute("aria-expanded") !== "true");
    btns.forEach((b) => setCardOpen(b, openAll));
    syncExpandAllLabel();
    requestAnimationFrame(updateScrollUI);
  });
}

function syncExpandAllLabel() {
  const allOpen = $$(".card__toggle").every((b) => b.getAttribute("aria-expanded") === "true");
  $("#expandAll").textContent = allOpen ? "Cerrar todas las tarjetas" : "Abrir todas las tarjetas";
}

/* Filtros por año y hechos complementarios */
const state = { year: "all", context: true };

function applyFilters() {
  $$(".filter[data-filter]").forEach((b) => {
    const on = b.dataset.filter === state.year;
    b.classList.toggle("is-active", on);
    b.setAttribute("aria-pressed", String(on));
  });

  $$(".event").forEach((el) => {
    const yearOk = state.year === "all" || el.dataset.year === state.year;
    const kindOk = state.context || el.dataset.kind === "main";
    el.hidden = !(yearOk && kindOk);
    if (!el.hidden) el.classList.remove("is-pending");
  });
  $$(".year-marker").forEach((el) => {
    el.hidden = !(state.year === "all" || el.dataset.year === state.year);
    if (!el.hidden) el.classList.remove("is-pending");
  });

  const visibleMain = $$(".event--main:not([hidden])").length;
  const visibleCtx = $$(".event--context:not([hidden])").length;
  const where = state.year === "all" ? "" : ` de ${state.year}`;
  $("#filterStatus").textContent =
    `Mostrando ${plural(visibleMain, "acontecimiento principal", "acontecimientos principales")}${where}` +
    (state.context ? ` y ${plural(visibleCtx, "hecho complementario", "hechos complementarios")}.` : ".");

  updateScrollUI();
}

function setupFilters() {
  $$(".filter[data-filter]").forEach((btn) =>
    btn.addEventListener("click", () => {
      state.year = btn.dataset.filter;
      applyFilters();
      const target = state.year === "all" ? $("#timeline") : $(`#anio-${state.year}`);
      const top = target?.getBoundingClientRect().top ?? 0;
      if (top < 0 || top > window.innerHeight * 0.85) scrollToEl(target);
    })
  );
  $("#toggleContext").addEventListener("change", (e) => {
    state.context = e.target.checked;
    applyFilters();
  });
}

/* =========================================================
   Capítulo 5 · Gráfico de elecciones
   ========================================================= */
const SERIES = {
  frejuli: "FREJULI (peronismo)",
  ucr: "UCR (radicalismo)",
  otros: "Otras fuerzas",
};

function renderElections() {
  const legend = Object.entries(SERIES)
    .map(([k, label]) => `<li><i class="key key--${k}"></i>${label}</li>`)
    .join("");

  const bars = ELECTIONS.map((el) => {
    const segs = el.rows
      .map((r) => {
        // Segmentos grandes: nombre y porcentaje. Medianos: solo porcentaje.
        const label = r.value >= 30 ? `${esc(r.party)} <b>${fmtPct(r.value)}</b>` : `<b>${fmtPct(r.value)}</b>`;
        const small = r.value < 20 ? " stack__seg--small" : "";
        return `
          <span class="stack__seg stack__seg--${r.series}${small}" style="flex-basis:${r.value}%"
                tabindex="0" data-tip="${esc(`${r.party} · ${r.detail}: ≈ ${fmtPct(r.value)}`)}">
            <span class="stack__label">${label}</span>
          </span>`;
      })
      .join("");
    return `
      <div class="stack">
        <div class="stack__head"><strong>${esc(el.label)}</strong><span>${esc(el.note)}</span></div>
        <div class="stack__bar">${segs}</div>
      </div>`;
  }).join("");

  const table = `
    <details class="chart__table">
      <summary>Ver los datos como tabla</summary>
      <div class="table-wrap">
        <table>
          <thead><tr><th scope="col">Fuerza</th>${ELECTIONS.map((e) => `<th scope="col">${esc(e.label)}</th>`).join("")}</tr></thead>
          <tbody>
            ${Object.entries(SERIES)
              .map(
                ([k, label]) => `<tr><th scope="row">${label}</th>${ELECTIONS.map((e) => {
                  const r = e.rows.find((x) => x.series === k);
                  return `<td>≈ ${fmtPct(r.value)}<small>${esc(r.detail)}</small></td>`;
                }).join("")}</tr>`
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </details>`;

  const frejuli = ELECTIONS.map((e) => e.rows.find((r) => r.series === "frejuli").value);
  const delta = (frejuli[1] - frejuli[0]).toLocaleString("es-AR", { maximumFractionDigits: 1 });

  $("#electionChart").innerHTML = `
    <div class="chart__top">
      <div class="chart__hero"><span>+${delta}</span><small>puntos ganó el peronismo entre marzo y septiembre</small></div>
      <ul class="chart__legend" aria-label="Referencias">${legend}</ul>
    </div>
    ${bars}
    ${table}`;
}

/* Tooltip compartido para gráficos */
function setupTooltip() {
  const tip = $("#tooltip");
  const show = (el, x, y) => {
    tip.textContent = el.dataset.tip;
    tip.hidden = false;
    const r = tip.getBoundingClientRect();
    const left = Math.min(Math.max(8, x - r.width / 2), window.innerWidth - r.width - 8);
    const top = y - r.height - 12 < 8 ? y + 16 : y - r.height - 12;
    tip.style.transform = `translate(${left}px, ${top}px)`;
  };
  const hide = () => (tip.hidden = true);

  document.addEventListener("pointermove", (e) => {
    const el = e.target.closest("[data-tip]");
    if (el) show(el, e.clientX, e.clientY);
    else hide();
  });
  document.addEventListener("focusin", (e) => {
    const el = e.target.closest("[data-tip]");
    if (!el) return hide();
    const r = el.getBoundingClientRect();
    show(el, r.left + r.width / 2, r.top);
  });
  document.addEventListener("focusout", hide);
  window.addEventListener("scroll", hide, { passive: true });
}

/* =========================================================
   Capítulo 7 · Protagonistas
   ========================================================= */
function renderPeople() {
  const groups = ["all", ...Object.keys(PEOPLE_GROUPS)];
  $("#peopleFilters").innerHTML = groups
    .map(
      (g) =>
        `<button class="filter${g === "all" ? " is-active" : ""}" type="button" data-group="${g}" aria-pressed="${g === "all"}">${
          g === "all" ? "Todos" : PEOPLE_GROUPS[g]
        }</button>`
    )
    .join("");

  $("#peopleGrid").innerHTML = PEOPLE.map(
    (p) => `
      <article class="person reveal" data-group="${p.group}">
        <span class="person__initials" aria-hidden="true">${esc(initials(p.name))}</span>
        <div>
          <h3>${esc(p.name)}</h3>
          <p class="person__role">${esc(p.role)}</p>
          <p>${esc(p.text)}</p>
          <span class="person__group person__group--${p.group}">${PEOPLE_GROUPS[p.group]}</span>
        </div>
      </article>`
  ).join("");

  $("#peopleFilters").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-group]");
    if (!btn) return;
    const g = btn.dataset.group;
    $$("#peopleFilters .filter").forEach((b) => {
      const on = b === btn;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", String(on));
    });
    $$(".person").forEach((card) => {
      card.hidden = g !== "all" && card.dataset.group !== g;
      card.classList.remove("is-pending");
    });
  });
}

function initials(name) {
  const clean = name.replace(/\(.*?\)/g, "").trim();
  if (/^[A-ZÁÉÍÓÚ]{2,}$/.test(clean.split(" ")[0])) return clean.split(" ")[0].slice(0, 3);
  const parts = clean.split(/\s+/).filter((w) => /^[A-ZÁÉÍÓÚ]/.test(w));
  return (parts[0][0] + (parts[parts.length - 1]?.[0] || "")).toUpperCase();
}

/* =========================================================
   Capítulo 8 · Glosario
   ========================================================= */
const normalize = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

function renderGlossary() {
  const sorted = [...GLOSSARY].sort((a, b) => a.term.localeCompare(b.term, "es"));
  $("#glossaryList").innerHTML = sorted
    .map(
      (g) => `
        <div class="glossary__item" data-search="${esc(normalize(g.term + " " + g.def))}">
          <dt>${esc(g.term)}</dt>
          <dd>${esc(g.def)}</dd>
        </div>`
    )
    .join("");

  $("#glossarySearch").addEventListener("input", (e) => {
    const q = normalize(e.target.value.trim());
    let shown = 0;
    $$(".glossary__item").forEach((item) => {
      const match = !q || item.dataset.search.includes(q);
      item.hidden = !match;
      if (match) shown += 1;
    });
    $("#glossaryEmpty").hidden = shown > 0;
  });
}

/* =========================================================
   Capítulo 10 · Repaso
   ========================================================= */
const answered = new Map();

function renderQuiz() {
  const letters = ["A", "B", "C", "D"];
  $("#quiz").innerHTML = QUIZ.map(
    (item, qi) => `
      <fieldset class="question reveal" data-q="${qi}">
        <legend><span class="question__n">${qi + 1}</span>${esc(item.q)}</legend>
        <div class="question__options">
          ${item.options
            .map(
              (opt, oi) => `
              <button class="option" type="button" data-q="${qi}" data-o="${oi}">
                <span class="option__letter">${letters[oi]}</span>${esc(opt)}
              </button>`
            )
            .join("")}
        </div>
        <p class="question__feedback" aria-live="polite"></p>
      </fieldset>`
  ).join("");

  $("#quiz").addEventListener("click", (e) => {
    const btn = e.target.closest(".option");
    if (!btn) return;
    const qi = Number(btn.dataset.q);
    if (answered.has(qi)) return;
    const oi = Number(btn.dataset.o);
    const item = QUIZ[qi];
    const ok = oi === item.answer;
    answered.set(qi, ok);

    const box = btn.closest(".question");
    $$(".option", box).forEach((b) => {
      b.disabled = true;
      if (Number(b.dataset.o) === item.answer) b.classList.add("is-correct");
    });
    if (!ok) btn.classList.add("is-wrong");
    box.classList.add(ok ? "is-right" : "is-missed");
    $(".question__feedback", box).innerHTML = `<strong>${ok ? "¡Correcto!" : "No es esa."}</strong> ${esc(item.why)}`;
    updateScore();
  });

  $("#quizReset").addEventListener("click", () => {
    answered.clear();
    $$(".question").forEach((box) => {
      box.classList.remove("is-right", "is-missed");
      $(".question__feedback", box).textContent = "";
      $$(".option", box).forEach((b) => {
        b.disabled = false;
        b.classList.remove("is-correct", "is-wrong");
      });
    });
    updateScore();
    scrollToEl($("#quiz"));
  });

  updateScore();
}

function updateScore() {
  const done = answered.size;
  const right = [...answered.values()].filter(Boolean).length;
  const total = QUIZ.length;
  let msg = `Respondiste ${done} de ${total} preguntas.`;
  if (done > 0) msg += ` Correctas: ${right}.`;
  if (done === total) {
    msg = `Terminaste: ${right} de ${total} correctas. ` +
      (right === total ? "¡Excelente!" : right >= total * 0.6 ? "Muy bien. Repasá las que fallaste en la cronología." : "Volvé a recorrer la cronología y el Pacto Social, y probá otra vez.");
  }
  $("#quizScore").textContent = msg;
  $("#quizReset").hidden = done === 0;
}

function renderExtras() {
  $("#thinkList").innerHTML = THINK.map((t) => `<li>${esc(t)}</li>`).join("");
  $("#sourcesList").innerHTML = SOURCES.map(
    (s) => `<li><cite>${esc(s.title)}</cite>, ${esc(s.author)}. <span>${esc(s.note)}</span></li>`
  ).join("");
}

/* =========================================================
   Animaciones de aparición
   ========================================================= */
let revealObserver;
function setupReveal() {
  if (prefersReducedMotion || !("IntersectionObserver" in window)) return;
  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.remove("is-pending");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
  );
  // Lo visible al cargar queda quieto; solo lo que está más abajo se anima al llegar
  $$(".reveal").forEach((el) => {
    if (el.getBoundingClientRect().top > window.innerHeight) {
      el.classList.add("is-pending");
      revealObserver.observe(el);
    }
  });
}

/* =========================================================
   Navegación y desplazamiento
   ========================================================= */
function headerOffset() {
  const yearbar = $("#yearbar");
  const inChrono = yearbar && yearbar.classList.contains("is-stuck");
  return $("#topbar").offsetHeight + (inChrono ? yearbar.offsetHeight : 0) + 12;
}

function scrollToEl(el) {
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - headerOffset();
  window.scrollTo({ top, behavior: scrollBehavior() });
}

function setupNavigation() {
  // Saltos por año: si el año quedó oculto por un filtro, se vuelve a "Todos"
  $$("[data-jump]").forEach((a) =>
    a.addEventListener("click", (e) => {
      e.preventDefault();
      const year = a.dataset.jump;
      if (state.year !== "all" && state.year !== year) {
        state.year = "all";
        applyFilters();
      }
      const target = $(`#anio-${year}`);
      const top = target.getBoundingClientRect().top + window.scrollY - $("#topbar").offsetHeight - $("#yearbar").offsetHeight - 12;
      window.scrollTo({ top, behavior: scrollBehavior() });
    })
  );

  // Enlaces internos (índice, menú, tarjetas)
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]:not([data-jump])');
    if (!a) return;
    const target = $(a.getAttribute("href"));
    if (!target) return;
    e.preventDefault();
    if (target.id === "inicio") window.scrollTo({ top: 0, behavior: scrollBehavior() });
    else scrollToEl(target);
  });

  $("#toTop").addEventListener("click", () => window.scrollTo({ top: 0, behavior: scrollBehavior() }));
}

/* =========================================================
   Progreso de lectura, capítulo y año activos
   ========================================================= */
/* [id de la sección, enlace del menú que se marca] en orden de aparición */
const SECTION_MAP = [
  ["contexto", "contexto"],
  ["gobiernos", "contexto"],
  ["cronologia", "cronologia"],
  ["pacto", "pacto"],
  ["elecciones", "pacto"],
  ["corrientes", "corrientes"],
  ["protagonistas", "protagonistas"],
  ["glosario", "glosario"],
  ["final", null],
  ["repaso", "repaso"],
];
let ticking = false;

function updateScrollUI() {
  const doc = document.documentElement;
  const max = doc.scrollHeight - window.innerHeight;
  const pct = max > 0 ? Math.min(1, window.scrollY / max) : 0;
  $("#progressBar").style.transform = `scaleX(${pct})`;

  const topbarH = $("#topbar").offsetHeight;
  const viewMid = window.innerHeight * 0.55;

  // Relleno de la línea de tiempo
  const tl = $("#timeline");
  const rect = tl.getBoundingClientRect();
  const fill = Math.max(0, Math.min(1, (viewMid - rect.top) / rect.height));
  $("#timelineFill").style.transform = `scaleY(${fill})`;

  // Barra de años: visible solo mientras se recorre la cronología
  const yearbar = $("#yearbar");
  const inTimeline = rect.top < topbarH + 60 && rect.bottom > viewMid;
  yearbar.classList.toggle("is-stuck", inTimeline);

  let currentYear = null;
  $$(".year-marker:not([hidden])").forEach((m) => {
    if (m.getBoundingClientRect().top < viewMid) currentYear = m.dataset.year;
  });
  if (!inTimeline) currentYear = null;
  $$("[data-jump]").forEach((a) => a.classList.toggle("is-current", a.dataset.jump === currentYear));

  // Capítulo activo en el menú
  let currentSection = null;
  SECTION_MAP.forEach(([id, navKey]) => {
    const el = document.getElementById(id);
    if (el && el.getBoundingClientRect().top < viewMid) currentSection = navKey;
  });
  $$(".topbar__nav a").forEach((a) => {
    const on = a.dataset.section === currentSection;
    a.classList.toggle("is-current", on);
    if (on) a.setAttribute("aria-current", "true");
    else a.removeAttribute("aria-current");
  });

  $("#topbar").classList.toggle("is-solid", window.scrollY > 40);
  $("#toTop").classList.toggle("is-visible", window.scrollY > window.innerHeight * 0.8);
  ticking = false;
}

function keepCurrentNavVisible() {
  const nav = $(".topbar__nav");
  const current = $(".topbar__nav a.is-current");
  if (!current || nav.scrollWidth <= nav.clientWidth) return;
  const left = current.offsetLeft - nav.clientWidth / 2 + current.offsetWidth / 2;
  nav.scrollTo({ left, behavior: scrollBehavior() });
}

function setupScroll() {
  let lastSection = null;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updateScrollUI();
      const cur = $(".topbar__nav a.is-current")?.dataset.section || null;
      if (cur !== lastSection) {
        lastSection = cur;
        keepCurrentNavVisible();
      }
    });
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  updateScrollUI();
}

/* =========================================================
   Inicio
   ========================================================= */
function init() {
  renderBackground();
  renderGantt();
  renderTimeline();
  renderElections();
  renderPeople();
  renderGlossary();
  renderQuiz();
  renderExtras();

  setupToggles();
  setupFilters();
  setupTooltip();
  setupReveal();
  setupNavigation();
  setupScroll();
  applyFilters();
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
else init();
