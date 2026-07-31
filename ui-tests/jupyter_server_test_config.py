"""Server configuration for integration tests.

!! Never use this configuration in production because it
opens the server to the world and provide access to JupyterLab
JavaScript objects through the global window variable.
"""

from jupyterlab.galata import configure_jupyter_server

# Among other things this points `c.LabServerApp.extra_labextensions_path` at the
# `@jupyterlab/galata-extension` helper shipped inside the jupyterlab package.
# Galata's `page.goto()` needs that extension present; without it every test
# fails with "Failed to activate galata extension".
configure_jupyter_server(c)  # noqa: F821

# Uncomment to set server log level to debug level
# c.ServerApp.log_level = "DEBUG"
