from ._version import __version__

__all__ = ["__version__"]


def _jupyter_labextension_paths():
    # `dest` must match the npm package name in package.json (and therefore the
    # `shared-data` path in pyproject.toml). This package is scoped, so the
    # scope has to be included -- otherwise `jupyter-builder develop` symlinks
    # to an unscoped directory and registers a second, duplicate copy of the
    # extension alongside the one a wheel install provides.
    return [
        {
            "src": "labextension",
            "dest": "@ninerealmlabs/jupyterlab_material_night_eighties",
        }
    ]
