# JupyterLab Material Night Eighties theme

[![Build](https://github.com/ninerealmlabs/jupyterlab-theme-material-night-eighties/actions/workflows/build.yaml/badge.svg)](https://github.com/ninerealmlabs/jupyterlab-theme-material-night-eighties/actions/workflows/build.yaml)[![Check](https://github.com/ninerealmlabs/jupyterlab-theme-material-night-eighties/actions/workflows/check-release.yaml/badge.svg)](https://github.com/ninerealmlabs/jupyterlab-theme-material-night-eighties/actions/workflows/check-release.yaml)[![Publish](https://github.com/ninerealmlabs/jupyterlab-theme-material-night-eighties/actions/workflows/publish-release.yaml/badge.svg)](https://github.com/ninerealmlabs/jupyterlab-theme-material-night-eighties/actions/workflows/publish-release.yaml)

Theme for jupyterlab based on [jupyterlab/theme-extension-cookiecutter-ts](https://github.com/jupyterlab/extension-cookiecutter-ts),
inspired by [oriolmirosa/jupyterlab_materialdarker](https://github.com/oriolmirosa/jupyterlab_materialdarker),
[arbennett/jupyterlab-themes](https://github.com/arbennett/jupyterlab-themes), [VSCode Material Theme Kit](https://marketplace.visualstudio.com/items?itemName=ms-vscode.Theme-MaterialKit),
and [base16](https://github.com/chriskempson/base16)

- [JupyterLab Material Night Eighties theme](#jupyterlab-material-night-eighties-theme)
  - [Requirements](#requirements)
  - [Installation](#installation)
  - [Screenshots](#screenshots)
  - [Contributing](#contributing)
    - [Development install](#development-install)
    - [Updating dependencies](#updating-dependencies)
    - [Development uninstall](#development-uninstall)
    - [Testing the extension](#testing-the-extension)
      - [Frontend tests](#frontend-tests)
      - [Integration tests](#integration-tests)
    - [Packaging the extension](#packaging-the-extension)

## Requirements

- JupyterLab >= 3.0

## Installation

To install the extension, execute:

```sh
pip install jupyterlab-material-night-eighties
```

Themes can be installed directly from `npm` using the standard JupyterLab installation method:

```sh
jupyter labextension install @ninerealmlabs/jupyterlab_material_night_eighties
```

<!-- Themes can also be installed from source. From a theme's subdirectory:

```sh
npm install
jupyter labextension link .
``` -->

## Screenshots

![material_night_eighties](./screenshots/material_night_eighties.png 'material_night_eighties theme screenshot')

<!--
![theme_wallpaper](./screenshots/themer.png "theme wallpaper")
-->

## Contributing

### Development install

Note: You will need NodeJS to build the extension package.

The `jlpm` command is JupyterLab's pinned version of
[yarn](https://yarnpkg.com/) that is installed with JupyterLab. You may use
`yarn` or `npm` in lieu of `jlpm` below.

```bash
# Clone the repo to your local environment
# Change directory to the jupyterlab_material_night_eighties directory
# Install package in development mode
pip install -e .
# Link your development version of the extension with JupyterLab
jupyter labextension develop . --overwrite
# Rebuild extension Typescript source after making changes
jlpm build
```

You can watch the source directory and run JupyterLab at the same time in different terminals
to watch for changes in the extension's source and automatically rebuild the extension.

- Terminal A:

  ```bash
  # Watch the source directory in one terminal, automatically rebuilding when needed
  jlpm run watch
  ```

- Terminal B:

  ```sh
  jupyter lab
  ```

With the watch command running, every saved change will immediately be built
locally and available in your running JupyterLab.
Refresh JupyterLab to load the change in your browser
(you may need to wait several seconds for the extension to be rebuilt).

By default, the `jlpm build` command generates the source maps for this extension
to make it easier to debug using the browser dev tools.
To also generate source maps for the JupyterLab core extensions, you can run the following command:

```bash
jupyter lab build --minimize=False
```

### Updating dependencies

Copy `devDependencies` in [`package.json`](./package.json) from [jupyterlab-extension-cookiecutter-ts](https://github.com/jupyterlab/extension-cookiecutter-ts/blob/3.0/%7B%7Bcookiecutter.python_name%7D%7D/package.json)

Then run

```sh
rm package-lock.json yarn.lock
npm update
npm install
yarn install
```

### Development uninstall

```bash
pip uninstall jupyterlab-material-night-eighties
```

In development mode, you will also need to remove the symlink created by `jupyter labextension develop`
command. To find its location, you can run `jupyter labextension list` to figure out where the `labextensions`
folder is located. Then you can remove the symlink named `jupyterlab_material_night_eighties` within that folder.

### Testing the extension

#### Frontend tests

This extension is using [Jest](https://jestjs.io/) for JavaScript code testing.

To execute them, execute:

```sh
jlpm
jlpm test
```

#### Integration tests

This extension uses [Playwright](https://playwright.dev/docs/intro/) for the integration tests (aka user level tests).
More precisely, the JupyterLab helper [Galata](https://github.com/jupyterlab/jupyterlab/tree/master/galata) is used
to handle testing the extension in JupyterLab.

More information are provided within the [ui-tests](./ui-tests/README.md) README.

### Packaging the extension

See [RELEASE](RELEASE.md)
