# Evidence Model

## Case layout

```text
case-root/
├── scope.md
├── evidence/
│   ├── screenshots/
│   ├── raw_screenshots/
│   ├── ui_tree/
│   └── runtime/
├── indexes/
│   ├── screenshot_index.csv
│   ├── interface_index.csv
│   ├── control_coverage.csv
│   └── coverage_gaps.csv
├── analysis/
├── reports/
└── templates/
```

## Stable evidence ID

Use `<PREFIX>-<four digits>_<slug>`, for example `EV-0001_first-launch`.

The same base name binds:

- visual evidence;
- UI hierarchy;
- runtime snapshot;
- report statement;
- capability or interface row.

Do not reuse an ID for a different state. Preserve mistaken or partial captures as audit records when they influenced a conclusion; mark their validity instead of silently replacing history.

## Evidence labels

- `[OBSERVED]`: directly visible in a screenshot, UI hierarchy, Android command output, or reproducible state.
- `[COMPUTED]`: generated from evidence, such as a hash, image dimension, count, or coverage result.
- `[INFERRED]`: a bounded interpretation supported by cited observations.
- `[NOT_TESTED]`: visible or expected capability not exercised.
- `[OUT_OF_SCOPE]`: intentionally excluded, such as real payment.

## Separate proof layers

Keep these claims independent:

1. A page or control exists.
2. The control can be activated.
3. A visible result appears.
4. Android runtime state changes.
5. Data persists after restart.
6. External service or API success is proven.

One layer does not automatically prove the next.

## Capture quality

- Keep the original screenshot bytes.
- Record actual format, dimensions, byte size, and SHA-256.
- Treat UI-tree failure separately from screenshot validity.
- Record unavailable camera, login, network, or paid access as a boundary.
- Avoid publishing runtime dumps until identifiers and tokens are reviewed.
