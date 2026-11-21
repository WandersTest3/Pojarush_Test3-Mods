import { ICONS, auth, esc, gh, markdown, safeUrl, t } from "./core.js";

export const MIB = 1048576;
export const IMAGE_TYPES = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" };
const LICENSES = [
  ["MIT", "MIT License"],
  ["Apache-2.0", "Apache License 2.0"],
  ["GPL-3.0-only", "GNU GPL v3 only"],
  ["GPL-3.0-or-later", "GNU GPL v3 or later"],
  ["GPL-2.0-only", "GNU GPL v2 only"],
  ["LGPL-3.0-only", "GNU LGPL v3"],
  ["LGPL-2.1-only", "GNU LGPL v2.1"],
  ["AGPL-3.0-only", "GNU AGPL v3"],
  ["MPL-2.0", "Mozilla Public License 2.0"],
  ["BSD-2-Clause", "BSD 2-Clause"],
  ["BSD-3-Clause", "BSD 3-Clause"],
  ["ISC", "ISC License"],
  ["Zlib", "zlib License"],
  ["Unlicense", "The Unlicense"],
  ["CC0-1.0", "CC0 1.0 (public domain)"],
  ["CC-BY-4.0", "CC BY 4.0"],
  ["CC-BY-SA-4.0", "CC BY-SA 4.0"],
  ["CC-BY-NC-4.0", "CC BY-NC 4.0"],
  ["CC-BY-NC-SA-4.0", "CC BY-NC-SA 4.0"],
  ["All Rights Reserved", "All Rights Reserved"]
];
const DEFAULT_LICENSE = "MIT";
const sleep = ms => new Promise(r => setTimeout(r, ms));

export function newState() {
  return { icon: null, cats: new Set(), gallery: [], featured: -1, descImage: null, hadDescImage: false, busy: false };
}

export function showError(app, msg) {
  const box = app.querySelector("#formError");
  box.hidden = !msg;
  box.textContent = msg || "";
  if (msg) box.scrollIntoView({ block: "center" });
}

function imageSize(file) {
  return new Promise(resolve => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve([img.naturalWidth, img.naturalHeight]); };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
    img.src = url;
  });
}

async function checkImage(cfg, file, minSide, tooSmall = "up_tooSmall") {
  if (!IMAGE_TYPES[file.type]) return `${file.name}: PNG, JPEG, WEBP`;
  if (file.size > cfg.maxImageMiB * MIB) return t("up_tooBig", { file: file.name, n: cfg.maxImageMiB });
  const size = await imageSize(file);
  if (!size) return `${file.name}: PNG, JPEG, WEBP`;
  if (minSide && Math.min(...size) < minSide) return t(tooSmall, { file: file.name, n: minSide });
  return "";
}

export function fieldsHtml(cfg, mode) {
  const isNew = mode === "new";
  return `
    <div class="form">
      <div>
        <label for="summary">${esc(t("up_summary"))} <span class="counter" id="summaryCount"></span></label>
        <input class="input" id="summary" maxlength="160" required>
        <span class="hint">${esc(t("up_summaryHint"))}</span>
      </div>
      <div>
        <span class="label">${esc(t("up_categories"))} <span class="hint">${esc(t("up_categoriesHint", { n: cfg.maxCategories }))}</span></span>
        <div class="chips" id="cats">${cfg.categories.map(c => `<button type="button" class="chip" data-cat="${c}" aria-pressed="false">${esc(t(`cat_${c}`))}</button>`).join("")}</div>
      </div>
      ${isNew ? `<div>
        <label for="pojarush">${esc(t("up_pojarush"))}</label>
        <select class="input" id="pojarush">${cfg.pojarushVersions.map(v => `<option value="${esc(v)}">${esc(t("up_pojarushOpt", { v }))}</option>`).join("")}</select>
        <span class="hint">${esc(t("up_pojarushHint"))}</span>
      </div>` : ""}
      <div id="licenseRow">
        <label for="licenseSel">${esc(t("up_license"))}</label>
        <select class="input" id="licenseSel">${LICENSES.map(([v, n]) => `<option value="${esc(v)}">${esc(n)}</option>`).join("")}<option value="__other">${esc(t("up_licenseOther"))}</option></select>
        <input class="input" id="license" maxlength="100" placeholder="${esc(t("up_licenseCustom"))}" hidden>
        <span class="hint">${esc(t("up_licenseHint"))}</span>
      </div>
      <div>
        <label for="source">${esc(t("up_source"))}</label>
        <input class="input" id="source" type="url" inputmode="url" placeholder="https://github.com/..." maxlength="500">
        <span class="hint">${esc(t("up_sourceHint"))}</span>
      </div>
      <div>
        <span class="label">${esc(t("up_icon"))}</span>
        <div class="file-row">
          <img class="thumb" id="iconThumb" alt="" hidden>
          <label class="btn">${esc(t("up_choose"))}<input type="file" id="icon" accept="image/png,image/jpeg,image/webp" hidden></label>
          <button type="button" class="link-btn" id="iconRemove" hidden>${esc(t("up_remove"))}</button>
        </div>
        <span class="hint">${esc(t("up_iconHint"))} ${esc(t("up_limit", { n: cfg.maxIconMiB }))}</span>
      </div>
      <div>
        <span class="label">${esc(t("up_gallery"))}</span>
        <div class="g-grid" id="gallery"></div>
        <input type="file" id="galleryInput" accept="image/png,image/jpeg,image/webp" multiple hidden>
        <span class="hint">${esc(t("up_galleryHint", { n: cfg.maxGalleryImages }))} ${esc(t("up_limit", { n: cfg.maxImageMiB }))}</span>
      </div>
      <div>
        <span class="label">${esc(t("up_descImage"))}</span>
        <div class="file-row">
          <img class="thumb wide" id="descThumb" alt="" hidden>
          <label class="btn">${esc(t("up_choose"))}<input type="file" id="descImage" accept="image/png,image/jpeg,image/webp" hidden></label>
          <button type="button" class="link-btn" id="descRemove" hidden>${esc(t("up_remove"))}</button>
        </div>
        <span class="hint">${esc(t("up_descImageHint"))} ${esc(t("up_limit", { n: cfg.maxImageMiB }))}</span>
      </div>
      <div>
        <label for="description">${esc(t("up_description"))}</label>
        <div class="tabs" role="tablist" id="mdTabs">
          <button type="button" role="tab" aria-selected="true" data-md="edit">${esc(t("up_edit"))}</button>
          <button type="button" role="tab" aria-selected="false" data-md="preview">${esc(t("up_preview"))}</button>
        </div>
        <textarea id="description" maxlength="20000"></textarea>
        <div class="panel md" id="descPreview" hidden></div>
        <span class="hint">${esc(t("up_descriptionHint"))}</span>
      </div>
      ${isNew ? `<div>
        <label for="changelog">${esc(t("up_changelog"))}</label>
        <textarea id="changelog" maxlength="6000" style="min-height:90px"></textarea>
        <span class="hint">${esc(t("up_changelogHint"))}</span>
      </div>` : ""}
      <button class="btn primary" type="submit" id="submitBtn">${ICONS.upload}${esc(t(isNew ? "up_publish" : "edit_save"))}</button>
    </div>`;
}

export function bindFields(app, cfg, s, mode) {
  const err = msg => showError(app, msg);
  const summary = app.querySelector("#summary");
  const count = () => { app.querySelector("#summaryCount").textContent = `${summary.value.length}/160`; };
  summary.addEventListener("input", count);
  count();

  app.querySelector("#cats").addEventListener("click", e => {
    const b = e.target.closest("[data-cat]");
    if (!b) return;
    const c = b.dataset.cat;
    if (s.cats.has(c)) s.cats.delete(c);
    else if (s.cats.size < cfg.maxCategories) s.cats.add(c);
    paintCats(app, s);
  });

  const licenseSel = app.querySelector("#licenseSel");
  licenseSel.onchange = () => {
    const other = licenseSel.value === "__other";
    app.querySelector("#license").hidden = !other;
    if (other) app.querySelector("#license").focus();
  };
  setLicense(app, DEFAULT_LICENSE);

  const icon = app.querySelector("#icon");
  icon.onchange = async () => {
    const f = icon.files[0];
    icon.value = "";
    if (!f) return;
    const bad = await checkImage(cfg, f, cfg.minIconPx, "up_iconSmall");
    if (bad) return err(bad);
    err("");
    s.icon = f;
    paintThumb(app, "icon", f);
  };
  app.querySelector("#iconRemove").onclick = () => { s.icon = null; paintThumb(app, "icon", null, s.detectedIcon); };

  const gallery = app.querySelector("#gallery");
  const galleryInput = app.querySelector("#galleryInput");
  galleryInput.onchange = async () => {
    const files = [...galleryInput.files];
    galleryInput.value = "";
    for (const f of files) {
      if (s.gallery.length >= cfg.maxGalleryImages) break;
      const bad = await checkImage(cfg, f, 200);
      if (bad) { err(bad); continue; }
      err("");
      s.gallery.push({ kind: "new", file: f, url: URL.createObjectURL(f) });
    }
    paintGallery(app, cfg, s);
  };
  gallery.addEventListener("click", e => {
    const add = e.target.closest("[data-a='add']");
    if (add) return galleryInput.click();
    const item = e.target.closest("[data-i]");
    const btn = e.target.closest("button[data-a]");
    if (!item || !btn) return;
    const i = Number(item.dataset.i);
    if (btn.dataset.a === "star") s.featured = s.featured === i ? -1 : i;
    if (btn.dataset.a === "del") {
      const [gone] = s.gallery.splice(i, 1);
      if (gone.kind === "new") URL.revokeObjectURL(gone.url);
      if (s.featured === i) s.featured = -1;
      else if (s.featured > i) s.featured--;
    }
    paintGallery(app, cfg, s);
  });

  const desc = app.querySelector("#descImage");
  desc.onchange = async () => {
    const f = desc.files[0];
    desc.value = "";
    if (!f) return;
    const bad = await checkImage(cfg, f, 100);
    if (bad) return err(bad);
    err("");
    s.descImage = { kind: "new", file: f, url: URL.createObjectURL(f) };
    paintDesc(app, s);
  };
  app.querySelector("#descRemove").onclick = () => { s.descImage = null; paintDesc(app, s); };

  app.querySelector("#mdTabs").addEventListener("click", e => {
    const b = e.target.closest("[data-md]");
    if (!b) return;
    const preview = b.dataset.md === "preview";
    app.querySelectorAll("[data-md]").forEach(x => x.setAttribute("aria-selected", x === b));
    app.querySelector("#description").hidden = preview;
    const pv = app.querySelector("#descPreview");
    pv.hidden = !preview;
    if (preview) pv.innerHTML = markdown(app.querySelector("#description").value) || `<p>${esc(t("noDescription"))}</p>`;
  });
  paintGallery(app, cfg, s);
  paintDesc(app, s);
  paintCats(app, s);
}

export function paintCats(app, s) {
  app.querySelectorAll("#cats [data-cat]").forEach(b => b.setAttribute("aria-pressed", s.cats.has(b.dataset.cat)));
}

function paintThumb(app, kind, file, url) {
  const img = app.querySelector(`#${kind}Thumb`);
  if (img.src.startsWith("blob:")) URL.revokeObjectURL(img.src);
  const src = file ? URL.createObjectURL(file) : url || "";
  img.hidden = !src;
  img.src = src;
  app.querySelector(`#${kind}Remove`).hidden = !file;
}

export function paintGallery(app, cfg, s) {
  const el = app.querySelector("#gallery");
  el.innerHTML = s.gallery.map((g, i) => `
    <div class="g-item" data-i="${i}">
      <img src="${esc(g.url)}" alt="">
      <button type="button" class="g-btn g-star" data-a="star" aria-pressed="${s.featured === i}" aria-label="${esc(t("up_star"))}">${s.featured === i ? ICONS.star : ICONS.starOutline}</button>
      <button type="button" class="g-btn g-del" data-a="del" aria-label="${esc(t("up_removeImage"))}">${ICONS.close}</button>
    </div>`).join("") + (s.gallery.length < cfg.maxGalleryImages
    ? `<button type="button" class="g-add" data-a="add">${ICONS.image}<span>${esc(t("up_addImage"))}</span></button>` : "");
}

export function paintDesc(app, s) {
  const img = app.querySelector("#descThumb");
  img.hidden = !s.descImage;
  img.src = s.descImage?.url || "";
  app.querySelector("#descRemove").hidden = !s.descImage;
}

export function setLicense(app, value) {
  const sel = app.querySelector("#licenseSel");
  const custom = app.querySelector("#license");
  const v = (value || "").trim() || DEFAULT_LICENSE;
  const known = LICENSES.some(([id]) => id === v);
  sel.value = known ? v : "__other";
  custom.value = known ? "" : v;
  custom.hidden = known;
}

function getLicense(app) {
  const sel = app.querySelector("#licenseSel").value;
  return sel === "__other" ? app.querySelector("#license").value.trim() : sel;
}

export function setIcon(app, url) {
  const img = app.querySelector("#iconThumb");
  img.hidden = !url;
  img.src = url || "";
}

function ext(file) {
  return IMAGE_TYPES[file.type];
}

function utf8(text) {
  return new TextEncoder().encode(text).buffer;
}

export async function payload(app, s, mode) {
  const meta = {
    summary: app.querySelector("#summary").value.trim(),
    categories: [...s.cats],
    source: app.querySelector("#source").value.trim()
  };
  const files = [];
  let n = 0;
  meta.gallery = [];
  for (const g of s.gallery) {
    if (g.kind === "keep") meta.gallery.push({ keep: g.name });
    else {
      const name = `gallery-${++n}.${ext(g.file)}`;
      meta.gallery.push({ file: name });
      files.push([name, await g.file.arrayBuffer()]);
    }
  }
  meta.featured = s.featured >= 0 ? s.featured : null;
  if (s.descImage?.kind === "new") {
    const name = `description-image.${ext(s.descImage.file)}`;
    meta.description_image = { file: name };
    files.push([name, await s.descImage.file.arrayBuffer()]);
  } else if (s.descImage?.kind === "keep") meta.description_image = { keep: true };
  else if (s.hadDescImage) meta.description_image = null;

  const description = app.querySelector("#description").value.trim();
  if (description || mode === "edit") files.push(["description.md", utf8(description + "\n")]);
  if (s.icon) files.push([`icon.${ext(s.icon)}`, await s.icon.arrayBuffer()]);

  meta.license = getLicense(app);
  if (mode === "new") {
    meta.pojarush = app.querySelector("#pojarush").value;
    const changelog = app.querySelector("#changelog").value.trim();
    if (changelog) meta.changelog = changelog;
  }
  return { meta, files };
}

export function validateFields(app, mode) {
  const summary = app.querySelector("#summary").value.trim();
  const source = app.querySelector("#source").value.trim();
  if (!summary) return t("up_needSummary");
  if (!getLicense(app)) return t("up_needLicense");
  if (source && !safeUrl(source)) return t("up_badSource");
  return "";
}

function base64(buf) {
  const bytes = new Uint8Array(buf);
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}

export function stepsView(app, title, checkKey) {
  const keys = ["fork", "files", "pr", "check"];
  app.innerHTML = `<h1>${esc(title)}</h1>
    <div class="panel"><ol class="steps">${keys.map(k => `<li data-step="${k}"><span class="dot"></span>${esc(t(k === "check" ? checkKey : `up_step_${k}`))}</li>`).join("")}</ol></div>
    <div id="outcome" style="margin-top:16px"></div>`;
  return (key, status) => { app.querySelector(`[data-step="${key}"]`).className = status; };
}

export async function sendPR(app, cfg, { root, id, title, message, files, mark, onDone, again }) {
  const outcome = html => { app.querySelector("#outcome").innerHTML = html; };
  const upstream = cfg.repo;
  const [upOwner] = upstream.split("/");
  const login = auth.user.login;
  let step = "fork";
  try {
    mark("fork", "now");
    let target = upstream;
    let headOwner = upOwner;
    if (login.toLowerCase() !== upOwner.toLowerCase()) {
      const fork = await gh(`/repos/${upstream}/forks`, { method: "POST", body: { default_branch_only: true } });
      target = fork.full_name;
      headOwner = fork.owner.login;
      for (let i = 0; ; i++) {
        try { await gh(`/repos/${target}/commits?per_page=1`); break; } catch (e) {
          if (i > 40) throw e;
          await sleep(3000);
        }
      }
      try { await gh(`/repos/${target}/merge-upstream`, { method: "POST", body: { branch: fork.default_branch } }); } catch {}
    }
    const base = (await gh(`/repos/${upstream}/git/ref/heads/main`)).object.sha;
    let baseCommit;
    for (let i = 0; ; i++) {
      try { baseCommit = await gh(`/repos/${target}/git/commits/${base}`); break; } catch (e) {
        if (i > 10) throw e;
        await sleep(3000);
      }
    }
    mark("fork", "done");

    step = "files";
    mark("files", "now");
    const tree = [];
    for (const [name, buf] of files) {
      const blob = await gh(`/repos/${target}/git/blobs`, { method: "POST", body: { content: base64(buf), encoding: "base64" } });
      tree.push({ path: `${root}/${id}/${name}`, mode: "100644", type: "blob", sha: blob.sha });
    }
    const newTree = await gh(`/repos/${target}/git/trees`, { method: "POST", body: { base_tree: baseCommit.tree.sha, tree } });
    const commit = await gh(`/repos/${target}/git/commits`, { method: "POST", body: { message, tree: newTree.sha, parents: [base] } });
    const branch = `${root === "edits" ? "edit" : "submit"}/${id}-${Date.now()}`;
    await gh(`/repos/${target}/git/refs`, { method: "POST", body: { ref: `refs/heads/${branch}`, sha: commit.sha } });
    mark("files", "done");

    step = "pr";
    mark("pr", "now");
    const pr = await gh(`/repos/${upstream}/pulls`, {
      method: "POST",
      body: { title, head: target === upstream ? branch : `${headOwner}:${branch}`, base: "main", body: message, maintainer_can_modify: false }
    });
    mark("pr", "done");

    step = "check";
    mark("check", "now");
    const prLink = `<a class="btn" href="${esc(pr.html_url)}" target="_blank" rel="noopener">${esc(t("up_viewPr"))}</a>`;
    const deadline = Date.now() + 10 * 60 * 1000;
    while (Date.now() < deadline) {
      await sleep(6000);
      let comments;
      try { comments = await gh(`/repos/${upstream}/issues/${pr.number}/comments?per_page=100`); } catch { continue; }
      const bot = comments.find(c => c.user?.login === "github-actions[bot]");
      if (!bot) continue;
      if (bot.body.startsWith("✅")) {
        mark("check", "done");
        outcome(onDone(prLink));
      } else {
        mark("check", "fail");
        const reason = bot.body.split("\n\n").slice(1).join("\n\n").trim() || bot.body;
        outcome(`<div class="notice box error"><p>${esc(t("up_refused", { e: reason }))}</p><div class="mod-actions">${again}${prLink}</div></div>`);
      }
      return;
    }
    outcome(`<div class="notice box"><p>${esc(t("up_timeout"))}</p>${prLink}</div>`);
  } catch (e) {
    mark(step, "fail");
    outcome(`<div class="notice box error"><p>${esc(t("up_failed", { e: e.message }))}</p><div class="mod-actions">${again}</div></div>`);
  }
}
