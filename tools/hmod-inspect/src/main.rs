use horizon_mods::{
    Package,
    index::{self, Index, Kind},
};
use serde_json::{Value, json};
use std::{path::Path, process::ExitCode};

const USAGE: &str = "usage: hmod-inspect mod <file.hmod> [--icon-out <file.png>]
       hmod-inspect index <index.json>";

fn inspect(path: &Path, icon_out: Option<&str>) -> Result<Value, String> {
    let facts = index::inspect(&Kind::Mod, path)?;
    let Package { manifest: m, wasm } = Package::read(path)?;
    let mut icon = false;
    if let Some(out) = icon_out
        && !m.icon.is_empty()
        && let Some(bytes) = Package::read_file(path, &m.icon)
    {
        std::fs::write(out, bytes).map_err(|e| format!("{out}: {e}"))?;
        icon = true;
    }
    let translations: serde_json::Map<String, Value> = m
        .translations
        .iter()
        .map(|(code, t)| (code.clone(), json!({ "name": t.name, "description": t.description })))
        .collect();
    Ok(json!({
        "id": m.id,
        "name": m.name,
        "version": m.version,
        "description": m.description,
        "authors": m.authors,
        "license": m.license,
        "api": facts.api,
        "side": facts.side,
        "capabilities": facts.capabilities,
        "experimental": m.experimental,
        "api_level": facts.api_level,
        "minecraft": m.minecraft,
        "namespaces": m.namespaces,
        "contact": {
            "homepage": m.contact.homepage,
            "sources": m.contact.sources,
            "issues": m.contact.issues,
        },
        "translations": translations,
        "code": wasm.is_some(),
        "icon": icon,
    }))
}

fn run(args: &[String]) -> Result<Value, String> {
    match args.first().map(String::as_str) {
        Some("mod") => {
            let file = args.get(1).ok_or(USAGE)?;
            let icon_out = args
                .iter()
                .position(|a| a == "--icon-out")
                .and_then(|i| args.get(i + 1))
                .map(String::as_str);
            inspect(Path::new(file), icon_out)
        }
        Some("index") => {
            let file = args.get(1).ok_or(USAGE)?;
            let text = std::fs::read_to_string(file).map_err(|e| format!("{file}: {e}"))?;
            let index = Index::parse(&text)?;
            Ok(json!({ "projects": index.projects.len() }))
        }
        _ => Err(USAGE.into()),
    }
}

fn main() -> ExitCode {
    let args: Vec<String> = std::env::args().skip(1).collect();
    match run(&args) {
        Ok(v) => {
            println!("{}", json!({ "ok": true, "result": v }));
            ExitCode::SUCCESS
        }
        Err(e) => {
            println!("{}", json!({ "ok": false, "error": e }));
            ExitCode::FAILURE
        }
    }
}
