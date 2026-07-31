# Making a new release of jupyterlab_material_night_eighties

Releases go to [PyPI](https://pypi.org/project/jupyterlab-material-night-eighties/) and
[npm](https://www.npmjs.com/package/@ninerealmlabs/jupyterlab_material_night_eighties) through two
manually dispatched workflows built on
[Jupyter Releaser](https://github.com/jupyter-server/jupyter_releaser).

After the one-time setup, the repository stores no long-lived **registry** credentials.
PyPI and npm use Trusted Publishing: GitHub Actions presents a short-lived OIDC identity at publish time, and each registry verifies it against its configured publisher.
The GitHub App private key remains an Actions secret because the workflows need to create branches, tags, and releases in this repository.

Publishing from the GitHub-hosted runners also adds [PEP 740](https://peps.python.org/pep-0740/)
attestations on PyPI and npm provenance.

- [Making a new release of jupyterlab_material_night_eighties](#making-a-new-release-of-jupyterlab_material_night_eighties)
  - [One-time setup](#one-time-setup)
    - [Prerequisites](#prerequisites)
    - [1. Allowlist the actions](#1-allowlist-the-actions)
    - [2. Create the GitHub App](#2-create-the-github-app)
    - [3. Create the environments](#3-create-the-environments)
    - [4. Register the PyPI trusted publisher](#4-register-the-pypi-trusted-publisher)
    - [5. Register the npm trusted publisher](#5-register-the-npm-trusted-publisher)
    - [6. Smoke-test trusted publishing](#6-smoke-test-trusted-publishing)
  - [Cutting a release](#cutting-a-release)
  - [Verifying a release](#verifying-a-release)
  - [How the publish workflow is put together](#how-the-publish-workflow-is-put-together)
  - [When publishing automation is unavailable](#when-publishing-automation-is-unavailable)

## One-time setup

Work through these in order.
Steps 4 and 5 depend on the environment created in step 3.

### Prerequisites

The person configuring publishing needs:

- repository-administrator access and permission to install a GitHub App for `ninerealmlabs`;
- owner or maintainer access to the existing projects on PyPI and npm; and
- a protected `main` branch.

### 1. Allowlist the actions

If the organization restricts which actions may run, configure its policy before enabling these workflows.
This is the complete inventory of external actions used by the repository's workflows and by their pinned composite actions:

| Allowlist pattern                   | Ownership   | Used for                                         |
| ----------------------------------- | ----------- | ------------------------------------------------ |
| `actions/cache@*`                   | GitHub      | Playwright browser cache                         |
| `actions/checkout@*`                | GitHub      | Repository checkout                              |
| `actions/create-github-app-token@*` | GitHub      | Short-lived release token                        |
| `actions/download-artifact@*`       | GitHub      | Build and release artifact transfer              |
| `actions/github-script@*`           | GitHub      | Nested inside the JupyterLab label action        |
| `actions/setup-node@*`              | GitHub      | Node.js and npm                                  |
| `actions/setup-python@*`            | GitHub      | Python                                           |
| `actions/upload-artifact@*`         | GitHub      | Build and release artifact transfer              |
| `astral-sh/setup-uv@*`              | Third-party | Exact uv installation and caching                |
| `jupyter-server/jupyter_releaser@*` | Third-party | Release preparation, building, and finalization  |
| `jupyterlab/maintainer-tools@*`     | Third-party | Link checking and pull-request label enforcement |
| `pypa/gh-action-pypi-publish@*`     | Third-party | PyPI Trusted Publishing and PEP 740 attestations |

The local `./.github/actions/setup` action needs no allowlist entry.
If **Allow actions created by GitHub** is enabled, the eight `actions/*` rows are covered by that setting; add the four third-party patterns explicitly.
Otherwise, add all twelve patterns.

All actions are pinned to commit SHAs.
If your allowlist entries are written as `owner/repo@*` this keeps working; if they pin exact tags, they need updating to allow SHA refs.

> [!NOTE]
> Optionally, require SHA pinning repo-wide:
>
> ```bash
> gh api /repos/ninerealmlabs/jupyterlab-theme-material-night-eighties/actions/permissions \
>   --method PUT --field enabled=true --field sha_pinning_required=true
> ```
>
> A composite action's SHA also freezes its nested `uses` references.
> Recheck the inventory whenever a pinned composite action is updated because the new revision may
> add or replace nested actions.

### 2. Create the GitHub App

The workflows use this app for repository operations.
Each installation token expires in an hour and is scoped to this repository.
Unlike a personal access token with `workflow` scope, it cannot rewrite the workflow files that define the release process.

Create it under the **ninerealmlabs** org (Settings → Developer settings → GitHub Apps → New).

- **Repository permissions**

  | Permission     | Level          | Used for                                          |
  | -------------- | -------------- | ------------------------------------------------- |
  | Contents       | Read and write | Version bump, branch push, tag, release assets    |
  | Pull requests  | Read and write | Changelog PR and the forwardport PR               |
  | Administration | Read-only      | Releaser's `admin_check` reads collaborator level |
  | Metadata       | Read-only      | Mandatory; granted automatically                  |

- Uncheck **Webhook → Active**; nothing listens for events.

- Install the app on `jupyterlab-theme-material-night-eighties` only.

- Generate a private key and keep the `.pem` — you paste it in the next step.

- Note the **Client ID** (the `Iv23…` string on the app settings page).

The workflows request each permission explicitly, so the token they receive is narrower than the installation.
If granting `Administration` is not acceptable, drop it and add `admin_check: 'false'` to the releaser steps in [prep-release.yaml](.github/workflows/prep-release.yaml) and [publish-release.yaml](.github/workflows/publish-release.yaml) — the environment approval gate in step 3 already restricts who can publish.

### 3. Create the environments

Two environments, with different jobs.
Both should set **Deployment branches → Protected branches only**, so a workflow on a feature branch cannot reach either.
This requires `main` to be a protected branch.

| Environment          | Reviewers                     | Holds                                                  | Used by                       |
| -------------------- | ----------------------------- | ------------------------------------------------------ | ----------------------------- |
| `release-automation` | none                          | `APP_CLIENT_ID` (variable), `APP_PRIVATE_KEY` (secret) | prep, build, finalize jobs    |
| `release`            | release approver(s), required | nothing                                                | the PyPI and npm publish jobs |

Splitting them puts the approval prompt immediately before the irreversible step rather than before
the build, and confines the app private key to an environment that ordinary workflows cannot read.

- On `release-automation`: add variable `APP_CLIENT_ID` (the app's Client ID) and secret
  `APP_PRIVATE_KEY` (the full `.pem` contents, `BEGIN`/`END` lines included).
- On `release`: add the designated maintainer or team under **Required reviewers**.
  If the workflow initiator must approve their own run, leave **Prevent self-review** disabled.
  Add no secrets.

### 4. Register the PyPI trusted publisher

On <https://pypi.org/manage/project/jupyterlab-material-night-eighties/settings/publishing/>, add a GitHub publisher:

| Field           | Value                                      |
| --------------- | ------------------------------------------ |
| Owner           | `ninerealmlabs`                            |
| Repository name | `jupyterlab-theme-material-night-eighties` |
| Workflow name   | `publish-release.yaml`                     |
| Environment     | `release`                                  |

### 5. Register the npm trusted publisher

On <https://www.npmjs.com/package/@ninerealmlabs/jupyterlab_material_night_eighties/access>
(the package page's **Settings** tab), find the Trusted Publisher section:

| Field                | Value                                      |
| -------------------- | ------------------------------------------ |
| Publisher            | GitHub Actions                             |
| Organization or user | `ninerealmlabs`                            |
| Repository           | `jupyterlab-theme-material-night-eighties` |
| Workflow filename    | `publish-release.yaml`                     |
| Environment          | `release`                                  |
| Allowed actions      | `npm publish`                              |

The values are case-sensitive, and npm does not validate them when you save the configuration.
Mistakes surface as authentication errors when the workflow first tries to publish.

### 6. Smoke-test trusted publishing

1. Confirm that both release workflows are present on the protected `main` branch.
   Trusted Publishing matches the workflow identity on the branch being run.
2. Choose a prerelease version that has never been published to either registry, such as `<next-version>a1`, and cut it as the smoke test.
   It exercises the whole path against the real registries, and the npm side lands under the `next` dist-tag rather than moving `latest`.
3. Confirm both packages published and both carry attestations (see
   [Verifying a release](#verifying-a-release)).
4. On the npm package settings, set **Require two-factor authentication and disallow tokens**.
   This blocks traditional token authentication while leaving Trusted Publishing available.

## Cutting a release

Both workflows are dispatched manually from the Actions tab, from `main`.

1. **Step 1: Prep Release** — bumps the version, generates the changelog, opens a draft GitHub release.

   | Input               | Notes                                                      |
   | ------------------- | ---------------------------------------------------------- |
   | `version_spec`      | `next`, or an explicit version such as `1.2.3` / `1.2.3a1` |
   | `since_last_stable` | Include PR activity since the last stable tag              |

   The workflow always targets this repository's `main` branch.
   It rejects unsupported versions before requesting the release app credential.

2. Review the draft release and its changelog.

3. Run **Step 2: Publish Release**.
   It proceeds only when it finds exactly one draft for `main` containing Jupyter Releaser's `metadata.json`.
   If no draft or multiple matching drafts exist, resolve the ambiguity in GitHub Releases and run the workflow again.

4. The run pauses at the `release` environment gate.
   Approve it, and the PyPI and npm jobs publish in parallel.
   The GitHub release is published last, after both registries succeed.

5. If `forwardport-changelog` opened a PR against `main`, merge it.

> [!WARNING]
> If a registry job fails after the other succeeded, the run stops before publishing the GitHub
> release. Neither PyPI nor npm allows overwriting a version, so re-running requires a new version
> number — fix the cause, then cut the next patch or prerelease.

## Verifying a release

```bash
# npm: provenance and signature attestations
npm audit signatures

# PyPI: the release page shows a "Verified details" / attestations panel per file
```

The GitHub release page should also show the published assets, and the run summary links to the final release URL.

## How the publish workflow is put together

[publish-release.yaml](.github/workflows/publish-release.yaml) separates the release into four jobs:

| Job        | Credentials                  | Does                                                                                                |
| ---------- | ---------------------------- | --------------------------------------------------------------------------------------------------- |
| `build`    | app token                    | Builds, attaches dists to the draft release, re-downloads and sha256-verifies them into an artifact |
| `pypi`     | OIDC only, `id-token: write` | Uploads via `pypa/gh-action-pypi-publish`, with attestations                                        |
| `npm`      | OIDC only, `id-token: write` | `npm publish`, with provenance                                                                      |
| `finalize` | app token                    | Forwardports the changelog, publishes the GitHub release                                            |

The releaser's `publish-assets` step is skipped throughout.
It uploads with `twine upload` and no `--attestations` flag, so it cannot produce PEP 740 attestations; `pypa/gh-action-pypi-publish` does so by default.
The other Jupyter Releaser steps prepare, populate, and finalize the GitHub release.

Separating build from publish prevents any job from holding both the build inputs and the publishing capability.
Before uploading the artifact for the publish jobs, the build job verifies it against the `asset_shas.json` recorded on the draft release.

## When publishing automation is unavailable

There is no credential-free local publishing fallback.
Trusted Publishing relies on the GitHub Actions identity, and the recommended npm configuration rejects traditional publish tokens.

If a workflow fails before either registry accepts a package, fix the failure and rerun it.
If one registry accepts the version, do not rerun with the same version: registry releases are immutable, so prepare the next patch or prerelease.

Reintroducing registry credentials for an emergency release changes the security model and requires separate, time-limited credentials from both registries.
Treat that as an incident procedure, revoke the credentials immediately afterward, and restore npm's **disallow tokens** setting.

<!-- ## Publishing to `conda-forge`

If the package is not on conda forge yet, check the documentation to learn how to add it:
<https://conda-forge.org/docs/maintainer/adding_pkgs.html>

Otherwise a bot should pick up the new version publish to PyPI,
and open a new PR on the feedstock repository automatically. -->
