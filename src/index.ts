import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { IThemeManager } from '@jupyterlab/apputils';

/**
 * Initialization data for the jupyterlab-material-darker extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab-material-darker:plugin',
  autoStart: true,
  requires: [IThemeManager],
  activate: (app: JupyterFrontEnd, manager: IThemeManager) => {
    console.log('JupyterLab extension jupyterlab-material-darker is activated!');
    const style = 'jupyterlab-material-darker/index.css';

    manager.register({
      name: 'jupyterlab-material-darker',
      isLight: true,
      load: () => manager.loadCSS(style),
      unload: () => Promise.resolve(undefined)
    });
  }
};

export default plugin;
