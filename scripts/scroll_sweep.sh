#!/usr/bin/env bash
set -euo pipefail

serial=''
case_root=''
prefix='EV'
start='1'
slug='long-page'
count='3'
package_name=''
x1='540'
y1='1800'
x2='540'
y2='400'
duration='700'
wait_seconds='1'

while [[ $# -gt 0 ]]; do
  case "$1" in
    --serial) serial="${2:-}"; shift 2 ;;
    --case-root) case_root="${2:-}"; shift 2 ;;
    --prefix) prefix="${2:-}"; shift 2 ;;
    --start) start="${2:-}"; shift 2 ;;
    --slug) slug="${2:-}"; shift 2 ;;
    --count) count="${2:-}"; shift 2 ;;
    --package) package_name="${2:-}"; shift 2 ;;
    --swipe) x1="${2:-}"; y1="${3:-}"; x2="${4:-}"; y2="${5:-}"; duration="${6:-}"; shift 6 ;;
    --wait) wait_seconds="${2:-}"; shift 2 ;;
    *) printf 'unknown argument: %s\n' "$1" >&2; exit 2 ;;
  esac
done

if [[ -z "${serial}" || -z "${case_root}" ]]; then
  printf 'usage: %s --serial SERIAL --case-root DIR [--prefix EV] [--start 1] [--slug NAME] [--count 3]\n' "${0##*/}" >&2
  exit 2
fi

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
for ((index=0; index<count; index++)); do
  number=$((start + index))
  evidence_id="$(printf '%s-%04d' "${prefix}" "${number}")"
  segment_slug="$(printf '%s_%02d' "${slug}" "$((index + 1))")"
  args=(--serial "${serial}" --case-root "${case_root}" --id "${evidence_id}" --slug "${segment_slug}")
  if [[ -n "${package_name}" ]]; then args+=(--package "${package_name}"); fi
  "${script_dir}/capture_evidence.sh" "${args[@]}"
  if (( index + 1 < count )); then
    adb -s "${serial}" shell input swipe "${x1}" "${y1}" "${x2}" "${y2}" "${duration}"
    sleep "${wait_seconds}"
  fi
done
