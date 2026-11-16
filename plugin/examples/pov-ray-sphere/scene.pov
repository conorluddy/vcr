#version 3.7;
global_settings { assumed_gamma 1.0 }

background { color rgb <0.72, 0.82, 0.95> }

camera {
  location <0, 1.5, -5>
  look_at <0, 0, 0>
  angle 38
}

light_source { <-3, 5, -4> color rgb <1, 1, 1> }

sphere {
  <0, 0, 0>, 1
  texture {
    pigment { color rgb <0.8, 0.12, 0.08> }
    finish { ambient 0.08 diffuse 0.82 specular 0.25 roughness 0.035 }
  }
}

plane {
  y, -1.05
  texture {
    pigment { color rgb <0.83, 0.82, 0.78> }
    finish { ambient 0.08 diffuse 0.78 }
  }
}
