//! Draws a fixed scene with vello_cpu on a transparent 320x240 canvas, writes a PNG
//! and prints one JSON line of facts (dimensions, pixel probes, alpha counts).
use vello_cpu::color::palette::css::{BLUE, CYAN, DEEP_PINK, NAVY, ORANGE, WHITE, YELLOW};
use vello_cpu::kurbo::{Affine, BezPath, Circle, Point, Rect, Shape, Stroke};
use vello_cpu::peniko::{
    ColorStop, ColorStops, Extend, Gradient, LinearGradientPosition, RadialGradientPosition,
};
use vello_cpu::{Pixmap, RenderContext, Resources};

const WIDTH: u16 = 320;
const HEIGHT: u16 = 240;

fn stops(list: [ColorStop; 3]) -> ColorStops {
    ColorStops::from(list.as_slice())
}

fn main() {
    let output_path = std::env::args()
        .nth(1)
        .expect("usage: vello-cpu-raster <out.png>");
    let mut context = RenderContext::new(WIDTH, HEIGHT);

    // Linear gradient on a rotated, anti-aliased rectangle.
    let card = Rect::new(20.0, 20.0, 160.0, 120.0);
    context.set_paint(Gradient {
        kind: LinearGradientPosition {
            start: Point::new(20.0, 20.0),
            end: Point::new(160.0, 120.0),
        }
        .into(),
        stops: stops([
            ColorStop::from((0.0, DEEP_PINK)),
            ColorStop::from((0.55, ORANGE)),
            ColorStop::from((1.0, YELLOW)),
        ]),
        extend: Extend::Pad,
        ..Default::default()
    });
    context.set_transform(Affine::rotate_about(0.2, Point::new(90.0, 70.0)));
    context.fill_path(&card.to_path(0.1));

    // Radial gradient circle.
    context.set_transform(Affine::IDENTITY);
    let centre = Point::new(230.0, 150.0);
    context.set_paint(Gradient {
        kind: RadialGradientPosition {
            start_center: centre,
            start_radius: 8.0,
            end_center: centre,
            end_radius: 70.0,
        }
        .into(),
        stops: stops([
            ColorStop::from((0.0, CYAN)),
            ColorStop::from((0.6, BLUE)),
            ColorStop::from((1.0, NAVY)),
        ]),
        extend: Extend::Pad,
        ..Default::default()
    });
    context.fill_path(&Circle::new(centre, 70.0).to_path(0.1));

    // Stroked cubic curve.
    let mut curve = BezPath::new();
    curve.move_to((20.0, 210.0));
    curve.curve_to((90.0, 130.0), (160.0, 290.0), (300.0, 200.0));
    context.set_paint(WHITE);
    context.set_stroke(Stroke::new(6.0));
    context.stroke_path(&curve);

    context.flush();
    let mut pixmap = Pixmap::new(WIDTH, HEIGHT);
    context.render(&mut pixmap, &mut Resources::new());

    let pixels = pixmap.data();
    let transparent = pixels.iter().filter(|p| p.a == 0).count();
    let opaque = pixels.iter().filter(|p| p.a == 255).count();
    let partial = pixels.len() - transparent - opaque;
    let probe = |name: &str, x: usize, y: usize| {
        let p = pixels[y * WIDTH as usize + x];
        format!("\"{name}\":[{},{},{},{}]", p.r, p.g, p.b, p.a)
    };
    println!(
        "{{\"width\":{WIDTH},\"height\":{HEIGHT},\"transparent\":{transparent},\"opaque\":{opaque},\"partial\":{partial},{},{},{},{}}}",
        probe("corner", 2, 2),
        probe("linear_centre", 90, 70),
        probe("radial_centre", 230, 150),
        probe("radial_edge", 230, 85),
    );
    std::fs::write(output_path, pixmap.into_png().expect("PNG encode failed"))
        .expect("write failed");
}
