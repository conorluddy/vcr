from PIL import Image, ImageDraw


image = Image.new("RGB", (1206, 2622), "#f4f5f7")
draw = ImageDraw.Draw(image)
draw.rounded_rectangle((72, 72, 1134, 330), radius=48, fill="#ffffff")
draw.rectangle((122, 136, 220, 158), fill="#252a34")
draw.rectangle((930, 136, 1070, 158), fill="#252a34")
draw.rounded_rectangle((72, 390, 1134, 635), radius=40, fill="#ffffff")
draw.rectangle((122, 445, 590, 485), fill="#252a34")
draw.rectangle((122, 520, 830, 548), fill="#737b89")
draw.rounded_rectangle((72, 700, 1134, 1220), radius=44, fill="#dce9f7")
draw.rounded_rectangle((122, 755, 1084, 1110), radius=28, fill="#7d9fc6")
draw.rectangle((122, 1150, 710, 1180), fill="#252a34")
for top, color in ((1290, "#ffffff"), (1665, "#ffffff"), (2040, "#ffffff")):
    draw.rounded_rectangle((72, top, 1134, top + 315), radius=38, fill=color)
    draw.ellipse((122, top + 68, 270, top + 216), fill="#86ad8a")
    draw.rectangle((315, top + 82, 940, top + 112), fill="#252a34")
    draw.rectangle((315, top + 145, 1000, top + 170), fill="#8b929d")
draw.rounded_rectangle((72, 2420, 1134, 2550), radius=38, fill="#ffffff")
for x, color in ((260, "#4b74a5"), (600, "#a0a6b0"), (940, "#a0a6b0")):
    draw.ellipse((x - 28, 2468, x + 28, 2524), fill=color)
image.save("output/input-screen.png", format="PNG", optimize=False)
