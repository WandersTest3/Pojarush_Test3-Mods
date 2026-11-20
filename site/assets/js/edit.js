import { ICONS, auth, chrome, config, esc, iconUrl, loadIndex, t } from "./core.js";
import { bindFields, fieldsHtml, newState, paintCats, paintDesc, paintGallery, payload, sendPR, setIcon, showError, stepsView, validateFields } from "./form.js";

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
    </form>`;
  bindFields(app, cfg, s, "edit");

  const site = p.site || {};
  app.querySelector("#summary").value = p.summary;
  app.querySelector("#summary").dispatchEvent(new Event("input"));
  app.querySelector("#description").value = p.description || "";
  app.querySelector("#source").value = p.source && !p.source.startsWith(cfg.siteUrl) ? p.source : "";
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
})();
