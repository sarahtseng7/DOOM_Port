"""Run one command with a timeout, saved log, and honest activity updates."""
import os
import re
import signal
import subprocess
import sys
import time

log, command = sys.argv[1], sys.argv[2:]
limit = int(os.environ.get('TIMEOUT_SECONDS', '3600'))
print(f'Log: {log}', flush=True)
with open(log, 'w') as output:
    process = subprocess.Popen(command, stdout=output, stderr=subprocess.STDOUT,
                               start_new_session=True)
    started, offset = time.monotonic(), 0
    try:
        while True:
            remaining = limit - (time.monotonic() - started)
            if remaining <= 0:
                raise TimeoutError()
            try:
                code = process.wait(timeout=min(30, remaining))
                break
            except subprocess.TimeoutExpired:
                with open(log, 'rb') as stream:
                    stream.seek(0, 2)
                    size = stream.tell()
                    stream.seek(max(offset, size - 8000))
                    text = stream.read().decode('utf-8', errors='replace')
                offset = size
                lines = [s.strip() for s in re.sub(r'\x1b\[[0-?]*[ -/]*[@-~]', '', text).splitlines() if s.strip()]
                progress = [s for s in lines if s.startswith('PROGRESS:')]
                print((progress[-1] if progress else ' | '.join(lines[-2:]))[:500]
                      if lines else 'No new reported activity; see the log.', flush=True)
    except (TimeoutError, KeyboardInterrupt):
        os.killpg(process.pid, signal.SIGTERM)
        try:
            process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            os.killpg(process.pid, signal.SIGKILL)
            process.wait()
        print('Stopped: timeout or interruption.', flush=True)
        sys.exit(124)
print(f'Finished: exit {code}. Log: {log}', flush=True)
sys.exit(code if code >= 0 else 128 - code)
