"""Writes the generated 64x48 quadrant PNG that ComfyUI's LoadImage node reads. No randomness."""
import sys
from pathlib import Path

from PIL import Image

from fixture import generate_input_array


def main(argv: list[str]) -> int:
    if len(argv) != 2:
        print("usage: generate_input.py <output-png-path>", file=sys.stderr)
        return 2
    output_path = Path(argv[1])
    output_path.parent.mkdir(parents=True, exist_ok=True)
    Image.fromarray(generate_input_array(), mode="RGB").save(output_path, format="PNG")
    print(f"wrote {output_path}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
