// Логика приложения: навигация по вкладкам и отрисовка экранов.
// Данные (разделы и упражнения) лежат в data.js.

const APP_VERSION = "0.24";
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
  backBtn.onclick = back ? () => { location.hash = back; } : null;
  document.querySelectorAll("#tabbar a").forEach(a => a.classList.toggle("active", a.dataset.tab === tab));
  window.scrollTo({ top: 0 });
}

// ---------- Экраны ----------

function sectionCard(s, wide, i = 0) {
  const n = countExercises(s);
  return `
    <a class="section-card${wide ? " wide" : ""}" href="#/s/${s.id}" style="--i:${i}">
      <div class="top"><span class="ico">${s.icon}</span></div>
      <div class="bottom">
        <div class="name">${esc(s.title)}</div>
        <div class="meta"><span class="dot mint"></span>${s.subs.length} подвкладок</div>
        <div class="meta"><span class="dot blue"></span>${n ? n + " упражнений" : "пока пусто"}</div>
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

  const tech = Array.isArray(ex.technique) && ex.technique.length
    ? `<h4>Техника</h4><ol>${ex.technique.map(t => `<li>${esc(t)}</li>`).join("")}</ol>` : "";
  const prog = ex.progression ? `<h4>Когда увеличивать нагрузку</h4><p>${esc(ex.progression)}</p>` : "";
  const safe = ex.safety ? `<h4>Безопасность</h4><p>${esc(ex.safety)}</p>` : "";
  const vid = ex.video ? `<h4>Видео</h4><p><a href="${esc(ex.video)}" target="_blank" rel="noopener">Открыть</a></p>` : "";
  const body = tech + prog + safe + vid;

  return `
    <details class="ex">
      <summary>
        <div class="ex-name">${esc(ex.name)}</div>
        ${ex.muscles ? `<div class="ex-muscles">${esc(ex.muscles)}</div>` : ""}
        ${tags ? `<div class="ex-tags">${tags}</div>` : ""}
      </summary>
      ${body ? `<div class="ex-body">${body}</div>` : ""}
    </details>`;
}

let currentSection = null;

function renderSection(sectionId, subId) {
  const s = SECTIONS.find(x => x.id === sectionId);
  if (!s) return renderHome();
  const sub = s.subs.find(x => x.id === subId) || s.subs[0];

  const list = sub.exercises?.length
    ? sub.exercises.map(exerciseCard).join("")
    : `<div class="empty"><div class="big">${s.icon}</div>«${esc(sub.title)}»: упражнения появятся позже</div>`;

  // Смена подвкладки внутри того же раздела — меняем только список, без перерисовки экрана
  const listEl = document.getElementById("list");
  if (currentSection === s.id && listEl) {
    document.querySelectorAll(".chip").forEach(c => c.classList.toggle("active", c.dataset.sub === sub.id));
    document.querySelector(".chip.active")?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
    listEl.innerHTML = list;
    listEl.classList.remove("swap"); void listEl.offsetWidth; listEl.classList.add("swap");
    return "keep";
  }

  setChrome(s.title, "home", "#/");
  const chips = s.subs.map(x =>
    `<a class="chip${x.id === sub.id ? " active" : ""}" data-sub="${x.id}" href="#/s/${s.id}/${x.id}">${esc(x.title)}</a>`
  ).join("");

  view.innerHTML = `
    <div class="chips">${chips}</div>
    ${s.note ? `<div class="note">⚠️ ${esc(s.note)}</div>` : ""}
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
  const parts = location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  let mode;
  if (parts[0] === "s") mode = renderSection(parts[1], parts[2]);
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

window.addEventListener("hashchange", () => {
  const from = lastHash, to = location.hash;
  lastHash = to;
  const sameSection = tabOf(from) === tabOf(to) && depthOf(to) === 1;
  if (!document.startViewTransition || sameSection || matchMedia("(prefers-reduced-motion: reduce)").matches) {
    route();
    return;
  }
  const dir = depthOf(to) > depthOf(from) ? "vt-forward" : depthOf(to) < depthOf(from) ? "vt-back" : "vt-tab";
  const root = document.documentElement;
  root.classList.add(dir);
  const t = document.startViewTransition(() => route());
  t.finished.finally(() => root.classList.remove(dir));
});
route();

// ---------- Работа без интернета ----------
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
}
