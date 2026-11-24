"""Posts an API-format workflow to a running ComfyUI server, waits for /history, saves the output image.

Usage: submit.py <base-url> <workflow.json> <results-dir> <label>
Writes <results-dir>/<label>.png (bytes from /view) and <results-dir>/<label>.json (run summary).
Uses only the standard library, so it runs under any Python 3.
"""
import json
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

HISTORY_TIMEOUT_S = 180
POLL_INTERVAL_S = 0.5
REQUEST_TIMEOUT_S = 30


def post_prompt(base_url: str, workflow: dict[str, object], client_id: str) -> dict[str, object]:
    body = json.dumps({"prompt": workflow, "client_id": client_id}).encode("utf-8")
    request = urllib.request.Request(f"{base_url}/prompt", data=body, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(request, timeout=REQUEST_TIMEOUT_S) as response:
            return json.load(response)
    except urllib.error.HTTPError as error:
        raise SystemExit(f"POST /prompt rejected with HTTP {error.code}: {error.read().decode('utf-8', 'replace')}")


def wait_for_history_entry(base_url: str, prompt_id: str) -> dict[str, object]:
    deadline = time.monotonic() + HISTORY_TIMEOUT_S
    while time.monotonic() < deadline:
        with urllib.request.urlopen(f"{base_url}/history/{prompt_id}", timeout=REQUEST_TIMEOUT_S) as response:
            history = json.load(response)
        entry = history.get(prompt_id)
        if entry is not None and entry["status"]["completed"]:
            return entry
        time.sleep(POLL_INTERVAL_S)
    raise SystemExit(f"prompt {prompt_id} did not complete within {HISTORY_TIMEOUT_S} s")


def single_output_image(entry: dict[str, object]) -> dict[str, str]:
    images = [image for node_output in entry["outputs"].values() for image in node_output.get("images", [])]
    if len(images) != 1:
        raise SystemExit(f"expected exactly one output image in /history, found {len(images)}")
    return images[0]


def message_event_names(entry: dict[str, object]) -> list[str]:
    return [str(event_name) for event_name, _ in entry["status"]["messages"]]


def cached_node_ids(entry: dict[str, object]) -> list[str]:
    cached: list[str] = []
    for event_name, event_data in entry["status"]["messages"]:
        if event_name == "execution_cached":
            cached.extend(str(node_id) for node_id in event_data["nodes"])
    return sorted(cached, key=int)


def download_image(base_url: str, image: dict[str, str]) -> bytes:
    query = urllib.parse.urlencode({"filename": image["filename"], "subfolder": image["subfolder"], "type": image["type"]})
    with urllib.request.urlopen(f"{base_url}/view?{query}", timeout=REQUEST_TIMEOUT_S) as response:
        return response.read()


def main(argv: list[str]) -> int:
    if len(argv) != 5:
        print("usage: submit.py <base-url> <workflow.json> <results-dir> <label>", file=sys.stderr)
        return 2
    base_url, workflow_path, results_dir, label = argv[1], Path(argv[2]), Path(argv[3]), argv[4]
    workflow = json.loads(workflow_path.read_text(encoding="utf-8"))
    accepted = post_prompt(base_url, workflow, client_id=f"vcr-fixture-{label}")
    if accepted.get("node_errors"):
        raise SystemExit(f"node errors in prompt: {json.dumps(accepted['node_errors'])}")
    prompt_id = str(accepted["prompt_id"])
    entry = wait_for_history_entry(base_url, prompt_id)
    image = single_output_image(entry)
    results_dir.mkdir(parents=True, exist_ok=True)
    (results_dir / f"{label}.png").write_bytes(download_image(base_url, image))
    summary = {
        "label": label,
        "prompt_id": prompt_id,
        "status_str": entry["status"]["status_str"],
        "completed": entry["status"]["completed"],
        "history_image_count": 1,
        "output_filename": image["filename"],
        "message_events": message_event_names(entry),
        "cached_node_ids": cached_node_ids(entry),
    }
    (results_dir / f"{label}.json").write_text(json.dumps(summary, indent=2) + "\n", encoding="utf-8")
    print(f"{label}: {image['filename']} status={summary['status_str']} cached={summary['cached_node_ids']}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
