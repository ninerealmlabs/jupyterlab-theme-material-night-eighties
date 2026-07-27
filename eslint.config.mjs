// Formatting and general linting are handled by biome (see .biome.jsonc).
// eslint is kept only for @jupyter/eslint-plugin, whose rules are specific to
// JupyterLab extensions -- plugin descriptions, token naming, translation
// handling -- and have no biome equivalent.
import jupyterPlugin from "@jupyter/eslint-plugin"
import { defineConfig } from "eslint/config"
import tseslint from "typescript-eslint"

export default defineConfig([
  {
    ignores: [
      "node_modules",
      "dist",
      "lib",
      "coverage",
      "scss",
      "jupyterlab_material_night_eighties",
      "**/*.js",
      "**/*.mjs",
      "**/*.d.ts",
      "**/.ipynb_checkpoints/**",
      ".venv",
      "tests",
      "**/__tests__",
      "ui-tests",
    ],
  },
  // Parser and plugin registration only -- no rule sets, so nothing here
  // duplicates what biome already reports.
  tseslint.configs.base,
  jupyterPlugin.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx"],
    plugins: {
      jupyter: jupyterPlugin,
    },
    languageOptions: {
      parserOptions: {
        project: "tsconfig.json",
        sourceType: "module",
      },
    },
  },
])
