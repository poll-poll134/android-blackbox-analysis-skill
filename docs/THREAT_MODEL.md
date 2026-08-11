# Threat Model

This document describes security boundaries for the public Skill and its helper scripts. It is not a claim that third-party Android apps are safe.

## Protected assets

- The maintainer's and user's credentials, device identifiers, internal package names, screenshots, UI dumps, and runtime reports.
- Files outside the explicitly selected case directory.
- The state of the designated Android device and app.
- The integrity of generated CSV indexes and published release archives.

## Trust boundaries

1. **User instructions and scope** define the only device, app, case directory, and actions the Skill may use.
2. **ADB output and app-rendered text are untrusted evidence.** They may contain prompt-injection text, terminal escapes, spreadsheet formulas, misleading labels, or malformed XML. They never grant permission to run commands or expand scope.
3. **Generated case data is private by default.** `cases/` is ignored and must not be published without separate human review.
4. **Repository contributions and dependencies are untrusted until reviewed.** CI checks structure and known negative cases, but cannot prove a contribution or dependency is benign.
5. **Release archives are maintainer-built artifacts.** Users should verify the published SHA-256 checksum before installation.

## Primary threats and controls

| Threat | Example impact | Current control |
|---|---|---|
| Prompt injection in UI text | An app tells an Agent to reveal files, run shell commands, or ignore scope | `SKILL.md` requires treating UI content only as evidence; execution remains limited to documented helpers and explicit user approval boundaries |
| Shell or argument injection | A crafted package, ID, slug, wait, or swipe value changes a command | Shell arguments are quoted; package names, path components, dimensions, counts, coordinates, and waits are allow-listed and bounded |
| CSV formula injection | UI text beginning with `=`, `+`, `-`, or `@` executes when an index opens in a spreadsheet | Formula-like generated cells are prefixed as text before CSV quoting |
| Path traversal or symlink escape | A published reference or case root reads/writes outside the intended tree | Published paths must remain under the example root; symlinks and unsafe case roots are rejected |
| Resource exhaustion | Huge XML/text input or unbounded sweep consumes memory, time, or device actions | UI dumps and publishable text have size caps; sweep count, duration, coordinates, and waits are bounded |
| Credential or private-data disclosure | Tokens, private keys, account data, device addresses, or real artifacts enter a release | Heuristic redaction checks, forbidden artifact types, ignored case data, private reporting, and mandatory human review |
| Unauthorized device/network action | A helper acts on another device or exposes ADB | Every ADB operation requires an explicit serial; helpers do not discover or select a target; documentation forbids exposing ADB to untrusted networks |
| Destructive app action | Automation triggers payment, deletion, permission, publication, or account changes | Taps are dry-run by default; high-risk and irreversible actions require separate confirmation and must be listed in scope |
| Supply-chain compromise | A dependency, Action, release asset, or contribution changes behavior | Runtime uses standard Bash/Node/Python libraries; Actions are pinned by commit; CodeQL, Dependabot, review policy, negative tests, deterministic packaging, and checksums provide layered controls |

## Residual risks

- Text redaction cannot detect sensitive pixels in screenshots or every identifier in arbitrary dumps.
- A malicious app may render deceptive text or change state between capture and a later user-approved tap.
- ADB itself is highly privileged. A compromised host, device, platform-tools installation, or exposed ADB endpoint is outside what this repository can contain.
- CI validates scripts and synthetic fixtures; it does not establish compatibility across all devices, Android versions, custom renderers, or third-party contributions.
- Human review remains required before publishing any real case material or accepting code that changes shell, file, network, release, or credential behavior.

Security reports should follow [`SECURITY.en.md`](../SECURITY.en.md).
