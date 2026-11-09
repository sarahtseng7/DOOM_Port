#!/usr/bin/env bash
# Acceptance entry point (tester-owned). Exit 0 only if build + every required check passes.
# Env: RUN_ID (evidence dir name), SOAK_SECONDS (default 300), QUICK=1 (partial; never exits 0),
#      SKIP_BUILD=1 is intentionally NOT supported.
set -u
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
RUN_ID="${RUN_ID:-manual-$(date -u +%Y%m%dT%H%M%SZ)}"
OUT_DIR="${OUT_DIR:-artifacts/runs/$RUN_ID/tester/verify-$(date -u +%H%M%SZ)}"
mkdir -p "$OUT_DIR"
OUT_DIR="$(cd "$OUT_DIR" && pwd)"
export OUT_DIR
fail() { echo "VERIFY FAIL: $1" | tee -a "$OUT_DIR/verify.log"; exit "${2:-1}"; }
step() { echo "== $1" | tee -a "$OUT_DIR/verify.log"; }

# Identity of what was tested.
{
  echo "commit: $(git rev-parse HEAD)"
  echo "dirty_diff_sha256: $(git diff HEAD -- . ':!artifacts' | shasum -a 256 | cut -d' ' -f1)"
  git status --short -- . ':!artifacts' | sed 's/^/status: /'
  echo "tests_sha256: $(cat tests/verify.sh tests/faults.sh tests/playtest.mjs tests/selftest.mjs tests/lib/frames.mjs tests/package.json | shasum -a 256 | cut -d' ' -f1)"
  echo "wad_sha256: $(shasum -a 256 assets/doom1.wad | cut -d' ' -f1)"
  echo "emcc: $(emcc --version 2>/dev/null | head -1 || echo missing)"
} > "$OUT_DIR/identity.txt"

step "tooling"
command -v node >/dev/null || fail "node missing" 2
command -v make >/dev/null || fail "make missing" 2
command -v emcc >/dev/null || fail "emcc missing (source emsdk 4.0.18 env)" 2
(cd tests && npm ci --no-audit --no-fund >>"$OUT_DIR/verify.log" 2>&1) || fail "npm ci in tests/ failed" 2
(cd tests && npx playwright install chromium >>"$OUT_DIR/verify.log" 2>&1) || fail "playwright chromium install failed" 2

step "helper self-test (fault injection on pixel checks)"
node tests/selftest.mjs 2>&1 | tee "$OUT_DIR/selftest.log"; [ "${PIPESTATUS[0]}" -eq 0 ] || fail "selftest failed"

step "clean build"
{ make clean && make all; } >"$OUT_DIR/build.log" 2>&1 || fail "make clean && make all failed (see $OUT_DIR/build.log)"
[ -f dist/index.html ] && [ -f dist/doom.wasm ] || fail "dist/index.html or dist/doom.wasm missing after build"
shasum -a 256 dist/* > "$OUT_DIR/dist-sha256.txt" 2>/dev/null

step "browser playtest"
node tests/playtest.mjs 2>&1 | tee "$OUT_DIR/playtest.log"
rc=${PIPESTATUS[0]}
if [ "$rc" -eq 0 ] && [ "${QUICK:-0}" != 1 ]; then
  step "fault injection (checks must fail on broken behaviour)"
  tests/faults.sh 2>&1 | tee "$OUT_DIR/faults.log"; [ "${PIPESTATUS[0]}" -eq 0 ] || rc=1
fi
echo "{\"exit\": $rc, \"evidence\": \"$OUT_DIR\"}" > "$OUT_DIR/verify-result.json"
exit "$rc"
