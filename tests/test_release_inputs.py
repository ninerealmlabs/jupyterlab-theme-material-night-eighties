from __future__ import annotations

import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

REPOSITORY_ROOT = Path(__file__).parents[1]
VALIDATOR = REPOSITORY_ROOT / ".github" / "scripts" / "validate_release_inputs.py"
RELEASE_URL = "https://github.com/ninerealmlabs/jupyterlab-theme-material-night-eighties/releases/tag/v0.4.0"


class ReleaseInputValidationTests(unittest.TestCase):
    def run_validator(
        self,
        mode: str,
        *,
        input_text: str | None = None,
        **values: str,
    ) -> subprocess.CompletedProcess[str]:
        with tempfile.NamedTemporaryFile() as output:
            env = {
                **os.environ,
                "GITHUB_OUTPUT": output.name,
                "GITHUB_REF": "refs/heads/main",
                **values,
            }
            result = subprocess.run(
                [sys.executable, str(VALIDATOR), mode],
                cwd=REPOSITORY_ROOT,
                env=env,
                capture_output=True,
                text=True,
                input=input_text,
                check=False,
            )
            output.seek(0)
            result.workflow_outputs = output.read().decode()
            return result

    def test_prep_accepts_documented_versions(self) -> None:
        for version in ("next", "0.4.0", "0.4.0a1", "0.4.0rc2"):
            with self.subTest(version=version):
                result = self.run_validator("prep", VERSION_SPEC=version)

                self.assertEqual(result.returncode, 0, result.stderr)
                self.assertEqual(result.workflow_outputs, f"version_spec={version}\n")

    def test_prep_rejects_shell_syntax(self) -> None:
        result = self.run_validator("prep", VERSION_SPEC="next$(id)")

        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(result.workflow_outputs, "")

    def test_prep_rejects_runs_outside_main(self) -> None:
        result = self.run_validator(
            "prep",
            GITHUB_REF="refs/heads/release$(id)",
            VERSION_SPEC="0.4.0",
        )

        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(result.workflow_outputs, "")

    def test_draft_discovery_selects_the_only_main_jupyter_draft(self) -> None:
        releases = [
            [
                {
                    "id": 123,
                    "html_url": RELEASE_URL,
                    "tag_name": "v0.4.0",
                    "target_commitish": "main",
                    "draft": True,
                    "assets": [{"name": "metadata.json", "state": "uploaded"}],
                },
                {
                    "id": 122,
                    "html_url": f"{RELEASE_URL}-maintenance",
                    "tag_name": "v0.4.0-maintenance",
                    "target_commitish": "maintenance",
                    "draft": True,
                    "assets": [{"name": "metadata.json", "state": "uploaded"}],
                },
                {
                    "id": 121,
                    "html_url": f"{RELEASE_URL}-notes",
                    "tag_name": "v0.4.0-notes",
                    "target_commitish": "main",
                    "draft": True,
                    "assets": [],
                },
            ]
        ]

        result = self.run_validator(
            "discover-release",
            input_text=json.dumps(releases),
        )

        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(
            result.workflow_outputs,
            f"release_url={RELEASE_URL}\nrelease_tag=v0.4.0\n",
        )

    def test_draft_discovery_rejects_no_eligible_draft(self) -> None:
        result = self.run_validator(
            "discover-release",
            input_text=json.dumps([[]]),
        )

        self.assertNotEqual(result.returncode, 0)
        self.assertIn("exactly one", result.stderr)
        self.assertEqual(result.workflow_outputs, "")

    def test_draft_discovery_rejects_multiple_eligible_drafts(self) -> None:
        releases = [
            [
                {
                    "id": 123,
                    "html_url": RELEASE_URL,
                    "tag_name": "v0.4.0",
                    "target_commitish": "main",
                    "draft": True,
                    "assets": [{"name": "metadata.json", "state": "uploaded"}],
                },
                {
                    "id": 124,
                    "html_url": f"{RELEASE_URL}rc1",
                    "tag_name": "v0.4.0rc1",
                    "target_commitish": "main",
                    "draft": True,
                    "assets": [{"name": "metadata.json", "state": "uploaded"}],
                },
            ]
        ]

        result = self.run_validator(
            "discover-release",
            input_text=json.dumps(releases),
        )

        self.assertNotEqual(result.returncode, 0)
        self.assertIn("exactly one", result.stderr)
        self.assertEqual(result.workflow_outputs, "")

    def test_draft_discovery_rejects_an_unsafe_release_identity(self) -> None:
        releases = [
            [
                {
                    "id": 123,
                    "html_url": f"{RELEASE_URL}$(id)",
                    "tag_name": "v0.4.0$(id)",
                    "target_commitish": "main",
                    "draft": True,
                    "assets": [{"name": "metadata.json", "state": "uploaded"}],
                }
            ]
        ]

        result = self.run_validator(
            "discover-release",
            input_text=json.dumps(releases),
        )

        self.assertNotEqual(result.returncode, 0)
        self.assertIn("selected release URL is not", result.stderr)
        self.assertEqual(result.workflow_outputs, "")


if __name__ == "__main__":
    unittest.main()
