# Making a new release of jupyterlab_material_night_eighties

The extension can be published to `PyPI` and `npm` manually or using the [Jupyter Releaser](https://github.com/jupyter-server/jupyter_releaser).

- [Making a new release of jupyterlab_material_night_eighties](#making-a-new-release-of-jupyterlab_material_night_eighties)
  - [Automated releases with the Jupyter Releaser](#automated-releases-with-the-jupyter-releaser)
  - [Manual release](#manual-release)
    - [Python package](#python-package)
    - [NPM package](#npm-package)

## Automated releases with the Jupyter Releaser

The extension repository should already be compatible with the Jupyter Releaser.

Check out the [workflow documentation](https://github.com/jupyter-server/jupyter_releaser#typical-workflow) for more information.

Here is a summary of the steps to cut a new release:

- Convert the repo to use [`jupyter-releaser`](https://jupyter-releaser.readthedocs.io/en/latest/how_to_guides/convert_repo_from_repo.html)
- Add `ADMIN_GITHUB_TOKEN`, `PYPI_TOKEN` and `NPM_TOKEN` to the Github Secrets in the fork
- Go to the Actions panel
- Run the "Draft Changelog" workflow
- Merge the Changelog PR
- Run the "Draft Release" workflow
- Run the "Publish Release" workflow

<!-- ## Publishing to `conda-forge`

If the package is not on conda forge yet, check the documentation to learn how to add it: <https://conda-forge.org/docs/maintainer/adding_pkgs.html>

Otherwise a bot should pick up the new version publish to PyPI, and open a new PR on the feedstock repository automatically. -->

## Manual release

### Python package

This extension can be distributed as Python
packages. All of the Python
packaging instructions in the `pyproject.toml` file to wrap your extension in a
Python package. Before generating a package, we first need to install `build`.

```bash
pip install build twine hatch
```

Bump the version using `hatch`. By default this will create a tag.
See the docs on [hatch-nodejs-version](https://github.com/agoose77/hatch-nodejs-version#semver) for details.

```bash
hatch version <new-version>
```

To create a Python source package (`.tar.gz`) and the binary package (`.whl`) in the `dist/` directory, do:

```bash
python -m build
```

> `python setup.py sdist bdist_wheel` is deprecated and will not work for this package.

Then to upload the package to PyPI, do:

```bash
twine upload dist/*
```

### NPM package

To publish the frontend part of the extension as a NPM package, do:

```bash
npm login
npm publish --access public
```
