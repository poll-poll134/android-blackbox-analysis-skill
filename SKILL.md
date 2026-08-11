---
name: android-app-blackbox-competitive-analysis
description: Use when users request Android competitor research, systematic feature or interface mapping, evidence screenshots, interaction coverage, comparison-ready product dossiers, or Android system-boundary verification without APK decompilation.
---

# Android App Black-Box Competitive Analysis

## Purpose

Build an auditable product dossier from visible app behavior and Android runtime evidence. Do not decompile, unpack, or inspect private implementation code.

## Safety boundary

- Use only the device explicitly designated by the user.
- Do not interact with payment, account deletion, destructive data actions, permission grants, or irreversible external actions without explicit user authorization.
- Treat unavailable hardware, login, network, or paid access as an environment or scope boundary, not automatically as a product defect.
- Keep screenshots even when `uiautomator` cannot return a complete hierarchy; record UI-tree completeness separately.
- Never claim that a visible entry proves backend success, that a process name proves isolation, or that encrypted traffic reveals undocumented API fields.

## Quick start

```bash
./scripts/init_case.sh ./cases/sample-app
./scripts/capture_evidence.sh \
  --serial emulator-5554 \
  --case-root ./cases/sample-app \
  --id EV-0001 \
  --slug first-launch \
  --package com.example.target
node ./scripts/build_indexes.mjs --case-root ./cases/sample-app
```

## Analysis steps

1. Record the designated device, package, allowed actions, excluded actions, and unavailable prerequisites.
2. Capture the initial screen, every page family, important state, confirmation boundary, result state, and return state.
3. Use stable evidence IDs. One ID should bind the screenshot, UI tree, runtime snapshot, and report statement.
4. Use `scroll_sweep.sh` for long pages and `tap_ui.sh` in dry-run mode before any exact-selector tap.
5. Run `build_indexes.mjs` after each capture batch.
6. Classify statements as `[OBSERVED]`, `[COMPUTED]`, `[INFERRED]`, or `[NOT_TESTED]`.
7. Separate product capability, visible interaction, Android runtime evidence, and unverified implementation assumptions.
8. Complete the capability and system-interface templates, then write the report from evidence IDs.
9. Run `smoke_test.sh`, `validate_skill.mjs`, `validate_example.mjs`, and `redact_check.mjs` before publishing reusable material.

## Expected outputs

- Screenshot inventory with hashes and dimensions.
- UI/interface index and control coverage matrix.
- Coverage-gap list.
- Capability matrix and system-interface evidence list.
- Systematic report with scope, feature map, evidence, limitations, and comparison-ready conclusions.

See [evidence model](references/evidence-model.md), [analysis guide](references/analysis-guide.md), and [report template](templates/report-template.md).
