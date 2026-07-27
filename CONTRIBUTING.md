# Contributing

- [Development setup](#development-setup)
- [Tooling](#tooling)
- [Test runbook](#test-runbook)
- [Pinned dependencies](#pinned-dependencies)
- [Updating from the JupyterLab template](#updating-from-the-jupyterlab-template)
- [Editing the color palette](#editing-the-color-palette)

## Development setup

You need Node.js and [uv](https://docs.astral.sh/uv/).

`uv` manages the Python environment. `hatchling` remains the PEP 517 build backend:
`hatch-jupyter-builder` is a hatchling _build hook_, and it is what compiles the TypeScript and
stages the prebuilt labextension into `share/jupyter/labextensions`. uv has no equivalent hook
mechanism, so the two are complementary rather than alternatives.

```sh
uv sync                                  # create .venv with JupyterLab + build tooling
uv pip install -e .                      # editable install of this extension
uv run jupyter-builder develop . --overwrite
uv run jlpm install                      # install node_modules
```

> `jupyter labextension develop|build|watch` still work but print a deprecation warning; the
> `jupyter-builder` equivalents are the supported spelling. `jupyter labextension list` is **not**
> deprecated.
>
> `jlpm` is JupyterLab's pinned Yarn (currently Yarn 3.x). Run it through `uv run` so it resolves
> from the project's `.venv`. Use `jlpm` rather than `npm`/`yarn` so `yarn.lock` stays consistent.

### The `ui-tests` directory is a separate Yarn project

`ui-tests/` has its own `package.json` and its own **`yarn.lock`, which must stay committed even though it is empty**.
Yarn 3 locates a project root by walking up to the nearest `yarn.lock`; with no lockfile there it walks up to the repo root and refuses to run:

```text
Usage Error: The nearest package directory (.../ui-tests) doesn't seem to be
part of the project declared in .../jupyterlab-theme-material-night-eighties.
```

Yarn 1 (JupyterLab 3's `jlpm`) did not care, so this only surfaced with the JupyterLab 4 upgrade.
`ui-tests/` is deliberately **not** a Yarn workspace of the root project — the integration tests
install a released JupyterLab and Galata independently of the extension's own dependency tree.

## Tooling

Formatting and linting follow
[ninerealmlabs/precommit-template](https://github.com/ninerealmlabs/precommit-template).
Everything is wired through [`.pre-commit-config.yaml`](.pre-commit-config.yaml); run it with
[`prek`](https://github.com/j178/prek) or `pre-commit`.

| Area                    | Tool                              | Config                                                           |
| ----------------------- | --------------------------------- | ---------------------------------------------------------------- |
| TypeScript, JSON, CSS   | biome (format + lint)             | [`.biome.jsonc`](.biome.jsonc)                                   |
| JupyterLab plugin rules | eslint + `@jupyter/eslint-plugin` | [`eslint.config.mjs`](eslint.config.mjs)                         |
| CSS lint                | stylelint + `csstree/validator`   | [`.stylelintrc`](.stylelintrc)                                   |
| Markdown                | mdformat, then rumdl              | [`.mdformat.toml`](.mdformat.toml), [`.rumdl.toml`](.rumdl.toml) |
| Python                  | ruff                              | [`pyproject.toml`](pyproject.toml)                               |
| Shell                   | shellcheck, shfmt                 | —                                                                |
| YAML                    | yamllint                          | [`.yamllint.yaml`](.yamllint.yaml)                               |
| Spelling                | typos                             | [`.typos.toml`](.typos.toml)                                     |
| Whitespace              | editorconfig-checker              | [`.editorconfig`](.editorconfig)                                 |

Biome replaced prettier.
It does not handle Markdown or YAML, which is why mdformat, rumdl and yamllint cover those instead.

eslint is deliberately reduced to `@jupyter/eslint-plugin` only.
Its rules — plugin descriptions, token naming, translation handling — are JupyterLab-specific and biome has no equivalent.
Every other rule it used to enforce was moved into `.biome.jsonc` and is annotated there with the eslint rule it replaces.

`CHANGELOG.md` is excluded from mdformat and rumdl: jupyter-releaser rewrites it around a marker
comment and parses it back, so reformatting risks breaking a release.

## Test runbook

Run these in order.
This is the same sequence CI runs in [`.github/workflows/build.yaml`](.github/workflows/build.yaml), so a clean local pass should mean a clean CI pass.

### 1. Type check

```sh
uv run jlpm build:lib
```

Compiles `src/` with `tsc`.
Catches JupyterLab API breakage — this is the check that fails first after a `@jupyterlab/*` major bump.

### 2. Lint

```sh
uv run jlpm lint:check     # check only; use `jlpm lint` to autofix
```

Runs stylelint, biome, and eslint.
Biome formats and lints TypeScript, JSON and CSS. stylelint still lints CSS for what biome does not check, notably `csstree/validator`. eslint carries only the `@jupyter/eslint-plugin` rules, which are JupyterLab-specific and have no biome equivalent; everything else it used to enforce was transferred to `.biome.jsonc`.

### 3. Unit tests

```sh
uv run jlpm test
```

Jest, via `@jupyterlab/testutils/lib/jest-config`.

### 4. Build the prebuilt labextension

```sh
uv run jlpm build:prod
```

Runs `tsc` then `jupyter-builder build .` (Rspack).
This is what actually produces the artifact users install, so a green type check alone is not sufficient.

### 5. Verify JupyterLab loads it

```sh
uv run jupyter labextension list
```

Expect a line reading:

```text
@ninerealmlabs/jupyterlab_material_night_eighties v<version> enabled OK (python, jupyterlab_material_night_eighties)
```

`enabled OK` is the check that matters.
A theme can build cleanly and still fail to register.

### 6. Package

```sh
uv build
```

Produces `dist/*.whl` and `dist/*.tar.gz`.
To confirm the theme CSS landed in the right place:

```sh
uv run python -c "import zipfile,glob;print('\n'.join(zipfile.ZipFile(glob.glob('dist/*.whl')[0]).namelist()))"
```

The wheel must contain `.../share/jupyter/labextensions/@ninerealmlabs/jupyterlab_material_night_eighties/themes/@ninerealmlabs/jupyterlab_material_night_eighties/index.css`.
The doubled path is expected — the outer segment is the labextension, the inner is the theme.

### 7. Integration tests

See [`ui-tests/README.md`](./ui-tests/README.md).
These need a browser and are the slowest step; they are worth running before a release but not on every change.

### 8. Visual check

`tests/theme-variables.spec.ts` (step 7) fails if any `--jp-*` variable the built-in dark theme defines resolves to nothing under this theme.
That catches the silent-degradation failure mode, but it says nothing about whether the result _looks_ right.

For that, run the preview after any change to `style/variables.css`:

```sh
cd ui-tests && uv run jlpm preview
```

It drives JupyterLab through the launcher, a dialog, notebook editors, and cell output including an error traceback; screenshots each; and opens a report for you to look at.
Every run keeps the previous run's screenshots, so each surface is shown as **PREVIOUS** then **CURRENT** — edit, re-run, compare.
Nothing is committed and nothing is compared automatically; you are the check.

There is deliberately no pixel-diffing in CI.
Baselines for a theme would mean committed binaries, a bot to regenerate them, and per-platform copies — a lot of machinery to approximate a judgement you can make by eye.

For anything the preview does not cover — the completer, settings panels, the debugger — open the app directly:

```sh
uv run jupyter lab
```

## Pinned dependencies

Some dependencies are deliberately held below their latest release.
Dependabot is configured to skip them in [`.github/dependabot.yaml`](.github/dependabot.yaml).
**Do not bump these without re-checking the constraint** — the failure modes are confusing.

| Dependency                       | Held at | Constraint                                                                                                          |
| -------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------- |
| `jest`, `ts-jest`, `@types/jest` | `^29`   | `@jupyterlab/testing` pins `jest ^29.2.0` / `ts-jest ^29.1.0`, and it backs `@jupyterlab/testutils/lib/jest-config` |
| `typescript`                     | `~5.9`  | `typescript-eslint` v8 declares `typescript: >=4.8.4 <6.1.0`                                                        |

To re-check a constraint:

```sh
npm view @jupyterlab/testing@latest dependencies
npm view typescript-eslint@latest peerDependencies
```

Other intentional divergences from the upstream template:

- The npm package is **scoped** (`@ninerealmlabs/...`), so the `shared-data` paths in [`pyproject.toml`](./pyproject.toml) are scoped to match.
  The template's are unscoped.
- Python tooling is `uv` + `ruff`, not `pip` + `black`.
- `resolutions.lib0` is carried over from the template as a precaution and is not independently
  verified here.

## Updating from the JupyterLab template

This extension tracks [`jupyterlab/extension-template`](https://github.com/jupyterlab/extension-template) (`kind: theme`).
Render a throwaway copy and diff against it to pick up upstream build changes:

```sh
uvx --from copier --with jinja2-time copier copy --trust \
  https://github.com/jupyterlab/extension-template /tmp/ref-theme
diff /tmp/ref-theme/package.json package.json
diff /tmp/ref-theme/pyproject.toml pyproject.toml
```

Expect diffs for everything under "Pinned dependencies" above.

## Editing the color palette

[`style/variables.css`](./style/variables.css) is the file JupyterLab actually loads.
It defines a `--base16-*` ramp of literal hex values, then maps every `--jp-*` variable onto that ramp with `var()`.
**Prefer adding new variables as `var(--base16-*)` references rather than new hex** so the palette stays internally consistent.

[`scss/`](./scss/) generates only the `--base16-*` ramp from a base16 seed palette; see [`scss/README.md`](./scss/README.md).
It does not generate the `--jp-*` mappings, so most edits do not require regenerating it.
Regenerating needs the `sass` CLI.

To find `--jp-*` variables this theme does not define (they fall back to JupyterLab's built-in dark
theme, which will be off-palette):

```sh
JL=$(uv run python -c "import jupyterlab,pathlib;print(pathlib.Path(jupyterlab.__file__).parent)")
DARK="$JL/themes/@jupyterlab/theme-dark-extension/index.css"
grep -oE '\-\-jp-[a-zA-Z0-9-]+[[:space:]]*:' "$DARK" | sed 's/[[:space:]]*:$//' | sort -u > /tmp/jl-vars
grep -oE '\-\-jp-[a-zA-Z0-9-]+[[:space:]]*:' style/variables.css | sed 's/[[:space:]]*:$//' | sort -u > /tmp/theme-vars
comm -23 /tmp/jl-vars /tmp/theme-vars
```

That file is minified, so an anchored grep (`^\s*--jp-`) silently returns nothing — match unanchored as above.
Run this after every JupyterLab minor upgrade; new releases add variables.
