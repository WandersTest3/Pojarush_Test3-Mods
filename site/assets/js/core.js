const STRINGS = {
  en: {
    search: "Search mods...",
    sortBy: "Sort by:",
    sort_relevance: "Relevance",
    sort_downloads: "Downloads",
    sort_newest: "Newest",
    sort_updated: "Recently updated",
    sort_name: "Name",
    view: "View:",
    filter: "Filter results...",
    toggleView: "Switch between banners and compact list",
    categories: "Categories",
    environment: "Environment",
    type: "Type",
    minecraft: "Minecraft version",
    clearFilters: "Clear filters",
    results: "{n} mods",
    result: "1 mod",
    by: "by",
    side_client: "Client",
    side_server: "Server",
    side_both: "Client and server",
    type_content: "Content",
    type_code: "Code",
    downloads: "{n} downloads",
    updatedAgo: "Updated {t}",
    noResults: "No mods match this search.",
    noMods: "No mods yet. Be the first to upload one.",
    loadError: "The mod list could not be loaded. Check your connection and reload the page.",
    prev: "Previous page",
    next: "Next page",
    page: "Page {n}",
    nav_home: "Home",
    nav_search: "Search",
    nav_upload: "Upload a mod",
    nav_mine: "My mods",
    nav_account: "Account",
    login: "Sign in with GitHub",
    logout: "Sign out",
    signedAs: "Signed in as {login}",
    loginWhy: "Sign in to upload mods. The site creates a copy (fork) of the mods repository in your GitHub account and opens a pull request with your mod.",
    loginOff: "Uploading from the site is not enabled yet.",
    close: "Close",
    mineNeedsLogin: "Sign in to see your mods.",
    download: "Download",
    newVersion: "Upload new version",
    tab_description: "Description",
    tab_versions: "Versions",
    tab_details: "Details",
    noDescription: "No description.",
    license: "License",
    source: "Source code",
    homepage: "Homepage",
    issues: "Issues",
    modId: "Mod ID",
    owners: "Owners",
    authors: "Authors",
    created: "Published",
    permissions: "Permissions",
    noPermissions: "This mod asks for no permissions.",
    hasCode: "Contains code (mod.wasm), run by the game in a sandbox.",
    contentOnly: "Content only: blocks, items and assets, no code.",
    sha256: "SHA-256 of the latest file",
    notFound: "This mod does not exist.",
    backToList: "Back to the list",
    cap_game_read: "Read position, health, time and other game data",
    cap_chat: "Show messages in chat",
    cap_hud: "Draw text on the HUD",
    cap_render: "Shapes on the HUD, camera shake and zoom",
    cap_input: "Its own keys, the mouse wheel and the use button on its items",
    cap_ui: "Its own screens and a settings page in Options > Mods",
    cap_storage: "Save its settings to disk",
    cap_command: "Run vanilla commands as the player",
    cap_recipes: "Read recipes and items",
    cap_registries: "New blocks and items from its data/ folder",
    cap_players: "Players on the server and messages to them",
    cap_world: "Blocks in loaded chunks and changes to them",
    cat_adventure: "Adventure",
    cat_decoration: "Decoration",
    cat_equipment: "Equipment",
    cat_food: "Food",
    "cat_game-mechanics": "Game mechanics",
    cat_hud: "HUD and interface",
    cat_library: "Library",
    cat_magic: "Magic",
    cat_mobs: "Mobs",
    cat_optimization: "Optimization",
    cat_social: "Social",
    cat_storage: "Storage",
    cat_technology: "Technology",
    cat_transportation: "Transportation",
    cat_utility: "Utility",
    cat_worldgen: "World generation",
    up_title: "Upload a mod",
    up_file: "Mod file (.hmod)",
    up_pick: "Choose or drop a .hmod file",
    up_limit: "Up to {n} MiB",
    up_tooBig: "{file} is larger than {n} MiB.",
    up_notHmod: "Choose a .hmod file.",
    up_badHmod: "This file is not a valid .hmod: {e}",
    up_newMod: "New mod",
    up_update: "New version of {name}",
    up_notOwner: "The id {id} belongs to another author ({owners}). Change the id in horizon-mod.toml.",
    up_sameVersion: "Version {v} is already published. Raise the version in horizon-mod.toml.",
    up_summary: "Short description",
    up_summaryHint: "Shown on the mod card, up to 160 characters.",
    up_categories: "Categories",
    up_categoriesHint: "Up to {n}.",
    up_license: "License",
    up_licenseHint: "The file has no license. Choose or type one.",
    up_source: "Source code link",
    up_sourceHint: "Optional, https:// only.",
    up_icon: "Icon",
    up_iconHint: "Optional. PNG, JPEG or WEBP, square. Without one, the icon from the .hmod is used.",
    up_banner: "Banner",
    up_bannerHint: "Optional. PNG, JPEG or WEBP, wide (2:1 looks best, at least 320×80).",
    up_description: "Description",
    up_descriptionHint: "Optional. Markdown: # titles, **bold**, *italics*, [links](https://...), lists.",
    up_changelog: "What changed in this version",
    up_changelogHint: "Optional.",
    up_preview: "Preview",
    up_edit: "Edit",
    up_publish: "Publish",
    up_choose: "Choose file",
    up_remove: "Remove",
    up_needSummary: "Write a short description.",
    up_needLicense: "Choose a license.",
    up_badSource: "The source code link must start with https://.",
    up_step_fork: "Preparing your copy of the repository",
    up_step_files: "Sending the files",
    up_step_pr: "Opening the pull request",
    up_step_check: "Checking and publishing (1 to 5 minutes)",
    up_done: "Published. The site shows it in a few minutes.",
    up_openPage: "Open mod page",
    up_refused: "Refused: {e}",
    up_failed: "Upload failed: {e}",
    up_timeout: "Still checking. Follow it on the pull request.",
    up_viewPr: "View pull request",
    up_another: "Upload another",
    up_contains: "contains code",
    up_content: "content only",
    sizeMiB: "{n} MiB",
    sizeKiB: "{n} KiB",
    footer: "Mods for the Pojarush launcher. Files are hosted on GitHub."
  },
  pt_br: {
    search: "Pesquisar mods...",
    sortBy: "Ordenar por:",
    sort_relevance: "Relevância",
    sort_downloads: "Downloads",
    sort_newest: "Mais novos",
    sort_updated: "Atualizados recentemente",
    sort_name: "Nome",
    view: "Exibir:",
    filter: "Filtrar resultados...",
    toggleView: "Alternar entre banners e lista compacta",
    categories: "Categorias",
    environment: "Ambiente",
    type: "Tipo",
    minecraft: "Versão do Minecraft",
    clearFilters: "Limpar filtros",
    results: "{n} mods",
    result: "1 mod",
    by: "por",
    side_client: "Cliente",
    side_server: "Servidor",
    side_both: "Cliente e servidor",
    type_content: "Conteúdo",
    type_code: "Código",
    downloads: "{n} downloads",
    updatedAgo: "Atualizado {t}",
    noResults: "Nenhum mod corresponde a esta pesquisa.",
    noMods: "Ainda não há mods. Seja o primeiro a enviar um.",
    loadError: "Não foi possível carregar a lista de mods. Verifique a conexão e recarregue a página.",
    prev: "Página anterior",
    next: "Próxima página",
    page: "Página {n}",
    nav_home: "Início",
    nav_search: "Pesquisar",
    nav_upload: "Enviar um mod",
    nav_mine: "Meus mods",
    nav_account: "Conta",
    login: "Entrar com o GitHub",
    logout: "Sair",
    signedAs: "Conectado como {login}",
    loginWhy: "Entre para enviar mods. O site cria uma cópia (fork) do repositório de mods na sua conta do GitHub e abre um pull request com o seu mod.",
    loginOff: "O envio pelo site ainda não foi ativado.",
    close: "Fechar",
    mineNeedsLogin: "Entre para ver os seus mods.",
    download: "Baixar",
    newVersion: "Enviar nova versão",
    tab_description: "Descrição",
    tab_versions: "Versões",
    tab_details: "Detalhes",
    noDescription: "Sem descrição.",
    license: "Licença",
    source: "Código-fonte",
    homepage: "Página inicial",
    issues: "Problemas",
    modId: "ID do mod",
    owners: "Donos",
    authors: "Autores",
    created: "Publicado em",
    permissions: "Permissões",
    noPermissions: "Este mod não pede permissões.",
    hasCode: "Contém código (mod.wasm), executado pelo jogo em ambiente isolado.",
    contentOnly: "Só conteúdo: blocos, itens e recursos, sem código.",
    sha256: "SHA-256 do arquivo mais recente",
    notFound: "Este mod não existe.",
    backToList: "Voltar para a lista",
    cap_game_read: "Ler posição, vida, hora e outros dados do jogo",
    cap_chat: "Mostrar mensagens no chat",
    cap_hud: "Desenhar texto no HUD",
    cap_render: "Formas no HUD, tremor e zoom da câmera",
    cap_input: "Teclas próprias, a roda do mouse e o botão de usar em itens do mod",
    cap_ui: "Telas próprias e uma página de ajustes em Opções > Mods",
    cap_storage: "Salvar os ajustes do mod em disco",
    cap_command: "Rodar comandos vanilla como o jogador",
    cap_recipes: "Ler receitas e itens",
    cap_registries: "Blocos e itens novos pela pasta data/ do mod",
    cap_players: "Jogadores do servidor e mensagens para eles",
    cap_world: "Blocos nos chunks carregados e mudanças neles",
    cat_adventure: "Aventura",
    cat_decoration: "Decoração",
    cat_equipment: "Equipamento",
    cat_food: "Comida",
    "cat_game-mechanics": "Mecânicas de jogo",
    cat_hud: "HUD e interface",
    cat_library: "Biblioteca",
    cat_magic: "Magia",
    cat_mobs: "Criaturas",
    cat_optimization: "Otimização",
    cat_social: "Social",
    cat_storage: "Armazenamento",
    cat_technology: "Tecnologia",
    cat_transportation: "Transporte",
    cat_utility: "Utilidade",
    cat_worldgen: "Geração de mundo",
    up_title: "Enviar um mod",
    up_file: "Arquivo do mod (.hmod)",
    up_pick: "Escolha ou solte um arquivo .hmod",
    up_limit: "Até {n} MiB",
    up_tooBig: "{file} tem mais de {n} MiB.",
    up_notHmod: "Escolha um arquivo .hmod.",
    up_badHmod: "Este arquivo não é um .hmod válido: {e}",
    up_newMod: "Mod novo",
    up_update: "Nova versão de {name}",
    up_notOwner: "O id {id} pertence a outro autor ({owners}). Mude o id no horizon-mod.toml.",
    up_sameVersion: "A versão {v} já foi publicada. Aumente a versão no horizon-mod.toml.",
    up_summary: "Descrição curta",
    up_summaryHint: "Aparece no card do mod, até 160 caracteres.",
    up_categories: "Categorias",
    up_categoriesHint: "Até {n}.",
    up_license: "Licença",
    up_licenseHint: "O arquivo não tem licença. Escolha ou digite uma.",
    up_source: "Link do código-fonte",
    up_sourceHint: "Opcional, só https://.",
    up_icon: "Ícone",
    up_iconHint: "Opcional. PNG, JPEG ou WEBP, quadrado. Sem ele, é usado o ícone do .hmod.",
    up_banner: "Banner",
    up_bannerHint: "Opcional. PNG, JPEG ou WEBP, largo (2:1 fica melhor, mínimo 320×80).",
    up_description: "Descrição",
    up_descriptionHint: "Opcional. Markdown: # títulos, **negrito**, *itálico*, [links](https://...), listas.",
    up_changelog: "O que mudou nesta versão",
    up_changelogHint: "Opcional.",
    up_preview: "Visualizar",
    up_edit: "Editar",
    up_publish: "Publicar",
    up_choose: "Escolher arquivo",
    up_remove: "Remover",
    up_needSummary: "Escreva uma descrição curta.",
    up_needLicense: "Escolha uma licença.",
    up_badSource: "O link do código-fonte precisa começar com https://.",
    up_step_fork: "Preparando a sua cópia do repositório",
    up_step_files: "Enviando os arquivos",
    up_step_pr: "Abrindo o pull request",
    up_step_check: "Verificando e publicando (1 a 5 minutos)",
    up_done: "Publicado. O site mostra o mod em alguns minutos.",
    up_openPage: "Abrir página do mod",
    up_refused: "Recusado: {e}",
    up_failed: "O envio falhou: {e}",
    up_timeout: "Ainda verificando. Acompanhe pelo pull request.",
    up_viewPr: "Ver pull request",
    up_another: "Enviar outro",
    up_contains: "contém código",
    up_content: "só conteúdo",
    sizeMiB: "{n} MiB",
    sizeKiB: "{n} KiB",
    footer: "Mods para o launcher Pojarush. Os arquivos ficam hospedados no GitHub."
  }
};

STRINGS.pt_pt = Object.assign({}, STRINGS.pt_br, {
  search: "Pesquisar mods...",
  sort_updated: "Atualizados recentemente",
  filter: "Filtrar resultados...",
  noMods: "Ainda não há mods. Seja o primeiro a enviar um.",
  loadError: "Não foi possível carregar a lista de mods. Verifique a ligação e recarregue a página.",
  nav_upload: "Enviar um mod",
  login: "Iniciar sessão com o GitHub",
  logout: "Terminar sessão",
  signedAs: "Sessão iniciada como {login}",
  loginWhy: "Inicie sessão para enviar mods. O site cria uma cópia (fork) do repositório de mods na sua conta do GitHub e abre um pull request com o seu mod.",
  loginOff: "O envio pelo site ainda não foi ativado.",
  mineNeedsLogin: "Inicie sessão para ver os seus mods.",
  download: "Transferir",
  downloads: "{n} transferências",
  sort_downloads: "Transferências",
  newVersion: "Enviar nova versão",
  source: "Código-fonte",
  issues: "Problemas",
  owners: "Proprietários",
  hasCode: "Contém código (mod.wasm), executado pelo jogo num ambiente isolado.",
  sha256: "SHA-256 do ficheiro mais recente",
  cap_game_read: "Ler posição, vida, hora e outros dados do jogo",
  cap_input: "Teclas próprias, a roda do rato e o botão de usar em itens do mod",
  cap_ui: "Ecrãs próprios e uma página de definições em Opções > Mods",
  cap_storage: "Guardar as definições do mod no disco",
  cap_command: "Executar comandos vanilla como o jogador",
  up_file: "Ficheiro do mod (.hmod)",
  up_pick: "Escolha ou largue um ficheiro .hmod",
  up_tooBig: "{file} tem mais de {n} MiB.",
  up_notHmod: "Escolha um ficheiro .hmod.",
  up_badHmod: "Este ficheiro não é um .hmod válido: {e}",
  up_summaryHint: "Aparece no cartão do mod, até 160 caracteres.",
  up_licenseHint: "O ficheiro não tem licença. Escolha ou escreva uma.",
  up_iconHint: "Opcional. PNG, JPEG ou WEBP, quadrado. Sem ele, é usado o ícone do .hmod.",
  up_choose: "Escolher ficheiro",
  up_step_files: "A enviar os ficheiros",
  up_step_fork: "A preparar a sua cópia do repositório",
  up_step_pr: "A abrir o pull request",
  up_step_check: "A verificar e publicar (1 a 5 minutos)",
  up_timeout: "Ainda a verificar. Acompanhe pelo pull request.",
  footer: "Mods para o launcher Pojarush. Os ficheiros estão alojados no GitHub."
});

const LANGS = { en: "English", pt_br: "Português (Brasil)", pt_pt: "Português (Portugal)" };

function store(kind) {
  try {
    const s = window[kind];
    const k = "__pm";
    s.setItem(k, k);
    s.removeItem(k);
    return s;
  } catch {
    const mem = new Map();
    return { getItem: k => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, String(v)), removeItem: k => mem.delete(k) };
  }
}
export const local = store("localStorage");
export const session = store("sessionStorage");

function detectLang() {
  const saved = local.getItem("pm_lang");
  if (saved && STRINGS[saved]) return saved;
  const nav = (navigator.language || "en").toLowerCase();
  if (nav === "pt-pt") return "pt_pt";
  if (nav.startsWith("pt")) return "pt_br";
  return "en";
}
export const lang = detectLang();
document.documentElement.lang = { en: "en", pt_br: "pt-BR", pt_pt: "pt-PT" }[lang];

export function t(key, vars = {}) {
  const s = STRINGS[lang][key] ?? STRINGS.en[key] ?? key;
  return s.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? vars[k] : `{${k}}`));
}

export function fmtNumber(n) {
  return new Intl.NumberFormat(document.documentElement.lang, { notation: n >= 10000 ? "compact" : "standard", maximumFractionDigits: 1 }).format(n);
}

export function fmtSize(bytes) {
  return bytes >= 1048576 ? t("sizeMiB", { n: (bytes / 1048576).toFixed(2) }) : t("sizeKiB", { n: Math.max(1, Math.round(bytes / 1024)) });
}

export function fmtDate(iso) {
  return new Intl.DateTimeFormat(document.documentElement.lang, { dateStyle: "medium" }).format(new Date(iso));
}

export function fmtAgo(iso) {
  const diff = (new Date(iso).getTime() - Date.now()) / 1000;
  const rtf = new Intl.RelativeTimeFormat(document.documentElement.lang, { numeric: "auto" });
  const units = [["year", 31536000], ["month", 2592000], ["week", 604800], ["day", 86400], ["hour", 3600], ["minute", 60]];
  for (const [unit, sec] of units) {
    if (Math.abs(diff) >= sec) return rtf.format(Math.round(diff / sec), unit);
  }
  return rtf.format(0, "minute");
}

export function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

export function safeUrl(u) {
  return typeof u === "string" && /^https:\/\/[^\s<>"']+$/.test(u) ? u : null;
}

export const ICONS = {
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  chevron: '<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',
  left: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m15 6-6 6 6 6"/></svg>',
  right: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>',
  grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/></svg>',
  list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="18" r="1"/></svg>',
  globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z"/></svg>',
  monitor: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/></svg>',
  server: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="7" rx="2"/><rect x="3" y="13" width="18" height="7" rx="2"/><path d="M7 7.5h.01M7 16.5h.01"/></svg>',
  cube: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 3 20 7.5v9L12 21l-8-4.5v-9z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/></svg>',
  code: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m8 7-5 5 5 5M16 7l5 5-5 5"/></svg>',
  download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 20h14"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M4 10.5 12 4l8 6.5V20h-5v-6H9v6H4z"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  folder: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M3 6.5A1.5 1.5 0 0 1 4.5 5H9l2 2.5h8.5A1.5 1.5 0 0 1 21 9v9.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18.5z"/></svg>',
  user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.2-4 4.2-6 8-6s6.8 2 8 6"/></svg>',
  upload: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 16V5m0 0L7.5 9.5M12 5l4.5 4.5M5 20h14"/></svg>',
  mark: '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linejoin="round"><path d="M12 3 20 7.5v9L12 21l-8-4.5v-9z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/></svg>'
};

let configPromise;
export function config() {
  configPromise ??= fetch("config.json", { cache: "no-cache" }).then(r => r.json());
  return configPromise;
}

let indexPromise;
export function loadIndex() {
  indexPromise ??= fetch("index.json", { cache: "no-cache" }).then(r => {
    if (!r.ok) throw new Error(String(r.status));
    return r.json();
  });
  return indexPromise;
}

export function localized(p) {
  const tr = p.site?.translations || {};
  const pick = tr[lang] || (lang.startsWith("pt_") ? tr.pt_br : null);
  return { name: pick?.name || p.name, summary: pick?.summary || p.summary };
}

export function author(p) {
  return p.authors?.[0] || p.owners?.[0] || "";
}

export function iconUrl(p) {
  return p.site?.icon_file || "assets/img/icon-default.svg";
}

export const auth = {
  get token() { return local.getItem("pm_token"); },
  get user() {
    try { return JSON.parse(local.getItem("pm_user") || "null"); } catch { return null; }
  },
  save(token, user) {
    local.setItem("pm_token", token);
    local.setItem("pm_user", JSON.stringify(user));
  },
  clear() {
    local.removeItem("pm_token");
    local.removeItem("pm_user");
  },
  async enabled() {
    const c = await config();
    return Boolean(c.oauthClientId && c.authWorker);
  },
  async login(returnTo = location.pathname + location.search) {
    const c = await config();
    const state = crypto.getRandomValues(new Uint32Array(4)).join("-");
    session.setItem("pm_state", state);
    session.setItem("pm_return", returnTo);
    const params = new URLSearchParams({
      client_id: c.oauthClientId,
      redirect_uri: new URL("callback.html", c.siteUrl).href,
      scope: "public_repo",
      state,
      allow_signup: "true"
    });
    location.href = `https://github.com/login/oauth/authorize?${params}`;
  }
};

export async function gh(path, opts = {}) {
  const headers = { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", ...(opts.headers || {}) };
  if (auth.token) headers.Authorization = `Bearer ${auth.token}`;
  if (opts.body && typeof opts.body !== "string") {
    headers["Content-Type"] = "application/json";
    opts = { ...opts, body: JSON.stringify(opts.body) };
  }
  const r = await fetch(`https://api.github.com${path}`, { ...opts, headers });
  if (r.status === 401) {
    auth.clear();
  }
  const text = await r.text();
  const data = text ? JSON.parse(text) : null;
  if (!r.ok) {
    const err = new Error(data?.message || `GitHub ${r.status}`);
    err.status = r.status;
    err.data = data;
    throw err;
  }
  return data;
}

function sheet(html) {
  const back = document.createElement("div");
  back.className = "sheet-back";
  back.innerHTML = `<div class="sheet" role="dialog" aria-modal="true">${html}</div>`;
  const close = () => back.remove();
  back.addEventListener("click", e => { if (e.target === back) close(); });
  document.addEventListener("keydown", function onKey(e) {
    if (e.key === "Escape") { close(); document.removeEventListener("keydown", onKey); }
  });
  document.body.append(back);
  back.querySelector("button, a")?.focus();
  return { el: back, close };
}

export async function accountSheet() {
  const user = auth.user;
  if (user) {
    const s = sheet(`<h2>${esc(t("signedAs", { login: user.login }))}</h2>
      <button class="btn" data-a="logout">${esc(t("logout"))}</button>
      <button class="btn" data-a="close">${esc(t("close"))}</button>`);
    s.el.querySelector('[data-a="logout"]').onclick = () => { auth.clear(); location.reload(); };
    s.el.querySelector('[data-a="close"]').onclick = s.close;
    return;
  }
  const on = await auth.enabled();
  const s = sheet(`<h2>${esc(t("nav_account"))}</h2>
    <p>${esc(on ? t("loginWhy") : t("loginOff"))}</p>
    ${on ? `<button class="btn primary" data-a="login">${esc(t("login"))}</button>` : ""}
    <button class="btn" data-a="close">${esc(t("close"))}</button>`);
  s.el.querySelector('[data-a="login"]')?.addEventListener("click", () => auth.login());
  s.el.querySelector('[data-a="close"]').onclick = s.close;
}

export function chrome(active) {
  const top = document.createElement("header");
  top.className = "topbar";
  top.innerHTML = `<a class="brand" href="./"><span class="brand-mark">${ICONS.mark}</span>Pojarush Mods</a>
    <label><span hidden>Language</span><select class="lang" aria-label="Language">${Object.entries(LANGS)
      .map(([k, v]) => `<option value="${k}"${k === lang ? " selected" : ""}>${esc(v)}</option>`).join("")}</select></label>`;
  top.querySelector("select").onchange = e => { local.setItem("pm_lang", e.target.value); location.reload(); };
  document.body.prepend(top);

  const user = auth.user;
  const nav = document.createElement("nav");
  nav.className = "bottom-nav";
  nav.setAttribute("aria-label", "Pojarush Mods");
  const cur = k => (k === active ? ' aria-current="page"' : "");
  nav.innerHTML = `
    <a href="./" aria-label="${esc(t("nav_home"))}"${cur("home")}>${ICONS.home}</a>
    <a href="./?focus=1" aria-label="${esc(t("nav_search"))}" data-a="search"${cur("search")}>${ICONS.search}</a>
    <a href="upload.html" class="upload" aria-label="${esc(t("nav_upload"))}"${cur("upload")}>${ICONS.plus}</a>
    <a href="./?owner=me" aria-label="${esc(t("nav_mine"))}"${cur("mine")}>${ICONS.folder}</a>
    <button type="button" aria-label="${esc(t("nav_account"))}" data-a="account">${user?.avatar_url
      ? `<img class="avatar" src="${esc(user.avatar_url)}" alt="">` : ICONS.user}</button>`;
  nav.querySelector('[data-a="account"]').onclick = accountSheet;
  document.body.append(nav);

  const foot = document.createElement("footer");
  foot.className = "footer";
  foot.textContent = t("footer");
  document.querySelector("main").after(foot);
  return nav;
}

function inline(s) {
  let out = "";
  const re = /(`+)([\s\S]*?)\1|!\[([^\]]*)\]\(([^)\s]+)\)|\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*|__([^_]+)__|\*([^*\s][^*]*)\*|_([^_\s][^_]*)_/g;
  let last = 0;
  let m;
  while ((m = re.exec(s))) {
    out += esc(s.slice(last, m.index));
    if (m[1]) out += `<code>${esc(m[2])}</code>`;
    else if (m[4] !== undefined) {
      const u = safeUrl(m[4]);
      out += u ? `<img src="${esc(u)}" alt="${esc(m[3])}" loading="lazy">` : esc(m[0]);
    } else if (m[6] !== undefined) {
      const u = safeUrl(m[6]);
      out += u ? `<a href="${esc(u)}" rel="nofollow noopener" target="_blank">${inline(m[5])}</a>` : esc(m[0]);
    } else if (m[7] || m[8]) out += `<strong>${inline(m[7] || m[8])}</strong>`;
    else out += `<em>${inline(m[9] || m[10])}</em>`;
    last = re.lastIndex;
  }
  return out + esc(s.slice(last));
}

export function markdown(src) {
  const lines = String(src || "").replace(/\r\n?/g, "\n").split("\n");
  const html = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (/^```/.test(line)) {
      const buf = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]);
      i++;
      html.push(`<pre><code>${esc(buf.join("\n"))}</code></pre>`);
      continue;
    }
    const h = /^(#{1,4})\s+(.*)$/.exec(line);
    if (h) { const n = Math.min(h[1].length + 1, 4); html.push(`<h${n}>${inline(h[2])}</h${n}>`); i++; continue; }
    if (/^(\*\s*\*\s*\*|-\s*-\s*-|_\s*_\s*_)[\s*_-]*$/.test(line)) { html.push("<hr>"); i++; continue; }
    if (/^>\s?/.test(line)) {
      const buf = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) buf.push(lines[i++].replace(/^>\s?/, ""));
      html.push(`<blockquote>${markdown(buf.join("\n"))}</blockquote>`);
      continue;
    }
    const ul = /^\s*[-*+]\s+/, ol = /^\s*\d+[.)]\s+/;
    if (ul.test(line) || ol.test(line)) {
      const ordered = ol.test(line);
      const re = ordered ? ol : ul;
      const items = [];
      while (i < lines.length && re.test(lines[i])) items.push(`<li>${inline(lines[i++].replace(re, ""))}</li>`);
      html.push(ordered ? `<ol>${items.join("")}</ol>` : `<ul>${items.join("")}</ul>`);
      continue;
    }
    if (!line.trim()) { i++; continue; }
    const buf = [];
    while (i < lines.length && lines[i].trim() && !/^(```|#{1,4}\s|>|\s*[-*+]\s+|\s*\d+[.)]\s+)/.test(lines[i])) buf.push(lines[i++]);
    if (!buf.length) buf.push(lines[i++]);
    html.push(`<p>${buf.map(inline).join("<br>")}</p>`);
  }
  return html.join("\n");
}

export function sideTag(side) {
  const s = side || "client";
  const icon = s === "server" ? ICONS.server : s === "both" ? ICONS.globe : ICONS.monitor;
  return `<span class="tag">${icon}${esc(t(`side_${s}`))}</span>`;
}

export function typeTag(code) {
  return code
    ? `<span class="tag code">${ICONS.code}${esc(t("type_code"))}</span>`
    : `<span class="tag content">${ICONS.cube}${esc(t("type_content"))}</span>`;
}
