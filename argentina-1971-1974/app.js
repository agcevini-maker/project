/* =========================================================
   Argentina 1971–1974 · Línea de tiempo interactiva
   ---------------------------------------------------------
   Para editar contenido, modificá solo el arreglo EVENTS.
   Campos de cada acontecimiento:
     year      Año (se usa para filtros y navegación)
     date      Fecha tal como se muestra
     title     Título
     text      Descripción breve
     more      Texto extra de "Ver más" (por qué importa)
     people    Protagonistas mencionados
     category  politica | economia | sociedad | violencia
     icon      Ilustración (ver ICONS más abajo)
     image     (opcional) URL de una foto histórica con licencia libre
     credit    (opcional) Crédito/fuente de esa foto
   ========================================================= */

const EVENTS = [
  {
    year: 1971,
    date: "1971",
    title: "Gran Acuerdo Nacional (GAN)",
    text: "Alejandro Agustín Lanusse impulsa el GAN para organizar una salida electoral, estableciendo condiciones que impedían la candidatura de Perón.",
    more: "Abre el camino hacia las elecciones de 1973, pero con reglas que dejan afuera a Perón. Esa exclusión explica por qué el peronismo se presentará con otro candidato.",
    people: ["Alejandro Agustín Lanusse", "Juan Domingo Perón"],
    category: "politica",
    icon: "document",
  },
  {
    year: 1972,
    date: "17 de noviembre de 1972",
    title: "Operativo Retorno",
    text: "Juan Domingo Perón regresa brevemente a Argentina después de 18 años de exilio.",
    more: "Es la primera vez que Perón pisa el país desde su exilio. Aunque la estadía es breve, anticipa el regreso definitivo de junio de 1973.",
    people: ["Juan Domingo Perón"],
    category: "politica",
    icon: "plane",
  },
  {
    year: 1973,
    date: "11 de marzo de 1973",
    title: "Elecciones presidenciales",
    text: "El FREJULI gana las elecciones con aproximadamente el 49,5 % de los votos, bajo el lema “Cámpora al gobierno, Perón al poder”.",
    more: "Con Perón impedido de ser candidato, el lema dejaba claro quién era el verdadero conductor del movimiento: el peronismo volvía al gobierno a través de Cámpora.",
    people: ["Héctor J. Cámpora", "FREJULI"],
    category: "politica",
    icon: "ballot",
    stat: { value: "49,5 %", label: "de los votos" },
  },
  {
    year: 1973,
    date: "25 de mayo de 1973",
    title: "Asunción de Cámpora y Devotazo",
    text: "Héctor J. Cámpora asume la presidencia. Una movilización popular exige la liberación de presos políticos y se producen liberaciones.",
    more: "El primer día del nuevo gobierno muestra a la vez la esperanza democrática y la fuerza de la movilización popular en las calles.",
    people: ["Héctor J. Cámpora"],
    category: "sociedad",
    icon: "crowd",
  },
  {
    year: 1973,
    date: "30 de mayo de 1973",
    title: "Acta de Compromiso Nacional",
    text: "Se inicia el Pacto Social y el plan económico impulsado por José Ber Gelbard.",
    more: "Es la apuesta económica central del período: ordenar la economía a través de un acuerdo, el Pacto Social, con el plan de Gelbard como eje.",
    people: ["José Ber Gelbard"],
    category: "economia",
    icon: "handshake",
  },
  {
    year: 1973,
    date: "20 de junio de 1973",
    title: "Regreso definitivo de Perón y Masacre de Ezeiza",
    text: "El regreso de Perón genera una movilización multitudinaria que termina en enfrentamientos entre sectores de la derecha y la izquierda peronista.",
    more: "La jornada que debía ser una fiesta expone en público el enfrentamiento entre la derecha y la izquierda peronista, una tensión que marcará todo el período.",
    people: ["Juan Domingo Perón", "Derecha peronista", "Izquierda peronista"],
    category: "violencia",
    icon: "clash",
  },
  {
    year: 1973,
    date: "13 de julio de 1973",
    title: "Renuncia de Cámpora",
    text: "Cámpora y su vicepresidente renuncian. Raúl Lastiri asume interinamente y convoca nuevas elecciones.",
    more: "La renuncia abre el camino a una nueva elección, esta vez con Perón como candidato.",
    people: ["Héctor J. Cámpora", "Raúl Lastiri"],
    category: "politica",
    icon: "door",
  },
  {
    year: 1973,
    date: "23 de septiembre de 1973",
    title: "Elecciones presidenciales",
    text: "La fórmula Perón–Isabel Martínez gana las elecciones con aproximadamente el 62 % de los votos.",
    more: "Perón vuelve al poder con un respaldo electoral todavía mayor que el obtenido por el FREJULI en marzo (cerca del 49,5 %).",
    people: ["Juan Domingo Perón", "María Estela (Isabel) Martínez"],
    category: "politica",
    icon: "ballot",
    stat: { value: "62 %", label: "de los votos" },
  },
  {
    year: 1973,
    date: "25 de septiembre de 1973",
    title: "Asesinato de José Ignacio Rucci",
    text: "El secretario general de la CGT es asesinado, profundizando las tensiones dentro del peronismo.",
    more: "Ocurre solo dos días después del triunfo electoral de Perón: la violencia golpea al movimiento obrero en el momento de mayor respaldo popular.",
    people: ["José Ignacio Rucci", "CGT"],
    category: "violencia",
    icon: "ribbon",
  },
  {
    year: 1973,
    date: "12 de octubre de 1973",
    title: "Tercera presidencia de Perón",
    text: "Juan Domingo Perón asume nuevamente la presidencia de Argentina.",
    more: "Tras 18 años de exilio y una proscripción que le impedía ser candidato, Perón vuelve a gobernar, ahora con Isabel Martínez como vicepresidenta.",
    people: ["Juan Domingo Perón", "María Estela (Isabel) Martínez"],
    category: "politica",
    icon: "sash",
  },
  {
    year: 1974,
    date: "Enero de 1974",
    title: "Triple A",
    text: "La Triple A, organización parapolicial de extrema derecha vinculada a José López Rega, comienza a operar clandestinamente.",
    more: "La violencia política suma un actor clandestino de extrema derecha, lo que agrava el clima de enfrentamiento dentro y fuera del peronismo.",
    people: ["José López Rega"],
    category: "violencia",
    icon: "shadow",
  },
  {
    year: 1974,
    date: "1 de mayo de 1974",
    title: "Ruptura entre Perón y Montoneros",
    text: "Durante el acto del Día del Trabajador en Plaza de Mayo, Perón critica a los sectores juveniles y los llama “imberbes”. Se produce una ruptura pública.",
    more: "La tensión entre Perón y la izquierda peronista, visible desde Ezeiza, se convierte en una ruptura abierta, a la vista de todos.",
    people: ["Juan Domingo Perón", "Montoneros"],
    category: "sociedad",
    icon: "split",
  },
  {
    year: 1974,
    date: "12 de junio de 1974",
    title: "Último discurso público de Perón",
    text: "Perón realiza uno de sus últimos discursos desde el balcón de la Casa Rosada.",
    more: "Es una de sus últimas apariciones frente a la multitud, pocas semanas antes de su muerte.",
    people: ["Juan Domingo Perón"],
    category: "politica",
    icon: "balcony",
  },
  {
    year: 1974,
    date: "1 de julio de 1974",
    title: "Muerte de Perón",
    text: "Juan Domingo Perón fallece y su vicepresidenta, María Estela Martínez de Perón, asume la presidencia.",
    more: "Con su muerte desaparece la figura que sostenía el equilibrio entre los sectores del movimiento. Comienza una etapa de fuerte inestabilidad.",
    people: ["Juan Domingo Perón", "María Estela Martínez de Perón"],
    category: "politica",
    icon: "candle",
  },
];

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

function escapeHTML(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/* ---------- Render de la línea de tiempo ---------- */
function plateHTML(ev, index) {
  if (ev.image) {
    return `
      <figure class="plate plate--photo">
        <img src="${escapeHTML(ev.image)}" alt="${escapeHTML(ev.title)}" loading="lazy" />
        ${ev.credit ? `<figcaption>${escapeHTML(ev.credit)}</figcaption>` : ""}
      </figure>`;
  }
  const big = ev.stat ? ev.stat.value : String(ev.year).slice(2);
  return `
    <div class="plate plate--${ev.category}" aria-hidden="true">
      <span class="plate__big">${escapeHTML(big)}</span>
      <svg class="plate__icon" viewBox="0 0 64 64">${ICONS[ev.icon] || ""}</svg>
      <span class="plate__num">N.º ${String(index + 1).padStart(2, "0")}</span>
      <span class="plate__tag">Ilustración</span>
    </div>`;
}

function cardHTML(ev, index) {
  const id = `ev-${index + 1}`;
  const people = ev.people.map((p) => `<li>${escapeHTML(p)}</li>`).join("");
  return `
    <article class="event reveal" data-year="${ev.year}" data-category="${ev.category}" id="${id}">
      <span class="event__node" aria-hidden="true"></span>
      <div class="card">
        ${plateHTML(ev, index)}
        <div class="card__body">
          <div class="card__meta">
            <time class="card__date">${escapeHTML(ev.date)}</time>
            <span class="chip chip--${ev.category}">${CATEGORY_LABELS[ev.category]}</span>
          </div>
          <h3 class="card__title">${escapeHTML(ev.title)}</h3>
          <p class="card__text">${escapeHTML(ev.text)}</p>
          <div class="card__more" id="${id}-more" role="region" aria-label="Más información sobre ${escapeHTML(ev.title)}">
            <div class="card__more-inner">
              <h4>Por qué importa</h4>
              <p>${escapeHTML(ev.more)}</p>
              <h4>Protagonistas</h4>
              <ul class="people">${people}</ul>
            </div>
          </div>
          <button class="card__toggle" type="button" aria-expanded="false" aria-controls="${id}-more">
            <span>Ver más</span>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
          </button>
        </div>
      </div>
    </article>`;
}

function renderTimeline() {
  const timeline = $("#timeline");
  let html = "";
  let currentYear = null;
  EVENTS.forEach((ev, i) => {
    if (ev.year !== currentYear) {
      currentYear = ev.year;
      const count = EVENTS.filter((e) => e.year === ev.year).length;
      html += `
        <div class="year-marker reveal" id="anio-${ev.year}" data-year="${ev.year}">
          <span class="year-marker__label">${ev.year}</span>
          <span class="year-marker__count">${count} ${count === 1 ? "acontecimiento" : "acontecimientos"}</span>
        </div>`;
    }
    html += cardHTML(ev, i);
  });
  timeline.insertAdjacentHTML("beforeend", html);
}

/* ---------- Tarjetas expandibles ---------- */
function setupToggles() {
  $("#timeline").addEventListener("click", (e) => {
    const btn = e.target.closest(".card__toggle");
    if (!btn) return;
    const card = btn.closest(".card");
    const open = btn.getAttribute("aria-expanded") === "true";
    btn.setAttribute("aria-expanded", String(!open));
    card.classList.toggle("is-open", !open);
    btn.querySelector("span").textContent = open ? "Ver más" : "Ver menos";
  });
}

/* ---------- Animaciones de aparición ---------- */
let revealObserver;
function setupReveal() {
  const items = $$(".reveal");
  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }
  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  items.forEach((el) => revealObserver.observe(el));
}

/* ---------- Filtros por año ---------- */
let activeFilter = "all";
function applyFilter(filter) {
  activeFilter = filter;
  $$(".filter").forEach((b) => {
    const on = b.dataset.filter === filter;
    b.classList.toggle("is-active", on);
    b.setAttribute("aria-pressed", String(on));
  });
  $$(".event, .year-marker").forEach((el) => {
    const show = filter === "all" || el.dataset.year === filter;
    el.hidden = !show;
    if (show) el.classList.add("is-visible");
  });
  const n = filter === "all" ? EVENTS.length : EVENTS.filter((e) => String(e.year) === filter).length;
  $("#filterStatus").textContent =
    filter === "all" ? `Mostrando los ${n} acontecimientos.` : `Mostrando ${n} ${n === 1 ? "acontecimiento" : "acontecimientos"} de ${filter}.`;
  updateScrollUI();
}

function setupFilters() {
  $$(".filter").forEach((btn) =>
    btn.addEventListener("click", () => {
      const filter = btn.dataset.filter;
      applyFilter(filter);
      // Lleva la vista al comienzo de los resultados si quedaron fuera de pantalla
      const target = filter === "all" ? $("#timeline") : $(`#anio-${filter}`);
      if (target && target.getBoundingClientRect().top > window.innerHeight * 0.8) scrollToEl(target);
      else if (target && target.getBoundingClientRect().top < 0) scrollToEl(target);
    })
  );
}

/* ---------- Navegación rápida y desplazamiento suave ---------- */
function scrollToEl(el) {
  if (!el) return;
  const offset = $("#topbar").offsetHeight + 16;
  const top = el.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top, behavior: prefersReducedMotion ? "auto" : "smooth" });
}

function setupNavigation() {
  // Botón del hero
  $("#exploreBtn").addEventListener("click", (e) => {
    e.preventDefault();
    scrollToEl($("#cronologia"));
  });

  // Saltos por año: si el año está oculto por un filtro, se vuelve a "Todos"
  $$("[data-jump]").forEach((a) =>
    a.addEventListener("click", (e) => {
      e.preventDefault();
      const year = a.dataset.jump;
      if (activeFilter !== "all" && activeFilter !== year) applyFilter("all");
      scrollToEl($(`#anio-${year}`));
    })
  );

  // Otros enlaces internos
  $$('a[href^="#"]:not([data-jump]):not(#exploreBtn)').forEach((a) =>
    a.addEventListener("click", (e) => {
      const target = $(a.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      if (target.id === "inicio") {
        window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
      } else {
        scrollToEl(target);
      }
    })
  );

  $("#toTop").addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  });
}

/* ---------- Progreso de lectura, año activo y botón "arriba" ---------- */
let ticking = false;
function updateScrollUI() {
  const doc = document.documentElement;
  const max = doc.scrollHeight - window.innerHeight;
  const pct = max > 0 ? Math.min(1, window.scrollY / max) : 0;
  $("#progressBar").style.transform = `scaleX(${pct})`;

  // Relleno de la línea de tiempo
  const tl = $("#timeline");
  const rect = tl.getBoundingClientRect();
  const viewMid = window.innerHeight * 0.55;
  const fill = Math.max(0, Math.min(1, (viewMid - rect.top) / rect.height));
  $("#timelineFill").style.transform = `scaleY(${fill})`;

  // Año activo en la barra superior
  let current = null;
  $$(".year-marker:not([hidden])").forEach((m) => {
    if (m.getBoundingClientRect().top < viewMid) current = m.dataset.year;
  });
  if (rect.bottom < viewMid * 0.5) current = null;
  $$("[data-jump]").forEach((a) => a.classList.toggle("is-current", a.dataset.jump === current));

  $("#topbar").classList.toggle("is-solid", window.scrollY > 40);
  $("#toTop").classList.toggle("is-visible", window.scrollY > window.innerHeight * 0.8);
  ticking = false;
}

function setupScroll() {
  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateScrollUI);
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  updateScrollUI();
}

/* ---------- Inicio ---------- */
document.addEventListener("DOMContentLoaded", () => {
  renderTimeline();
  setupToggles();
  setupReveal();
  setupFilters();
  setupNavigation();
  setupScroll();
  $("#filterStatus").textContent = `Mostrando los ${EVENTS.length} acontecimientos.`;
});
