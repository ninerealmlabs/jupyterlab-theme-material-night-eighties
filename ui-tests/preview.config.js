/**
 * Configuration for `jlpm preview` -- the manual "does this look right?" pass.
 *
 * This is deliberately not a pass/fail suite. It drives JupyterLab through the
 * surfaces a theme change is most likely to break, screenshots each one, and
 * opens a report for a human to look at. Nothing is compared against a baseline
 * and nothing is committed.
 */
const baseConfig = require('@jupyterlab/galata/lib/playwright-config')

module.exports = {
  ...baseConfig,
  testDir: './preview',
  // The report *is* the output, so always open it.
  reporter: [['html', { open: 'always' }]],
  // A retry would just add duplicate screenshots to the report.
  retries: 0,
  // The run rotates the previous screenshots aside exactly once, in a
  // `beforeAll`; more than one worker would rotate more than once.
  workers: 1,
  webServer: {
    command: 'jlpm start',
    url: 'http://localhost:8888/lab',
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
  },
}
