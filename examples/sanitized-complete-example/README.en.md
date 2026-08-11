# Complete Sanitized Example

[简体中文](README.md) | [English](README.en.md)

This directory demonstrates a complete public Android black-box analysis chain from input to final report. The app, screens, version, device identifier, and all observations are synthetic and do not represent any real product or user.

To demonstrate publication safety, reviewable text screen summaries replace real screenshots and UI XML. `screenshot_index.csv` retains the production index headers while marking the format as `TEXT-SUMMARY` and the UI-tree status as `omitted`; the SHA-256 hashes and byte counts of these summaries remain reproducible. This publication treatment does not mean raw screenshots or UI XML may be skipped during normal analysis.

## Directory and Analysis Chain

```text
input/scope.md
input/capture-plan.csv
        │
        ▼
evidence/screen-summaries/*.md
        │
        ▼
indexes/screenshot_index.csv
indexes/interface_index.csv
indexes/control_coverage.csv
indexes/coverage_gaps.csv
        │
        ▼
analysis/capability-matrix.csv
analysis/system-interface-evidence.csv
        │
        ▼
reports/final-report.en.md
```

## How to Read It

1. Start with [`input/scope.en.md`](input/scope.en.md) for the device, allowed actions, and explicit exclusions.
2. Compare the plan and observed states in [`input/capture-plan.csv`](input/capture-plan.csv).
3. Follow `DEMO-0001` through `DEMO-0005` across screen summaries, the four indexes, and the report.
4. Review omitted raw artifacts, an incomplete UI tree, and untested prerequisites in [`indexes/coverage_gaps.csv`](indexes/coverage_gaps.csv).
5. The final report treats only index-supported statements as observed or computed; all other statements are marked as inferred or untested.

Recompute the published-summary hashes with:

```bash
shasum -a 256 examples/sanitized-complete-example/evidence/screen-summaries/*.md
```

Validate the complete example reference chain from the repository root:

```bash
node ./scripts/validate_example.mjs ./examples/sanitized-complete-example
```
