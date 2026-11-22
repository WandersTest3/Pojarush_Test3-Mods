use horizon_mod_sdk::{
    Mod, Registration, render::{self, Corner, FillShape, Point, Rect, Shape, TextShape}, storage,
    ui::{self, ButtonWidget, WidgetV2 as Widget},
};

const FILE: &str = "timer.txt";
const TICKS_PER_SECOND: u64 = 20;
const CORNERS: [Corner; 4] = [Corner::TopLeft, Corner::TopRight, Corner::BottomLeft, Corner::BottomRight];
const CORNER_NAMES: [&str; 4] = ["Top left", "Top right", "Bottom left", "Bottom right"];
const TOGGLE: u32 = 0;
const CORNER: u32 = 1;

struct Timer {
    enabled: bool,
    corner: usize,
    ticks: u64,
    shown: String,
}

impl Timer {
    fn load() -> Self {
        let mut t = Timer { enabled: true, corner: 0, ticks: 0, shown: String::new() };
        if let Some(text) = storage::get(FILE).and_then(|v| String::from_utf8(v).ok()) {
            for line in text.lines() {
                match line.split_once('=') {
                    Some(("enabled", v)) => t.enabled = v.trim() == "1",
                    Some(("corner", v)) => t.corner = v.trim().parse::<usize>().unwrap_or(0).min(3),
                    _ => {}
                }
            }
        }
        t
    }

    fn save(&self) {
        let _ = storage::set(FILE, format!("enabled={}\ncorner={}\n", u8::from(self.enabled), self.corner).as_bytes());
    }

    fn clock(&self) -> String {
        let s = self.ticks / TICKS_PER_SECOND;
        format!("{:02}:{:02}:{:02}", s / 3600, s / 60 % 60, s % 60)
    }

    fn draw(&mut self) {
        if !self.enabled {
            render::clear_corner();
            self.shown.clear();
            return;
        }
        let text = format!("Session {}", self.clock());
        if text == self.shown {
            return;
        }
        let w = render::text_width(&text) + 6.0;
        let shapes = [
            Shape::Fill(FillShape { rect: Rect { x: 0.0, y: 0.0, w, h: 13.0 }, color: 0x80000000 }),
            Shape::Text(TextShape { text: text.clone(), at: Point { x: 3.0, y: 3.0 }, color: 0xFFFFFF, centered: false, shadow: true }),
        ];
        render::set_corner(CORNERS[self.corner], w, 13.0, &shapes);
        self.shown = text;
    }

    fn page(&self) {
        let on = if self.enabled { "On" } else { "Off" };
        ui::set_settings_v2(&[
            Widget::Button(ButtonWidget { id: TOGGLE, label: format!("Timer: {on}") }),
            Widget::Button(ButtonWidget { id: CORNER, label: format!("Corner: {}", CORNER_NAMES[self.corner]) }),
        ]);
    }
}

impl Mod for Timer {
    fn init() -> Result<(Self, Registration), String> {
        Ok((Timer::load(), Registration::new().on_tick().command("timer")))
    }

    fn tick(&mut self, _tick: u64) {
        self.ticks += 1;
        self.draw();
    }

    fn command(&mut self, _name: &str, args: &str) -> Result<Option<String>, String> {
        if args.trim() == "reset" {
            self.ticks = 0;
            self.shown.clear();
            return Ok(Some("Timer reset".into()));
        }
        Ok(Some(format!("Session time {}", self.clock())))
    }

    fn ui_settings_opened(&mut self) {
        self.page();
    }

    fn ui_select(&mut self, id: u32, _row: u32) {
        match id {
            TOGGLE => self.enabled = !self.enabled,
            CORNER => self.corner = (self.corner + 1) % CORNERS.len(),
            _ => return,
        }
        self.save();
        self.shown.clear();
        self.draw();
        self.page();
    }
}

horizon_mod_sdk::export_mod!(Timer);
