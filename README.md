# JupyterLab Material Night Eighties theme

[![Build](https://github.com/ninerealmlabs/jupyterlab-theme-material-night-eighties/actions/workflows/build.yml/badge.svg)](https://github.com/ninerealmlabs/jupyterlab-theme-material-night-eighties/actions/workflows/build.yml) [![Node.js Package](https://github.com/ninerealmlabs/jupyterlab-theme-material-night-eighties/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/ninerealmlabs/jupyterlab-theme-material-night-eighties/actions/workflows/npm-publish.yml)

Theme for jupyterlab based on [jupyterlab/theme-cookiecutter](https://github.com/jupyterlab/theme-cookiecutter), inspired by [oriolmirosa/jupyterlab_materialdarker](https://github.com/oriolmirosa/jupyterlab_materialdarker),
[arbennett/jupyterlab-themes](https://github.com/arbennett/jupyterlab-themes), and [base16](https://github.com/chriskempson/base16)

## Installation

```sh
# currently not published to pip
pip install jupyterlab_material_night_eighties
```

Themes can be installed directly from `npm` using the standard JupyterLab installation method:

```sh
jupyter labextension install @ninerealmlabs/jupyterlab_material_night_eighties
```

Themes can also be installed from source. From a theme's subdirectory:

```sh
npm install
jupyter labextension link .
```

## Screenshots

![material_darker](./screenshots/material_night_eighties.png 'material_night_eighties theme screenshot')

<!--
![theme_wallpaper](./screenshots/themer.png "theme wallpaper")
-->

## Requirements

- node/npm
- python
  - jupyterlab >= 3.1
  - jupyter-packaging
- typescript

## Development install

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
jlpm run build
```

You can watch the source directory and run JupyterLab at the same time in different terminals to watch for changes in the extension's source and automatically rebuild the extension.

```bash
# Watch the source directory in one terminal, automatically rebuilding when needed
jlpm run watch
```

_Run JupyterLab in another terminal_

```bash
jupyter lab
```

With the watch command running, every saved change will immediately be built locally and available in your running JupyterLab. Refresh JupyterLab to load the change in your browser (you may need to wait several seconds for the extension to be rebuilt).

By default, the `jlpm run build` command generates the source maps for this extension to make it easier to debug using the browser dev tools. To also generate source maps for the JupyterLab core extensions, you can run the following command:

```bash
jupyter lab build --minimize=False
```

### Uninstall

```bash
pip uninstall jupyterlab_material_night_eighties
jupyter labextension uninstall @ninerealmlabs/jupyterlab_material_night_eighties
# may have to delete file manually
rm -rf /path/to/envs/ENVNAME/share/jupyter/labextensions/@ninerealmlabs/jupyterlab_material_night_eighties
```

## Bumping versions

Via [arbennett/jupyterlab-themes](https://github.com/arbennett/jupyterlab-themes)

> Because I have cobbled together a strange workflow for updating all of the themes at once it's a bit unwieldy
> to update the versioning consistently. This is the command I use (mostly for my own sake):

```sh
CURRENT_VERSION="v0.2.5"
NEW_VERSION="v0.2.6"
# add blank '' for mac sed
sed -i '' "s/\"version\": \"${CURRENT_VERSION}\"/\"version\": \"${NEW_VERSION}\"/g" ./**/package.json
sed -i '' "s/\"version\": \"${CURRENT_VERSION}\"/\"version\": \"${NEW_VERSION}\"/g" ./**/package-lock.json
npm install
```
