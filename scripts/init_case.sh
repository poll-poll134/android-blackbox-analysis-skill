#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 ]]; then
  printf 'usage: %s <case-root>\n' "${0##*/}" >&2
  exit 2
fi

case_root="$1"
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
skill_root="$(cd "${script_dir}/.." && pwd)"

mkdir -p \
  "${case_root}/evidence/screenshots" \
  "${case_root}/evidence/raw_screenshots" \
  "${case_root}/evidence/ui_tree" \
  "${case_root}/evidence/runtime" \
  "${case_root}/indexes" \
  "${case_root}/analysis" \
  "${case_root}/reports" \
  "${case_root}/templates"

for template in capability-matrix.csv system-interface-evidence.csv report-template.md; do
  target="${case_root}/templates/${template}"
  if [[ ! -e "${target}" ]]; then
    cp "${skill_root}/templates/${template}" "${target}"
  fi
done

scope_file="${case_root}/scope.md"
if [[ ! -e "${scope_file}" ]]; then
  printf '%s\n' \
    '# Analysis Scope' \
    '' \
    '- Designated device:' \
    '- Package and version:' \
    '- Allowed actions:' \
    '- User-assisted actions:' \
    '- Excluded actions:' \
    '- Unavailable prerequisites:' \
    '- Evidence prefix:' > "${scope_file}"
fi

printf 'case_root=%s\n' "${case_root}"
printf 'status=ready\n'
