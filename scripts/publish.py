import hashlib
import io
import json
import os
import re
import shutil
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
IMAGE_RE = r"(png|jpe?g|webp)"
ICON_TARGET = 128
FILE_RE = re.compile(rf"^(icon|description-image|gallery-[1-3])\.{IMAGE_RE}$")
TEXT_FILES = {
    "submissions": {"mod.hmod", "submission.json", "description.md"},
    "edits": {"edit.json", "description.md"},
}
META_FILE = {"submissions": "submission.json", "edits": "edit.json"}
LIMITS = {
    "mod.hmod": CONFIG["maxModMiB"] * MIB,
    "submission.json": 64 * 1024,
    "edit.json": 64 * 1024,
    "description.md": 64 * 1024,
    "icon": CONFIG["maxIconMiB"] * MIB,
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
    roots = ("submissions/", "edits/")
    inside = [(f, st) for f, st in files if f.startswith(roots)]
    outside = [f for f, _ in files if not f.startswith(roots)]
    if not inside:
        return None
    if outside:
        if is_maintainer():
            return None
        raise Reject("Only files in `submissions/<id>/` or `edits/<id>/` can be sent.")
    kinds = {f.split("/")[0] for f, _ in inside}
    if len(kinds) != 1:
        raise Reject("Send either a submission or an edit, not both.")
    root = kinds.pop()
    folders = {f.split("/")[1] for f, _ in inside if f.count("/") == 2}
    if len(folders) != 1 or any(f.count("/") != 2 for f, _ in inside):
        raise Reject(f"One folder per pull request: `{root}/<id>/<file>`.")
    folder = folders.pop()
    picked = {}
    for path, status in inside:
        name = path.split("/")[2]
        if status not in ("added", "modified"):
            raise Reject(f"`{path}`: {status}")
        match = FILE_RE.match(name)
        if match:
            key = name.rsplit(".", 1)[0]
        elif name in TEXT_FILES[root]:
            key = name
        else:
            raise Reject(f"`{name}` is not an accepted file.")
        if key in picked:
            raise Reject(f"More than one `{key}`.")
        picked[key] = (path, name)
    if root == "submissions" and "mod.hmod" not in picked:
        raise Reject("`mod.hmod` is missing.")
    data = {}
    for key, (path, name) in picked.items():
        limit = LIMITS.get(key) or (LIMITS["icon"] if key == "icon" else CONFIG["maxImageMiB"] * MIB)
        data[key] = (name, blob(path, limit))
    return root, folder, data


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
    if min(img.size) < CONFIG["minIconPx"]:
        raise Reject(f"The icon is too small. Use at least {CONFIG['minIconPx']}×{CONFIG['minIconPx']} px.")
    side = max(img.size)
    if side < ICON_TARGET:
        factor = -(-ICON_TARGET // side)
        img = img.resize((img.width * factor, img.height * factor), Image.NEAREST)
    elif side > 256:
        scale = 256 / side
        size = (max(1, round(img.width * scale)), max(1, round(img.height * scale)))
        img = img.resize(size, Image.LANCZOS)
    out.parent.mkdir(parents=True, exist_ok=True)
    img.save(out, "PNG", optimize=True)


def webp_bytes(img, width):
    img = img.convert("RGBA" if img.mode in ("RGBA", "LA", "P") else "RGB")
    if img.width > width:
        img = img.resize((width, max(1, round(img.height * width / img.width))), Image.LANCZOS)
    buf = io.BytesIO()
    img.save(buf, "WEBP", quality=82, method=6)
    return buf.getvalue()


def digest(data):
    return hashlib.sha256(data).hexdigest()[:10]


def read_meta(data, root):
    key = META_FILE[root]
    if key not in data:
        return {}
    try:
        meta = json.loads(data[key][1].decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError):
        raise Reject(f"`{key}` is not valid JSON.")
    if not isinstance(meta, dict):
        raise Reject(f"`{key}` must be an object.")
    return meta


def sync_files(folder, pattern, keep):
    if not folder.exists():
        return
    for f in folder.glob(pattern):
        if f.name not in keep:
            f.unlink()


def apply_media(mod_id, site_old, data, meta):
    assets = SITE / "mods" / mod_id
    old_gallery = list(site_old.get("gallery") or [])
    by_name = {Path(p).name: p for p in old_gallery}
    new_files = {}

    if "gallery" in meta:
        spec = meta["gallery"]
        if not isinstance(spec, list) or len(spec) > CONFIG["maxGalleryImages"]:
            raise Reject(f"The gallery accepts up to {CONFIG['maxGalleryImages']} images.")
        gallery = []
        for entry in spec:
            if not isinstance(entry, dict):
                raise Reject("Invalid gallery entry.")
            if "keep" in entry:
                path = by_name.get(entry["keep"])
                if not path:
                    raise Reject("A gallery image to keep does not exist anymore.")
            elif "file" in entry:
                stem = str(entry["file"]).rsplit(".", 1)[0]
                if not stem.startswith("gallery-") or stem not in data:
                    raise Reject("A gallery image is missing from the pull request.")
                img = open_image(data[stem][1], "gallery image")
                if min(img.size) < 200:
                    raise Reject("Gallery images must be at least 200 px on each side.")
                raw = webp_bytes(img, 1600)
                name = f"g-{digest(raw)}.webp"
                new_files[name] = raw
                path = f"mods/{mod_id}/{name}"
            else:
                raise Reject("Invalid gallery entry.")
            if path not in gallery:
                gallery.append(path)
    else:
        gallery = old_gallery

    if "featured" in meta:
        index = meta["featured"]
        if index is None:
            featured = None
        elif isinstance(index, int) and not isinstance(index, bool) and 0 <= index < len(gallery):
            featured = gallery[index]
        else:
            raise Reject("Invalid featured gallery image.")
    else:
        featured = site_old.get("featured")
        if featured not in gallery:
            featured = None

    banner_name = None
    banner_raw = None
    if featured:
        name = Path(featured).name
        old_banner = site_old.get("banner")
        if featured == site_old.get("featured") and old_banner and re.search(r"/banner-[0-9a-f]{10}\.webp$", old_banner):
            banner_name = Path(old_banner).name
        else:
            source = new_files.get(name)
            if source is None:
                source = (SITE / featured).read_bytes()
            banner_raw = webp_bytes(open_image(source, "gallery image"), 960)
            banner_name = f"banner-{digest(banner_raw)}.webp"

    desc_rel = site_old.get("description_image")
    desc_raw = None
    if "description_image" in meta:
        spec = meta["description_image"]
        if spec is None:
            desc_rel = None
        elif isinstance(spec, dict) and spec.get("keep"):
            pass
        elif isinstance(spec, dict) and spec.get("file"):
            stem = str(spec["file"]).rsplit(".", 1)[0]
            if stem != "description-image" or stem not in data:
                raise Reject("The description image is missing from the pull request.")
            img = open_image(data[stem][1], "description image")
            if min(img.size) < 100:
                raise Reject("The description image must be at least 100 px on each side.")
            desc_raw = webp_bytes(img, 1280)
            desc_rel = f"mods/{mod_id}/d-{digest(desc_raw)}.webp"
        else:
            raise Reject("Invalid description image.")

    if gallery or featured or desc_rel or new_files or "gallery" in meta or desc_raw:
        assets.mkdir(parents=True, exist_ok=True)
    for name, raw in new_files.items():
        (assets / name).write_bytes(raw)
    if banner_raw:
        (assets / banner_name).write_bytes(banner_raw)
    if desc_raw:
        (SITE / desc_rel).write_bytes(desc_raw)
    sync_files(assets, "g-*.webp", {Path(p).name for p in gallery})
    sync_files(assets, "banner*.webp", {banner_name} if banner_name else set())
    sync_files(assets, "d-*.webp", {Path(desc_rel).name} if desc_rel else set())
    return {
        "gallery": gallery,
        "featured": featured,
        "banner": f"mods/{mod_id}/{banner_name}" if banner_name else None,
        "description_image": desc_rel,
    }


def read_description(data):
    if "description.md" not in data:
        return None
    try:
        return clean(data["description.md"][1].decode("utf-8"), 20000)
    except UnicodeDecodeError:
        raise Reject("`description.md` must be UTF-8 text.")


def pick_categories(meta, old):
    categories = meta.get("categories")
    if isinstance(categories, list):
        return [c for c in dict.fromkeys(categories) if c in CONFIG["categories"]][: CONFIG["maxCategories"]]
    return old


def validate_index(tmp):
    check = tmp / "index.json"
    write_json(check, {"schema": 1, "generated": "", "projects": load_projects(), "revoked": []})
    proc = subprocess.run([INSPECT, "index", str(check)], capture_output=True, text=True)
    if not json.loads(proc.stdout or "{}").get("ok"):
        raise Reject(f"Index check failed: {proc.stdout.strip()}")


def edit(mod_id, data, meta):
    if not ID_RE.match(mod_id):
        raise Reject(f"Invalid id `{mod_id}`.")
    reg_path = REGISTRY / f"{mod_id}.json"
    if not reg_path.exists():
        raise Reject(f"`{mod_id}` does not exist.")
    existing = json.loads(reg_path.read_text(encoding="utf-8"))
    if AUTHOR.lower() not in [o.lower() for o in existing["owners"]]:
        raise Reject(f"`{mod_id}` belongs to {', '.join('@' + o for o in existing['owners'])}.")
    now = datetime.now(timezone.utc).replace(microsecond=0)

    def tag_of(v):
        return v["file"]["url"].rsplit("/", 2)[-2]

    if meta.get("delete_mod") is True:
        reg_path.unlink()
        shutil.rmtree(SITE / "mods" / mod_id, ignore_errors=True)
        with tempfile.TemporaryDirectory() as tmp:
            validate_index(Path(tmp))
        output("result", "published")
        output("mod_id", mod_id)
        output("message", f"{existing['name']} (deleted)")
        output("page", SITE_URL)
        output("delete_tags", " ".join(tag_of(v) for v in existing["versions"]))
        return

    site = dict(existing.get("site", {}))
    delete_tags = []
    if "delete_versions" in meta:
        wanted = meta["delete_versions"]
        if not isinstance(wanted, list) or not all(isinstance(x, str) for x in wanted):
            raise Reject("Invalid list of versions to delete.")
        known = {v["version"] for v in existing["versions"]}
        if not set(wanted) <= known:
            raise Reject("A version to delete does not exist.")
        if set(wanted) >= known:
            raise Reject("The only version cannot be deleted. Delete the whole mod page instead.")
        delete_tags = [tag_of(v) for v in existing["versions"] if v["version"] in wanted]
        existing["versions"] = [v for v in existing["versions"] if v["version"] not in wanted]
        site["min_pojarush"] = {k: x for k, x in site.get("min_pojarush", {}).items() if k not in wanted}
    if "summary" in meta:
        summary = clean(meta["summary"], 160, True)
        if not summary:
            raise Reject("A short description (summary) is required.")
        existing["summary"] = summary
    if "source" in meta:
        existing["source"] = meta["source"] if https(meta["source"]) else f"{SITE_URL}mod.html?id={mod_id}"
    description = read_description(data)
    if description is not None:
        existing["description"] = description
    site["categories"] = pick_categories(meta, site.get("categories", []))
    with tempfile.TemporaryDirectory() as tmp:
        tmp = Path(tmp)
        assets = SITE / "mods" / mod_id
        if "icon" in data:
            save_icon(data["icon"][1], assets / "icon.png")
            site["icon_file"] = f"mods/{mod_id}/icon.png"
            existing["icon"] = SITE_URL + site["icon_file"]
        site.update(apply_media(mod_id, site, data, meta))
        site["edited"] = now.isoformat().replace("+00:00", "Z")
        existing["site"] = site
        write_json(reg_path, existing)
        validate_index(tmp)
    output("result", "published")
    output("mod_id", mod_id)
    output("message", f"{existing['name']} ({'versions deleted' if delete_tags else 'edit'})")
    output("page", f"{SITE_URL}mod.html?id={mod_id}")
    output("delete_tags", " ".join(delete_tags))


def main():
    collected = collect()
    if collected is None:
        output("result", "skip")
        return
    root, folder, data = collected
    meta = read_meta(data, root)
    if root == "edits":
        edit(folder, data, meta)
        return
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

        pojarush = clean(meta.get("pojarush"), 20, True)
        if pojarush not in CONFIG["pojarushVersions"]:
            raise Reject("Choose the Pojarush_Test3 version this mod works from.")

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
        categories = pick_categories(meta, site_old.get("categories", []))
        description = read_description(data)
        if description is None:
            description = existing.get("description", "") if existing else clean(m["description"], 20000)
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
        media = apply_media(mod_id, site_old, data, meta)

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
                **media,
                "min_pojarush": {**site_old.get("min_pojarush", {}), version: pojarush},
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

        validate_index(tmp)

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
