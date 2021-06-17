import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { IThemeManager } from '@jupyterlab/apputils';

/**
 * Initialization data for the @ahgraber/jupyterlab_material_darker extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: '@ahgraber/jupyterlab_material_darker',
  requires: [IThemeManager],
  autoStart: true,
  activate: (app: JupyterFrontEnd, manager: IThemeManager) => {
    console.log('JupyterLab extension @ahgraber/jupyterlab_material_darker is activated!');
    const style = '@ahgraber/jupyterlab_material_darker/index.css';

    manager.register({
      name: '@ahgraber/jupyterlab_material_darker',
      isLight: true,
      load: () => manager.loadCSS(style),
      unload: () => Promise.resolve(undefined)
    });
  }
};

export default extension;
