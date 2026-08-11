# Contributing

[简体中文](CONTRIBUTING.md) | [English](CONTRIBUTING.en.md)

Thank you for helping improve Android App Black-Box Analysis Skill. Focused contributions to compatibility, evidence capture, index generation, validation scripts, documentation, and tests are welcome.

Report security vulnerabilities privately by following [SECURITY.en.md](SECURITY.en.md). Do not open a public Issue containing vulnerability details.

## Before You Start

- Search existing Issues to avoid duplicate work.
- For a substantial behavior change, open an Issue first and describe the problem, use case, and proposed boundaries.
- Preserve the black-box analysis principle: do not submit decompilation results, bypass mechanisms, or unsupported claims about implementation details.
- Do not commit APKs, screenshots, UI XML, logs, account data, device identifiers, credentials, internal package names, or internal company materials.

## Local Development

The project requires Bash 3.2+, Node.js 18+, and Python 3.9+. After cloning the repository, run:

```bash
./scripts/smoke_test.sh
node ./scripts/validate_skill.mjs .
node ./scripts/redact_check.mjs .
```

All three commands must pass. They do not require an attached Android device. Changes involving a real device should also be tested separately on a device you are authorized to operate, with tested and untested environments documented in the Pull Request.

## Change Requirements

- Keep each Pull Request focused on one clear problem and avoid unrelated refactoring.
- Preserve read-only or preview behavior by default. New operations with side effects must require an explicit execution flag and document their boundaries clearly.
- New outputs should be traceable to evidence IDs and distinguish observations, computations, inferences, and untested areas.
- Behavior changes require corresponding tests or reproducible verification steps.
- Keep Chinese and English documentation synchronized. Code blocks, paths, and safety limitations must remain equivalent.
- Run `git diff --check` before submitting, then manually review both text and binary materials for sensitive information.

## Submitting a Pull Request

A Pull Request should describe:

- the problem and scope of the change;
- whether user-visible behavior changes;
- the validation commands run and their results;
- tested platforms and remaining untested boundaries; and
- any related Issue.

The maintainer may ask for a narrower scope, additional evidence, tests, or redaction. All merged contributions are released under this repository's [MIT License](LICENSE).

