#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
skill_root="$(cd "${script_dir}/.." && pwd)"
temporary_dir="$(mktemp -d "${TMPDIR:-/tmp}/android-blackbox-skill-test.XXXXXX")"
trap 'rm -rf "${temporary_dir}"' EXIT
case_root="${temporary_dir}/case"

"${script_dir}/init_case.sh" "${case_root}" >/dev/null
python3 -c 'import base64,sys; open(sys.argv[1],"wb").write(base64.b64decode("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII="))' "${case_root}/evidence/screenshots/EV-0001_first-launch.png"
printf '%s\n' '<hierarchy rotation="0"><node index="0" text="Continue" resource-id="com.example.target:id/continue" class="android.widget.Button" package="com.example.target" content-desc="" clickable="true" long-clickable="false" checkable="false" checked="false" enabled="true" selected="false" bounds="[10,20][110,80]" /></hierarchy>' > "${case_root}/evidence/ui_tree/EV-0001_first-launch.xml"

node "${script_dir}/build_indexes.mjs" --case-root "${case_root}" >/dev/null
coordinates="$(python3 "${script_dir}/ui_pick.py" "${case_root}/evidence/ui_tree/EV-0001_first-launch.xml" Continue 2>/dev/null)"
[[ "${coordinates}" == '60 50' ]]
[[ "$(wc -l < "${case_root}/indexes/screenshot_index.csv" | tr -d ' ')" -eq 2 ]]
[[ "$(wc -l < "${case_root}/indexes/control_coverage.csv" | tr -d ' ')" -eq 2 ]]
node "${script_dir}/validate_skill.mjs" "${skill_root}" >/dev/null
node "${script_dir}/redact_check.mjs" "${skill_root}" >/dev/null
leak_fixture="${temporary_dir}/redaction-fixture"
mkdir -p "${leak_fixture}"
printf 'device=%s.%s.%s.%s\n' '10' '23' '45' '67' > "${leak_fixture}/sample.txt"
if node "${script_dir}/redact_check.mjs" "${leak_fixture}" >/dev/null 2>&1; then
  printf 'redaction negative test unexpectedly passed\n' >&2
  exit 6
fi
printf 'smoke_test=passed\n'
