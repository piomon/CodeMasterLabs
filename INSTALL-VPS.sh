#!/usr/bin/env bash
set -Eeuo pipefail
umask 077
ROOT="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
if [[ "${EUID}" -ne 0 ]]; then echo 'Uruchom: sudo bash INSTALL-VPS.sh' >&2; exit 1; fi
command -v python3 >/dev/null || { echo 'Python 3 is required (included in supported Ubuntu images).' >&2; exit 1; }
exec python3 "$ROOT/vps/manage.py" install
