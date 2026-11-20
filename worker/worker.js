export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const allowed = origin === env.ALLOWED_ORIGIN;
    const cors = {
      "Access-Control-Allow-Origin": allowed ? origin : env.ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
      Vary: "Origin"
    };
    const reply = (body, status = 200) =>
      new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json", "Cache-Control": "no-store" } });

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    const url = new URL(request.url);
    if (url.pathname !== "/token" || request.method !== "POST") return reply({ error: "not found" }, 404);
    if (!allowed) return reply({ error: "origin not allowed" }, 403);

    let code;
    try {
      ({ code } = await request.json());
    } catch {
      return reply({ error: "bad request" }, 400);
    }
    if (typeof code !== "string" || !/^[A-Za-z0-9_-]{1,100}$/.test(code)) return reply({ error: "bad code" }, 400);

    const r = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json", "User-Agent": "pojarush-mods-auth" },
      body: JSON.stringify({ client_id: env.CLIENT_ID, client_secret: env.CLIENT_SECRET, code })
    });
    const data = await r.json().catch(() => ({}));
    if (!data.access_token) return reply({ error: data.error_description || data.error || "login failed" }, 400);
    return reply({ access_token: data.access_token, scope: data.scope });
  }
};
