#!/usr/bin/env bash
cd /Users/sarahtseng/Projects/fellowship-loop-capstone
for i in 2 3 4 5 6 7 8 9 10; do QUICK=1 OUT_DIR=/Users/sarahtseng/Projects/fellowship-loop-capstone/artifacts/logs/tester.QSq2Uh/quick-$i node tests/playtest.mjs > /Users/sarahtseng/Projects/fellowship-loop-capstone/artifacts/logs/tester.QSq2Uh/quick-$i.log 2>&1; echo "quick-$i exit=$?" >> /Users/sarahtseng/Projects/fellowship-loop-capstone/artifacts/logs/tester.QSq2Uh/repeat-summary.txt; done
OUT_DIR=/Users/sarahtseng/Projects/fellowship-loop-capstone/artifacts/logs/tester.QSq2Uh/faults tests/faults.sh > /Users/sarahtseng/Projects/fellowship-loop-capstone/artifacts/logs/tester.QSq2Uh/faults.log 2>&1; echo "faults exit=$?" >> /Users/sarahtseng/Projects/fellowship-loop-capstone/artifacts/logs/tester.QSq2Uh/repeat-summary.txt
echo DONE >> /Users/sarahtseng/Projects/fellowship-loop-capstone/artifacts/logs/tester.QSq2Uh/repeat-summary.txt
