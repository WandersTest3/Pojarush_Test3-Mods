import json
import os
import shutil
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

from common import CONFIG, ROOT, SITE, load_projects, load_revoked, run, write_json


def release_downloads(repo):
    counts = {}
    if not os.environ.get("GH_TOKEN"):
        return counts
    text = run(["gh", "api", f"repos/{repo}/releases", "--paginate",
                "--jq", ".[] | .tag_name as $t | .assets[] | [$t, .name, .download_count] | @tsv"])
    for line in text.splitlines():
        tag, name, count = line.split("\t")
        counts[(tag, name)] = int(count)
    return counts


def main():
    out = Path(sys.argv[1] if len(sys.argv) > 1 else ROOT / "_site")
    if out.exists():
        shutil.rmtree(out)
    shutil.copytree(SITE, out)
    counts = release_downloads(CONFIG["repo"])
    projects = []
    for p in load_projects():
        per_version = {}
        total = 0
        for v in p["versions"]:
            tag = v["file"]["url"].rsplit("/", 2)[-2]
            n = counts.get((tag, v["file"]["name"]), 0)
            per_version[v["version"]] = n
            total += n
        p.pop("downloads", None)
        if total:
            p["downloads"] = total
        p.setdefault("site", {})["version_downloads"] = per_version
        projects.append(p)
    projects.sort(key=lambda p: p["id"])
    index = {
        "schema": 1,
        "generated": datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z"),
        "projects": projects,
        "revoked": load_revoked(),
    }
    write_json(out / "index.json", index)
    inspect = os.environ.get("INSPECT")
    if inspect:
        proc = subprocess.run([inspect, "index", str(out / "index.json")], capture_output=True, text=True)
        result = json.loads(proc.stdout or "{}")
        if not result.get("ok"):
            print(proc.stdout, file=sys.stderr)
            sys.exit(1)
    (out / ".nojekyll").write_text("")
    print(f"{len(projects)} mod(s) -> {out}")


if __name__ == "__main__":
    main()
