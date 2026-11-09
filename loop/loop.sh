#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."
# Load the existing local SDK if this terminal has not loaded it yet.
if ! command -v emcc >/dev/null && [[ -f "$HOME/Developer/emsdk/emsdk_env.sh" ]]; then
  source "$HOME/Developer/emsdk/emsdk_env.sh" >/dev/null 2>&1
fi
MAX_ITERATIONS=10
export TIMEOUT_SECONDS=3600
mkdir -p artifacts/logs artifacts/reports

agent() {
  local name="$1" task="$2"
  local output
  output="$(mktemp -d "artifacts/logs/$name.XXXXXX")"
  echo "Running $name: $task"
  python3 loop/run-command.py "$output/agent.log" \
    docker agent run loop/agents.yaml --agent "$name" --exec \
    "Task: $task Read artifacts/reports/ for prior findings. OUTPUT_DIR=$output REPORT=$output/report.md. Follow your role prompt; record assumptions and evidence."
  [[ -f "$output/report.md" ]] || { echo "Missing report: $output/report.md"; exit 2; }
  cp "$output/report.md" "artifacts/reports/$name.md"
}


agent tester "Prepare missing criteria and tests; preserve existing valid checks."
for ((i=1; i<=MAX_ITERATIONS; i++)); do
  echo "Iteration $i/$MAX_ITERATIONS"
  agent coder "Implement or repair build/startup and shared interfaces."
  agent coder_render_timing "Implement or repair rendering and timing."
  agent coder_input_audio "Implement or repair controls, sound effects, and music."
  agent coder "Integrate specialist work through your owned files."
  agent reviewer_site "Review localhost:8000 loading and startup."
  agent reviewer_gameplay "Review movement, playability, and audio."
  agent tester "Run automated verification and report remaining failures."
  log="$(mktemp "artifacts/logs/verify.XXXXXX")"
  if python3 loop/run-command.py "$log" bash tests/verify.sh; then
    if [[ "$(head -n 1 artifacts/reports/reviewer_site.md)" == PASS &&
          "$(head -n 1 artifacts/reports/reviewer_gameplay.md)" == PASS &&
          "$(head -n 1 artifacts/reports/tester.md)" == PASS ]]; then
      echo "Game checks and both reviews passed. Review homework evidence separately."
      exit 0
    fi
  fi
  echo "Findings remain; continuing. Read artifacts/reports/."
done
echo "Iteration limit reached without verified success."
exit 1