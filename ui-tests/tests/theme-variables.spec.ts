/**
 * Regression tests for the theme's CSS custom properties.
 *
 * A JupyterLab theme fails *silently*: if it omits a `--jp-*` variable, or
 * defines one whose value references an undefined variable, the property is
 * simply unset and JupyterLab falls back to its built-in defaults. Nothing
 * errors. These tests turn that silent degradation into a hard failure.
 *
 * They compare against whatever the *installed* JupyterLab dark theme declares,
 * so they stay correct as JupyterLab adds variables in new releases, and they
 * need no baselines or fixtures.
 *
 * Appearance itself is reviewed by hand -- see `jlpm preview` and ../preview/.
 */
import { expect, test } from '@jupyterlab/galata'
import type { Page } from '@playwright/test'

const THEME = '@ninerealmlabs/jupyterlab_material_night_eighties'

/**
 * Collect every `--jp-*` custom property declared by any loaded stylesheet.
 *
 * Recurses through `@import` rules, since this theme's `index.css` pulls in
 * `variables.css` that way and imported sheets do not appear in
 * `document.styleSheets`.
 */
async function declaredJpVariables(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const names = new Set<string>()

    const walk = (sheet: CSSStyleSheet): void => {
      let rules: CSSRuleList
      try {
        rules = sheet.cssRules
      } catch {
        return // stylesheet served from another origin; not readable
      }
      for (const rule of Array.from(rules)) {
        const imported = (rule as CSSImportRule).styleSheet
        if (imported) {
          walk(imported)
          continue
        }
        const style = (rule as CSSStyleRule).style
        if (!style) {
          continue
        }
        for (const property of Array.from(style)) {
          if (property.startsWith('--jp-')) {
            names.add(property)
          }
        }
      }
    }

    for (const sheet of Array.from(document.styleSheets)) {
      walk(sheet)
    }
    return Array.from(names).sort()
  })
}

/**
 * Resolve the given custom properties against `document.body`.
 *
 * A property that is undefined -- or whose value contains a `var()` reference
 * to an undefined property with no fallback -- resolves to the empty string.
 */
async function computeVariables(page: Page, names: string[]): Promise<Record<string, string>> {
  return page.evaluate((names: string[]) => {
    const style = getComputedStyle(document.body)
    const values: Record<string, string> = {}
    for (const name of names) {
      values[name] = style.getPropertyValue(name).trim()
    }
    return values
  }, names)
}

test('theme is registered and can be activated', async ({ page }) => {
  await page.theme.setTheme(THEME)

  expect(await page.theme.getTheme()).toBe(THEME)
})

test('defines every CSS variable the built-in dark theme defines', async ({ page }) => {
  // Use JupyterLab's own dark theme as the reference set, so this test picks up
  // variables added by future JupyterLab releases without needing an update.
  await page.theme.setDarkTheme()
  const referenceNames = await declaredJpVariables(page)
  const reference = await computeVariables(page, referenceNames)

  expect(referenceNames.length).toBeGreaterThan(100)

  await page.theme.setTheme(THEME)
  const actual = await computeVariables(page, referenceNames)

  // Guard against a vacuous pass. If the built-in dark stylesheet were still
  // supplying values -- because the theme swap silently failed, or because
  // JupyterLab stopped unloading the outgoing theme -- then nothing would ever
  // look "missing" and the assertion below would trivially succeed.
  //
  // This theme overrides most of the palette, so a correct swap changes a large
  // number of variables, and `--jp-layout-color0` (the base background) in
  // particular must no longer hold the built-in value.
  const changed = referenceNames.filter((name) => reference[name] !== actual[name])
  expect(
    changed.length,
    'switching to the theme barely changed any CSS variable -- the theme did not apply, ' +
      'or the built-in dark stylesheet is still loaded'
  ).toBeGreaterThan(20)
  expect(
    actual['--jp-layout-color0'],
    'the base layout color still resolves to the built-in dark theme value'
  ).not.toBe(reference['--jp-layout-color0'])

  const missing = referenceNames.filter((name) => reference[name] !== '' && actual[name] === '')
  expect(
    missing,
    `These --jp-* variables are defined by the built-in dark theme but resolve to nothing under ${THEME}. ` +
      'Each one silently falls back to a JupyterLab default that is off-palette. ' +
      'Add them to style/variables.css, preferring var(--base16-*) references over new hex values.'
  ).toEqual([])
})
