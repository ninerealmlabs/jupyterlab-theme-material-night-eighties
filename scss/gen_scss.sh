#!/bin/bash
# Regenerate variables.css from the base16 seed palette in *.scss.
# Requires the `sass` CLI. Run from this directory.
set -euo pipefail

for file in *.scss; do
  sass --update "${file}":./variables.css
done
