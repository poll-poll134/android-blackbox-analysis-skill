# Android App Black-Box Analysis Skill

[简体中文](README.md) | [English](README.en.md)

A Codex Skill for **black-box competitive analysis of Android apps**. It uses ADB screenshots, UI hierarchies, Android runtime information, and structured indexes to turn manual app exploration into traceable, verifiable evidence that can support side-by-side comparisons.

> Core principle: Draw conclusions only from visible behavior and Android system evidence. Do not decompile APKs or present assumptions as facts.

## Project Background and Open-Source Rationale

This repository was first made public in August 2026, but it was not created as a temporary proof of concept solely for the Codex for Open Source application process. It grew out of a personal toolchain that I have used over the long term for black-box analysis of Android apps. Inspired by the Codex for Open Source program, I generalized the original tools, removed private information, clarified operational boundaries, and added release validation. I am publishing it under the MIT License so that other maintainers working on Android, cloud devices, and agent tooling can reuse it and contribute.

## Used in Practice

The private predecessor of this repository has been used over the long term for authorized black-box analysis of Android apps, including systematic screen, feature, and runtime-boundary reviews of two app-cloning products. Real work used remote ADB containerized Android environments and encountered JPEG screenshot output, incomplete UI hierarchies, unavailable cameras, interrupted networks followed by resumed capture, payment boundaries, and user-assisted login or permission steps. The resulting evidence supported capability matrices, product-difference comparisons, and feature selection for a new product.

These statements describe real use of the method and its private predecessor. They do not claim third-party adoption of this public repository, user counts, download counts, or success rates that cannot be verified publicly.

## Complete Sanitized Example

[`examples/sanitized-complete-example/`](examples/sanitized-complete-example/README.en.md) demonstrates the complete cross-reference chain among scope input, capture plan, text evidence summaries, four evidence indexes, coverage gaps, capability matrix, system-interface boundaries, and final report. All example data is synthetic and represents no real app, device, or user; real screenshots and UI XML are not included in the public repository.

## Problems It Solves

- **Screens and features are easy to miss**: Assign stable evidence IDs to screens, states, dialogs, long pages, and return paths.
- **Screenshots alone cannot support conclusions**: Bind screenshots, UI XML, dimensions, SHA-256 hashes, and runtime information to the same evidence record.
- **Analysis results are difficult to verify**: Automatically generate a screenshot index, interface index, control coverage table, and coverage-gap list.
- **Observations and assumptions become mixed together**: Classify conclusions as `[OBSERVED]`, `[COMPUTED]`, `[INFERRED]`, or `[NOT_TESTED]`.
- **System capabilities are easily overstated**: Separate product entry points, observed interaction results, Android runtime evidence, and unverified implementation assumptions.
- **Competitive-analysis materials are difficult to reuse**: Produce consistent capability matrices, system-interface evidence tables, and report templates.
- **Internal information can leak during publication**: Provide text-based redaction checks and publishable-package structure validation.

## Suitable and Unsuitable Use Cases

### Suitable

- Mapping Android competitor features, interfaces, and interaction paths.
- Building aligned capability matrices across similar apps.
- Using screenshots and Android system information to verify boundaries such as permissions, foreground activities, and AppOps.
- Physical devices, emulators, cloud devices, and containerized Android environments accessible through ADB.
- Systematic analysis that must retain image dimensions, evidence hashes, and known coverage gaps.

### Not Suitable

- Analysis of iOS apps, websites, or desktop applications.
- Static APK auditing, source-code auditing, vulnerability exploitation, protocol reverse engineering, or risk-control bypasses.
- Recovering private API fields from encrypted network traffic.
- Automating login, payment, CAPTCHA, account deletion, or other high-risk actions.
- Making unconditional claims of exhaustive feature coverage. Login, payment, hardware, region, and network prerequisites must be recorded explicitly as untested boundaries.

## Outputs

| Type | Contents | How it is completed |
|---|---|---|
| Raw evidence | Screenshots, original screenshots, UI hierarchy XML | Captured automatically |
| Runtime evidence | package, AppOps, activities, and capture metadata | Captured automatically when a package is specified |
| Evidence indexes | `screenshot_index.csv`, `interface_index.csv`, `control_coverage.csv`, `coverage_gaps.csv` | Generated automatically |
| Scope definition | Device, package name, allowed and prohibited actions, prerequisites | A skeleton is generated and completed manually |
| Product analysis | Capability matrix and system-interface evidence table | Summarized manually from evidence IDs |
| Final report | Scope, features, interfaces, interactions, evidence, limitations, and comparison conclusions | Completed manually from the template |

The Skill generates and copies report templates; it **does not automatically fill in the final report without evidence-based analysis**.

## Requirements and Compatibility

### Core Requirements

- Codex Desktop or Codex CLI with Skills support.
- Android Platform Tools with `adb` available on `PATH`.
- Bash 3.2+, Node.js 18+, and Python 3.9+.
- Optional: ImageMagick. On macOS, the workflow can fall back to `sips` when a device returns JPEG screenshots.

### Compatibility Matrix

| Environment | Support notes |
|---|---|
| macOS | Runs directly; verified with the local smoke test |
| Linux | Core smoke, structure, and redaction checks pass on GitHub Actions Ubuntu 24.04.4; real Android-device capture has not been tested across a Linux distribution matrix; ImageMagick is recommended for JPEG conversion |
| Windows | WSL2 is recommended, with `adb`, Bash, Node.js, and Python installed inside WSL; direct execution of `.sh` files in PowerShell or CMD is not supported |
| USB-connected physical device | Supported; USB debugging must be enabled and RSA authorization completed |
| Android emulator | Supported; use the actual serial reported by `adb devices -l` |
| Remote or cloud device | Supported; run `adb connect` first, then pass `host:port` to `--serial` |
| Containerized Android | Capture is possible when ADB, screenshots, and `uiautomator` are available; missing hardware such as a camera must be recorded as an environment boundary |

WebView, Canvas, game, and custom-rendered interfaces may not return a complete UI hierarchy. In these cases, screenshots remain valid evidence, but control coverage must be marked as incomplete.

## Installation

### macOS / Linux / WSL2

```bash
mkdir -p ~/.codex/skills
git clone https://github.com/poll-poll134/android-blackbox-analysis-skill.git \
  ~/.codex/skills/android-app-blackbox-competitive-analysis
```

If you use a custom `CODEX_HOME`, place the repository at `$CODEX_HOME/skills/android-app-blackbox-competitive-analysis`. Some shared agent environments use `~/.agents/skills/`; substitute the Skills directory used by your environment when necessary.

### Verify the Installation

```bash
test -f ~/.codex/skills/android-app-blackbox-competitive-analysis/SKILL.md
cd ~/.codex/skills/android-app-blackbox-competitive-analysis
./scripts/smoke_test.sh
```

After installation, create a new Codex task or restart the current Codex client to refresh the Skills directory. Use the following request to test skill triggering:

```text
Use android-app-blackbox-competitive-analysis to perform black-box feature, interface, and interaction analysis of the Android app I designate, without decompiling it.
```

### Update

```bash
git -C ~/.codex/skills/android-app-blackbox-competitive-analysis pull --ff-only
```

## First Analysis

### 1. Confirm the Device

```bash
adb devices -l
adb -s emulator-5554 get-state
```

Remote ADB example:

```bash
adb connect adb-host.example:5555
adb -s adb-host.example:5555 get-state
```

When multiple devices are online, every command must specify the serial explicitly. Do not expose an ADB port to an untrusted network for convenience.

### 2. Create the Analysis Directory

```bash
cd ~/.codex/skills/android-app-blackbox-competitive-analysis
./scripts/init_case.sh ./cases/sample-app
```

Complete `./cases/sample-app/scope.md` before interacting with the app. At a minimum, record:

- The designated device and app version.
- The package name.
- Actions that may be automated and actions that require user assistance.
- Prohibited payment, deletion, account, and privacy-related actions.
- Unavailable prerequisites such as login, network, camera, or location access.

### 3. Capture One Evidence Record

Navigate the app to the screen to be analyzed, then run:

```bash
./scripts/capture_evidence.sh \
  --serial emulator-5554 \
  --case-root ./cases/sample-app \
  --id EV-0001 \
  --slug first-launch \
  --package com.example.target
```

The first capture prints the actual `resolution`. After confirming that it is correct for the target device, later captures can add a real-dimension gate such as `--expected-size 1080x2400` to prevent evidence with an unexpected resolution or reduced clarity from entering the results. You can also check the screen size reported by the device with the following command, but for portrait and landscape orientations, use the dimensions reported by the actual screenshot as the source of truth:

```bash
adb -s emulator-5554 shell wm size
```

Each `ID + slug` combination must be unique. Do not reuse an existing evidence ID.

### 4. Sweep a Long Page

```bash
./scripts/scroll_sweep.sh \
  --serial emulator-5554 \
  --case-root ./cases/sample-app \
  --prefix EV \
  --start 20 \
  --slug privacy-policy \
  --count 5 \
  --package com.example.target \
  --swipe 540 1800 540 400 700 \
  --wait 1
```

Adjust `--swipe X1 Y1 X2 Y2 DURATION_MS` to the actual resolution, screen orientation, and scrollable region. Do not use the example coordinates blindly.

### 5. Preview and Perform an Exact Tap

```bash
./scripts/tap_ui.sh --serial emulator-5554 --selector Continue
./scripts/tap_ui.sh --serial emulator-5554 --selector Continue --execute --wait 1
```

The first command only prints the proposed tap coordinates and does not tap by default. Use `--execute` only after confirming that the selector is unique, the coordinates are correct, and the action is within the allowed scope.

### 6. Build the Indexes

```bash
node ./scripts/build_indexes.mjs --case-root ./cases/sample-app
```

Review these files carefully:

- `indexes/screenshot_index.csv`: Screenshot hashes, dimensions, and UI-tree status.
- `indexes/interface_index.csv`: Visible text, descriptions, and control summaries.
- `indexes/control_coverage.csv`: Interactive controls and coordinates.
- `indexes/coverage_gaps.csv`: Missing XML, incomplete UI trees, duplicate IDs, and other gaps.

### 7. Complete the Manual Analysis and Report

Complete the following files in `cases/sample-app/templates/`:

- `capability-matrix.csv`: Product capabilities, states, entry points, and evidence IDs.
- `system-interface-evidence.csv`: System boundaries, direct evidence, inferences, and limitations.
- `report-template.md`: Produce the final report.

A capability is considered a complete analysis loop only when the entry point, key states, result or blocking state, and return path are all supported by evidence, or when untested prerequisites have been recorded explicitly.

## Pre-Publication Validation and Redaction

```bash
./scripts/smoke_test.sh
node ./scripts/validate_skill.mjs .
node ./scripts/validate_example.mjs ./examples/sanitized-complete-example
node ./scripts/redact_check.mjs .
```

`validate_example.mjs` verifies the public example's required files, CSV schemas, and cross-references; recomputes SHA-256 hashes and byte counts for text evidence; and checks that evidence IDs, coverage gaps, capability and system-interface records, and both final reports form a consistent chain.

To scan a specific case directory and an additional internal code name, run separately:

```bash
node ./scripts/redact_check.mjs ./cases/sample-app --deny internal-code-name
```

`redact_check.mjs` is only a heuristic text scan; it is **not a publication-safety guarantee**. It cannot identify visual information such as accounts, profile images, or addresses in screenshots, and it cannot cover every device serial or the contents of UI XML. Before publishing externally, separately review:

- APKs, AABs, signing files, and original installation packages.
- Screenshots, UI XML, runtime dumps, and completed reports.
- Credentials, email addresses, internal package names, device addresses, serials, and internal code names.

The default `.gitignore` excludes generated `cases/`. Do not commit APKs, screenshots, UI dumps, logs, device identifiers, or completed competitive-analysis reports unless they have been reviewed separately.

## Safety Boundaries

- Operate only on the device and app explicitly designated by the user.
- Payment, deletion, permission grants, publication, account changes, and irreversible actions require separate confirmation.
- When login, network, hardware, or paid prerequisites are unavailable, record them as scope boundaries rather than automatically treating them as product defects.
- A visible entry point does not prove backend success, a process name does not prove complete isolation, and encrypted traffic does not reveal undocumented API fields.

## Directory Structure

```text
android-app-blackbox-competitive-analysis/
├── .github/workflows/validate.yml
├── CONTRIBUTING.md
├── CONTRIBUTING.en.md
├── SECURITY.md
├── SECURITY.en.md
├── SKILL.md
├── README.md
├── README.en.md
├── examples/
│   └── sanitized-complete-example/
├── references/
│   ├── analysis-guide.md
│   └── evidence-model.md
├── scripts/
│   ├── init_case.sh
│   ├── capture_evidence.sh
│   ├── scroll_sweep.sh
│   ├── tap_ui.sh
│   ├── build_indexes.mjs
│   ├── redact_check.mjs
│   ├── validate_example.mjs
│   ├── validate_skill.mjs
│   └── smoke_test.sh
└── templates/
    ├── capability-matrix.csv
    ├── system-interface-evidence.csv
    └── report-template.md
```

## License

MIT
