import { ICONS, auth, author, chrome, config, esc, fmtAgo, fmtNumber, iconUrl, loadIndex, local, localized, sideTag, t, typeTag, accountSheet } from "./core.js";

const SORTS = ["relevance", "downloads", "newest", "updated", "name"];
const PER = [10, 20, 50, 100];
const app = document.getElementById("app");
const params = new URLSearchParams(location.search);
const owner = params.get("owner") === "me" ? "me" : params.get("owner") || "";

const state = {
  q: params.get("q") || "",
  sort: SORTS.includes(params.get("sort")) ? params.get("sort") : "relevance",
  per: PER.includes(Number(params.get("per"))) ? Number(params.get("per")) : 20,
  page: Math.max(1, Number(params.get("page")) || 1),
  view: local.getItem("pm_view") === "list" ? "list" : "gallery",
  cats: new Set((params.get("cat") || "").split(",").filter(Boolean)),
  side: params.get("side") || "",
  type: params.get("type") || "",
  game: params.get("game") || "",
  owner,
  filtersOpen: false
};

const nav = chrome(owner ? "mine" : params.get("focus") ? "search" : "home");
let mods = [];
let cfg;

function syncUrl() {
  const p = new URLSearchParams();
  if (state.q) p.set("q", state.q);
  if (state.sort !== "relevance") p.set("sort", state.sort);
  if (state.per !== 20) p.set("per", state.per);
  if (state.page > 1) p.set("page", state.page);
  if (state.cats.size) p.set("cat", [...state.cats].join(","));
  for (const k of ["side", "type", "game", "owner"]) if (state[k]) p.set(k, state[k]);
  history.replaceState(null, "", p.size ? `?${p}` : location.pathname);
}

function norm(s) {
  return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function score(m, words) {
  if (!words.length) return 0;
  const name = norm(m.name + " " + m.localName);
  const rest = norm([m.summary, m.localSummary, m.id, ...(m.authors || []), ...(m.owners || []), ...m.cats.map(c => t(`cat_${c}`))].join(" "));
  let total = 0;
  for (const w of words) {
    if (name.startsWith(w)) total += 10;
    else if (name.includes(w)) total += 6;
    else if (rest.includes(w)) total += 2;
    else return -1;
  }
  return total;
}

function filtered() {
  const words = norm(state.q).split(/\s+/).filter(Boolean);
  const me = auth.user?.login?.toLowerCase();
  const ownerName = state.owner === "me" ? me : state.owner.toLowerCase();
  let list = mods
    .map(m => ({ m, s: score(m, words) }))
    .filter(({ m, s }) => s >= 0
      && (!state.cats.size || m.cats.some(c => state.cats.has(c)))
      && (!state.side || m.side === state.side)
      && (!state.type || (state.type === "code") === m.code)
      && (!state.game || m.games.includes(state.game))
      && (!ownerName || m.owners.some(o => o.toLowerCase() === ownerName)));
  const by = {
    relevance: (a, b) => b.s - a.s || b.m.downloads - a.m.downloads || b.m.updated.localeCompare(a.m.updated),
    downloads: (a, b) => b.m.downloads - a.m.downloads,
    newest: (a, b) => b.m.created.localeCompare(a.m.created),
    updated: (a, b) => b.m.updated.localeCompare(a.m.updated),
    name: (a, b) => a.m.localName.localeCompare(b.m.localName, document.documentElement.lang)
  }[state.sort];
  return list.sort(by).map(x => x.m);
}

function card(m) {
  const banner = m.banner ? `<img src="${esc(m.banner)}" alt="" loading="lazy">` : "";
  const tags = [sideTag(m.side), ...m.cats.map(c => `<span class="tag">${esc(t(`cat_${c}`))}</span>`), typeTag(m.code)].join(" ");
  return `<a class="card" href="mod.html?id=${encodeURIComponent(m.id)}">
    <div class="card-banner">${banner}</div>
    <div class="card-body">
      <img class="mod-icon" src="${esc(m.icon)}" alt="" loading="lazy">
      <h2 class="card-title">${esc(m.localName)}<span class="by">${esc(t("by"))} ${esc(m.author)}</span></h2>
      <p class="card-summary">${esc(m.localSummary)}</p>
      <div class="card-tags chips">${tags}</div>
      <div class="card-stats">
        <span class="stat">${ICONS.download}${esc(t("downloads", { n: fmtNumber(m.downloads) }))}</span>
        <span class="stat">${ICONS.clock}${esc(t("updatedAgo", { t: fmtAgo(m.updated) }))}</span>
      </div>
    </div>
  </a>`;
}

function pager(pages) {
  if (pages <= 1) return "";
  const p = state.page;
  const nums = new Set([1, pages, p, p - 1, p + 1].filter(n => n >= 1 && n <= pages));
  const sorted = [...nums].sort((a, b) => a - b);
  let html = `<button data-page="${p - 1}" aria-label="${esc(t("prev"))}"${p === 1 ? " disabled" : ""}>${ICONS.left}</button>`;
  let prev = 0;
  for (const n of sorted) {
    if (n - prev > 1) html += `<span class="gap">…</span>`;
    html += `<button data-page="${n}" aria-label="${esc(t("page", { n }))}"${n === p ? ' aria-current="page"' : ""}>${n}</button>`;
    prev = n;
  }
  html += `<button data-page="${p + 1}" aria-label="${esc(t("next"))}"${p === pages ? " disabled" : ""}>${ICONS.right}</button>`;
  return `<nav class="pager" aria-label="Pages">${html}</nav>`;
}

function filterPanel() {
  const games = [...new Set(mods.flatMap(m => m.games))].sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
  const chip = (group, value, label, on) =>
    `<button type="button" class="chip" data-group="${group}" data-value="${esc(value)}" aria-pressed="${on}">${esc(label)}</button>`;
  return `<div class="filters" id="filters"${state.filtersOpen ? "" : " hidden"}>
    <div><h3>${esc(t("categories"))}</h3><div class="chips">${cfg.categories.map(c => chip("cat", c, t(`cat_${c}`), state.cats.has(c))).join("")}</div></div>
    <div><h3>${esc(t("environment"))}</h3><div class="chips">${["client", "server", "both"].map(s => chip("side", s, t(`side_${s}`), state.side === s)).join("")}</div></div>
    <div><h3>${esc(t("type"))}</h3><div class="chips">${["content", "code"].map(s => chip("type", s, t(`type_${s}`), state.type === s)).join("")}</div></div>
    ${games.length ? `<div><h3>${esc(t("minecraft"))}</h3><div class="chips">${games.map(g => chip("game", g, g, state.game === g)).join("")}</div></div>` : ""}
    <div class="filters-foot"><span id="count"></span><button type="button" class="link-btn" data-a="clear">${esc(t("clearFilters"))}</button></div>
  </div>`;
}

function activeFilters() {
  return state.cats.size + (state.side ? 1 : 0) + (state.type ? 1 : 0) + (state.game ? 1 : 0);
}

function renderShell() {
  app.innerHTML = `
    <label class="field">${ICONS.search}<input id="q" type="search" placeholder="${esc(t("search"))}" aria-label="${esc(t("search"))}" value="${esc(state.q)}" autocomplete="off"></label>
    <div class="controls">
      <label class="pill sort"><span class="k">${esc(t("sortBy"))}</span> <span id="sortLabel"></span>${ICONS.chevron}
        <select id="sort" aria-label="${esc(t("sortBy"))}">${SORTS.map(s => `<option value="${s}">${esc(t(`sort_${s}`))}</option>`).join("")}</select></label>
      <label class="pill"><span class="k">${esc(t("view"))}</span> <span id="perLabel"></span>${ICONS.chevron}
        <select id="per" aria-label="${esc(t("view"))}">${PER.map(n => `<option value="${n}">${n}</option>`).join("")}</select></label>
      <button type="button" class="pill" id="filterBtn" aria-expanded="${state.filtersOpen}" aria-controls="filters"></button>
      <button type="button" class="pill icon-btn" id="viewBtn" aria-label="${esc(t("toggleView"))}"></button>
    </div>
    ${filterPanel()}
    <div id="pagerTop"></div>
    <div id="results" class="results ${state.view}" aria-live="polite"></div>
    <div id="pagerBottom"></div>`;

  const q = app.querySelector("#q");
  let timer;
  q.addEventListener("input", () => {
    clearTimeout(timer);
    timer = setTimeout(() => { state.q = q.value; state.page = 1; update(); }, 150);
  });
  const sort = app.querySelector("#sort");
  sort.value = state.sort;
  sort.onchange = () => { state.sort = sort.value; state.page = 1; update(); };
  const per = app.querySelector("#per");
  per.value = String(state.per);
  per.onchange = () => { state.per = Number(per.value); state.page = 1; update(); };
  app.querySelector("#filterBtn").onclick = e => {
    state.filtersOpen = !state.filtersOpen;
    e.currentTarget.setAttribute("aria-expanded", state.filtersOpen);
    app.querySelector("#filters").hidden = !state.filtersOpen;
  };
  app.querySelector("#viewBtn").onclick = () => {
    state.view = state.view === "gallery" ? "list" : "gallery";
    local.setItem("pm_view", state.view);
    update();
  };
  app.querySelector("#filters").addEventListener("click", e => {
    const b = e.target.closest("button");
    if (!b) return;
    if (b.dataset.a === "clear") {
      state.cats.clear();
      state.side = state.type = state.game = "";
      app.querySelectorAll("#filters .chip").forEach(c => c.setAttribute("aria-pressed", "false"));
    } else {
      const { group, value } = b.dataset;
      if (group === "cat") {
        state.cats.has(value) ? state.cats.delete(value) : state.cats.add(value);
        b.setAttribute("aria-pressed", state.cats.has(value));
      } else {
        state[group] = state[group] === value ? "" : value;
        app.querySelectorAll(`#filters .chip[data-group="${group}"]`).forEach(c => c.setAttribute("aria-pressed", c.dataset.value === state[group]));
      }
    }
    state.page = 1;
    update();
  });
  app.addEventListener("click", e => {
    const b = e.target.closest(".pager button");
    if (!b || b.disabled) return;
    state.page = Number(b.dataset.page);
    update();
    app.querySelector("#q").scrollIntoView({ block: "start" });
  });
  if (params.get("focus")) q.focus();
}

function update() {
  const list = filtered();
  const pages = Math.max(1, Math.ceil(list.length / state.per));
  state.page = Math.min(state.page, pages);
  const slice = list.slice((state.page - 1) * state.per, state.page * state.per);
  app.querySelector("#sortLabel").textContent = t(`sort_${state.sort}`);
  app.querySelector("#perLabel").textContent = state.per;
  const n = activeFilters();
  const fb = app.querySelector("#filterBtn");
  fb.textContent = n ? `${t("filter").replace(/\.+$/, "")} (${n})` : t("filter");
  fb.classList.toggle("on", n > 0);
  const vb = app.querySelector("#viewBtn");
  vb.innerHTML = state.view === "gallery" ? ICONS.list : ICONS.grid;
  app.querySelector("#count").textContent = list.length === 1 ? t("result") : t("results", { n: fmtNumber(list.length) });
  const results = app.querySelector("#results");
  results.className = `results ${state.view}`;
  let empty = "";
  if (state.owner === "me" && !auth.user) empty = `<div class="empty">${esc(t("mineNeedsLogin"))}<p><button class="btn primary" data-a="account">${esc(t("nav_account"))}</button></p></div>`;
  else if (!mods.length) empty = `<div class="empty">${esc(t("noMods"))}<p><a class="btn primary" href="upload.html">${esc(t("nav_upload"))}</a></p></div>`;
  else if (!list.length) empty = `<div class="empty">${esc(t("noResults"))}</div>`;
  results.innerHTML = empty || slice.map(card).join("");
  results.querySelector('[data-a="account"]')?.addEventListener("click", accountSheet);
  const pg = pager(pages);
  app.querySelector("#pagerTop").innerHTML = pg;
  app.querySelector("#pagerBottom").innerHTML = pg;
  syncUrl();
}

function prepare(p) {
  const l = localized(p);
  const updated = p.site?.updated || `${p.versions[0]?.published}T00:00:00Z`;
  return {
    id: p.id,
    name: p.name,
    summary: p.summary,
    localName: l.name,
    localSummary: l.summary,
    authors: p.authors || [],
    owners: p.owners || [],
    author: author(p),
    icon: iconUrl(p),
    banner: p.site?.banner || null,
    cats: p.site?.categories || [],
    side: p.versions[0]?.side || "client",
    code: Boolean(p.site?.code),
    games: [...new Set(p.versions.map(v => v.game).filter(Boolean))],
    downloads: p.downloads || 0,
    created: p.site?.created || updated,
    updated
  };
}

(async () => {
  try {
    cfg = await config();
    const index = await loadIndex();
    const revokedAll = new Set((index.revoked || []).filter(r => !r.sha256).map(r => r.id));
    mods = (index.projects || []).filter(p => p.kind === "mod" && p.versions?.length && !revokedAll.has(p.id)).map(prepare);
  } catch {
    app.innerHTML = `<div class="notice box error">${esc(t("loadError"))}</div>`;
    return;
  }
  renderShell();
  update();
  nav.querySelector('[data-a="search"]').addEventListener("click", e => {
    if (location.pathname.endsWith("/") || location.pathname.endsWith("index.html")) {
      e.preventDefault();
      app.querySelector("#q").focus();
    }
  });
})();
