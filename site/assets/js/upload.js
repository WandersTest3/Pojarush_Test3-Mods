import { ICONS, auth, chrome, config, esc, fmtSize, gh, iconUrl, loadIndex, markdown, safeUrl, sideTag, t, typeTag } from "./core.js";
import { readHmod } from "./hmod.js";

chrome("upload");
const app = document.getElementById("app");
const MIB = 1048576;
const IMAGE_TYPES = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" };
const LICENSES = ["All Rights Reserved", "MIT", "Apache-2.0", "GPL-3.0-only", "LGPL-3.0-only", "MPL-2.0", "CC-BY-4.0", "CC-BY-NC-4.0", "CC0-1.0"];
let cfg, index;
const s = { file: null, mod: null, existing: null, icon: null, banner: null, cats: new Set(), busy: false };

function notice(html, error = false) {
  app.innerHTML = `<div class="notice box${error ? " error" : ""}">${html}</div>`;
}

function errorBox(msg) {
  const box = app.querySelector("#formError");
  box.hidden = !msg;
  box.textContent = msg || "";
  if (msg) box.scrollIntoView({ block: "center" });
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
      <div id="fields" hidden>
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
          <div id="licenseRow" hidden>
            <label for="license">${esc(t("up_license"))}</label>
            <input class="input" id="license" list="licenses" maxlength="100">
            <datalist id="licenses">${LICENSES.map(l => `<option value="${esc(l)}">`).join("")}</datalist>
            <span class="hint">${esc(t("up_licenseHint"))}</span>
          </div>
          <div>
            <label for="source">${esc(t("up_source"))}</label>
            <input class="input" id="source" type="url" inputmode="url" placeholder="https://github.com/..." maxlength="500">
            <span class="hint">${esc(t("up_sourceHint"))}</span>
          </div>
          ${imageField("icon", t("up_icon"), t("up_iconHint"), cfg.maxIconMiB)}
          ${imageField("banner", t("up_banner"), t("up_bannerHint"), cfg.maxBannerMiB)}
          <div>
            <label for="description">${esc(t("up_description"))}</label>
            <div class="tabs" role="tablist">
              <button type="button" role="tab" aria-selected="true" data-md="edit">${esc(t("up_edit"))}</button>
              <button type="button" role="tab" aria-selected="false" data-md="preview">${esc(t("up_preview"))}</button>
            </div>
            <textarea id="description" maxlength="20000"></textarea>
            <div class="panel md" id="descPreview" hidden></div>
            <span class="hint">${esc(t("up_descriptionHint"))}</span>
          </div>
          <div>
            <label for="changelog">${esc(t("up_changelog"))}</label>
            <textarea id="changelog" maxlength="6000" style="min-height:90px"></textarea>
            <span class="hint">${esc(t("up_changelogHint"))}</span>
          </div>
          <button class="btn primary" type="submit" id="publish">${ICONS.upload}${esc(t("up_publish"))}</button>
        </div>
      </div>
    </form>`;
  wire();
}

function imageField(kind, label, hint, max) {
  return `<div>
    <span class="label">${esc(label)}</span>
    <div class="file-row">
      <img class="thumb${kind === "banner" ? " wide" : ""}" id="${kind}Thumb" alt="" hidden>
      <label class="btn">${esc(t("up_choose"))}<input type="file" id="${kind}" accept="image/png,image/jpeg,image/webp" hidden></label>
      <button type="button" class="link-btn" id="${kind}Remove" hidden>${esc(t("up_remove"))}</button>
    </div>
    <span class="hint">${esc(hint)} ${esc(t("up_limit", { n: max }))}</span>
  </div>`;
}

function wire() {
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
    paintCats();
  });
  for (const [kind, max] of [["icon", cfg.maxIconMiB], ["banner", cfg.maxBannerMiB]]) {
    const el = app.querySelector(`#${kind}`);
    el.onchange = () => {
      const f = el.files[0];
      el.value = "";
      if (!f) return;
      if (!IMAGE_TYPES[f.type]) return errorBox(`${f.name}: PNG, JPEG, WEBP`);
      if (f.size > max * MIB) return errorBox(t("up_tooBig", { file: f.name, n: max }));
      errorBox("");
      s[kind] = f;
      paintImage(kind);
    };
    app.querySelector(`#${kind}Remove`).onclick = () => { s[kind] = null; paintImage(kind); };
  }
  app.querySelector(".form .tabs").addEventListener("click", e => {
    const b = e.target.closest("[data-md]");
    if (!b) return;
    const preview = b.dataset.md === "preview";
    app.querySelectorAll("[data-md]").forEach(x => x.setAttribute("aria-selected", x === b));
    app.querySelector("#description").hidden = preview;
    const pv = app.querySelector("#descPreview");
    pv.hidden = !preview;
    if (preview) pv.innerHTML = markdown(app.querySelector("#description").value) || `<p>${esc(t("noDescription"))}</p>`;
  });
  app.querySelector("#form").addEventListener("submit", e => { e.preventDefault(); publish(); });
}

function paintCats() {
  app.querySelectorAll("#cats [data-cat]").forEach(b => b.setAttribute("aria-pressed", s.cats.has(b.dataset.cat)));
}

function paintImage(kind) {
  const img = app.querySelector(`#${kind}Thumb`);
  const f = s[kind];
  if (img.src.startsWith("blob:")) URL.revokeObjectURL(img.src);
  img.hidden = !f;
  img.src = f ? URL.createObjectURL(f) : "";
  app.querySelector(`#${kind}Remove`).hidden = !f;
}

async function pickHmod(file) {
  errorBox("");
  app.querySelector("#fields").hidden = true;
  app.querySelector("#modPreview").hidden = true;
  s.file = s.mod = s.existing = null;
  if (!file.name.toLowerCase().endsWith(".hmod")) return errorBox(t("up_notHmod"));
  if (file.size > cfg.maxModMiB * MIB) return errorBox(t("up_tooBig", { file: file.name, n: cfg.maxModMiB }));
  let mod;
  try {
    mod = await readHmod(file);
  } catch (e) {
    return errorBox(t("up_badHmod", { e: e.message }));
  }
  const m = mod.manifest;
  if (!/^[a-z0-9_]{1,64}$/.test(m.id)) return errorBox(t("up_badHmod", { e: `id "${m.id}"` }));
  if (!/^[A-Za-z0-9._+-]{1,64}$/.test(m.version)) return errorBox(t("up_badHmod", { e: `version "${m.version}"` }));
  const existing = (index.projects || []).find(p => p.id === m.id) || null;
  const me = auth.user.login.toLowerCase();
  if (existing && !existing.owners.some(o => o.toLowerCase() === me)) {
    return errorBox(t("up_notOwner", { id: m.id, owners: existing.owners.join(", ") }));
  }
  if (existing?.versions.some(v => v.version === m.version)) return errorBox(t("up_sameVersion", { v: m.version }));
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
  paintCats();
  const hasLicense = typeof m.license === "string" && m.license.trim();
  app.querySelector("#licenseRow").hidden = Boolean(hasLicense);
  app.querySelector("#license").value = hasLicense ? "" : existing?.license || "";
  const src = m.contact?.sources || m.contact?.homepage || "";
  const kept = existing && !existing.source.startsWith(cfg.siteUrl) ? existing.source : "";
  app.querySelector("#source").value = safeUrl(src) || kept;
  app.querySelector("#fields").hidden = false;
}

function base64(buf) {
  const bytes = new Uint8Array(buf);
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}

function utf8(text) {
  return new TextEncoder().encode(text).buffer;
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

function stepsView() {
  const keys = ["fork", "files", "pr", "check"];
  app.innerHTML = `<h1>${esc(t("up_title"))}</h1>
    <div class="panel"><ol class="steps">${keys.map(k => `<li data-step="${k}"><span class="dot"></span>${esc(t(`up_step_${k}`))}</li>`).join("")}</ol></div>
    <div id="outcome" style="margin-top:16px"></div>`;
  return (key, status) => {
    const li = app.querySelector(`[data-step="${key}"]`);
    li.className = status;
  };
}

function outcome(html) {
  app.querySelector("#outcome").innerHTML = html;
}

async function publish() {
  if (s.busy || !s.mod) return;
  const summary = app.querySelector("#summary").value.trim();
  const license = app.querySelector("#license").value.trim();
  const source = app.querySelector("#source").value.trim();
  if (!summary) return errorBox(t("up_needSummary"));
  if (!app.querySelector("#licenseRow").hidden && !license) return errorBox(t("up_needLicense"));
  if (source && !safeUrl(source)) return errorBox(t("up_badSource"));
  s.busy = true;
  const m = s.mod.manifest;
  const description = app.querySelector("#description").value.trim();
  const changelog = app.querySelector("#changelog").value.trim();
  const meta = { summary, categories: [...s.cats] };
  if (license) meta.license = license;
  if (source) meta.source = source;
  if (changelog) meta.changelog = changelog;

  const files = [["mod.hmod", await s.file.arrayBuffer()], ["submission.json", utf8(JSON.stringify(meta, null, 2) + "\n")]];
  if (description) files.push(["description.md", utf8(description + "\n")]);
  for (const kind of ["icon", "banner"]) {
    if (s[kind]) files.push([`${kind}.${IMAGE_TYPES[s[kind].type]}`, await s[kind].arrayBuffer()]);
  }

  const mark = stepsView();
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
      tree.push({ path: `submissions/${m.id}/${name}`, mode: "100644", type: "blob", sha: blob.sha });
    }
    const newTree = await gh(`/repos/${target}/git/trees`, { method: "POST", body: { base_tree: baseCommit.tree.sha, tree } });
    const commit = await gh(`/repos/${target}/git/commits`, {
      method: "POST",
      body: { message: `Publish ${m.id} ${m.version}`, tree: newTree.sha, parents: [base] }
    });
    const branch = `submit/${m.id}-${m.version}-${Date.now()}`;
    await gh(`/repos/${target}/git/refs`, { method: "POST", body: { ref: `refs/heads/${branch}`, sha: commit.sha } });
    mark("files", "done");

    step = "pr";
    mark("pr", "now");
    const pr = await gh(`/repos/${upstream}/pulls`, {
      method: "POST",
      body: {
        title: `Publish ${m.name} ${m.version}`,
        head: target === upstream ? branch : `${headOwner}:${branch}`,
        base: "main",
        body: `\`${m.id}\` ${m.version}`,
        maintainer_can_modify: false
      }
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
        outcome(`<div class="notice box"><p>${esc(t("up_done"))}</p><div class="mod-actions">
          <a class="btn primary" href="mod.html?id=${encodeURIComponent(m.id)}">${esc(t("up_openPage"))}</a>${prLink}</div></div>`);
      } else {
        mark("check", "fail");
        const reason = bot.body.split("\n\n").slice(1).join("\n\n").trim() || bot.body;
        outcome(`<div class="notice box error"><p>${esc(t("up_refused", { e: reason }))}</p><div class="mod-actions">
          <a class="btn primary" href="upload.html">${esc(t("up_another"))}</a>${prLink}</div></div>`);
      }
      return;
    }
    outcome(`<div class="notice box"><p>${esc(t("up_timeout"))}</p>${prLink}</div>`);
  } catch (e) {
    mark(step, "fail");
    outcome(`<div class="notice box error"><p>${esc(t("up_failed", { e: e.message }))}</p>
      <a class="btn" href="upload.html">${esc(t("up_another"))}</a></div>`);
  } finally {
    s.busy = false;
  }
}

(async () => {
  cfg = await config();
  if (!(await auth.enabled())) return notice(esc(t("loginOff")));
  if (!auth.user || !auth.token) {
    notice(`<h1 style="margin-top:0">${esc(t("up_title"))}</h1><p>${esc(t("loginWhy"))}</p>
      <button class="btn primary" id="login">${esc(t("login"))}</button>`);
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
