const jestJupyterLab = require('@jupyterlab/testutils/lib/jest-config')

const esModules = [
  '@codemirror',
  '@jupyter/ydoc',
  '@jupyterlab/',
  'lib0',
  'nanoid',
  'vscode-ws-jsonrpc',
  'y-protocols',
  'y-websocket',
  'yjs',
].join('|')

const baseConfig = jestJupyterLab(__dirname)

module.exports = {
  ...baseConfig,
  automock: false,
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts', '!src/**/.ipynb_checkpoints/*'],
  coverageDirectory: 'coverage',
  coverageReporters: ['lcov', 'text'],
  // `uv` creates .venv in the project root; the JupyterLab install inside it
  // otherwise collides with itself in jest's haste map.
  modulePathIgnorePatterns: ['<rootDir>/.venv/'],
  testRegex: 'src/.*/.*.spec.ts[x]?$',
  transformIgnorePatterns: [`/node_modules/(?!${esModules}).+`],
}
