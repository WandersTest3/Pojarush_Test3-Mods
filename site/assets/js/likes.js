import { ICONS, accountSheet, auth, esc, fmtNumber, gh, t } from "./core.js";

async function findMine(repo, issue) {
  const me = auth.user?.login?.toLowerCase();
  if (!auth.token || !me) return null;
  for (let page = 1; page <= 10; page++) {
    const list = await gh(`/repos/${repo}/issues/${issue}/reactions?content=heart&per_page=100&page=${page}`);
    const hit = list.find(r => r.user?.login?.toLowerCase() === me);
    if (hit) return hit.id;
    if (list.length < 100) break;
  }
  return null;
}

export function likeButton(p) {
  return p.site?.like_issue
    ? `<button type="button" class="round like" id="likeBtn" aria-pressed="false" aria-label="${esc(t("like"))}" title="${esc(t("like"))}">${ICONS.heartOutline}</button>`
    : "";
}

export function likeStat(p) {
  return p.site?.like_issue ? `<span class="dotsep"></span><span class="stat" id="likeStat">${ICONS.heart}${esc(t("likes", { n: "…" }))}</span>` : "";
}

export async function bindLike(app, p, cfg) {
  const btn = app.querySelector("#likeBtn");
  const issue = p.site?.like_issue;
  if (!btn || !issue) return;
  const stat = app.querySelector("#likeStat");
  const state = { count: 0, mine: null, busy: false };

  const paint = () => {
    const on = state.mine !== null;
    btn.setAttribute("aria-pressed", String(on));
    btn.innerHTML = on ? ICONS.heart : ICONS.heartOutline;
    const label = t(on ? "unlike" : "like");
    btn.setAttribute("aria-label", label);
    btn.title = label;
    if (stat) stat.innerHTML = `${ICONS.heart}${esc(t("likes", { n: fmtNumber(state.count) }))}`;
  };

  try {
    const data = await gh(`/repos/${cfg.repo}/issues/${issue}`);
    state.count = data?.reactions?.heart || 0;
    state.mine = await findMine(cfg.repo, issue);
  } catch {
    if (stat) stat.remove();
  }
  paint();

  btn.onclick = async () => {
    if (!auth.token) return accountSheet();
    if (state.busy) return;
    state.busy = true;
    btn.disabled = true;
    const before = { count: state.count, mine: state.mine };
    try {
      if (state.mine !== null) {
        state.count = Math.max(0, state.count - 1);
        const id = state.mine;
        state.mine = null;
        paint();
        await gh(`/repos/${cfg.repo}/issues/${issue}/reactions/${id}`, { method: "DELETE" });
      } else {
        state.count += 1;
        state.mine = -1;
        paint();
        const r = await gh(`/repos/${cfg.repo}/issues/${issue}/reactions`, { method: "POST", body: { content: "heart" } });
        state.mine = r.id;
      }
    } catch {
      Object.assign(state, before);
      paint();
      btn.insertAdjacentHTML("afterend", `<span class="muted like-err" role="alert">${esc(t("likeError"))}</span>`);
      setTimeout(() => app.querySelector(".like-err")?.remove(), 4000);
    }
    state.busy = false;
    btn.disabled = false;
  };
}
