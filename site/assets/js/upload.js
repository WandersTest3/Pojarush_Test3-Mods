import { ICONS, auth, chrome, config, esc, fmtSize, iconUrl, loadIndex, safeUrl, sideTag, t, typeTag } from "./core.js";
import { MIB, bindFields, fieldsHtml, newState, paintCats, paintDesc, paintGallery, payload, sendPR, setIcon, showError, stepsView, validateFields } from "./form.js";
import { readHmod } from "./hmod.js";

chrome("upload");
const app = document.getElementById("app");
let cfg, index;
const s = { ...newState(), file: null, mod: null, existing: null };

function notice(html, error = false) {
  app.innerHTML = `<div class="notice box${error ? " error" : ""}">${html}</div>`;
}

function form() {
  app.innerHTML = `
    <h1>${esc(t("up_title"))}</h1>
    <form class="form" id="form" novalidate>
      <div>
        <span class="label">${esc(t("up_file"))}</span>
        <label class="drop" id="drop">${ICONS.upload}<span id="dropText">${esc(t("up_pick"))}</span>
          <span class="hint">${esc(t("up_limit", { n: cfg.maxModMiB }))}</span>
          <input type="file" id="hmod" accept=".hmod"></label>
      </div>
      <div id="modPreview" hidden></div>
      <div class="notice box error" id="formError" role="alert" hidden></div>
      <div id="fields" hidden>${fieldsHtml(cfg, "new")}</div>
    </form>`;
  const drop = app.querySelector("#drop");
  const input = app.querySelector("#hmod");
  input.onchange = () => input.files[0] && pickHmod(input.files[0]);
  drop.addEventListener("dragover", e => { e.preventDefault(); drop.classList.add("over"); });
  drop.addEventListener("dragleave", () => drop.classList.remove("over"));
  drop.addEventListener("drop", e => {
    e.preventDefault();
    drop.classList.remove("over");
    if (e.dataTransfer.files[0]) pickHmod(e.dataTransfer.files[0]);
  });
  bindFields(app, cfg, s, "new");
  app.querySelector("#form").addEventListener("submit", e => { e.preventDefault(); publish(); });
}

async function pickHmod(file) {
  showError(app, "");
  app.querySelector("#fields").hidden = true;
  app.querySelector("#modPreview").hidden = true;
  s.file = s.mod = s.existing = null;
  if (!file.name.toLowerCase().endsWith(".hmod")) return showError(app, t("up_notHmod"));
  if (file.size > cfg.maxModMiB * MIB) return showError(app, t("up_tooBig", { file: file.name, n: cfg.maxModMiB }));
  let mod;
  try {
    mod = await readHmod(file);
  } catch (e) {
    return showError(app, t("up_badHmod", { e: e.message }));
  }
  const m = mod.manifest;
  if (!/^[a-z0-9_]{1,64}$/.test(m.id)) return showError(app, t("up_badHmod", { e: `id "${m.id}"` }));
  if (!/^[A-Za-z0-9._+-]{1,64}$/.test(m.version)) return showError(app, t("up_badHmod", { e: `version "${m.version}"` }));
  const existing = (index.projects || []).find(p => p.id === m.id) || null;
  const me = auth.user.login.toLowerCase();
  if (existing && !existing.owners.some(o => o.toLowerCase() === me)) {
    return showError(app, t("up_notOwner", { id: m.id, owners: existing.owners.join(", ") }));
  }
  if (existing?.versions.some(v => v.version === m.version)) return showError(app, t("up_sameVersion", { v: m.version }));
  s.file = file;
  s.mod = mod;
  s.existing = existing;
  app.querySelector("#dropText").textContent = `${file.name} · ${fmtSize(file.size)}`;

  const iconSrc = mod.icon ? URL.createObjectURL(mod.icon) : existing ? iconUrl(existing) : "assets/img/icon-default.svg";
  const caps = Array.isArray(m.capabilities) ? m.capabilities : [];
  const pv = app.querySelector("#modPreview");
  pv.innerHTML = `<div class="preview">
    <img class="mod-icon" src="${esc(iconSrc)}" alt="">
    <h2 class="card-title">${esc(m.name)} <span class="by">${esc(m.version)}</span></h2>
    <p class="card-summary">${esc(existing ? t("up_update", { name: existing.name }) : t("up_newMod"))} · <code>${esc(m.id)}</code></p>
    <div class="facts">${sideTag(m.side)} ${typeTag(mod.code)} ${caps.map(c => `<span class="tag">${esc(c)}</span>`).join(" ")}</div>
  </div>`;
  pv.hidden = false;

  const desc = typeof m.description === "string" ? m.description : "";
  app.querySelector("#summary").value = (existing?.summary || desc.replace(/\s+/g, " ").trim()).slice(0, 160);
  app.querySelector("#summary").dispatchEvent(new Event("input"));
  app.querySelector("#description").value = existing ? existing.description || "" : desc;
  s.cats = new Set(existing?.site?.categories || []);
  paintCats(app, s);

  const site = existing?.site || {};
  s.gallery = (site.gallery || []).map(p => ({ kind: "keep", name: p.split("/").pop(), url: p }));
  s.featured = site.featured ? s.gallery.findIndex(g => site.featured.endsWith(g.name)) : -1;
  s.descImage = site.description_image ? { kind: "keep", url: site.description_image } : null;
  s.hadDescImage = Boolean(s.descImage);
  s.icon = null;
  setIcon(app, null);
  paintGallery(app, cfg, s);
  paintDesc(app, s);

  const pojarush = site.min_pojarush?.[existing?.versions?.[0]?.version];
  if (pojarush && cfg.pojarushVersions.includes(pojarush)) app.querySelector("#pojarush").value = pojarush;

  const hasLicense = typeof m.license === "string" && m.license.trim();
  app.querySelector("#licenseRow").hidden = Boolean(hasLicense);
  app.querySelector("#license").value = hasLicense ? "" : existing?.license || "";
  const src = m.contact?.sources || m.contact?.homepage || "";
  const kept = existing && !existing.source.startsWith(cfg.siteUrl) ? existing.source : "";
  app.querySelector("#source").value = safeUrl(src) || kept;
  app.querySelector("#fields").hidden = false;
}

async function publish() {
  if (s.busy || !s.mod) return;
  const problem = validateFields(app, "new");
  if (problem) return showError(app, problem);
  s.busy = true;
  const m = s.mod.manifest;
  const { meta, files } = await payload(app, s, "new");
  if (s.existing && !files.some(([n]) => n === "description.md")) files.push(["description.md", new TextEncoder().encode("\n").buffer]);
  const all = [["mod.hmod", await s.file.arrayBuffer()], ["submission.json", new TextEncoder().encode(JSON.stringify(meta, null, 2) + "\n").buffer], ...files];
  const mark = stepsView(app, t("up_title"), "up_step_check");
  await sendPR(app, cfg, {
    root: "submissions",
    id: m.id,
    title: `Publish ${m.name} ${m.version}`,
    message: `Publish ${m.id} ${m.version}`,
    files: all,
    mark,
    again: `<a class="btn primary" href="upload.html">${esc(t("up_another"))}</a>`,
    onDone: prLink => `<div class="notice box"><p>${esc(t("up_done"))}</p><div class="mod-actions">
      <a class="btn primary" href="mod.html?id=${encodeURIComponent(m.id)}">${esc(t("up_openPage"))}</a>${prLink}</div></div>`
  });
  s.busy = false;
}

(async () => {
  cfg = await config();
  const tutorial = `<h2>${esc(t("tut_title"))}</h2>
    <ol class="tutorial">${[1, 2, 3, 4, 5].map(n => `<li>${esc(t(`tut_${n}`))}</li>`).join("")}</ol>`;
  if (!(await auth.enabled())) return notice(`<p>${esc(t("loginOff"))}</p>${tutorial}`);
  if (!auth.user || !auth.token) {
    notice(`<h1 style="margin-top:0">${esc(t("up_title"))}</h1><p>${esc(t("loginWhy"))}</p>
      <p><button class="btn primary" id="login">${esc(t("login"))}</button></p>${tutorial}`);
    app.querySelector("#login").onclick = () => auth.login();
    return;
  }
  try {
    index = await loadIndex();
  } catch {
    return notice(esc(t("loadError")), true);
  }
  form();
})();
