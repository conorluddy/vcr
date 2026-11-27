#!/usr/bin/env python3
"""Write a 128x96 SDR (RGBA8888) and HDR (RGBA1010102, HLG, P3) raw pair.

Outside the highlight bar both versions agree. The bar reaches SDR 0.75 but
HDR 1.0, so a gain map must carry the difference.
"""
import sys
import numpy as np

WIDTH, HEIGHT = 128, 96
out = sys.argv[1]

x = np.linspace(0.0, 1.0, WIDTH)[None, :].repeat(HEIGHT, axis=0)
y = np.linspace(0.0, 1.0, HEIGHT)[:, None].repeat(WIDTH, axis=1)
base = np.stack([0.15 + 0.35 * x, 0.2 + 0.3 * y, 0.5 - 0.2 * x], axis=-1)

sdr = base.copy()
hdr = base.copy()
highlight = (x > 0.55) & (y > 0.25) & (y < 0.75)
ramp = ((x - 0.55) / 0.45).clip(0, 1)[..., None]
sdr[highlight] = (0.55 + 0.2 * ramp)[highlight]
hdr[highlight] = (0.55 + 0.45 * ramp)[highlight]

alpha8 = np.full((HEIGHT, WIDTH, 1), 255, dtype=np.uint8)
sdr8 = np.concatenate([(sdr * 255 + 0.5).astype(np.uint8), alpha8], axis=-1)
sdr8.tofile(f"{out}/sdr_{WIDTH}x{HEIGHT}.rgba8888")

# RGBA1010102 little endian: R bits 0-9, G 10-19, B 20-29, A 30-31
h10 = (hdr * 1023 + 0.5).astype(np.uint32)
packed = h10[..., 0] | (h10[..., 1] << 10) | (h10[..., 2] << 20) | (np.uint32(3) << 30)
packed.astype("<u4").tofile(f"{out}/hdr_{WIDTH}x{HEIGHT}.rgba1010102")
print(f"wrote {WIDTH}x{HEIGHT} raw SDR and HDR pair to {out}")
