// Parametric block with a through-hole. Override with -D width=50 etc.
width = 40;
depth = 30;
height = 10;
holeRadius = 5;
mode = "solid"; // "solid" or "projection" (2D footprint for SVG)
$fn = 128;

module block() {
  difference() {
    cube([width, depth, height]);
    translate([width / 2, depth / 2, -1]) cylinder(r = holeRadius, h = height + 2);
  }
}

if (mode == "projection") projection() block(); else block();
