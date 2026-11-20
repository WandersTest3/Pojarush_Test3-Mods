import { ICONS, auth, author, chrome, esc, fmtAgo, fmtDate, fmtNumber, fmtSize, iconUrl, loadIndex, localized, markdown, safeUrl, sideTag, t, typeTag } from "./core.js";

chrome("");
const app = document.getElementById("app");
const id = new URLSearchParams(location.search).get("id") || "";

const CAP_KEYS = ["game-read", "chat", "hud", "render", "input", "ui", "storage", "command", "recipes", "registries", "players", "world"];

function ghUser(login) {
  return `<a href="https://github.com/${encodeURIComponent(login)}" rel="noopener" target="_blank">${esc(login)}</a>`;
}

function link(url, label) {
  const u = safeUrl(url);
  return u ? `<a href="${esc(u)}" rel="nofollow noopener" target="_blank">${esc(label || u)}</a>` : "";
}

function render(p, revoked) {
  const l = localized(p);
  const latest = p.versions.find(v => !revoked.has(v.file.sha256));
  const site = p.site || {};
  const vd = site.version_downloads || {};
  document.title = `${l.name} - Pojarush Mods`;
  const me = auth.user?.login?.toLowerCase();
  const owns = me && p.owners.some(o => o.toLowerCase() === me);
  const tags = [sideTag(latest?.side || p.versions[0].side), ...(site.categories || []).map(c => `<span class="tag">${esc(t(`cat_${c}`))}</span>`), typeTag(site.code)].join(" ");
  const caps = latest?.capabilities || [];
  const contact = site.contact || {};

  app.innerHTML = `
    <article class="mod-head">
      <div class="card-banner">${site.banner ? `<img src="${esc(site.banner)}" alt="">` : ""}</div>
      <div class="mod-head-body">
        <img class="mod-icon" src="${esc(iconUrl(p))}" alt="">
        <div>
          <h1>${esc(l.name)}</h1>
          <div class="by">${esc(t("by"))} ${esc(author(p))}</div>
        </div>
        <p class="summary">${esc(l.summary)}</p>
        <div class="chips">${tags}</div>
        <div class="mod-stats">
          <span class="stat">${ICONS.download}${esc(t("downloads", { n: fmtNumber(p.downloads || 0) }))}</span>
          ${site.updated ? `<span class="stat">${ICONS.clock}${esc(t("updatedAgo", { t: fmtAgo(site.updated) }))}</span>` : ""}
        </div>
        <div class="mod-actions">
          ${latest ? `<a class="btn primary" href="${esc(latest.file.url)}" download>${ICONS.download}${esc(t("download"))} ${esc(latest.version)} · ${esc(fmtSize(latest.file.size))}</a>` : ""}
          ${owns ? `<a class="btn" href="upload.html?id=${encodeURIComponent(p.id)}">${ICONS.upload}${esc(t("newVersion"))}</a>` : ""}
        </div>
      </div>
    </article>
    <div class="tabs" role="tablist">
      ${["description", "versions", "details"].map((k, i) => `<button role="tab" id="tab-${k}" aria-controls="panel-${k}" aria-selected="${i === 0}">${esc(t(`tab_${k}`))}</button>`).join("")}
    </div>
    <section class="panel md" id="panel-description" role="tabpanel" aria-labelledby="tab-description">
      ${p.description ? markdown(p.description) : `<p>${esc(t("noDescription"))}</p>`}
    </section>
    <section class="panel" id="panel-versions" role="tabpanel" aria-labelledby="tab-versions" hidden>
      <div class="versions">${p.versions.map(v => `
        <div class="version">
          <div><div class="v">${esc(v.version)}</div>
            <div class="meta">Minecraft ${esc(v.game)} · ${esc(v.published ? fmtDate(v.published + "T12:00:00Z") : "")} · ${esc(fmtSize(v.file.size))} · ${esc(t("downloads", { n: fmtNumber(vd[v.version] || 0) }))}</div></div>
          ${revoked.has(v.file.sha256) ? "" : `<a class="btn" href="${esc(v.file.url)}" download aria-label="${esc(t("download"))} ${esc(v.version)}">${ICONS.download}</a>`}
          ${v.changelog ? `<p class="changelog">${esc(v.changelog)}</p>` : ""}
        </div>`).join("")}
      </div>
    </section>
    <section class="panel" id="panel-details" role="tabpanel" aria-labelledby="tab-details" hidden>
      <dl class="details">
        <div><dt>${esc(t("permissions"))}</dt><dd>
          <p>${esc(site.code ? t("hasCode") : t("contentOnly"))}</p>
          ${caps.length ? `<ul class="perm-list">${caps.map(c => `<li><strong>${esc(c)}</strong>: ${esc(CAP_KEYS.includes(c) ? t(`cap_${c.replace("-", "_")}`) : c)}</li>`).join("")}</ul>` : esc(t("noPermissions"))}
        </dd></div>
        <div><dt>${esc(t("license"))}</dt><dd>${esc(p.license)}</dd></div>
        <div><dt>${esc(t("source"))}</dt><dd>${link(p.source)}</dd></div>
        ${contact.homepage ? `<div><dt>${esc(t("homepage"))}</dt><dd>${link(contact.homepage)}</dd></div>` : ""}
        ${contact.issues ? `<div><dt>${esc(t("issues"))}</dt><dd>${link(contact.issues)}</dd></div>` : ""}
        <div><dt>${esc(t("authors"))}</dt><dd>${(p.authors || []).map(esc).join(", ")}</dd></div>
        <div><dt>${esc(t("owners"))}</dt><dd>${p.owners.map(ghUser).join(", ")}</dd></div>
        <div><dt>${esc(t("modId"))}</dt><dd><code>${esc(p.id)}</code></dd></div>
        ${site.created ? `<div><dt>${esc(t("created"))}</dt><dd>${esc(fmtDate(site.created))}</dd></div>` : ""}
        ${latest ? `<div><dt>${esc(t("sha256"))}</dt><dd><code>${esc(latest.file.sha256)}</code></dd></div>` : ""}
      </dl>
    </section>`;

  const tabs = [...app.querySelectorAll('[role="tab"]')];
  tabs.forEach(tab => tab.addEventListener("click", () => {
    tabs.forEach(o => {
      const on = o === tab;
      o.setAttribute("aria-selected", on);
      app.querySelector(`#${o.getAttribute("aria-controls")}`).hidden = !on;
    });
  }));
}

(async () => {
  let index;
  try {
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
  render(p, revoked);
})();
