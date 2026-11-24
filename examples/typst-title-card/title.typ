// Title card: fixed page size, one font passed with --font-path, a heading and a value read from data.json.
#set page(width: 640pt, height: 360pt, margin: 48pt, fill: none)
#set text(font: "JetBrains Mono", weight: "bold", size: 14pt, fill: rgb("#1d2a3a"))

#let data = json("data.json")

#heading(level: 1)[Kestrel Survey Summary]

#v(28pt)
#text(size: 56pt)[#data.value]
#v(8pt)
#text(size: 16pt)[#data.label]
