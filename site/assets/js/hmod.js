function u16(v, o) { return v.getUint16(o, true); }
function u32(v, o) { return v.getUint32(o, true); }

function entries(buf) {
  const v = new DataView(buf);
  let eocd = -1;
  for (let i = buf.byteLength - 22; i >= Math.max(0, buf.byteLength - 65557); i--) {
    if (u32(v, i) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error("not a zip archive");
  const count = u16(v, eocd + 10);
  let p = u32(v, eocd + 16);
  const dec = new TextDecoder();
  const out = new Map();
  for (let n = 0; n < count; n++) {
    if (p + 46 > buf.byteLength || u32(v, p) !== 0x02014b50) throw new Error("broken zip directory");
    const method = u16(v, p + 10);
    const csize = u32(v, p + 20);
    const usize = u32(v, p + 24);
    const nlen = u16(v, p + 28), xlen = u16(v, p + 30), clen = u16(v, p + 32);
    const local = u32(v, p + 42);
    const name = dec.decode(new Uint8Array(buf, p + 46, nlen));
    out.set(name, { method, csize, usize, local });
    p += 46 + nlen + xlen + clen;
  }
  return out;
}

async function read(buf, e) {
  const v = new DataView(buf);
  if (u32(v, e.local) !== 0x04034b50) throw new Error("broken zip entry");
  const start = e.local + 30 + u16(v, e.local + 26) + u16(v, e.local + 28);
  const data = new Uint8Array(buf, start, e.csize);
  if (e.method === 0) return data;
  if (e.method !== 8) throw new Error("unsupported compression");
  const stream = new Blob([data]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

function parseValue(src, i) {
  const ws = () => { while (i < src.length && /[ \t\r\n]/.test(src[i])) i++; };
  const comment = () => { while (true) { ws(); if (src[i] === "#") { while (i < src.length && src[i] !== "\n") i++; } else break; } };
  if (src.startsWith('"""', i) || src.startsWith("'''", i)) {
    const q = src.slice(i, i + 3);
    const end = src.indexOf(q, i + 3);
    if (end < 0) throw new Error("unclosed string");
    let s = src.slice(i + 3, end).replace(/^\r?\n/, "");
    if (q === '"""') s = unescape(s);
    return [s, end + 3];
  }
  if (src[i] === '"') {
    let j = i + 1, s = "";
    while (j < src.length && src[j] !== '"') { if (src[j] === "\\") { s += src[j] + src[j + 1]; j += 2; } else s += src[j++]; }
    return [unescape(s), j + 1];
  }
  if (src[i] === "'") {
    const end = src.indexOf("'", i + 1);
    return [src.slice(i + 1, end), end + 1];
  }
  if (src[i] === "[") {
    const arr = [];
    i++;
    while (true) {
      comment();
      if (src[i] === "]") return [arr, i + 1];
      const [val, j] = parseValue(src, i);
      arr.push(val);
      i = j;
      comment();
      if (src[i] === ",") i++;
      else if (src[i] !== "]") throw new Error("bad array");
    }
  }
  if (src[i] === "{") {
    const obj = {};
    i++;
    while (true) {
      ws();
      if (src[i] === "}") return [obj, i + 1];
      const m = /^([A-Za-z0-9_-]+|"[^"]*")\s*=\s*/.exec(src.slice(i));
      if (!m) throw new Error("bad inline table");
      i += m[0].length;
      const [val, j] = parseValue(src, i);
      obj[m[1].replace(/"/g, "")] = val;
      i = j;
      ws();
      if (src[i] === ",") i++;
    }
  }
  const m = /^[^,\]\}\s#]+/.exec(src.slice(i));
  if (!m) throw new Error("bad value");
  const raw = m[0];
  const val = raw === "true" ? true : raw === "false" ? false : Number.isNaN(Number(raw)) ? raw : Number(raw);
  return [val, i + raw.length];
}

function unescape(s) {
  return s.replace(/\\(u[0-9a-fA-F]{4}|U[0-9a-fA-F]{8}|.)/g, (_, c) => {
    if (c[0] === "u" || c[0] === "U") return String.fromCodePoint(parseInt(c.slice(1), 16));
    return { n: "\n", t: "\t", r: "\r", '"': '"', "\\": "\\" }[c] ?? c;
  });
}

export function parseToml(src) {
  const root = {};
  let table = root;
  let i = 0;
  while (i < src.length) {
    const rest = src.slice(i);
    const blank = /^[ \t\r\n]+/.exec(rest);
    if (blank) { i += blank[0].length; continue; }
    if (rest[0] === "#") { const nl = rest.indexOf("\n"); i += nl < 0 ? rest.length : nl; continue; }
    const arrTable = /^\[\[\s*([^\]]+?)\s*\]\]/.exec(rest);
    const tableHead = /^\[\s*([^\]]+?)\s*\]/.exec(rest);
    if (arrTable || tableHead) {
      const path = (arrTable || tableHead)[1].split(".").map(s => s.trim().replace(/^"|"$/g, ""));
      let node = root;
      path.forEach((k, n) => {
        const last = n === path.length - 1;
        if (last && arrTable) {
          node[k] ??= [];
          const item = {};
          node[k].push(item);
          node = item;
        } else {
          node[k] ??= {};
          node = Array.isArray(node[k]) ? node[k][node[k].length - 1] : node[k];
        }
      });
      table = node;
      i += (arrTable || tableHead)[0].length;
      continue;
    }
    const kv = /^([A-Za-z0-9_.-]+|"[^"]*")\s*=\s*/.exec(rest);
    if (!kv) throw new Error(`horizon-mod.toml: cannot read "${rest.slice(0, 20)}"`);
    i += kv[0].length;
    const [val, j] = parseValue(src, i);
    const keys = kv[1].replace(/"/g, "").split(".");
    let node = table;
    keys.slice(0, -1).forEach(k => { node[k] ??= {}; node = node[k]; });
    node[keys[keys.length - 1]] = val;
    i = j;
  }
  return root;
}

export async function readHmod(file) {
  const buf = await file.arrayBuffer();
  const list = entries(buf);
  const man = list.get("horizon-mod.toml");
  if (!man) throw new Error("horizon-mod.toml missing");
  const manifest = parseToml(new TextDecoder().decode(await read(buf, man)));
  for (const k of ["id", "name", "version", "api"]) {
    if (typeof manifest[k] !== "string" || !manifest[k]) throw new Error(`horizon-mod.toml: ${k} missing`);
  }
  let icon = null;
  const iconPath = typeof manifest.icon === "string" ? manifest.icon : "";
  if (iconPath && list.has(iconPath)) {
    icon = new Blob([await read(buf, list.get(iconPath))], { type: "image/png" });
  }
  return { manifest, code: list.has("mod.wasm"), icon };
}
