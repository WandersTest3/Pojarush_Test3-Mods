use horizon_mod_sdk::{
    Mod, Registration,
    hud::{self, Corner, Line},
    input::{self, Event},
};

const KEY: &str = "toggle_line";

struct Toggle {
    on: bool,
}

impl Toggle {
    fn draw(&self) {
        if self.on {
            hud::set_panel(Corner::TopRight, &[Line { text: "Toggle is ON".into(), color: 0x55FF55 }]);
        } else {
            hud::clear();
        }
    }
}

impl Mod for Toggle {
    fn init() -> Result<(Self, Registration), String> {
        input::register_key(KEY, "Toggle the HUD line", "key.keyboard.j")?;
        Ok((Toggle { on: false }, Registration::new().on_tick()))
    }

    fn tick(&mut self, _tick: u64) {
        for event in input::poll() {
            if let Event::KeyDown(name) = event {
                if name == KEY {
                    self.on = !self.on;
                    self.draw();
                }
            }
        }
    }
}

horizon_mod_sdk::export_mod!(Toggle);
