import { ICONS, auth, avatarUrl, chrome, esc, fmtMonth, fmtNumber, gh, loadIndex, modCard, prepareMod, session, t } from "./core.js";

const app = document.getElementById("app");
const login = new URLSearchParams(location.search).get("u") || "";
chrome(auth.user?.login?.toLowerCase() === login.toLowerCase() ? "profile" : "");

async function profile(name) {
  const key = `pm_u_${name.toLowerCase()}`;
  try {
    const cached = JSON.parse(session.getItem(key) || "null");
    if (cached && Date.now() - cached.at < 600000) return cached.data;
  } catch {}
  try {
    const data = await gh(`/users/${encodeURIComponent(name)}`);
    session.setItem(key, JSON.stringify({ at: Date.now(), data }));
    return data;
  } catch (e) {
    if (e.status === 404) return null;
    return {};
  }
}

(async () => {
  if (!/^[A-Za-z0-9-]{1,39}$/.test(login)) {
    app.innerHTML = `<div class="notice box">${esc(t("userNotFound"))}<p><a class="btn" href="./">${esc(t("backToList"))}</a></p></div>`;
    return;
  }
  let index;
  try {
    index = await loadIndex();
  } catch {
    app.innerHTML = `<div class="notice box error">${esc(t("loadError"))}</div>`;
    return;
  }
  const revokedAll = new Set((index.revoked || []).filter(r => !r.sha256).map(r => r.id));
  const mods = (index.projects || [])
    .filter(p => p.kind === "mod" && p.versions?.length && !revokedAll.has(p.id) && p.owners.some(o => o.toLowerCase() === login.toLowerCase()))
    .map(p => prepareMod(p))
    .sort((a, b) => b.downloads - a.downloads || b.updated.localeCompare(a.updated));
  const gp = await profile(login);
  if (gp === null && !mods.length) {
    app.innerHTML = `<div class="notice box">${esc(t("userNotFound"))}<p><a class="btn" href="./">${esc(t("backToList"))}</a></p></div>`;
    return;
  }
  const shown = gp?.login || mods[0]?.owners.find(o => o.toLowerCase() === login.toLowerCase()) || login;
  document.title = `${shown} - Pojarush Mods`;
  const total = mods.reduce((n, m) => n + m.downloads, 0);
  const mine = auth.user?.login?.toLowerCase() === login.toLowerCase();
  const since = gp?.created_at ? t("onGithubSince", { d: fmtMonth(gp.created_at) }) : "";
  app.innerHTML = `
    <section class="profile">
      <img class="avatar-l" src="${esc(avatarUrl(shown, 192))}" alt="">
      <div class="profile-text">
        <h1>${esc(gp?.name || shown)}</h1>
        ${gp?.name && gp.name !== shown ? `<p class="muted">@${esc(shown)}</p>` : ""}
        ${gp?.bio ? `<p class="summary">${esc(gp.bio)}</p>` : ""}
      </div>
      <div class="profile-actions">
        <a class="btn" href="https://github.com/${mine ? "settings/profile" : encodeURIComponent(shown)}" target="_blank" rel="noopener">${mine ? ICONS.edit : ICONS.external}${esc(t(mine ? "editOnGithub" : "viewOnGithub"))}</a>
        ${mine ? `<button type="button" class="btn" id="logout">${esc(t("logout"))}</button>` : ""}
      </div>
      <div class="mod-stats">
        <span class="stat">${ICONS.cube}${esc(mods.length === 1 ? t("projectCount") : t("projectsCount", { n: fmtNumber(mods.length) }))}</span>
        <span class="dotsep"></span>
        <span class="stat">${ICONS.download}${esc(t("downloads", { n: fmtNumber(total) }))}</span>
        ${since ? `<span class="dotsep"></span><span class="stat">${ICONS.clock}${esc(since)}</span>` : ""}
      </div>
    </section>
    <div class="results gallery" id="results">${mods.length ? mods.map(modCard).join("") : `<div class="empty">${esc(t("noModsUser"))}</div>`}</div>`;
  app.querySelector("#logout")?.addEventListener("click", () => { auth.clear(); location.href = "./"; });
})();
