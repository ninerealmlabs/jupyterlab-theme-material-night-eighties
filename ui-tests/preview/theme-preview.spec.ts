/**
 * Manual theme review -- run with `jlpm preview` from `ui-tests`.
 *
 * This is not a pass/fail suite. It walks JupyterLab through the surfaces a
 * palette change is most likely to break, screenshots each one, and opens a
 * report for a human to look at.
 *
 * Each run rotates the previous run's screenshots aside, so every surface is
 * reported as "previous" followed by "current" -- i.e. before and after your
 * change. The first run has nothing to compare against; the second onwards do.
 *
 * Screenshots are also written to `ui-tests/preview-output/` (gitignored) if you
 * would rather diff them with your own tools.
 *
 * Each surface is its own test so that one failing -- a kernel that would not
 * start, say -- still leaves the others captured and viewable.
 */
import { expect, test } from '@jupyterlab/galata'
import type { Locator, Page, TestInfo } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

const THEME = '@ninerealmlabs/jupyterlab_material_night_eighties'

const OUTPUT = path.resolve(__dirname, '..', 'preview-output')
const CURRENT = path.join(OUTPUT, 'current')
const PREVIOUS = path.join(OUTPUT, 'previous')

const MARKDOWN_SAMPLE = [
  '# Material Night Eighties',
  '',
  'Body copy with a [link](https://jupyter.org), `inline code` and **bold** text.',
  '',
  '- first list item',
  '- second list item',
  '',
  '> A blockquote, for the border and muted-text colors.',
].join('\n')

const CODE_SAMPLE = [
  'import math  # a comment',
  '',
  'name: str = "material night eighties"',
  'count = 42',
  'ratio = math.pi',
  'enabled = True',
  'items = [1, 2, 3]',
  'mapping = {"key": "value"}',
  'print(f"{name}: {count}")',
].join('\n')

/**
 * Screenshot `target`, save it, and attach it to the report next to the same
 * surface from the previous run.
 */
async function capture(testInfo: TestInfo, name: string, target: Page | Locator): Promise<void> {
  const buffer = await target.screenshot()
  fs.mkdirSync(CURRENT, { recursive: true })
  fs.writeFileSync(path.join(CURRENT, `${name}.png`), buffer)

  // Attached before the current shot so the report reads top-to-bottom as
  // before -> after.
  const prior = path.join(PREVIOUS, `${name}.png`)
  if (fs.existsSync(prior)) {
    await testInfo.attach(`${name} — PREVIOUS run`, {
      path: prior,
      contentType: 'image/png',
    })
  }
  await testInfo.attach(`${name} — CURRENT`, {
    body: buffer,
    contentType: 'image/png',
  })
}

// Runs once: the preview config pins `workers: 1`.
test.beforeAll(() => {
  fs.rmSync(PREVIOUS, { recursive: true, force: true })
  if (fs.existsSync(CURRENT)) {
    fs.renameSync(CURRENT, PREVIOUS)
  }
  fs.mkdirSync(CURRENT, { recursive: true })
})

test.beforeEach(async ({ page }) => {
  await page.theme.setTheme(THEME)
  expect(await page.theme.getTheme()).toBe(THEME)
})

test('shell and launcher', async ({ page }, testInfo) => {
  await expect(page.locator('.jp-Launcher')).toBeVisible()

  // Whole viewport: menu bar, sidebar, file browser and status bar in one shot.
  await capture(testInfo, 'shell-and-launcher', page)
})

test('dialog', async ({ page }, testInfo) => {
  // The kernel picker is the most reliably reachable dialog. Covers
  // --jp-dialog-background and the accept/reject button colors.
  await page.menu.clickMenuItem('File>New>Notebook')
  const dialog = page.locator('.jp-Dialog')
  await dialog.waitFor()

  await capture(testInfo, 'dialog', dialog)

  await page.locator('.jp-Dialog .jp-mod-reject').click()
})

test('notebook editors', async ({ page }, testInfo) => {
  // No kernel: this surface is about editor and prompt colors, not output.
  await page.notebook.createNew('theme-preview.ipynb', { kernel: null })

  await page.notebook.setCell(0, 'markdown', MARKDOWN_SAMPLE)
  // Markdown rendering is client side, so Shift+Enter renders it without a
  // kernel. `notebook.runCell` cannot be used here -- it waits for one.
  await page.notebook.selectCells(0)
  await page.keyboard.press('Shift+Enter')
  await expect(page.locator('.jp-RenderedMarkdown').first()).toBeVisible()

  await page.notebook.addCell('code', CODE_SAMPLE)
  // Re-set so galata waits for CodeMirror highlighting to settle.
  await page.notebook.setCell(1, 'code', CODE_SAMPLE)

  await capture(testInfo, 'notebook-editors', page.locator('.jp-NotebookPanel'))
})

test('cell outputs and error traceback', async ({ page }, testInfo) => {
  // This one does need a kernel -- an error traceback exercises
  // --jp-rendermime-error-background and the ANSI color palette, which
  // nothing else covers.
  await page.notebook.createNew('theme-preview-outputs.ipynb')

  await page.notebook.setCell(0, 'code', 'print("standard output")')
  await page.notebook.runCell(0)

  await page.notebook.addCell('code', 'raise ValueError("traceback colors")')
  await page.notebook.setCell(1, 'code', 'raise ValueError("traceback colors")')
  await page.notebook.runCell(1)

  await expect(page.locator('.jp-OutputArea-output').first()).toBeVisible()

  await capture(testInfo, 'cell-outputs', page.locator('.jp-NotebookPanel'))
})
