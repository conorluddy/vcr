#!/usr/bin/env python3
from pathlib import Path

SIZE = 25
CENTER = SIZE // 2
rows = []
for y in range(SIZE):
    row = []
    for x in range(SIZE):
        distance = abs(x - CENTER) + abs(y - CENTER)
        row.append("1" if 4 < distance <= 10 else "0")
    rows.append(" ".join(row))
Path(__file__).with_name("source.pbm").write_text(f"P1\n{SIZE} {SIZE}\n" + "\n".join(rows) + "\n")
