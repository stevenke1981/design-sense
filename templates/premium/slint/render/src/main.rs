//! Render `demo.slint` to a PNG.
//! Usage: premium-render <out.png> [dark|light] [font-family]
//! `--features skia --no-default-features` uses Skia (needs a display, e.g. xvfb-run).
use slint::ComponentHandle;

slint::include_modules!();

const W: u32 = 1100;
const H: u32 = 760;

fn write_png(out: &str, w: u32, h: u32, rgb_or_rgba: &[u8], color: png::ColorType) -> Result<(), Box<dyn std::error::Error>> {
    let file = std::fs::File::create(out)?;
    let mut enc = png::Encoder::new(std::io::BufWriter::new(file), w, h);
    enc.set_color(color);
    enc.set_depth(png::BitDepth::Eight);
    enc.write_header()?.write_image_data(rgb_or_rgba)?;
    eprintln!("wrote {out}");
    Ok(())
}

fn setup(ui: &PremiumDemo, dark: bool, font: Option<String>) {
    ui.set_dark(dark);
    if let Some(f) = font {
        ui.set_ui_font(f.into());
    }
}

#[cfg(not(feature = "skia"))]
fn main() -> Result<(), Box<dyn std::error::Error>> {
    use slint::platform::software_renderer::{MinimalSoftwareWindow, RepaintBufferType};
    use slint::platform::{Platform, WindowAdapter};
    use std::rc::Rc;
    struct Headless(Rc<MinimalSoftwareWindow>);
    impl Platform for Headless {
        fn create_window_adapter(&self) -> Result<Rc<dyn WindowAdapter>, slint::PlatformError> {
            Ok(self.0.clone())
        }
    }
    let a: Vec<String> = std::env::args().collect();
    let out = a.get(1).cloned().unwrap_or_else(|| "demo.png".into());
    let window = MinimalSoftwareWindow::new(RepaintBufferType::NewBuffer);
    slint::platform::set_platform(Box::new(Headless(window.clone())))?;
    let ui = PremiumDemo::new()?;
    setup(&ui, a.get(2).map(|s| s != "light").unwrap_or(true), a.get(3).cloned());
    window.set_size(slint::PhysicalSize::new(W, H));
    ui.show()?;
    let mut buf = vec![slint::Rgb8Pixel::default(); (W * H) as usize];
    window.request_redraw();
    window.draw_if_needed(|r| {
        r.render(&mut buf, W as usize);
    });
    let bytes: Vec<u8> = buf.iter().flat_map(|p| [p.r, p.g, p.b]).collect();
    write_png(&out, W, H, &bytes, png::ColorType::Rgb)
}

#[cfg(feature = "skia")]
fn main() -> Result<(), Box<dyn std::error::Error>> {
    let a: Vec<String> = std::env::args().collect();
    let out = a.get(1).cloned().unwrap_or_else(|| "demo.png".into());
    let ui = PremiumDemo::new()?;
    setup(&ui, a.get(2).map(|s| s != "light").unwrap_or(true), a.get(3).cloned());
    ui.window().set_size(slint::PhysicalSize::new(W, H));
    let weak = ui.as_weak();
    let out2 = out.clone();
    slint::Timer::single_shot(std::time::Duration::from_millis(1500), move || {
        let ui = weak.upgrade().unwrap();
        match ui.window().take_snapshot() {
            Ok(img) => {
                let (w, h) = (img.width(), img.height());
                if let Err(e) = write_png(&out2, w, h, img.as_bytes(), png::ColorType::Rgba) {
                    eprintln!("png: {e}");
                }
            }
            Err(e) => eprintln!("snapshot failed: {e}"),
        }
        let _ = slint::quit_event_loop();
    });
    ui.run()?;
    Ok(())
}
