#!/usr/bin/env bash
set -euo pipefail

serial=''
case_root=''
evidence_id=''
slug=''
package_name=''
expected_size=''

while [[ $# -gt 0 ]]; do
  case "$1" in
    --serial) serial="${2:-}"; shift 2 ;;
    --case-root) case_root="${2:-}"; shift 2 ;;
    --id) evidence_id="${2:-}"; shift 2 ;;
    --slug) slug="${2:-}"; shift 2 ;;
    --package) package_name="${2:-}"; shift 2 ;;
    --expected-size) expected_size="${2:-}"; shift 2 ;;
    *) printf 'unknown argument: %s\n' "$1" >&2; exit 2 ;;
  esac
done

if [[ -z "${serial}" || -z "${case_root}" || -z "${evidence_id}" || -z "${slug}" ]]; then
  printf 'usage: %s --serial SERIAL --case-root DIR --id ID --slug SLUG [--package NAME] [--expected-size WIDTHxHEIGHT]\n' "${0##*/}" >&2
  exit 2
fi

if [[ ! "${evidence_id}" =~ ^[A-Za-z0-9][A-Za-z0-9._-]*$ || ! "${slug}" =~ ^[A-Za-z0-9][A-Za-z0-9._-]*$ ]]; then
  printf 'id and slug may contain only letters, numbers, dot, underscore, and hyphen\n' >&2
  exit 2
fi

if [[ "$(adb -s "${serial}" get-state 2>/dev/null || true)" != 'device' ]]; then
  printf 'ADB target is not ready: %s\n' "${serial}" >&2
  exit 3
fi

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
base="${evidence_id}_${slug}"
shots="${case_root}/evidence/screenshots"
raw_shots="${case_root}/evidence/raw_screenshots"
trees="${case_root}/evidence/ui_tree"
runtime="${case_root}/evidence/runtime"
mkdir -p "${shots}" "${raw_shots}" "${trees}" "${runtime}"

temporary_dir="$(mktemp -d "${TMPDIR:-/tmp}/android-blackbox-capture.XXXXXX")"
trap 'rm -rf "${temporary_dir}"' EXIT
raw_capture="${temporary_dir}/screenshot.source"
ui_capture="${temporary_dir}/ui.xml"

captured=false
for _attempt in 1 2 3; do
  if adb -s "${serial}" exec-out screencap -p > "${raw_capture}" && [[ -s "${raw_capture}" ]]; then
    captured=true
    break
  fi
  sleep 1
done
if [[ "${captured}" != true ]]; then
  printf 'failed to capture screenshot after three attempts\n' >&2
  exit 4
fi

read -r source_format width height < <(python3 "${script_dir}/image_info.py" "${raw_capture}")
if [[ -n "${expected_size}" && "${width}x${height}" != "${expected_size}" ]]; then
  printf 'unexpected resolution: got %sx%s, expected %s\n' "${width}" "${height}" "${expected_size}" >&2
  exit 5
fi

if [[ "${source_format}" == 'PNG' ]]; then
  raw_path="${raw_shots}/${base}.png"
  shot_path="${shots}/${base}.png"
  cp "${raw_capture}" "${raw_path}"
  cp "${raw_capture}" "${shot_path}"
else
  raw_path="${raw_shots}/${base}.jpg"
  cp "${raw_capture}" "${raw_path}"
  if command -v magick >/dev/null 2>&1; then
    shot_path="${shots}/${base}.png"
    magick "${raw_capture}" "${shot_path}"
  elif command -v sips >/dev/null 2>&1; then
    shot_path="${shots}/${base}.png"
    sips -s format png "${raw_capture}" --out "${shot_path}" >/dev/null
  else
    shot_path="${shots}/${base}.jpg"
    cp "${raw_capture}" "${shot_path}"
    printf 'warning: JPEG preserved because no converter is available\n' >&2
  fi
fi

ui_status='incomplete'
for _attempt in 1 2 3; do
  adb -s "${serial}" exec-out uiautomator dump /dev/tty > "${ui_capture}" 2>/dev/null || true
  if grep -q '</hierarchy>' "${ui_capture}"; then
    ui_status='complete'
    break
  fi
  sleep 1
done

if [[ "${ui_status}" == 'complete' ]]; then
  ui_path="${trees}/${base}.xml"
else
  ui_path="${trees}/${base}.incomplete.xml"
fi
cp "${ui_capture}" "${ui_path}"

if [[ -n "${package_name}" ]]; then
  adb -s "${serial}" shell dumpsys package "${package_name}" > "${runtime}/${base}.package.txt" 2>&1 || true
  adb -s "${serial}" shell cmd appops get "${package_name}" > "${runtime}/${base}.appops.txt" 2>&1 || true
  adb -s "${serial}" shell dumpsys activity activities > "${runtime}/${base}.activities.txt" 2>&1 || true
fi

captured_at="$(date -u '+%Y-%m-%dT%H:%M:%SZ')"
metadata="${runtime}/${base}.meta.txt"
printf '%s\n' \
  "capture_id=${evidence_id}" \
  "slug=${slug}" \
  "captured_at=${captured_at}" \
  "serial=${serial}" \
  "package=${package_name}" \
  "source_format=${source_format}" \
  "resolution=${width}x${height}" \
  "ui_tree_status=${ui_status}" > "${metadata}"

printf 'screenshot=%s\n' "${shot_path}"
printf 'raw_screenshot=%s\n' "${raw_path}"
printf 'ui_tree=%s\n' "${ui_path}"
printf 'resolution=%sx%s\n' "${width}" "${height}"
printf 'ui_tree_status=%s\n' "${ui_status}"
