use horizon_mod_sdk::{Mod, Registration, chat};

struct Hello {
    greeted: u32,
}

impl Mod for Hello {
    fn init() -> Result<(Self, Registration), String> {
        Ok((Hello { greeted: 0 }, Registration::new().command("hello").command("hellocount")))
    }

    fn command(&mut self, name: &str, args: &str) -> Result<Option<String>, String> {
        match name {
            "hello" => {
                self.greeted += 1;
                let who = if args.trim().is_empty() { "world" } else { args.trim() };
                chat::show(&format!("Hello, {who}!"));
                Ok(None)
            }
            "hellocount" => Ok(Some(format!("Greeted {} time(s)", self.greeted))),
            _ => Err("Unknown command".into()),
        }
    }
}

horizon_mod_sdk::export_mod!(Hello);
