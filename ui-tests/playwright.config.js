/**
 * Configuration for Playwright using default from @jupyterlab/galata
 */
const baseConfig = require('@jupyterlab/galata/lib/playwright-config')

module.exports = {
  ...baseConfig,
  // Only the automated checks. The theme preview lives in ./preview and is run
  // separately via `jlpm preview`, since it is for a human to look at rather
  // than something to pass or fail.
  testDir: './tests',
  webServer: {
    command: 'jlpm start',
    url: 'http://localhost:8888/lab',
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
  },
}
