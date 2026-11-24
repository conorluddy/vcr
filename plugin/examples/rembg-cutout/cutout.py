"""Remove the background from one PNG with the rembg library (default u2net session) and write the RGBA PNG."""
import sys
from pathlib import Path

from rembg import new_session, remove

MODEL_NAME = "u2net"


def main(argv: list[str]) -> int:
    if len(argv) != 3:
        print("usage: cutout.py INPUT_PNG OUTPUT_PNG", file=sys.stderr)
        return 2
    input_path, output_path = Path(argv[1]), Path(argv[2])
    session = new_session(MODEL_NAME)
    output_path.write_bytes(remove(input_path.read_bytes(), session=session))
    print(f"wrote {output_path} with model {MODEL_NAME}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
