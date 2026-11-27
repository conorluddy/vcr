// One red square turns 45 degrees in one second; frames are saved and three
// are captured at fixed times, so a run can be checked frame by frame.
use std::f64::consts::PI;

use ranim::{
    anims::rotating::RotatingAnim,
    color::palettes::manim,
    glam::DVec3,
    items::vitem::{geometry::Square, VItem},
    prelude::*,
};

#[scene(clear_color = "#333333ff")]
#[output(dir = "./out", width = 320, height = 180, fps = 12, save_frames = true)]
fn turning_square(r: &mut RanimScene) {
    let _camera = r.insert(CameraFrame::default());
    let mut square: VItem = Square::new(2.0)
        .with(|s| {
            s.set_color(manim::RED_C);
        })
        .into();
    r.insert_with(|t| {
        t.play(square.rotating(PI / 4.0, DVec3::Z).with_duration(1.0));
    });
    r.insert_time_mark(0.0, TimeMark::Capture("at-0000.png".to_string()));
    r.insert_time_mark(0.5, TimeMark::Capture("at-0500.png".to_string()));
    r.insert_time_mark(0.9, TimeMark::Capture("at-0900.png".to_string()));
}

fn main() {
    ranim::cmd::render_scene(&turning_square::scene(), 2);
}
