from common import REGISTRY, make_like_issue, write_json
import json


def main():
    for path in sorted(REGISTRY.glob("*.json")):
        if path.name == "revoked.json":
            continue
        project = json.loads(path.read_text(encoding="utf-8"))
        site = project.setdefault("site", {})
        if site.get("like_issue"):
            continue
        number = make_like_issue(project["id"])
        if number:
            site["like_issue"] = number
            write_json(path, project)
            print(f"{project['id']}: issue #{number}")


if __name__ == "__main__":
    main()
