# Security Policy

[简体中文](SECURITY.md) | [English](SECURITY.en.md)

## Supported Versions

Only the latest version on the default branch is supported. Security updates are not guaranteed for older commits, personal forks, or copies not published by the maintainer.

Reportable issues include unsafe script execution, unintended collection or disclosure of sensitive information, dangerous default behavior, validation bypasses, and other flaws in this project that could affect a user's device or analysis materials.

Vulnerabilities in third-party Android apps are outside this repository's scope and should be reported to the corresponding app maintainer. Do not upload APKs, screenshots, UI XML, device identifiers, account data, or other unsanitized materials with a report.

## Reporting a Vulnerability Privately

Do not disclose vulnerability details in a public Issue, Pull Request, or Discussion.

1. Prefer the private **Report a vulnerability** entry on this repository's **Security** page.
2. If that entry is unavailable, open a public Issue titled `[Security contact request]` that contains no sensitive details. Identify only the general component and ask to establish a private channel.
3. Do not send reproduction steps, exploit code, device addresses, credentials, or real analysis materials until a private channel has been established.

A useful report should include, when possible:

- the affected commit or version;
- a description of the issue and its potential impact;
- minimal, safe, and sanitized reproduction steps;
- any known mitigations; and
- any coordinated-disclosure timing requirements.

The maintainer will aim to acknowledge a report within seven days and coordinate remediation and disclosure after confirming the issue. This is a response target, not a service-level guarantee.

## Security Research Boundaries

- Test only devices, apps, and data that you own or are authorized to assess.
- Do not submit third-party credentials, personal information, or internal company materials through the reporting process.
- Do not perform payments, account deletion, destructive data operations, risk-control bypasses, or actions that affect other users to demonstrate an issue.
- Allow reasonable time for remediation and user upgrades before public disclosure.

