// Логика приложения: навигация по вкладкам и отрисовка экранов.
// Данные (разделы и упражнения) лежат в data.js.

const APP_VERSION = "0.55";
const STORAGE_PREFIX = "sport:";
const view = document.getElementById("view");
const titleEl = document.getElementById("title");
const backBtn = document.getElementById("backBtn");

const TRAINING_IDS = ["legs", "arms", "back", "chest", "core"];

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function countExercises(section) {
  return section.subs.reduce((n, s) => n + (s.exercises?.length || 0), 0);
}

function setChrome(title, tab, back) {
  titleEl.textContent = title;
  backBtn.hidden = !back;
  backBtn.onclick = back ? () => navigate(back) : null;
  document.querySelectorAll("#tabbar a").forEach(a => a.classList.toggle("active", a.dataset.tab === tab));
  view.scrollTop = 0;
}

// ---------- Экраны ----------

function sectionCard(s, wide, i = 0) {
  const n = countExercises(s);
  return `
    <a class="section-card${wide ? " wide" : ""}" href="#/s/${s.id}" style="--i:${i}">
      <div class="top"><span class="ico">${s.icon}</span></div>
      <div class="bottom">
        <div class="name">${esc(s.title)}</div>
      </div>
    </a>`;
}

function renderHome() {
  setChrome("Тренировки", "home");
  const training = SECTIONS.filter(s => TRAINING_IDS.includes(s.id));
  const health = SECTIONS.filter(s => !TRAINING_IDS.includes(s.id));
  view.innerHTML = `
    <div class="group-title">Мышцы</div>
    <div class="grid">${training.map((s, i) => sectionCard(s, false, i)).join("")}</div>
    <div class="group-title">Здоровье</div>
    <div class="grid">${health.map((s, i) => sectionCard(s, true, training.length + i)).join("")}</div>
  `;
}

function exerciseCard(ex) {
  const tags = [
    ex.sets && `Подходы: ${esc(ex.sets)}`,
    ex.reps && `Повторы: ${esc(ex.reps)}`,
    ex.rest && `Отдых: ${esc(ex.rest)}`,
  ].filter(Boolean).map(t => `<span class="tag">${t}</span>`).join("");

  const mg = (ex.main?.length || ex.extra?.length)
    ? `<h4>Какие мышцы работают</h4><div class="mg">` +
      (ex.main || []).map(m => `<span class="mtag main">${esc(m)}</span>`).join("") +
      (ex.extra || []).map(m => `<span class="mtag extra">${esc(m)}</span>`).join("") +
      `</div><div class="mg-legend"><span class="dot mint"></span>основные <span class="dot grey"></span>помогают</div>`
    : "";
  const tech = Array.isArray(ex.technique) && ex.technique.length
    ? `<h4>Техника</h4><ol>${ex.technique.map(t => `<li>${esc(t)}</li>`).join("")}</ol>` : "";
  const prog = ex.progression ? `<h4>Когда увеличивать нагрузку</h4><p>${esc(ex.progression)}</p>` : "";
  const safe = ex.safety ? `<h4>Безопасность</h4><p>${esc(ex.safety)}</p>` : "";
  // Видео: либо из поля video, либо автоматически videos/<id упражнения>.mp4.
  // Если файла нет — блок с видео просто не появляется.
  const vsrc = ex.video || (ex.id ? `videos/${ex.id}.mp4` : "");
  const vid = vsrc
    ? `<div class="ex-vwrap" hidden><h4>Видео</h4><video class="ex-video" src="${esc(vsrc)}" muted loop playsinline autoplay controls preload="auto"
         onended="this.currentTime=0;this.play()"
         onloadeddata="this.parentNode.hidden=false" onerror="this.parentNode.remove()"></video></div>`
    : "";
  const body = vid + mg + tech + prog + safe;

  return `
    <article class="ex">
      <div class="ex-head">
        <div class="ex-name">${esc(ex.name)}</div>
        ${ex.muscles ? `<div class="ex-muscles">${esc(ex.muscles)}</div>` : ""}
        ${tags ? `<div class="ex-tags">${tags}</div>` : ""}
      </div>
      ${body ? `<div class="ex-body">${body}</div>` : ""}
    </article>`;
}

let currentSection = null;

function renderSection(sectionId, subId, opt = {}) {
  const s = sectionId === "anatomy" ? ANATOMY : SECTIONS.find(x => x.id === sectionId);
  if (!s) return renderHome();
  const base = opt.base || `#/s/${s.id}`;
  const sub = s.subs.find(x => x.id === subId) || s.subs[0];

  const list = sub.exercises?.length
    ? `<div class="ex-row">${sub.exercises.map(exerciseCard).join("")}</div>`
    : `<div class="empty"><div class="big">${s.icon}</div>«${esc(sub.title)}»: ${s.id === "anatomy" ? "описание появится позже" : "упражнения появятся позже"}</div>`;

  // Смена подвкладки внутри того же раздела — меняем только список, без перерисовки экрана
  const listEl = document.getElementById("list");
  if (currentSection === s.id && listEl) {
    document.querySelectorAll(".chip").forEach(c => c.classList.toggle("active", c.dataset.sub === sub.id));
    document.querySelector(".chip.active")?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
    listEl.innerHTML = list;
    listEl.classList.remove("swap"); void listEl.offsetWidth; listEl.classList.add("swap");
    return "keep";
  }

  setChrome(s.title, opt.tab || "home", opt.back === undefined ? "#/" : opt.back);
  const chips = s.subs.map(x =>
    `<a class="chip${x.id === sub.id ? " active" : ""}" data-sub="${x.id}" href="${base}/${x.id}">${esc(x.title)}</a>`
  ).join("");

  view.innerHTML = `
    <div class="chips">${chips}</div>
    <div id="list">${list}</div>
  `;
  currentSection = s.id;
  document.querySelector(".chip.active")?.scrollIntoView({ inline: "center", block: "nearest" });
  return "forward";
}

function renderNutrition() {
  setChrome("Питание", "nutrition");
  view.innerHTML = `
    <div class="empty">
      <div class="big">🍽️</div>
      Здесь будет дневник питания:<br>что съедено за день, калории, белки, жиры и углеводы.
    </div>`;
}

function renderSettings() {
  setChrome("Настройки", "settings");
  view.innerHTML = `
    <div class="panel">
      <h3>Резервная копия</h3>
      <p>Твои записи хранятся только на этом телефоне. Время от времени сохраняй копию в файл, чтобы не потерять их.</p>
      <div class="row">
        <button class="btn" id="exportBtn">Сохранить копию</button>
        <button class="btn secondary" id="importBtn">Загрузить копию</button>
        <input type="file" id="importFile" accept="application/json" hidden>
      </div>
    </div>
    <div class="small">Версия ${APP_VERSION}</div>
  `;

  document.getElementById("exportBtn").onclick = () => {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k.startsWith(STORAGE_PREFIX)) data[k] = localStorage.getItem(k);
    }
    const blob = new Blob([JSON.stringify({ app: "sport", version: APP_VERSION, data }, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `sport-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  const fileInput = document.getElementById("importFile");
  document.getElementById("importBtn").onclick = () => fileInput.click();
  fileInput.onchange = async () => {
    const file = fileInput.files[0];
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      const entries = Object.entries(parsed.data || {}).filter(([k]) => k.startsWith(STORAGE_PREFIX));
      entries.forEach(([k, v]) => localStorage.setItem(k, v));
      fileInput.insertAdjacentHTML("afterend", `<p style="margin-top:10px">✅ Загружено записей: ${entries.length}</p>`);
    } catch {
      fileInput.insertAdjacentHTML("afterend", `<p style="margin-top:10px">❌ Не удалось прочитать файл</p>`);
    }
  };
}

// ---------- Навигация ----------

function route() {
  if (!document.getElementById("splash")) document.documentElement.classList.remove("splashing", "sp-hold");
  const parts = location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  let mode;
  if (parts[0] === "s") mode = renderSection(parts[1], parts[2]);
  else if (parts[0] === "anatomy") { mode = renderSection("anatomy", parts[1], { base: "#/anatomy", tab: "anatomy", back: null }); if (mode === "forward") mode = null; }
  else {
    currentSection = null;
    if (parts[0] === "nutrition") renderNutrition();
    else if (parts[0] === "settings") renderSettings();
    else renderHome();
  }
  if (mode === "keep") return;
  // Плавное появление экрана
  view.classList.remove("enter", "forward");
  void view.offsetWidth;
  view.classList.add("enter");
  if (mode === "forward") view.classList.add("forward");
}

// ---------- Плавные переходы между экранами ----------
function depthOf(hash) {
  const p = hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  return p[0] === "s" ? 1 : 0;
}
function tabOf(hash) {
  const p = hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  return p[0] === "s" ? "home:" + p[1] : (p[0] || "home");
}
let lastHash = location.hash;

// Переходы без записи в историю браузера: свайп двумя пальцами на Mac
// (жест «назад/вперёд») больше не листает вкладки и не показывает белый экран.
let forcedDir = null;
const INSTANT = true;   // переключение без анимации и задержки
function onNavigate() {
  const from = lastHash, to = location.hash;
  lastHash = to;
  const sameSection = tabOf(from) === tabOf(to) && depthOf(to) === 1;
  if ((INSTANT && !forcedDir) || !document.startViewTransition || sameSection || matchMedia("(prefers-reduced-motion: reduce)").matches) {
    forcedDir = null;
    route();
    return;
  }
  const dir = forcedDir || (depthOf(to) > depthOf(from) ? "vt-forward" : depthOf(to) < depthOf(from) ? "vt-back" : "vt-tab");
  forcedDir = null;
  const root = document.documentElement;
  root.classList.add(dir);
  const t = document.startViewTransition(() => route());
  t.finished.finally(() => root.classList.remove(dir));
}

function navigate(hash) {
  if (hash === location.hash) return;
  history.replaceState(null, "", hash);
  onNavigate();
}

document.addEventListener("click", e => {
  const a = e.target.closest('a[href^="#"]');
  if (!a || e.metaKey || e.ctrlKey) return;
  e.preventDefault();
  navigate(a.getAttribute("href"));
});
window.addEventListener("hashchange", onNavigate);
route();

// ---------- Свайп между вкладками (трекпад Mac и телефон) ----------
// Системный жест «назад» с белым экраном заблокирован — вместо него листаются вкладки.
const TAB_ORDER = ["#/", "#/anatomy", "#/nutrition", "#/settings"];
function currentTabIndex() {
  const h = location.hash || "#/";
  if (h.startsWith("#/anatomy")) return 1;
  if (h.startsWith("#/nutrition")) return 2;
  if (h.startsWith("#/settings")) return 3;
  return 0;
}
function swipeTab(step) {
  if (document.getElementById("splash")) return;
  const inSection = depthOf(location.hash) === 1;
  if (inSection && step < 0) { forcedDir = "vt-prev"; navigate("#/"); return; }   // свайп «назад» из раздела
  const i = currentTabIndex() + step;
  if (i < 0 || i >= TAB_ORDER.length) return;
  forcedDir = step > 0 ? "vt-next" : "vt-prev";   // плавный сдвиг только при свайпе
  navigate(TAB_ORDER[i]);
}

// Трекпад: срабатывает сразу в начале жеста. Инерция (затухающие события после свайпа)
// игнорируется, но новый свайп распознаётся сразу — по резкому росту силы движения или смене направления.
let wheelAcc = 0, wheelLast = 0, gestureUsed = false, lastAbs = 0, lastDir = 0, lastFire = 0;
let axis = null, axX = 0, axY = 0;   // направление текущего жеста: "x" — свайп вкладок, "y" — обычная прокрутка
window.addEventListener("wheel", e => {
  const now = performance.now();
  if (now - wheelLast > 120) { axis = null; axX = 0; axY = 0; wheelAcc = 0; gestureUsed = false; }   // новый жест
  wheelLast = now;

  // Сначала понимаем, куда движутся пальцы. Пока не ясно — ничего не блокируем, прокрутка идёт как обычно.
  if (!axis) {
    axX += Math.abs(e.deltaX); axY += Math.abs(e.deltaY);
    if (axX + axY < 6) return;
    axis = axX > axY * 2 ? "x" : "y";
  }
  if (axis === "y") return;            // вертикальный жест — это прокрутка страницы, не трогаем

  e.preventDefault();                  // горизонтальный жест — не даём браузеру показать белый экран «назад»
  const chips = e.target.closest && e.target.closest(".chips, .ex-row");
  if (chips) { chips.scrollLeft += e.deltaX; return; }
  const abs = Math.abs(e.deltaX), dir = Math.sign(e.deltaX);
  if (gestureUsed && now - lastFire > 180 && dir && (dir !== lastDir || abs > lastAbs * 1.6 + 3)) { wheelAcc = 0; gestureUsed = false; }
  lastAbs = abs;
  if (gestureUsed) return;
  wheelAcc += e.deltaX;
  if (Math.abs(wheelAcc) > 18) {
    gestureUsed = true; lastDir = Math.sign(wheelAcc); lastFire = now;
    swipeTab(wheelAcc > 0 ? 1 : -1);
  }
}, { passive: false });

// Телефон: переключение прямо во время движения пальца
let tx = 0, ty = 0, tOk = false;
window.addEventListener("touchstart", e => {
  const t = e.touches[0]; tx = t.clientX; ty = t.clientY;
  tOk = e.touches.length === 1 && !(e.target.closest && e.target.closest(".chips, .ex-row"));
}, { passive: true });
window.addEventListener("touchmove", e => {
  if (!tOk) return;
  const t = e.touches[0], dx = t.clientX - tx, dy = t.clientY - ty;
  if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) { tOk = false; swipeTab(dx < 0 ? 1 : -1); }
  else if (Math.abs(dy) > 30) tOk = false;
}, { passive: true });

// ---------- Работа без интернета ----------
if ("serviceWorker" in navigator) {
  const hadController = !!navigator.serviceWorker.controller;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").then(reg => reg.update()).catch(() => {});
  });
  // Пришла новая версия — применяем её незаметно: перезагружаемся, когда приложение свёрнуто,
  // а не во время заставки (иначе куб появлялся дважды)
  let pending = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (hadController) pending = true;
  });
  document.addEventListener("visibilitychange", () => {
    if (pending && document.visibilityState === "hidden") { pending = false; location.reload(); }
  });
}
