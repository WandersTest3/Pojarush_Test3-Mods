import json
import os
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SITE = ROOT / "site"
REGISTRY = ROOT / "registry"
CONFIG = json.loads((SITE / "config.json").read_text(encoding="utf-8"))

ID_RE = re.compile(r"^[a-z0-9_]{1,64}$")
VERSION_RE = re.compile(r"^[A-Za-z0-9._+-]{1,64}$")
CONTROL_RE = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")


def clean(text, limit, single_line=False):
    if not isinstance(text, str):
        return ""
    text = CONTROL_RE.sub("", text.replace("\r\n", "\n").replace("\r", "\n"))
    if single_line:
        text = " ".join(text.split())
    return text.strip()[:limit]


def https(url):
    return isinstance(url, str) and re.match(r"^https://[^\s<>\"']+$", url) is not None and len(url) <= 500


def run(args, **kw):
    return subprocess.run(args, check=True, text=True, capture_output=True, **kw).stdout


def load_projects():
    projects = []
    for path in sorted(REGISTRY.glob("*.json")):
        if path.name == "revoked.json":
            continue
        projects.append(json.loads(path.read_text(encoding="utf-8")))
    return projects


def load_revoked():
    path = REGISTRY / "revoked.json"
    if path.exists():
        return json.loads(path.read_text(encoding="utf-8"))
    return []


def write_json(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def make_like_issue(mod_id):
    repo = os.environ.get("REPO")
    if not repo:
        return None
    page = f"{CONFIG['siteUrl']}mod.html?id={mod_id}"
    try:
        url = run(["gh", "issue", "create", "-R", repo, "--title", f"Likes: {mod_id}",
                   "--body", f"Heart reactions on this issue are the likes of {page}. Please do not comment here."]).strip()
        number = int(url.rstrip("/").rsplit("/", 1)[1])
    except Exception:
        return None
    subprocess.run(["gh", "issue", "close", str(number), "-R", repo, "-r", "not planned"],
                   capture_output=True, text=True)
    return number
