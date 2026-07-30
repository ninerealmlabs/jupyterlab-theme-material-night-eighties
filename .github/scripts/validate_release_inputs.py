from __future__ import annotations

import json
import os
from pathlib import Path
import re
import sys

MAIN_REF = "refs/heads/main"
VERSION_PATTERN = re.compile(
    r"(?:next|(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)"
    r"(?:(?:a|b|rc)(?:0|[1-9]\d*))?)"
)
RELEASE_URL_PATTERN = re.compile(
    r"https://github\.com/ninerealmlabs/jupyterlab-theme-material-night-eighties/"
    r"releases/tag/(?P<tag>[A-Za-z0-9][A-Za-z0-9._-]*)"
)


def reject(message: str) -> None:
    print(f"::error::{message}", file=sys.stderr)
    raise SystemExit(2)


def require_full_match(
    pattern: re.Pattern[str],
    value: str,
    label: str,
) -> re.Match[str]:
    match = pattern.fullmatch(value)
    if match is None:
        reject(f"{label} is not in the supported format")
    return match


def write_outputs(values: dict[str, str]) -> None:
    output_path = os.environ.get("GITHUB_OUTPUT")
    if not output_path:
        reject("GITHUB_OUTPUT is not available")

    with Path(output_path).open("a", encoding="utf-8") as output:
        for name, value in values.items():
            print(f"{name}={value}", file=output)


def validate_prep() -> None:
    version_spec = os.environ.get("VERSION_SPEC", "")
    require_full_match(VERSION_PATTERN, version_spec, "version_spec")
    write_outputs({"version_spec": version_spec})


def discover_release() -> None:
    try:
        pages = json.load(sys.stdin)
    except (json.JSONDecodeError, UnicodeDecodeError):
        reject("GitHub returned invalid releases metadata")

    if not isinstance(pages, list) or any(not isinstance(page, list) for page in pages):
        reject("GitHub returned invalid releases metadata")

    candidates: list[dict[str, object]] = []
    for page in pages:
        for release in page:
            if not isinstance(release, dict):
                reject("GitHub returned invalid releases metadata")
            assets = release.get("assets")
            if not isinstance(assets, list):
                reject("GitHub returned invalid releases metadata")
            has_metadata = any(isinstance(asset, dict) and asset.get("name") == "metadata.json" for asset in assets)
            if release.get("draft") is True and release.get("target_commitish") == "main" and has_metadata:
                candidates.append(release)

    if len(candidates) != 1:
        reject(f"expected exactly one main-branch Jupyter Releaser draft; found {len(candidates)}")

    release = candidates[0]
    release_url = release.get("html_url")
    release_tag = release.get("tag_name")
    if not isinstance(release_url, str) or not isinstance(release_tag, str):
        reject("GitHub returned invalid releases metadata")
    release_match = require_full_match(
        RELEASE_URL_PATTERN,
        release_url,
        "selected release URL",
    )
    if release_tag != release_match.group("tag"):
        reject("selected release tag does not match its URL")
    write_outputs({"release_url": release_url, "release_tag": release_tag})


def main() -> None:
    if os.environ.get("GITHUB_REF") != MAIN_REF:
        reject("release workflows must run from main")

    if len(sys.argv) != 2:
        reject("usage: validate_release_inputs.py prep|discover-release")

    mode = sys.argv[1]
    if mode == "prep":
        validate_prep()
    elif mode == "discover-release":
        discover_release()
    else:
        reject("validation mode must be prep or discover-release")


if __name__ == "__main__":
    main()
