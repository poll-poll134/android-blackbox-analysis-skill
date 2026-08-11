#!/usr/bin/env bash
set -euo pipefail

serial=''
selector=''
execute=false
wait_seconds='1'

while [[ $# -gt 0 ]]; do
  case "$1" in
    --serial) serial="${2:-}"; shift 2 ;;
    --selector) selector="${2:-}"; shift 2 ;;
    --execute) execute=true; shift ;;
    --wait) wait_seconds="${2:-}"; shift 2 ;;
    *) printf 'unknown argument: %s\n' "$1" >&2; exit 2 ;;
  esac
done

if [[ -z "${serial}" || -z "${selector}" ]]; then
  printf 'usage: %s --serial SERIAL --selector VALUE [--execute] [--wait SECONDS]\n' "${0##*/}" >&2
  exit 2
fi

if [[ ! "${wait_seconds}" =~ ^[0-9]{1,2}$ || "${wait_seconds}" -gt 60 ]]; then
  printf 'wait must be an integer from 0 to 60 seconds\n' >&2
  exit 2
fi

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
temporary_ui="$(mktemp "${TMPDIR:-/tmp}/android-blackbox-ui.XXXXXX.xml")"
trap 'rm -f "${temporary_ui}"' EXIT
adb -s "${serial}" exec-out uiautomator dump /dev/tty > "${temporary_ui}"
coordinates="$(python3 "${script_dir}/ui_pick.py" "${temporary_ui}" "${selector}")"
tap_x="${coordinates%% *}"
tap_y="${coordinates##* }"

printf 'selector=%s\n' "${selector}"
printf 'tap=%s,%s\n' "${tap_x}" "${tap_y}"
if [[ "${execute}" != true ]]; then
  printf 'status=dry-run\n'
  exit 0
fi

adb -s "${serial}" shell input tap "${tap_x}" "${tap_y}"
sleep "${wait_seconds}"
printf 'status=executed\n'
