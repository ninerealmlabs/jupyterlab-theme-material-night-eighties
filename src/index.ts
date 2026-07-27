import type { JupyterFrontEnd, JupyterFrontEndPlugin } from '@jupyterlab/application'

import { IThemeManager } from '@jupyterlab/apputils'

/**
 * Initialization data for the jupyterlab-material-night-eighties extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: '@ninerealmlabs/jupyterlab_material_night_eighties:plugin',
  description:
    "A jupyterlab theme inspired by material darker and VSCode's material night eighties",
  autoStart: true,
  requires: [IThemeManager],
  activate: (app: JupyterFrontEnd, manager: IThemeManager) => {
    console.log('JupyterLab extension jupyterlab_material_night_eighties is activated!')
    const style = '@ninerealmlabs/jupyterlab_material_night_eighties/index.css'

    manager.register({
      // NOTE: `name` is persisted in user settings -- changing it would reset
      // the theme for every existing user. Use `displayName` for presentation.
      name: '@ninerealmlabs/jupyterlab_material_night_eighties',
      displayName: 'Material Night Eighties',
      isLight: false,
      themeScrollbars: true,
      load: () => manager.loadCSS(style),
      unload: () => Promise.resolve(undefined),
    })
  },
}

export default plugin
