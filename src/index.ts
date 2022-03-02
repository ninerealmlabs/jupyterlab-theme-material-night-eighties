import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { IThemeManager } from '@jupyterlab/apputils';

/**
 * Initialization data for the jupyterlab-material-night-eighties extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: '@ninerealmlabs/jupyterlab-material-night-eighties:plugin',
  autoStart: true,
  requires: [IThemeManager],
  activate: (app: JupyterFrontEnd, manager: IThemeManager) => {
    console.log(
      'JupyterLab extension jupyterlab-material-night-eighties is activated!'
    );
    const style = '@ninerealmlabs/jupyterlab-material-night-eighties/index.css';

    manager.register({
      name: '@ninerealmlabs/jupyterlab-material-night-eighties',
      isLight: false,
      load: () => manager.loadCSS(style),
      unload: () => Promise.resolve(undefined)
    });
  }
};

export default plugin;
