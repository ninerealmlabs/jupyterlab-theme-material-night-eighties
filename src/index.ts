import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { IThemeManager } from '@jupyterlab/apputils';

/**
 * Initialization data for the jupyterlab-material-night-eighties extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: '@ninerealmlabs/jupyterlab_material_night_eighties:plugin',
  autoStart: true,
  requires: [IThemeManager],
  activate: (app: JupyterFrontEnd, manager: IThemeManager) => {
    console.log(
      'JupyterLab extension jupyterlab_material_night_eighties is activated!'
    );
    const style = '@ninerealmlabs/jupyterlab_material_night_eighties/index.css';

    manager.register({
      name: '@ninerealmlabs/jupyterlab_material_night_eighties',
      isLight: false,
      load: () => manager.loadCSS(style),
      unload: () => Promise.resolve(undefined)
    });
  }
};

export default extension;
