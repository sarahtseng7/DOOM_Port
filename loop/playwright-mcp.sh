#!/usr/bin/env bash
set -e
cd "$(dirname "${BASH_SOURCE[0]}")/.."
# Reuse the installed test browser when available; otherwise MCP uses its default.
BROWSER="$(node --input-type=module -e "import {chromium} from './tests/node_modules/playwright/index.mjs'; console.log(chromium.executablePath())" 2>/dev/null || true)"
ARGS=(--headless --isolated --caps vision --output-dir artifacts/browser)
[[ -f "$BROWSER" ]] && ARGS+=(--executable-path "$BROWSER")
# Prefer an installed matching package so startup does not need npm/network.
for CLI in "${npm_config_cache:-$HOME/.npm}"/_npx/*/node_modules/@playwright/mcp/cli.js; do
  [[ -f "$CLI" ]] || continue
  VERSION="$(node -p "require(process.argv[1]).version" "${CLI%/cli.js}/package.json")"
  [[ "$VERSION" == 0.0.84 ]] && exec node "$CLI" "${ARGS[@]}"
done
exec npx -y @playwright/mcp@0.0.84 "${ARGS[@]}"
