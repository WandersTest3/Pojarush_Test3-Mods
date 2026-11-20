import hashlib
import io
import json
import os
import subprocess
import sys
import tempfile
from datetime import datetime, timezone
from pathlib import Path

from PIL import Image

from common import (
    CONFIG, ID_RE, REGISTRY, ROOT, SITE, VERSION_RE, clean, https, load_projects, run, write_json,
)

Image.MAX_IMAGE_PIXELS = 40_000_000

MIB = 1 << 20
IMAGE_EXT = ("png", "jpg", "jpeg", "webp")
ALLOWED = {"mod.hmod", "submission.json", "description.md"} | {
    f"{kind}.{ext}" for kind in ("icon", "banner") for ext in IMAGE_EXT
}
LIMITS = {
    "mod.hmod": CONFIG["maxModMiB"] * MIB,
    "submission.json": 64 * 1024,
    "description.md": 64 * 1024,
    "icon": CONFIG["maxIconMiB"] * MIB,
    "banner": CONFIG["maxBannerMiB"] * MIB,
}

REPO = os.environ["REPO"]
PR = os.environ["PR_NUMBER"]
AUTHOR = os.environ["PR_AUTHOR"]
HEAD_SHA = os.environ["HEAD_SHA"]
INSPECT = os.environ["INSPECT"]
SITE_URL = CONFIG["siteUrl"]


class Reject(Exception):
    pass


def output(key, value):
    path = os.environ.get("GITHUB_OUTPUT")
    if path:
        with open(path, "a", encoding="utf-8") as f:
            f.write(f"{key}<<__EOF__\n{value}\n__EOF__\n")
    else:
        print(f"{key}={value}")


def pr_files():
    text = run(["gh", "api", f"repos/{REPO}/pulls/{PR}/files", "--paginate",
                "--jq", ".[] | [.filename, .status] | @tsv"])
    return [line.split("\t") for line in text.splitlines() if line.strip()]


def is_maintainer():
    try:
        perm = run(["gh", "api", f"repos/{REPO}/collaborators/{AUTHOR}/permission", "--jq", ".permission"]).strip()
    except subprocess.CalledProcessError:
        return False
    return perm in ("admin", "maintain", "write")


def blob(path, limit):
    size = int(run(["git", "cat-file", "-s", f"{HEAD_SHA}:{path}"]).strip())
    if size > limit:
        raise Reject(f"`{path}`: {size / MIB:.2f} MiB > {limit / MIB:.0f} MiB")
    data = subprocess.run(["git", "cat-file", "blob", f"{HEAD_SHA}:{path}"], check=True, capture_output=True).stdout
    if len(data) != size:
        raise Reject(f"`{path}`: unreadable")
    return data


def collect():
    files = pr_files()
    inside = [(f, s) for f, s in files if f.startswith("submissions/")]
    outside = [f for f, _ in files if not f.startswith("submissions/")]
    if not inside:
        return None
    if outside:
        if is_maintainer():
            return None
        raise Reject("Only files in `submissions/<id>/` can be sent.")
    folders = {f.split("/")[1] for f, _ in inside if f.count("/") == 2}
    if len(folders) != 1 or any(f.count("/") != 2 for f, _ in inside):
        raise Reject("One submission folder per pull request: `submissions/<id>/<file>`.")
    folder = folders.pop()
    picked = {}
    for path, status in inside:
        name = path.split("/")[2]
        if status not in ("added", "modified"):
            raise Reject(f"`{path}`: {status}")
        if name not in ALLOWED:
            raise Reject(f"`{name}` is not an accepted file.")
        kind = name.split(".")[0]
        if kind in picked and kind in ("icon", "banner"):
            raise Reject(f"More than one {kind}.")
        picked[kind if kind in ("icon", "banner") else name] = (path, name)
    if "mod.hmod" not in picked:
        raise Reject("`mod.hmod` is missing.")
    data = {}
    for key, (path, name) in picked.items():
        data[key] = (name, blob(path, LIMITS.get(key, LIMITS.get(name))))
    return folder, data


def inspect(hmod_path, icon_path):
    proc = subprocess.run([INSPECT, "mod", str(hmod_path), "--icon-out", str(icon_path)],
                          capture_output=True, text=True)
    try:
        result = json.loads(proc.stdout)
    except json.JSONDecodeError:
        raise Reject("The .hmod could not be read.")
    if not result.get("ok"):
        raise Reject(f"Invalid .hmod: {result.get('error')}")
    return result["result"]


def open_image(data, label):
    try:
        img = Image.open(io.BytesIO(data))
        img.verify()
        img = Image.open(io.BytesIO(data))
        img.load()
    except Exception:
        raise Reject(f"The {label} is not a valid PNG, JPEG or WEBP image.")
    if img.format not in ("PNG", "JPEG", "WEBP"):
        raise Reject(f"The {label} must be PNG, JPEG or WEBP.")
    return img


def save_icon(data, out):
    img = open_image(data, "icon").convert("RGBA")
    side = max(img.size)
    if side > 256:
        scale = 256 / side
        size = (max(1, round(img.width * scale)), max(1, round(img.height * scale)))
        img = img.resize(size, Image.LANCZOS)
    out.parent.mkdir(parents=True, exist_ok=True)
    img.save(out, "PNG", optimize=True)


def save_banner(data, out):
    img = open_image(data, "banner")
    img = img.convert("RGBA" if img.mode in ("RGBA", "LA", "P") else "RGB")
    if img.width < 320 or img.height < 80:
        raise Reject("The banner must be at least 320x80.")
    if img.width > 1280:
        img = img.resize((1280, max(1, round(img.height * 1280 / img.width))), Image.LANCZOS)
    out.parent.mkdir(parents=True, exist_ok=True)
    img.save(out, "WEBP", quality=82, method=6)


def submission_meta(data):
    if "submission.json" not in data:
        return {}
    try:
        meta = json.loads(data["submission.json"][1].decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError):
        raise Reject("`submission.json` is not valid JSON.")
    if not isinstance(meta, dict):
        raise Reject("`submission.json` must be an object.")
    return meta


def main():
    collected = collect()
    if collected is None:
        output("result", "skip")
        return
    folder, data = collected
    meta = submission_meta(data)
    now = datetime.now(timezone.utc).replace(microsecond=0)

    with tempfile.TemporaryDirectory() as tmp:
        tmp = Path(tmp)
        hmod_bytes = data["mod.hmod"][1]
        hmod = tmp / "mod.hmod"
        hmod.write_bytes(hmod_bytes)
        icon_from_mod = tmp / "icon-from-mod.png"
        m = inspect(hmod, icon_from_mod)

        mod_id, version = m["id"], m["version"]
        if not ID_RE.match(mod_id):
            raise Reject(f"Invalid id `{mod_id}`.")
        if folder != mod_id:
            raise Reject(f"The folder `submissions/{folder}` must be named after the mod id `{mod_id}`.")
        if not VERSION_RE.match(version):
            raise Reject(f"Version `{version}`: use only letters, digits, `.`, `-`, `_` and `+`.")

        reg_path = REGISTRY / f"{mod_id}.json"
        existing = json.loads(reg_path.read_text(encoding="utf-8")) if reg_path.exists() else None
        if existing:
            if AUTHOR.lower() not in [o.lower() for o in existing["owners"]]:
                raise Reject(f"`{mod_id}` belongs to {', '.join('@' + o for o in existing['owners'])}.")
            if any(v["version"] == version for v in existing["versions"]):
                raise Reject(f"Version `{version}` of `{mod_id}` is already published. Raise the version in `horizon-mod.toml`.")
        tag = f"{mod_id}-{version}"
        if subprocess.run(["gh", "release", "view", tag, "-R", REPO], capture_output=True).returncode == 0:
            raise Reject(f"The release `{tag}` already exists.")

        site_old = (existing or {}).get("site", {})
        name = clean(m["name"], 80, True)
        if not name:
            raise Reject("The mod has no name.")
        summary = clean(meta.get("summary"), 160, True)
        if not summary:
            summary = existing["summary"] if existing else clean(m["description"], 160, True)
        if not summary:
            raise Reject("A short description (summary) is required.")
        license_ = clean(m["license"], 100, True) or clean(meta.get("license"), 100, True)
        if not license_ and existing:
            license_ = existing["license"]
        if not license_:
            raise Reject("A license is required: set `license` in `horizon-mod.toml` or pick one when uploading.")
        contact = m["contact"]
        source = next((u for u in (meta.get("source"), contact["sources"], contact["homepage"]) if https(u)), None)
        if not source:
            source = existing["source"] if existing else f"{SITE_URL}mod.html?id={mod_id}"
        categories = meta.get("categories")
        if isinstance(categories, list):
            categories = [c for c in dict.fromkeys(categories) if c in CONFIG["categories"]][: CONFIG["maxCategories"]]
        else:
            categories = site_old.get("categories", [])
        if "description.md" in data:
            try:
                description = clean(data["description.md"][1].decode("utf-8"), 20000)
            except UnicodeDecodeError:
                raise Reject("`description.md` must be UTF-8 text.")
        elif existing:
            description = existing.get("description", "")
        else:
            description = clean(m["description"], 20000)
        changelog = clean(meta.get("changelog"), 6000)

        assets = SITE / "mods" / mod_id
        icon_rel = site_old.get("icon_file")
        if "icon" in data:
            save_icon(data["icon"][1], assets / "icon.png")
            icon_rel = f"mods/{mod_id}/icon.png"
        elif m["icon"] and icon_from_mod.exists():
            try:
                save_icon(icon_from_mod.read_bytes(), assets / "icon.png")
                icon_rel = f"mods/{mod_id}/icon.png"
            except Reject:
                pass
        banner_rel = site_old.get("banner")
        if "banner" in data:
            save_banner(data["banner"][1], assets / "banner.webp")
            banner_rel = f"mods/{mod_id}/banner.webp"

        file_name = f"{tag}.hmod"
        asset = tmp / file_name
        asset.write_bytes(hmod_bytes)
        entry = {
            "version": version,
            "published": now.date().isoformat(),
            **({"changelog": changelog} if changelog else {}),
            "api": m["api"],
            "side": m["side"] or "client",
            **({"capabilities": m["capabilities"]} if m["capabilities"] else {}),
            "game": clean(m["minecraft"], 40, True) or CONFIG["defaultGame"],
            "file": {
                "name": file_name,
                "url": f"https://github.com/{REPO}/releases/download/{tag}/{file_name}",
                "size": len(hmod_bytes),
                "sha256": hashlib.sha256(hmod_bytes).hexdigest(),
            },
        }
        project = {
            "id": mod_id,
            "kind": "mod",
            "name": name,
            "summary": summary,
            "description": description,
            "authors": [clean(a, 60, True) for a in m["authors"] if clean(a, 60, True)][:20] or [AUTHOR],
            "owners": existing["owners"] if existing else [AUTHOR],
            "license": license_,
            "source": source,
            **({"icon": SITE_URL + icon_rel} if icon_rel else {}),
            "versions": [entry] + (existing["versions"] if existing else []),
            "site": {
                "categories": categories,
                "icon_file": icon_rel,
                "banner": banner_rel,
                "code": bool(m["code"]),
                "contact": {k: v for k, v in contact.items() if https(v)},
                "translations": {
                    code: {"name": clean(t.get("name"), 80, True), "summary": clean(t.get("description"), 160, True)}
                    for code, t in list(m["translations"].items())[:40]
                    if isinstance(t, dict)
                },
                "created": site_old.get("created", now.isoformat().replace("+00:00", "Z")),
                "updated": now.isoformat().replace("+00:00", "Z"),
            },
        }
        write_json(reg_path, project)

        check = tmp / "index.json"
        write_json(check, {"schema": 1, "generated": "", "projects": load_projects(), "revoked": []})
        proc = subprocess.run([INSPECT, "index", str(check)], capture_output=True, text=True)
        if not json.loads(proc.stdout or "{}").get("ok"):
            raise Reject(f"Index check failed: {proc.stdout.strip()}")

        notes = changelog or f"{name} {version}"
        run(["gh", "release", "create", tag, str(asset), "-R", REPO, "--target", "main",
             "--title", f"{name} {version}", "--notes", notes])

    output("result", "published")
    output("mod_id", mod_id)
    output("tag", tag)
    output("message", f"{name} {version}")
    output("page", f"{SITE_URL}mod.html?id={mod_id}")


if __name__ == "__main__":
    try:
        main()
    except Reject as e:
        output("result", "rejected")
        output("error", str(e))
        sys.exit(0)
