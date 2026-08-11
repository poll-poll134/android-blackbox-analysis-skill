# Analysis Guide

## Scope first

Write `scope.md` before interacting with the app:

- designated ADB target;
- app package and version;
- allowed accounts and test data;
- actions requiring user participation;
- destructive or paid actions excluded;
- unavailable hardware or network prerequisites.

## Capability map

Organize findings as product capabilities rather than a list of taps. Typical capability families:

- first launch and privacy choices;
- navigation, search, and content discovery;
- creation and configuration;
- item lifecycle and batch management;
- data backup, restore, migration, and deletion;
- permissions, notifications, background behavior, and system settings;
- security, credentials, and privacy protections;
- accounts, entitlements, support, and legal disclosures;
- external content and Android system integration.

Keep interaction details in the evidence index. The final capability table should remain decision-friendly.

## Runtime boundary

Use Android commands to observe package, task, process, permission, AppOps, storage, and component state. Do not convert a process name, task label, or UI claim into proof of a separate operating system, kernel, hardware identity, or security boundary.

When traffic is encrypted, record only what is directly supported: destination visibility, component launch, WebView use, or network capability. Do not invent endpoint parameters or response schemas.

## Coverage review

For each capability, check:

- entry state;
- prerequisite state;
- primary success path;
- cancel/back path;
- error or blocked state;
- persistence after restart when relevant;
- Android runtime state when relevant;
- untested or excluded boundary.

Stop expanding only when every known capability has an evidence status, not when every control has been clicked.

## Comparison output

Use one row per capability package:

| Capability | Product A | Product B | Difference | Recommendation | Priority |
|---|---|---|---|---|---|

Keep screenshots, controls, and exact interactions in supporting indexes rather than the meeting table.
