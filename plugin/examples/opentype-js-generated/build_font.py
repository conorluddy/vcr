from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen
from pathlib import Path

units = 1000
fb = FontBuilder(units, isTTF=True)
glyph_order = [".notdef", "A"]
fb.setupGlyphOrder(glyph_order)
fb.setupCharacterMap({65: "A"})

def glyph(points):
    pen = TTGlyphPen(None)
    if points:
        pen.moveTo(points[0])
        for point in points[1:]:
            pen.lineTo(point)
        pen.closePath()
    return pen.glyph()

fb.setupGlyf({".notdef": glyph([]), "A": glyph([(100, 0), (500, 800), (900, 0)])})
fb.setupHorizontalMetrics({".notdef": (1000, 0), "A": (1000, 100)})
fb.setupHorizontalHeader(ascent=800, descent=-200)
fb.setupNameTable({"familyName": "VCR Fixture", "styleName": "Regular", "uniqueFontIdentifier": "VCRFixture-Regular", "fullName": "VCR Fixture Regular", "psName": "VCRFixture-Regular", "version": "Version 1.0"})
fb.setupOS2(sTypoAscender=800, sTypoDescender=-200, usWinAscent=800, usWinDescent=200)
fb.setupPost()
fb.setupMaxp()
out = Path(__file__).parent / "output" / "fixture.ttf"
out.parent.mkdir(exist_ok=True)
fb.save(out)
print(out)
