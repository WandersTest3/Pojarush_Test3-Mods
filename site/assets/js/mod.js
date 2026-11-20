import { ICONS, auth, avatarUrl, chrome, config, creator, esc, fmtAgo, fmtDate, fmtNumber, fmtSize, iconUrl, loadIndex, localized, markdown, profileHref, safeUrl, sheet, sideTag, t, typeTag } from "./core.js";

chrome("");
const app = document.getElementById("app");
const id = new URLSearchParams(location.search).get("id") || "";
const CAP_KEYS = ["game-read", "chat", "hud", "render", "input", "ui", "storage", "command", "recipes", "registries", "players", "world"];
const TABS = ["description", "gallery", "changelog", "versions", "details"];

function link(url, label) {
  const u = safeUrl(url);
  return u ? `<a href="${esc(u)}" rel="nofollow noopener" target="_blank">${esc(label || u)}</a>` : "";
}

function person(login) {
  return `<a class="who" href="${esc(profileHref(login))}"><img class="mini-avatar" src="${esc(avatarUrl(login, 48))}" alt="">${esc(login)}</a>`;
}

function lightbox(src) {
  const back = document.createElement("div");
  back.className = "lightbox";
  back.innerHTML = `<button type="button" aria-label="${esc(t("close"))}">${ICONS.close}</button><img src="${esc(src)}" alt="">`;
  const close = () => { back.remove(); document.removeEventListener("keydown", onKey); };
  const onKey = e => { if (e.key === "Escape") close(); };
  back.addEventListener("click", close);
  document.addEventListener("keydown", onKey);
  document.body.append(back);
  back.querySelector("button").focus();
}

function render(p, revoked, cfg) {
  const l = localized(p);
  const latest = p.versions.find(v => !revoked.has(v.file.sha256));
  const site = p.site || {};
  const vd = site.version_downloads || {};
  const pj = site.min_pojarush || {};
  const gallery = site.gallery || [];
  const who = creator(p);
  document.title = `${l.name} - Pojarush Mods`;
  const me = auth.user?.login?.toLowerCase();
  const owns = me && p.owners.some(o => o.toLowerCase() === me);
  const latestPj = latest ? pj[latest.version] : null;
  const tags = [sideTag(latest?.side || p.versions[0].side), ...(site.categories || []).map(c => `<span class="tag">${esc(t(`cat_${c}`))}</span>`), typeTag(site.code)].join(" ");
  const caps = latest?.capabilities || [];
  const contact = site.contact || {};
  const hasSource = safeUrl(p.source) && !p.source.startsWith(cfg.siteUrl);

  app.innerHTML = `
    <article class="mod-top">
      <img class="mod-icon big" src="${esc(iconUrl(p))}" alt="">
      <div class="mod-top-text">
        <h1>${esc(l.name)}</h1>
        <p class="summary">${esc(l.summary)}</p>
      </div>
    </article>
    <div class="mod-bar">
      ${latest ? `<a class="round primary" href="${esc(latest.file.url)}" download aria-label="${esc(t("download"))} ${esc(latest.version)} · ${esc(fmtSize(latest.file.size))}" title="${esc(t("download"))} ${esc(latest.version)} · ${esc(fmtSize(latest.file.size))}">${ICONS.download}</a>` : ""}
      ${owns ? `<a class="round" href="edit.html?id=${encodeURIComponent(p.id)}" aria-label="${esc(t("editPage"))}" title="${esc(t("editPage"))}">${ICONS.edit}</a>` : ""}
      <button type="button" class="round" id="menuBtn" aria-label="${esc(t("menu"))}">${ICONS.dots}</button>
    </div>
    <div class="mod-stats">
      <span class="stat">${ICONS.download}${esc(t("downloads", { n: fmtNumber(p.downloads || 0) }))}</span>
      ${site.updated ? `<span class="dotsep"></span><span class="stat">${ICONS.clock}${esc(t("updatedAgo", { t: fmtAgo(site.updated) }))}</span>` : ""}
    </div>
    ${who ? `<a class="creator" href="${esc(profileHref(who))}">
      <img class="avatar-m" src="${esc(avatarUrl(who, 96))}" alt="">
      <span><small>${esc(t("creator"))}</small><strong>${esc(who)}</strong></span></a>` : ""}
    <div class="chips">${tags}${latestPj ? ` <span class="tag">${esc(t("requiresPojarush", { v: latestPj }))}</span>` : ""}</div>
    <div class="tabs" role="tablist">
      ${TABS.map((k, i) => `<button role="tab" id="tab-${k}" aria-controls="panel-${k}" aria-selected="${i === 0}">${esc(t(`tab_${k}`))}</button>`).join("")}
    </div>
    <section class="panel md" id="panel-description" role="tabpanel" aria-labelledby="tab-description">
      ${site.description_image ? `<img class="desc-image" src="${esc(site.description_image)}" alt="">` : ""}
      ${p.description ? markdown(p.description) : site.description_image ? "" : `<p>${esc(t("noDescription"))}</p>`}
    </section>
    <section class="panel" id="panel-gallery" role="tabpanel" aria-labelledby="tab-gallery" hidden>
      ${gallery.length ? `<div class="g-view">${gallery.map(g => `<button type="button" class="g-thumb" data-src="${esc(g)}"><img src="${esc(g)}" alt="" loading="lazy"></button>`).join("")}</div>` : `<p class="muted">${esc(t("noGallery"))}</p>`}
    </section>
    <section class="panel" id="panel-changelog" role="tabpanel" aria-labelledby="tab-changelog" hidden>
      <div class="versions">${p.versions.map(v => `
        <div class="log">
          <h3>${esc(v.version)} <small>${esc(v.published ? fmtDate(v.published + "T12:00:00Z") : "")}</small></h3>
          ${v.changelog ? `<div class="md">${markdown(v.changelog)}</div>` : `<p class="muted">${esc(t("noChangelog"))}</p>`}
        </div>`).join("")}
      </div>
    </section>
    <section class="panel" id="panel-versions" role="tabpanel" aria-labelledby="tab-versions" hidden>
      <div class="versions">${p.versions.map(v => `
        <div class="version">
          <div><div class="v">${esc(v.version)}</div>
            <div class="meta">Minecraft ${esc(v.game)}${pj[v.version] ? ` · ${esc(t("requiresPojarush", { v: pj[v.version] }))}` : ""} · ${esc(v.published ? fmtDate(v.published + "T12:00:00Z") : "")} · ${esc(fmtSize(v.file.size))} · ${esc(t("downloads", { n: fmtNumber(vd[v.version] || 0) }))}</div></div>
          ${revoked.has(v.file.sha256) ? "" : `<a class="btn" href="${esc(v.file.url)}" download aria-label="${esc(t("download"))} ${esc(v.version)}">${ICONS.download}</a>`}
        </div>`).join("")}
      </div>
    </section>
    <section class="panel" id="panel-details" role="tabpanel" aria-labelledby="tab-details" hidden>
      <dl class="details">
        <div><dt>${esc(t("permissions"))}</dt><dd>
          <p>${esc(site.code ? t("hasCode") : t("contentOnly"))}</p>
          ${caps.length ? `<ul class="perm-list">${caps.map(c => `<li><strong>${esc(c)}</strong>: ${esc(CAP_KEYS.includes(c) ? t(`cap_${c.replace("-", "_")}`) : c)}</li>`).join("")}</ul>` : esc(t("noPermissions"))}
        </dd></div>
        ${latestPj ? `<div><dt>${esc(t("requires"))}</dt><dd>${esc(t("requiresPojarush", { v: latestPj }))}</dd></div>` : ""}
        <div><dt>${esc(t("license"))}</dt><dd>${esc(p.license)}</dd></div>
        ${hasSource ? `<div><dt>${esc(t("source"))}</dt><dd>${link(p.source)}</dd></div>` : ""}
        ${contact.homepage ? `<div><dt>${esc(t("homepage"))}</dt><dd>${link(contact.homepage)}</dd></div>` : ""}
        ${contact.issues ? `<div><dt>${esc(t("issues"))}</dt><dd>${link(contact.issues)}</dd></div>` : ""}
        <div><dt>${esc(t("authors"))}</dt><dd>${(p.authors || []).map(esc).join(", ")}</dd></div>
        <div><dt>${esc(t("owners"))}</dt><dd class="people">${p.owners.map(person).join(" ")}</dd></div>
        <div><dt>${esc(t("modId"))}</dt><dd><code>${esc(p.id)}</code></dd></div>
        ${site.created ? `<div><dt>${esc(t("created"))}</dt><dd>${esc(fmtDate(site.created))}</dd></div>` : ""}
        ${latest ? `<div><dt>${esc(t("sha256"))}</dt><dd><code>${esc(latest.file.sha256)}</code></dd></div>` : ""}
      </dl>
    </section>`;

  const tabs = [...app.querySelectorAll('[role="tab"]')];
  const select = tab => tabs.forEach(o => {
    const on = o === tab;
    o.setAttribute("aria-selected", on);
    app.querySelector(`#${o.getAttribute("aria-controls")}`).hidden = !on;
  });
  tabs.forEach(tab => tab.addEventListener("click", () => {
    select(tab);
    history.replaceState(null, "", tab.id === "tab-description" ? location.pathname + location.search : `#${tab.id.slice(4)}`);
  }));
  const fromHash = tabs.find(x => x.id === `tab-${location.hash.slice(1)}`);
  if (fromHash) select(fromHash);

  app.querySelector("#panel-gallery").addEventListener("click", e => {
    const b = e.target.closest("[data-src]");
    if (b) lightbox(b.dataset.src);
  });

  app.querySelector("#menuBtn").onclick = () => {
    const pageUrl = new URL(`mod.html?id=${encodeURIComponent(p.id)}`, cfg.siteUrl).href;
    const sh = sheet(`<h2>${esc(l.name)}</h2>
      <button class="btn" data-a="copy">${ICONS.link}${esc(t("copyLink"))}</button>
      ${hasSource ? `<a class="btn" href="${esc(p.source)}" target="_blank" rel="nofollow noopener">${ICONS.code}${esc(t("viewSource"))}</a>` : ""}
      ${safeUrl(cfg.discord) ? `<a class="btn" href="${esc(cfg.discord)}" target="_blank" rel="noopener">${ICONS.flag}${esc(t("reportProblem"))}</a>` : ""}
      ${owns ? `<a class="btn" href="upload.html?id=${encodeURIComponent(p.id)}">${ICONS.upload}${esc(t("newVersion"))}</a>` : ""}
      <button class="btn" data-a="close">${esc(t("close"))}</button>`);
    sh.el.querySelector('[data-a="close"]').onclick = sh.close;
    const copy = sh.el.querySelector('[data-a="copy"]');
    copy.onclick = async () => {
      try { await navigator.clipboard.writeText(pageUrl); copy.lastChild.textContent = t("linkCopied"); } catch { prompt(t("copyLink"), pageUrl); }
    };
  };
}

(async () => {
  let index, cfg;
  try {
    cfg = await config();
    index = await loadIndex();
  } catch {
    app.innerHTML = `<div class="notice box error">${esc(t("loadError"))}</div>`;
    return;
  }
  const revokedAll = (index.revoked || []).some(r => r.id === id && !r.sha256);
  const p = (index.projects || []).find(x => x.id === id && x.kind === "mod");
  if (!p || revokedAll) {
    app.innerHTML = `<div class="notice box">${esc(t("notFound"))}<p><a class="btn" href="./">${esc(t("backToList"))}</a></p></div>`;
    return;
  }
  const revoked = new Set((index.revoked || []).filter(r => r.id === id && r.sha256).map(r => r.sha256));
  render(p, revoked, cfg);
})();
