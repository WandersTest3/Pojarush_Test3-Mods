import { ICONS, auth, chrome, config, esc, iconUrl, loadIndex, sheet, t } from "./core.js";
import { bindFields, setLicense, fieldsHtml, newState, paintCats, paintDesc, paintGallery, payload, sendPR, setIcon, showError, stepsView, validateFields } from "./form.js";

chrome("");
const app = document.getElementById("app");
const id = new URLSearchParams(location.search).get("id") || "";
const s = newState();

function notice(html, error = false) {
  app.innerHTML = `<div class="notice box${error ? " error" : ""}">${html}</div>`;
}

(async () => {
  const cfg = await config();
  let index;
  try {
    index = await loadIndex();
  } catch {
    return notice(esc(t("loadError")), true);
  }
  const p = (index.projects || []).find(x => x.id === id && x.kind === "mod");
  if (!p) return notice(`${esc(t("notFound"))}<p><a class="btn" href="./">${esc(t("backToList"))}</a></p>`);
  if (!(await auth.enabled())) return notice(esc(t("loginOff")));
  if (!auth.user || !auth.token) {
    notice(`<h1 style="margin-top:0">${esc(t("edit_title", { name: p.name }))}</h1><p>${esc(t("edit_login"))}</p>
      <button class="btn primary" id="login">${esc(t("login"))}</button>`);
    app.querySelector("#login").onclick = () => auth.login();
    return;
  }
  const me = auth.user.login.toLowerCase();
  if (!p.owners.some(o => o.toLowerCase() === me)) {
    return notice(`${esc(t("edit_notOwner"))}<p><a class="btn" href="mod.html?id=${encodeURIComponent(id)}">${esc(t("edit_back"))}</a></p>`, true);
  }

  app.innerHTML = `
    <h1>${esc(t("edit_title", { name: p.name }))}</h1>
    <form class="form" id="form" novalidate>
      <div class="notice box error" id="formError" role="alert" hidden></div>
      ${fieldsHtml(cfg, "edit")}
    </form>
    <section class="panel danger" id="danger">
      <h2>${esc(t("edit_danger"))}</h2>
      <div class="versions">${p.versions.map(v => `
        <div class="version">
          <div><div class="v">${esc(v.version)}</div></div>
          ${p.versions.length > 1 ? `<button type="button" class="btn bad" data-v="${esc(v.version)}">${esc(t("edit_deleteVersion"))}</button>` : ""}
        </div>`).join("")}
      </div>
      ${p.versions.length === 1 ? `<p class="muted">${esc(t("edit_lastVersion"))}</p>` : ""}
      <button type="button" class="btn bad" id="deleteMod">${ICONS.close}${esc(t("edit_deleteMod"))}</button>
    </section>`;
  bindFields(app, cfg, s, "edit");

  const site = p.site || {};
  app.querySelector("#summary").value = p.summary;
  app.querySelector("#summary").dispatchEvent(new Event("input"));
  app.querySelector("#description").value = p.description || "";
  app.querySelector("#source").value = p.source && !p.source.startsWith(cfg.siteUrl) ? p.source : "";
  setLicense(app, p.license);
  s.cats = new Set(site.categories || []);
  s.gallery = (site.gallery || []).map(path => ({ kind: "keep", name: path.split("/").pop(), url: path }));
  s.featured = site.featured ? s.gallery.findIndex(g => site.featured.endsWith(g.name)) : -1;
  s.descImage = site.description_image ? { kind: "keep", url: site.description_image } : null;
  s.hadDescImage = Boolean(s.descImage);
  setIcon(app, iconUrl(p) !== "assets/img/icon-default.svg" ? iconUrl(p) : null);
  paintCats(app, s);
  paintGallery(app, cfg, s);
  paintDesc(app, s);

  app.querySelector("#form").addEventListener("submit", async e => {
    e.preventDefault();
    if (s.busy) return;
    const problem = validateFields(app, "edit");
    if (problem) return showError(app, problem);
    s.busy = true;
    const { meta, files } = await payload(app, s, "edit");
    const all = [["edit.json", new TextEncoder().encode(JSON.stringify(meta, null, 2) + "\n").buffer], ...files];
    const mark = stepsView(app, t("edit_title", { name: p.name }), "edit_step_check");
    await sendPR(app, cfg, {
      root: "edits",
      id,
      title: `Edit ${p.name}`,
      message: `Edit ${id}`,
      files: all,
      mark,
      again: `<a class="btn primary" href="edit.html?id=${encodeURIComponent(id)}">${esc(t("editPage"))}</a>`,
      onDone: prLink => `<div class="notice box"><p>${esc(t("edit_done"))}</p><div class="mod-actions">
        <a class="btn primary" href="mod.html?id=${encodeURIComponent(id)}">${esc(t("up_openPage"))}</a>${prLink}</div></div>`
    });
    s.busy = false;
  });

  const remove = async meta => {
    if (s.busy) return;
    s.busy = true;
    const all = [["edit.json", new TextEncoder().encode(JSON.stringify(meta, null, 2) + "\n").buffer]];
    const mark = stepsView(app, t("edit_title", { name: p.name }), "edit_step_delete");
    await sendPR(app, cfg, {
      root: "edits",
      id,
      title: `Delete ${meta.delete_mod ? p.name : `${p.name} ${meta.delete_versions[0]}`}`,
      message: `Delete ${id}${meta.delete_mod ? "" : ` ${meta.delete_versions[0]}`}`,
      files: all,
      mark,
      again: `<a class="btn primary" href="mod.html?id=${encodeURIComponent(id)}">${esc(t("edit_back"))}</a>`,
      onDone: prLink => `<div class="notice box"><p>${esc(t("edit_deleted"))}</p><div class="mod-actions">
        <a class="btn primary" href="./">${esc(t("backToList"))}</a>${prLink}</div></div>`
    });
    s.busy = false;
  };

  const confirm = (message, needText, run) => {
    const sh = sheet(`<h2>${esc(t("edit_danger"))}</h2><p>${esc(message)}</p>
      ${needText ? `<input class="input" id="confirmText" autocomplete="off" autocapitalize="off" spellcheck="false">` : ""}
      <button class="btn bad" data-a="go"${needText ? " disabled" : ""}>${esc(t("edit_confirmDo"))}</button>
      <button class="btn" data-a="cancel">${esc(t("edit_cancel"))}</button>`);
    const go = sh.el.querySelector('[data-a="go"]');
    sh.el.querySelector('[data-a="cancel"]').onclick = sh.close;
    sh.el.querySelector("#confirmText")?.addEventListener("input", e => { go.disabled = e.target.value.trim() !== needText; });
    go.onclick = () => { sh.close(); run(); };
  };

  app.querySelector("#danger").addEventListener("click", e => {
    const v = e.target.closest("[data-v]")?.dataset.v;
    if (v) return confirm(t("edit_confirmVersion", { v }), "", () => remove({ delete_versions: [v] }));
    if (e.target.closest("#deleteMod")) confirm(t("edit_confirmMod", { name: p.name, id }), id, () => remove({ delete_mod: true }));
  });
})();
