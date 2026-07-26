# Integration Testing

This folder contains the integration tests of the extension.

They are defined using [Playwright](https://playwright.dev/docs/intro) test runner
and [Galata](https://github.com/jupyterlab/jupyterlab/tree/master/galata) helper.

The Playwright configuration is defined in [playwright.config.js](./playwright.config.js).

The JupyterLab server configuration to use for the integration test is defined
in [jupyter_server_test_config.py](./jupyter_server_test_config.py).

The default configuration will produce video for failing tests and an HTML report.

This folder is a **separate Yarn project** from the repo root, with its own `package.json` and its
own `yarn.lock`. That lockfile must stay committed even while it is empty — it is what tells Yarn 3
where the project root is. Without it, `jlpm install` here fails with
`The nearest package directory ... doesn't seem to be part of the project declared in ...`.

## Run the tests

> All commands are assumed to be executed from the root directory

To run the tests, you need to:

1. Build and install the extension:

   ```sh
   uv sync
   uv run jlpm install
   uv run jlpm build:prod
   uv pip install -e .
   ```

   Confirm JupyterLab actually picked it up — the tests will fail confusingly if it did not:

   ```sh
   uv run jupyter labextension list 2>&1 | grep -i "jupyterlab_material_night_eighties.*OK"
   ```

2. Install test dependencies (needed only once):

   ```sh
   cd ./ui-tests
   uv run jlpm install
   uv run jlpm playwright install chromium
   cd ..
   ```

3. Execute the [Playwright](https://playwright.dev/docs/intro) tests:

   ```sh
   cd ./ui-tests
   uv run jlpm playwright test
   ```

   Test results will be shown in the terminal. In case of any test failures, the test report
   will be opened in your browser at the end of the tests execution; see
   [Playwright documentation](https://playwright.dev/docs/test-reporters#html-reporter)
   for configuring that behavior.

4. To debug, execute the Playwright tests in [debug mode](https://playwright.dev/docs/debug):

   ```sh
   cd ./ui-tests
   PWDEBUG=1 uv run jlpm playwright test
   ```

## What the tests cover

| Spec | Covers |
| --- | --- |
| `tests/jupyterlab_material_night_eighties_theme.spec.ts` | the plugin activates |
| `tests/theme-variables.spec.ts` | every `--jp-*` variable the built-in dark theme defines also resolves under this theme |

`theme-variables.spec.ts` is the one that earns its keep. A theme fails *silently*: omit a
variable, or reference an undefined one, and JupyterLab quietly falls back to its own
default — nothing errors and no exception is raised. That test compares against whatever
the **installed** JupyterLab dark theme declares, so it keeps working as JupyterLab adds
variables in new releases, and it needs no baselines or fixtures.

There is deliberately **no automated screenshot comparison**. Pixel baselines for a theme
mean committed binaries, a bot to regenerate them, and per-platform copies, all to guard
something a person can judge in fifteen seconds. Use the preview below instead.

## Theme preview (`jlpm preview`)

A human-in-the-loop "does this still look right?" pass, run on your own machine:

```sh
cd ui-tests && uv run jlpm preview
```

It drives JupyterLab through the surfaces a palette change is most likely to break,
screenshots each one, and opens the Playwright report for you to look at. Nothing is
compared automatically and nothing is committed.

| Surface | Why it is there |
| --- | --- |
| shell and launcher | menu bar, sidebar, file browser, status bar |
| dialog | `--jp-dialog-background`, accept/reject button colors |
| notebook editors | cell editor and prompt colors, CodeMirror syntax highlighting, rendered markdown, link color |
| cell outputs and error traceback | `--jp-rendermime-*` and the ANSI palette — needs a kernel |

### Comparing against your previous run

Each run rotates the last run's screenshots aside, so every surface appears in the report
twice — **PREVIOUS run** then **CURRENT** — letting you flip between before and after your
change. The first run has nothing to compare against; from the second on it does.

So the loop is: preview → edit `style/variables.css` → preview again → compare.

Images are also written to `ui-tests/preview-output/` (gitignored) if you would rather use
your own diff tool:

```text
preview-output/previous/notebook-editors.png
preview-output/current/notebook-editors.png
```

Each surface is a separate test, so if one fails — a kernel that would not start, say —
the others are still captured and viewable.

## Troubleshooting

**`Error: Failed to activate galata extension`** on `page.goto()`

Galata needs the `@jupyterlab/galata-extension` helper — which ships inside the `jupyterlab`
Python package — to be served by the test server. That is wired up by
`jupyterlab.galata.configure_jupyter_server`, which
[jupyter_server_test_config.py](./jupyter_server_test_config.py) calls. A hand-rolled server config
that sets `c.ServerApp.*` directly (the JupyterLab 3 style) omits
`c.LabServerApp.extra_labextensions_path` and every test fails this way.

To check without running a browser, start the server and request the asset:

```sh
cd ui-tests && uv run jupyter lab --config jupyter_server_test_config.py &
curl -o /dev/null -w '%{http_code}\n' \
  'http://localhost:8888/lab/extensions/@jupyterlab/galata-extension/static/style.js'
```

`200` means it is wired up correctly; `404` means it is not.

## Create tests

> All commands are assumed to be executed from the root directory

To create tests, the easiest way is to use the code generator tool of playwright:

1. Complete steps 1 and 2 of [Run the tests](#run-the-tests) above.

2. Execute the [Playwright code generator](https://playwright.dev/docs/codegen):

   ```sh
   cd ./ui-tests
   uv run jlpm playwright codegen localhost:8888
   ```
