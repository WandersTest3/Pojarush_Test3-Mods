import { EXTRA, EXTRA_LANGS } from "./i18n.js";

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
    notFoundWait: "If the mod was just posted, it takes less than 5 minutes to appear.",
    pc_title: "Before you post",
    pc_question: "By posting, you are fully aware that this mod does not violate the rights of any other mod ported from Java, right?",
    pc_yes: "Yes, post it",
    pc_no: "No",
    pc_noTitle: "Why you should not post this mod",
    pc_no1: "Porting someone else's mod without permission is copyright infringement. The author owns the code, textures and ideas of their mod, even when it is free to download.",
    pc_no2: "Many licenses (like All Rights Reserved) forbid redistribution or derived versions. Before porting, check the original license and ask the author for permission. When the license allows it, credit the author clearly.",
    pc_no3: "Mods that violate other creators' rights are removed from this site. Respecting the people who made the original mod keeps the community healthy. Ask for permission or make your own mod instead.",
    up_licenseOther: "Other (type it)",
    up_licenseCustom: "License name or link",
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
    up_licenseHint: "Default is MIT. Choose the license that matches your mod.",
    up_source: "Source code link",
    up_sourceHint: "Optional, https:// only.",
    up_icon: "Icon",
    up_iconHint: "Optional. PNG, JPEG or WEBP, square, at least 8×8 px. Small icons are enlarged without blur. Without one, the icon from the .hmod is used.",
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
    footer: "Mods for the Pojarush launcher. Files are hosted on GitHub.",
    creator: "Creator",
    tab_gallery: "Gallery",
    tab_changelog: "Changelog",
    noGallery: "No images yet.",
    noChangelog: "No changelog for this version.",
    menu: "More options",
    copyLink: "Copy link",
    linkCopied: "Link copied",
    reportProblem: "Report a problem",
    editPage: "Edit page",
    viewSource: "Source code",
    requires: "Requires",
    requiresPojarush: "Pojarush_Test3 {v} or newer",
    projectsCount: "{n} projects",
    projectCount: "1 project",
    onGithubSince: "On GitHub since {d}",
    editOnGithub: "Edit on GitHub",
    viewOnGithub: "View on GitHub",
    noModsUser: "This user has not published any mods yet.",
    userNotFound: "This user was not found.",
    footer_mojang: "Pojarush Mods is an independent site. It is not affiliated with, endorsed by or associated with Mojang Studios or Microsoft. Minecraft is a trademark of Mojang Studios.",
    footer_rights: "All rights reserved. Each mod belongs to its authors and follows the license they chose.",
    footer_report: "Found a bug on the site, or a mod that should not be here? Report it on our Discord server.",
    footer_discord: "Join the Discord server",
    up_gallery: "Gallery",
    up_galleryHint: "Optional, up to {n} images. Tap the star on one to use it as the banner on the mod card.",
    up_addImage: "Add image",
    up_star: "Use as banner",
    up_removeImage: "Remove image",
    up_descImage: "Description image",
    up_descImageHint: "Optional. Shown at the top of the description.",
    up_tooSmall: "{file} is too small. Use at least 200×200 px.",
    up_iconSmall: "{file} is too small. The icon needs at least {n}×{n} px.",
    up_pojarush: "Works from Pojarush_Test3 version",
    up_pojarushHint: "The first launcher version this mod runs on.",
    up_pojarushOpt: "V{v}",
    edit_title: "Edit {name}",
    edit_save: "Save changes",
    edit_notOwner: "Only the owners of this mod can edit it.",
    edit_login: "Sign in to edit this mod.",
    edit_done: "Saved. The page updates in a few minutes.",
    edit_step_check: "Checking and saving (1 to 5 minutes)",
    edit_back: "Back to the mod page",
    tut_title: "How to post a mod",
    tut_1: "Sign in with your GitHub account. The site only asks for permission to copy the mods repository into your account and send your mod from there.",
    tut_2: "Have your mod ready as a .hmod file of up to 5 MiB. Its horizon-mod.toml needs an id, a name, a version and a license.",
    tut_3: "Tap the + button, choose the .hmod file, then fill in the short description, categories, images and the Pojarush_Test3 version.",
    tut_4: "Tap Publish. A bot checks the mod in 1 to 5 minutes and the site updates by itself.",
    tut_5: "To change anything later, open your mod page and tap the pencil. New versions go through the + button, with the same id and a higher version.",
    edit_danger: "Delete",
    edit_deleteVersion: "Delete version",
    edit_deleteMod: "Delete mod page",
    edit_confirmVersion: "Delete version {v}? Its file is removed from the site and from the downloads. This cannot be undone.",
    edit_confirmMod: "Delete the whole page of {name}, with all its versions, images and files? This cannot be undone. Type the mod id ({id}) to confirm.",
    edit_confirmDo: "Delete",
    edit_cancel: "Cancel",
    edit_lastVersion: "This is the only version. To remove it, delete the whole mod page.",
    edit_deleted: "Deleted. The site updates in a few minutes.",
    edit_step_delete: "Checking and deleting (1 to 5 minutes)"
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
    notFoundWait: "Se o mod acabou de ser postado, ele leva menos de 5 minutos para aparecer.",
    pc_title: "Antes de postar",
    pc_question: "Ao postar, você está totalmente ciente de que este mod não viola os direitos de nenhum outro mod portado do Java, certo?",
    pc_yes: "Sim, postar",
    pc_no: "Não",
    pc_noTitle: "Por que você não deve postar este mod",
    pc_no1: "Portar o mod de outra pessoa sem permissão é violação de direitos autorais. O autor é dono do código, das texturas e das ideias do mod dele, mesmo que o download seja gratuito.",
    pc_no2: "Muitas licenças (como All Rights Reserved) proíbem redistribuir ou criar versões derivadas. Antes de portar, confira a licença original e peça permissão ao autor. Quando a licença permitir, dê o crédito ao autor de forma clara.",
    pc_no3: "Mods que violam os direitos de outros criadores são removidos deste site. Respeitar quem fez o mod original mantém a comunidade saudável. Peça permissão ou faça um mod seu.",
    up_licenseOther: "Outra (digitar)",
    up_licenseCustom: "Nome ou link da licença",
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
    up_licenseHint: "O padrão é MIT. Escolha a licença que combina com o seu mod.",
    up_source: "Link do código-fonte",
    up_sourceHint: "Opcional, só https://.",
    up_icon: "Ícone",
    up_iconHint: "Opcional. PNG, JPEG ou WEBP, quadrado, de pelo menos 8×8 px. Ícones pequenos são ampliados sem borrar. Sem ele, é usado o ícone do .hmod.",
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
    footer: "Mods para o launcher Pojarush. Os arquivos ficam hospedados no GitHub.",
    creator: "Criador",
    tab_gallery: "Galeria",
    tab_changelog: "Changelog",
    noGallery: "Ainda não há imagens.",
    noChangelog: "Sem changelog para esta versão.",
    menu: "Mais opções",
    copyLink: "Copiar link",
    linkCopied: "Link copiado",
    reportProblem: "Reportar um problema",
    editPage: "Editar página",
    viewSource: "Código-fonte",
    requires: "Requer",
    requiresPojarush: "Pojarush_Test3 {v} ou mais novo",
    projectsCount: "{n} projetos",
    projectCount: "1 projeto",
    onGithubSince: "No GitHub desde {d}",
    editOnGithub: "Editar no GitHub",
    viewOnGithub: "Ver no GitHub",
    noModsUser: "Este usuário ainda não publicou nenhum mod.",
    userNotFound: "Este usuário não foi encontrado.",
    footer_mojang: "O Pojarush Mods é um site independente. Não é afiliado, aprovado nem associado à Mojang Studios ou à Microsoft. Minecraft é uma marca registrada da Mojang Studios.",
    footer_rights: "Todos os direitos reservados. Cada mod pertence aos seus autores e segue a licença escolhida por eles.",
    footer_report: "Encontrou um bug no site ou um mod que não deveria estar aqui? Reporte no nosso servidor do Discord.",
    footer_discord: "Entrar no servidor do Discord",
    up_gallery: "Galeria",
    up_galleryHint: "Opcional, até {n} imagens. Toque na estrela de uma delas para usá-la como banner no card do mod.",
    up_addImage: "Adicionar imagem",
    up_star: "Usar como banner",
    up_removeImage: "Remover imagem",
    up_descImage: "Imagem da descrição",
    up_descImageHint: "Opcional. Aparece no topo da descrição.",
    up_tooSmall: "{file} é pequena demais. Use pelo menos 200×200 px.",
    up_iconSmall: "{file} é pequeno demais. O ícone precisa de pelo menos {n}×{n} px.",
    up_pojarush: "Funciona a partir da versão do Pojarush_Test3",
    up_pojarushHint: "A primeira versão do launcher em que este mod funciona.",
    up_pojarushOpt: "V{v}",
    edit_title: "Editar {name}",
    edit_save: "Salvar alterações",
    edit_notOwner: "Só os donos deste mod podem editá-lo.",
    edit_login: "Entre para editar este mod.",
    edit_done: "Salvo. A página atualiza em alguns minutos.",
    edit_step_check: "Verificando e salvando (1 a 5 minutos)",
    edit_back: "Voltar para a página do mod",
    tut_title: "Como postar um mod",
    tut_1: "Entre com a sua conta do GitHub. O site só pede permissão para copiar o repositório de mods para a sua conta e enviar o seu mod a partir dela.",
    tut_2: "Deixe o mod pronto em um arquivo .hmod de até 5 MiB. O horizon-mod.toml dele precisa ter id, nome, versão e licença.",
    tut_3: "Toque no botão +, escolha o arquivo .hmod e preencha a descrição curta, as categorias, as imagens e a versão do Pojarush_Test3.",
    tut_4: "Toque em Publicar. Um bot confere o mod em 1 a 5 minutos e o site se atualiza sozinho.",
    tut_5: "Para mudar algo depois, abra a página do mod e toque no lápis. Versões novas entram pelo botão +, com o mesmo id e uma versão maior.",
    edit_danger: "Excluir",
    edit_deleteVersion: "Excluir versão",
    edit_deleteMod: "Excluir página do mod",
    edit_confirmVersion: "Excluir a versão {v}? O arquivo dela sai do site e dos downloads. Isso não pode ser desfeito.",
    edit_confirmMod: "Excluir a página inteira de {name}, com todas as versões, imagens e arquivos? Isso não pode ser desfeito. Digite o id do mod ({id}) para confirmar.",
    edit_confirmDo: "Excluir",
    edit_cancel: "Cancelar",
    edit_lastVersion: "Esta é a única versão. Para removê-la, exclua a página inteira do mod.",
    edit_deleted: "Excluído. O site atualiza em alguns minutos.",
    edit_step_delete: "Verificando e excluindo (1 a 5 minutos)"
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
  up_licenseHint: "O padrão é MIT. Escolha a licença que corresponde ao seu mod.",
  up_licenseOther: "Outra (escrever)",
  up_iconHint: "Opcional. PNG, JPEG ou WEBP, quadrado, de pelo menos 8×8 px. Ícones pequenos são ampliados sem borrar. Sem ele, é usado o ícone do .hmod.",
  up_choose: "Escolher ficheiro",
  up_step_files: "A enviar os ficheiros",
  up_step_fork: "A preparar a sua cópia do repositório",
  up_step_pr: "A abrir o pull request",
  up_step_check: "A verificar e publicar (1 a 5 minutos)",
  up_timeout: "Ainda a verificar. Acompanhe pelo pull request.",
  footer: "Mods para o launcher Pojarush. Os ficheiros estão alojados no GitHub.",
  noModsUser: "Este utilizador ainda não publicou nenhum mod.",
  userNotFound: "Este utilizador não foi encontrado.",
  footer_report: "Encontrou um erro no site ou um mod que não devia estar aqui? Reporte no nosso servidor do Discord.",
  up_galleryHint: "Opcional, até {n} imagens. Toque na estrela de uma delas para a usar como banner no cartão do mod.",
  up_addImage: "Adicionar imagem",
  up_pojarush: "Funciona a partir da versão do Pojarush_Test3",
  up_tooSmall: "{file} é demasiado pequena. Use pelo menos 200×200 px.",
  up_iconSmall: "{file} é demasiado pequeno. O ícone precisa de pelo menos {n}×{n} px.",
  edit_login: "Inicie sessão para editar este mod.",
  edit_notOwner: "Só os proprietários deste mod o podem editar."
});

Object.assign(STRINGS, EXTRA);

const LANGS = { en: "English", pt_br: "Português (Brasil)", pt_pt: "Português (Portugal)", ...Object.fromEntries(Object.entries(EXTRA_LANGS).map(([k, v]) => [k, v.name])) };
const HTML_LANG = { en: "en", pt_br: "pt-BR", pt_pt: "pt-PT", ...Object.fromEntries(Object.entries(EXTRA_LANGS).map(([k, v]) => [k, v.tag])) };

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
  for (const raw of navigator.languages?.length ? navigator.languages : [navigator.language || "en"]) {
    const nav = raw.toLowerCase();
    if (nav === "pt-pt") return "pt_pt";
    if (nav.startsWith("pt")) return "pt_br";
    if (nav.startsWith("zh")) return "zh_cn";
    const base = nav.split("-")[0];
    if (base === "en") return "en";
    if (STRINGS[base]) return base;
  }
  return "en";
}
export const lang = detectLang();
document.documentElement.lang = HTML_LANG[lang] || "en";

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
  star: '<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.9l-5.2 2.8 1-5.9-4.3-4.1 5.9-.8z"/></svg>',
  starOutline: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.9l-5.2 2.8 1-5.9-4.3-4.1 5.9-.8z"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  dots: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>',
  edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z"/><path d="m13.5 6.5 4 4"/></svg>',
  link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3A4 4 0 0 0 11 18.7l1-1"/></svg>',
  flag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 21V4m0 0h11l-2 4 2 4H5"/></svg>',
  external: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>',
  image: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2.5"/><circle cx="9" cy="10" r="1.7"/><path d="m4 18 5-5 4 4 3-3 4 4"/></svg>',
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

export function creator(p) {
  return p.owners?.[0] || p.authors?.[0] || "";
}

export function avatarUrl(login, size = 96) {
  return `https://github.com/${encodeURIComponent(login)}.png?size=${size}`;
}

export function profileHref(login) {
  return `user.html?u=${encodeURIComponent(login)}`;
}

export function fmtMonth(iso) {
  return new Intl.DateTimeFormat(document.documentElement.lang, { month: "short", year: "numeric" }).format(new Date(iso));
}

export function prepareMod(p) {
  const l = localized(p);
  const updated = p.site?.updated || `${p.versions[0]?.published}T00:00:00Z`;
  return {
    id: p.id,
    name: p.name,
    summary: p.summary,
    localName: l.name,
    localSummary: l.summary,
    authors: p.authors || [],
    owners: p.owners || [],
    creator: creator(p),
    icon: iconUrl(p),
    banner: p.site?.banner || null,
    cats: p.site?.categories || [],
    side: p.versions[0]?.side || "client",
    code: Boolean(p.site?.code),
    games: [...new Set(p.versions.map(v => v.game).filter(Boolean))],
    downloads: p.downloads || 0,
    created: p.site?.created || updated,
    updated
  };
}

export function modCard(m) {
  const banner = m.banner ? `<img src="${esc(m.banner)}" alt="" loading="lazy">` : "";
  const tags = [sideTag(m.side), ...m.cats.map(c => `<span class="tag">${esc(t(`cat_${c}`))}</span>`), typeTag(m.code)].join(" ");
  const who = m.creator
    ? `<span class="by"><span class="who"><img class="mini-avatar" src="${esc(avatarUrl(m.creator, 48))}" alt="" loading="lazy">${esc(m.creator)}</span></span>`
    : "";
  return `<a class="card" href="mod.html?id=${encodeURIComponent(m.id)}">
    <div class="card-banner">${banner}</div>
    <div class="card-body">
      <img class="mod-icon" src="${esc(m.icon)}" alt="" loading="lazy">
      <h2 class="card-title">${esc(m.localName)}${who}</h2>
      <p class="card-summary">${esc(m.localSummary)}</p>
      <div class="card-tags chips">${tags}</div>
      <div class="card-stats">
        <span class="stat">${ICONS.download}${esc(t("downloads", { n: fmtNumber(m.downloads) }))}</span>
        <span class="stat">${ICONS.clock}${esc(t("updatedAgo", { t: fmtAgo(m.updated) }))}</span>
      </div>
    </div>
  </a>`;
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

export function sheet(html) {
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
    <a href="upload.html" class="upload" aria-label="${esc(t("nav_upload"))}"${cur("upload")}>${ICONS.plus}</a>
    <a href="${user ? esc(profileHref(user.login)) : "#"}" data-a="account" aria-label="${esc(t("nav_account"))}"${cur("profile")}>${user?.avatar_url
      ? `<img class="avatar" src="${esc(user.avatar_url)}" alt="">` : ICONS.user}</a>`;
  if (!user) nav.querySelector('[data-a="account"]').addEventListener("click", e => { e.preventDefault(); accountSheet(); });
  document.body.append(nav);

  const foot = document.createElement("footer");
  foot.className = "footer";
  foot.innerHTML = `<p>${esc(t("footer"))}</p>
    <p>${esc(t("footer_mojang"))}</p>
    <p>${esc(t("footer_rights"))}</p>
    <p>${esc(t("footer_report"))} <a data-a="discord" href="#" rel="noopener" target="_blank">${esc(t("footer_discord"))}</a></p>`;
  document.querySelector("main").after(foot);
  config().then(c => {
    const a = foot.querySelector('[data-a="discord"]');
    if (safeUrl(c.discord)) a.href = c.discord;
    else a.hidden = true;
  }).catch(() => {});
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
